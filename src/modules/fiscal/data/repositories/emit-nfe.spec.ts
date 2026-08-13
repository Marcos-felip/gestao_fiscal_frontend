import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Either } from '@/core/either/either'
import { EmitNfeDto } from '@/modules/fiscal/domain/dto/emit-nfe-dto'

const post = vi.fn()

vi.mock('@/core/client/http-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: (...args: unknown[]) => post(...args),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const documentoValido = {
  id: 'doc-1',
  companyId: 'comp-1',
  establishmentId: 'est-1',
  saleId: 'sale-1',
  modelo: 'NFE',
  serie: 1,
  numero: 1,
  ambiente: 'HOMOLOGACAO',
  status: 'PENDENTE',
  valorTotal: '100.00',
  createdAt: '2026-08-13T12:00:00.000Z',
  updatedAt: '2026-08-13T12:00:00.000Z',
}

/**
 * O payload da NF-e é diferente do da NFC-e em duas coisas que importam: ele
 * leva `consumidorFinal` e **não** leva CSC. Enviar campo que o motor recusa
 * viraria 400 depois de o operador já ter fechado a venda.
 */
describe('FiscalDocumentsRepository.emitNfe', () => {
  beforeEach(() => {
    post.mockReset()
    post.mockResolvedValue(Either.right(documentoValido))
  })

  async function emitir(dto: EmitNfeDto) {
    const { FiscalDocumentsRepository } = await import(
      '@/modules/fiscal/data/repositories/fiscal-documents-repository'
    )
    return new FiscalDocumentsRepository().emitNfe(dto)
  }

  it('chama a rota da NF-e, não a da NFC-e', async () => {
    await emitir(new EmitNfeDto({ saleId: 'sale-1', consumidorFinal: false }))

    expect(post).toHaveBeenCalledWith('/fiscal/documents/nfe', {
      saleId: 'sale-1',
      consumidorFinal: false,
    })
  })

  it('envia consumidorFinal true sem confundir com campo ausente', async () => {
    await emitir(new EmitNfeDto({ saleId: 'sale-1', consumidorFinal: true }))

    expect(post.mock.calls[0][1]).toMatchObject({ consumidorFinal: true })
  })

  it('omite os grupos opcionais que não foram informados', async () => {
    await emitir(new EmitNfeDto({ saleId: 'sale-1', consumidorFinal: false }))

    const payload = post.mock.calls[0][1] as Record<string, unknown>
    expect(payload).not.toHaveProperty('transporte')
    expect(payload).not.toHaveProperty('cobranca')
    expect(payload).not.toHaveProperty('naturezaOperacao')
  })

  it('leva transporte e cobrança quando informados', async () => {
    await emitir(
      new EmitNfeDto({
        saleId: 'sale-1',
        consumidorFinal: false,
        naturezaOperacao: 'VENDA DE MERCADORIA',
        transporte: { modalidade: 0, volumes: [{ quantidade: 3 }] },
        cobranca: {
          numeroFatura: '001',
          duplicatas: [
            { numero: '001/1', vencimento: '2026-09-13', valor: 100 },
          ],
        },
      }),
    )

    const payload = post.mock.calls[0][1] as Record<string, unknown>
    expect(payload.naturezaOperacao).toBe('VENDA DE MERCADORIA')
    expect(payload.transporte).toMatchObject({ modalidade: 0 })
    expect(payload.cobranca).toMatchObject({ numeroFatura: '001' })
  })

  it('devolve o documento mapeado em sucesso', async () => {
    const result = await emitir(
      new EmitNfeDto({ saleId: 'sale-1', consumidorFinal: false }),
    )

    expect(result.isRight).toBe(true)
    expect(result.right.id).toBe('doc-1')
    expect(result.right.modelo).toBe('NFE')
  })
})
