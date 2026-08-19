import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Either } from '@/core/either/either'
import { ValidationError } from '@/core/errors/validation-error'
import { ServerError } from '@/core/errors/server-error'
import { FiscalCorrectionLetter } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'
import { CorrectionLettersController } from './correction-letters-controller'

/**
 * O que esta tela precisa acertar: quantas correções ainda cabem, e o que
 * mostrar quando a SEFAZ recusa — a mensagem dela diz o que fazer, a genérica
 * não.
 */

const baixado = vi.fn()
const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() }

vi.mock('@/core/utils/download', () => ({
  triggerFileDownload: (blob: Blob, nome: string) => baixado(blob, nome),
}))

vi.mock('@/shared/composables', () => ({
  useToast: () => toast,
}))

const carta = (sequencia: number) =>
  new FiscalCorrectionLetter({
    id: `cce-${sequencia}`,
    fiscalDocumentId: 'doc-1',
    sequencia,
    correcao: 'Corrigir o bairro do destinatario',
    condicaoDeUso: 'A Carta de Correcao e disciplinada...',
    protocolo: '131260000000001',
    xmlEvento: '<procEventoNFe/>',
    createdAt: new Date('2026-08-14T12:00:00Z'),
  })

function build(letters: FiscalCorrectionLetter[] = []) {
  const listUseCase = { execute: vi.fn() }
  const createUseCase = { execute: vi.fn() }
  const downloadUseCase = { execute: vi.fn() }

  listUseCase.execute.mockResolvedValue(Either.right(letters))
  createUseCase.execute.mockResolvedValue(Either.right(carta(1)))
  downloadUseCase.execute.mockResolvedValue(Either.right('<procEventoNFe/>'))

  const controller = new CorrectionLettersController(
    listUseCase as never,
    createUseCase as never,
    downloadUseCase as never,
  )

  return { controller, listUseCase, createUseCase, downloadUseCase }
}

describe('CorrectionLettersController', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    baixado.mockReset()
    toast.success.mockReset()
    toast.error.mockReset()
  })

  it('conta quantas correções ainda cabem antes do limite legal', async () => {
    const { controller } = build([carta(1), carta(2), carta(3)])
    await controller.load('doc-1')

    expect(controller.restantes.value).toBe(17)
    expect(controller.limiteAtingido.value).toBe(false)
  })

  it('marca o limite atingido na vigésima correção', async () => {
    const vinte = Array.from({ length: 20 }, (_, i) => carta(i + 1))
    const { controller } = build(vinte)
    await controller.load('doc-1')

    expect(controller.restantes.value).toBe(0)
    expect(controller.limiteAtingido.value).toBe(true)
  })

  it('acrescenta a correção emitida ao histórico, sem recarregar a lista', async () => {
    const { controller, listUseCase } = build([carta(1)])
    await controller.load('doc-1')
    listUseCase.execute.mockClear()

    const ok = await controller.create('Corrigir o bairro do destinatario')

    expect(ok).toBe(true)
    expect(controller.letters.value).toHaveLength(2)
    expect(listUseCase.execute).not.toHaveBeenCalled()
  })

  it('exibe a recusa da SEFAZ como veio, decidindo por instanceof', async () => {
    const { controller, createUseCase } = build()
    await controller.load('doc-1')
    createUseCase.execute.mockResolvedValue(
      Either.left(
        new ValidationError('Rejeição 573: duplicidade de evento', []),
      ),
    )

    const ok = await controller.create('Corrigir o bairro do destinatario')

    expect(ok).toBe(false)
    expect(toast.error).toHaveBeenCalledWith(
      'Rejeição 573: duplicidade de evento',
    )
    expect(controller.letters.value).toHaveLength(0)
  })

  it('não vaza erro de infraestrutura para o operador', async () => {
    const { controller, createUseCase } = build()
    await controller.load('doc-1')
    createUseCase.execute.mockResolvedValue(
      Either.left(new ServerError(500)),
    )

    await controller.create('Corrigir o bairro do destinatario')

    expect(toast.error).toHaveBeenCalledWith(
      'Não foi possível emitir a carta de correção.',
    )
  })

  it('nomeia o XML pela chave de acesso, como a exportação em lote', async () => {
    const chave = '31260851720322000146550010000000031458732971'
    const { controller } = build([carta(2)])
    await controller.load('doc-1')

    await controller.downloadXml(carta(2), chave)

    const [, nome] = baixado.mock.calls[0] as [Blob, string]
    expect(nome).toBe(`${chave}-cce-02.xml`)
  })

  it('mantém a tela de pé quando o histórico não carrega', async () => {
    const { controller, listUseCase } = build()
    listUseCase.execute.mockResolvedValue(
      Either.left(new ServerError(500)),
    )

    await controller.load('doc-1')

    // A seção some; o detalhe do documento continua utilizável.
    expect(controller.letters.value).toEqual([])
  })
})
