import { describe, expect, it, vi } from 'vitest'
import { toFiscalSnapshot } from '@/modules/fiscal/data/mappers/fiscal-snapshot.mapper'

/**
 * O snapshot é o retrato congelado da emissão, e o formato dele mudou na etapa 1
 * do roteiro fiscal — de chaves em inglês para português. O frontend não
 * acompanhou e, como tudo era opcional, `snapshot.items` virava `undefined`: a
 * tela mostrou **toda** nota sem itens, por dois dias, sem um erro sequer.
 *
 * Estes testes existem para que a próxima divergência apareça.
 */

const emitente = {
  cnpj: '51720322000146',
  razaoSocial: 'Empresa Teste LTDA',
  inscricaoEstadual: '0011234560012',
  crt: '1',
  logradouro: 'Rua Um',
  numero: '10',
  bairro: 'Centro',
  codigoMunicipio: '3143302',
  municipio: 'Montes Claros',
  uf: 'MG',
  cep: '39400000',
}

const item = {
  numeroItem: 1,
  codigoProduto: 'p-1',
  descricao: 'Espeto de Alcatra',
  ncm: '16025000',
  cfop: '5102',
  unidadeComercial: 'UN',
  quantidade: 2,
  valorUnitario: 12,
  imposto: {
    icms: { situacao: '102', origem: 0 },
    pis: { situacao: '07' },
    cofins: { situacao: '07' },
  },
}

const snapshotV2 = (overrides: Record<string, unknown> = {}) => ({
  versao: 2,
  venda: {
    id: 'sale-1',
    numero: 7,
    subtotal: 24,
    desconto: 0,
    total: 24,
    data: '2026-08-14T12:00:00.000Z',
  },
  emitente,
  itens: [item],
  pagamentos: [{ tipo: 'PIX', valor: 24 }],
  valorTotal: 24,
  ...overrides,
})

describe('toFiscalSnapshot', () => {
  it('lê o formato que o backend realmente grava', () => {
    const snapshot = toFiscalSnapshot(snapshotV2())

    expect(snapshot?.itens).toHaveLength(1)
    expect(snapshot?.itens[0].descricao).toBe('Espeto de Alcatra')
    expect(snapshot?.pagamentos[0].tipo).toBe('PIX')
  })

  it('preserva o quadro tributário do item', () => {
    const snapshot = toFiscalSnapshot(snapshotV2())

    expect(snapshot?.itens[0].imposto?.icms.situacao).toBe('102')
    expect(snapshot?.itens[0].imposto?.icms.origem).toBe(0)
    expect(snapshot?.itens[0].imposto?.pis.situacao).toBe('07')
  })

  it('lê os grupos que só a NF-e tem', () => {
    const snapshot = toFiscalSnapshot(
      snapshotV2({
        modelo: 'NFE',
        destinatarioNfe: {
          cpfCnpj: '33445566000186',
          nome: 'Cliente PJ LTDA',
          logradouro: 'Av. Dois',
          numero: '200',
          bairro: 'Centro',
          codigoMunicipio: '3143302',
          municipio: 'Montes Claros',
          uf: 'MG',
          cep: '39400000',
          indicadorIe: 9,
        },
        nfe: {
          naturezaOperacao: 'VENDA DE MERCADORIA',
          tipoOperacao: 1,
          finalidade: 1,
          consumidorFinal: true,
          presenca: 1,
        },
      }),
    )

    expect(snapshot?.modelo).toBe('NFE')
    expect(snapshot?.destinatarioNfe?.indicadorIe).toBe(9)
    expect(snapshot?.nfe?.naturezaOperacao).toBe('VENDA DE MERCADORIA')
  })

  it('aceita snapshot de NFC-e sem destinatário', () => {
    const snapshot = toFiscalSnapshot(snapshotV2())

    expect(snapshot?.destinatario).toBeUndefined()
    expect(snapshot?.destinatarioNfe).toBeUndefined()
  })

  it('devolve nulo quando não há snapshot', () => {
    expect(toFiscalSnapshot(null)).toBeNull()
    expect(toFiscalSnapshot(undefined)).toBeNull()
  })

  it('recusa o formato antigo, em inglês, em vez de devolver nota vazia', () => {
    const aviso = vi.spyOn(console, 'error').mockImplementation(() => {})

    const snapshot = toFiscalSnapshot({
      sale: { id: 'sale-1' },
      items: [{ productId: 'p-1', name: 'Produto', quantity: 1 }],
      payments: [{ method: 'DINHEIRO', amount: 10 }],
    })

    expect(snapshot).toBeNull()
    // Vai para o console porque é contrato divergindo, não erro do usuário.
    expect(aviso).toHaveBeenCalled()
    aviso.mockRestore()
  })

  it('recusa item sem o CFOP, que é obrigatório na nota', () => {
    const aviso = vi.spyOn(console, 'error').mockImplementation(() => {})
    const semCfop = { ...item, cfop: undefined }

    expect(toFiscalSnapshot(snapshotV2({ itens: [semCfop] }))).toBeNull()
    aviso.mockRestore()
  })

  it('tolera item sem imposto, dos snapshots anteriores ao quadro tributário', () => {
    const semImposto = { ...item, imposto: undefined }
    const snapshot = toFiscalSnapshot(snapshotV2({ itens: [semImposto] }))

    expect(snapshot?.itens[0].imposto).toBeUndefined()
  })
})
