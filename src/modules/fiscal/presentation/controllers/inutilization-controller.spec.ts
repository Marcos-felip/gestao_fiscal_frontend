import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Either } from '@/core/either/either'
import { ValidationError } from '@/core/errors/validation-error'
import { ServerError } from '@/core/errors/server-error'
import { FiscalInutilization } from '@/modules/fiscal/domain/entities/fiscal-inutilization.entity'
import { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'
import { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'
import { InutilizationController } from './inutilization-controller'

/**
 * A recusa por faixa ocupada **nomeia o número** — é ela que permite corrigir a
 * faixa. Trocá-la por uma mensagem genérica deixaria o operador sem saber qual
 * número tirar do intervalo.
 */

const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() }

vi.mock('@/shared/composables', () => ({
  useToast: () => toast,
}))

const pedido = {
  modelo: FiscalDocumentModel.NFE,
  serie: 1,
  numeroInicial: 1,
  numeroFinal: 1,
  justificativa: 'Numeracao reservada e nao utilizada por falha na emissao',
}

const inutilizacao = new FiscalInutilization({
  id: 'inut-1',
  establishmentId: 'estab-1',
  modelo: FiscalDocumentModel.NFE,
  ambiente: FiscalEnvironment.HOMOLOGACAO,
  serie: 1,
  numeroInicial: 1,
  numeroFinal: 1,
  ano: 2026,
  justificativa: pedido.justificativa,
  protocolo: '131260000000002',
  createdAt: new Date('2026-08-14T12:00:00Z'),
})

function build() {
  const inutilizeUseCase = { execute: vi.fn() }
  const listPendingUseCase = { execute: vi.fn() }

  inutilizeUseCase.execute.mockResolvedValue(Either.right(inutilizacao))
  listPendingUseCase.execute.mockResolvedValue(
    Either.right([
      {
        modelo: FiscalDocumentModel.NFE,
        serie: 1,
        faixas: [{ inicio: 1, fim: 1 }],
      },
    ]),
  )

  const controller = new InutilizationController(
    inutilizeUseCase as never,
    listPendingUseCase as never,
  )

  return { controller, inutilizeUseCase, listPendingUseCase }
}

describe('InutilizationController', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    toast.success.mockReset()
    toast.error.mockReset()
  })

  it('sinaliza numeração perdida quando o servidor encontra faixa', async () => {
    const { controller } = build()
    await controller.loadPending('estab-1')

    expect(controller.hasPending.value).toBe(true)
  })

  it('não sinaliza pendência quando a sequência está contínua', async () => {
    const { controller, listPendingUseCase } = build()
    listPendingUseCase.execute.mockResolvedValue(Either.right([]))

    await controller.loadPending('estab-1')

    expect(controller.hasPending.value).toBe(false)
  })

  it('envia a faixa com o estabelecimento da tela', async () => {
    const { controller, inutilizeUseCase } = build()
    await controller.loadPending('estab-1')

    const ok = await controller.inutilize(pedido)

    expect(ok).toBe(true)
    expect(inutilizeUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ establishmentId: 'estab-1', numeroFinal: 1 }),
    )
  })

  it('recarrega as faixas pendentes depois de inutilizar', async () => {
    const { controller, listPendingUseCase } = build()
    await controller.loadPending('estab-1')
    listPendingUseCase.execute.mockClear()

    await controller.inutilize(pedido)

    // A faixa recém-queimada não pode continuar sendo sugerida.
    expect(listPendingUseCase.execute).toHaveBeenCalledWith('estab-1')
  })

  it('mantém a recusa que nomeia o número ocupado, junto do formulário', async () => {
    const { controller, inutilizeUseCase } = build()
    await controller.loadPending('estab-1')
    inutilizeUseCase.execute.mockResolvedValue(
      Either.left(
        new ValidationError(
          'A faixa inclui o número 3 (312608...), que já pertence a documentos emitidos.',
        ),
      ),
    )

    const ok = await controller.inutilize({ ...pedido, numeroFinal: 5 })

    expect(ok).toBe(false)
    expect(controller.conflito.value).toContain('número 3')
  })

  it('não expõe erro de infraestrutura como se fosse conflito de faixa', async () => {
    const { controller, inutilizeUseCase } = build()
    await controller.loadPending('estab-1')
    inutilizeUseCase.execute.mockResolvedValue(
      Either.left(new ServerError(500)),
    )

    await controller.inutilize(pedido)

    expect(controller.conflito.value).toBe(
      'Não foi possível inutilizar a numeração.',
    )
  })

  it('recusa enviar sem estabelecimento carregado', async () => {
    const { controller, inutilizeUseCase } = build()

    expect(await controller.inutilize(pedido)).toBe(false)
    expect(inutilizeUseCase.execute).not.toHaveBeenCalled()
  })
})
