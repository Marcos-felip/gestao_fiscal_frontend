import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Either } from '@/core/either/either'
import { ValidationError } from '@/core/errors/validation-error'
import { ServerError } from '@/core/errors/server-error'
import { ExportFiscalXmlsDto } from '@/modules/fiscal/domain/dto/export-fiscal-xmls-dto'
import { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'
import { FiscalDocumentsListController } from './fiscal-documents-list-controller'

/**
 * A exportação é a única operação longa desta tela. O que precisa continuar
 * verdade: ela não trava a lista, não dispara duas vezes, e o erro do backend
 * chega ao usuário pela subclasse do `DomainError` — nunca por texto.
 */

const periodo = () =>
  new ExportFiscalXmlsDto({
    dataInicio: '2026-08-01',
    dataFim: '2026-08-31',
  })

const zip = () => new Blob(['PK'], { type: 'application/zip' })

const build = () => {
  const listUseCase = { execute: vi.fn() }
  const retryUseCase = { execute: vi.fn() }
  const exportUseCase = { execute: vi.fn() }
  const loadEstablishments = vi.fn()

  exportUseCase.execute.mockResolvedValue(Either.right(zip()))

  const controller = new FiscalDocumentsListController(
    listUseCase as never,
    retryUseCase as never,
    exportUseCase as never,
    loadEstablishments as never,
  )

  return { controller, exportUseCase, listUseCase }
}

describe('FiscalDocumentsListController — exportação de XMLs', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // happy-dom não implementa a URL de objeto usada para disparar o download.
    URL.createObjectURL = vi.fn(() => 'blob:zip')
    URL.revokeObjectURL = vi.fn()
  })

  it('baixa o ZIP e devolve sucesso', async () => {
    const { controller, exportUseCase } = build()

    const ok = await controller.exportXmls(periodo())

    expect(ok).toBe(true)
    expect(exportUseCase.execute).toHaveBeenCalledTimes(1)
    expect(controller.exportError.value).toBeNull()
  })

  it('nomeia o arquivo pelo período', async () => {
    const { controller } = build()
    const anchor = document.createElement('a')
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor)

    await controller.exportXmls(periodo())

    expect(anchor.download).toBe('xmls-2026-08-01-a-2026-08-31.zip')
  })

  it('marca homologação no nome do arquivo', async () => {
    const { controller } = build()
    const anchor = document.createElement('a')
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor)

    await controller.exportXmls(
      new ExportFiscalXmlsDto({
        dataInicio: '2026-08-01',
        dataFim: '2026-08-31',
        ambiente: FiscalEnvironment.HOMOLOGACAO,
      }),
    )

    expect(anchor.download).toContain('HOMOLOGACAO-SEM-VALOR-FISCAL')
  })

  it('sinaliza carregamento durante a exportação e o encerra ao fim', async () => {
    const { controller, exportUseCase } = build()
    let liberar: (valor: unknown) => void = () => {}
    exportUseCase.execute.mockReturnValue(
      new Promise((resolve) => {
        liberar = resolve
      }),
    )

    const promessa = controller.exportXmls(periodo())
    expect(controller.exporting.value).toBe(true)

    liberar(Either.right(zip()))
    await promessa

    expect(controller.exporting.value).toBe(false)
  })

  it('ignora disparo repetido enquanto a exportação está em andamento', async () => {
    const { controller, exportUseCase } = build()
    let liberar: (valor: unknown) => void = () => {}
    exportUseCase.execute.mockReturnValue(
      new Promise((resolve) => {
        liberar = resolve
      }),
    )

    const primeira = controller.exportXmls(periodo())
    const segunda = await controller.exportXmls(periodo())

    // O segundo clique não gera um segundo ZIP.
    expect(segunda).toBe(false)
    expect(exportUseCase.execute).toHaveBeenCalledTimes(1)

    liberar(Either.right(zip()))
    await primeira
  })

  it('não trava a lista durante a exportação', async () => {
    const { controller, exportUseCase } = build()
    let liberar: (valor: unknown) => void = () => {}
    exportUseCase.execute.mockReturnValue(
      new Promise((resolve) => {
        liberar = resolve
      }),
    )

    const promessa = controller.exportXmls(periodo())

    // `isLoading` é o estado da listagem; a exportação tem o seu próprio.
    expect(controller.isLoading).toBe(false)

    liberar(Either.right(zip()))
    await promessa
  })

  it('devolve o botão ao normal e guarda o erro quando a exportação falha', async () => {
    const { controller, exportUseCase } = build()
    exportUseCase.execute.mockResolvedValue(
      Either.left(new ValidationError('O período não pode passar de 92 dias.')),
    )

    const ok = await controller.exportXmls(periodo())

    expect(ok).toBe(false)
    expect(controller.exporting.value).toBe(false)
    expect(controller.exportError.value).toBe(
      'O período não pode passar de 92 dias.',
    )
  })

  it('exibe a orientação do limite de volume vinda da API', async () => {
    const { controller, exportUseCase } = build()
    const mensagem =
      'O período tem 6000 documentos e o limite por exportação é 5000. Divida o pedido por estabelecimento ou em intervalos menores.'
    exportUseCase.execute.mockResolvedValue(
      Either.left(new ValidationError(mensagem)),
    )

    await controller.exportXmls(periodo())

    expect(controller.exportError.value).toBe(mensagem)
  })

  it('esconde mensagem de erro que não é do usuário', async () => {
    const { controller, exportUseCase } = build()
    exportUseCase.execute.mockResolvedValue(
      Either.left(new ServerError(500, 'ECONNREFUSED no pool do Prisma')),
    )

    await controller.exportXmls(periodo())

    // A decisão vem do `isUserFacing` da subclasse, não de inspecionar o texto.
    expect(controller.exportError.value).toBe(
      'Não foi possível exportar os XMLs. Tente novamente.',
    )
  })

  it('limpa o erro anterior ao tentar de novo', async () => {
    const { controller, exportUseCase } = build()
    exportUseCase.execute.mockResolvedValue(
      Either.left(new ValidationError('Período inválido')),
    )
    await controller.exportXmls(periodo())
    expect(controller.exportError.value).not.toBeNull()

    exportUseCase.execute.mockResolvedValue(Either.right(zip()))
    await controller.exportXmls(periodo())

    expect(controller.exportError.value).toBeNull()
  })
})
