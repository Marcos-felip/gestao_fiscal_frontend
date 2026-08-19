import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Either } from '@/core/either/either'
import { FiscalDocumentDetailController } from './fiscal-document-detail-controller'

/**
 * O DANFE da NFC-e é PDF e o da NF-e é HTML.
 *
 * O controller forçava `application/pdf` em tudo, então o HTML da NF-e chegava
 * ao usuário renomeado para `.pdf` — e o navegador respondia "Falha ao carregar
 * documento PDF". Estes testes travam a decisão da extensão pelo tipo que o
 * servidor declarou.
 */

const baixado = vi.fn()

vi.mock('@/core/utils/download', () => ({
  triggerFileDownload: (blob: Blob, nome: string) => baixado(blob, nome),
}))

const CHAVE = '31260851720322000146550010000000031458732971'

const documento = (overrides: Record<string, unknown> = {}) => ({
  id: 'doc-1',
  chaveAcesso: CHAVE,
  modelo: 'NFE',
  numero: 3,
  status: 'AUTORIZADO',
  ...overrides,
})

const build = (blob: Blob) => {
  const getUseCase = { execute: vi.fn() }
  const downloadDanfeUseCase = { execute: vi.fn() }

  getUseCase.execute.mockResolvedValue(Either.right(documento()))
  downloadDanfeUseCase.execute.mockResolvedValue(Either.right(blob))

  const controller = new FiscalDocumentDetailController(
    getUseCase as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    downloadDanfeUseCase as never,
  )

  return { controller, getUseCase }
}

async function baixar(blob: Blob, doc = documento()) {
  const { controller, getUseCase } = build(blob)
  getUseCase.execute.mockResolvedValue(Either.right(doc))
  await controller.load('doc-1')
  await controller.downloadDanfe()
  return baixado.mock.calls[0] as [Blob, string]
}

describe('FiscalDocumentDetailController.downloadDanfe', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    baixado.mockReset()
  })

  it('salva o DANFE da NF-e como .html, sem reescrever o tipo', async () => {
    const [blob, nome] = await baixar(
      new Blob(['<html></html>'], { type: 'text/html; charset=utf-8' }),
    )

    expect(nome).toBe(`${CHAVE}.html`)
    expect(blob.type).toContain('html')
  })

  it('salva o DANFE da NFC-e como .pdf', async () => {
    const [blob, nome] = await baixar(
      new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
    )

    expect(nome).toBe(`${CHAVE}.pdf`)
    expect(blob.type).toBe('application/pdf')
  })

  it('trata tipo ausente como PDF — é o que servidor sem Content-Type devolve', async () => {
    const [blob, nome] = await baixar(new Blob(['%PDF-1.4']))

    expect(nome).toBe(`${CHAVE}.pdf`)
    expect(blob.type).toBe('application/pdf')
  })

  it('usa modelo e número quando o documento ainda não tem chave', async () => {
    const [, nome] = await baixar(
      new Blob(['<html></html>'], { type: 'text/html' }),
      documento({ chaveAcesso: null }),
    )

    expect(nome).toBe('nfe-3.html')
  })
})
