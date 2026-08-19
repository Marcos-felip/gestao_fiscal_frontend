import { describe, expect, it } from 'vitest'
import {
  toFiscalDocument,
  toFiscalDocumentOrNull,
  toFiscalDocumentList,
  toFiscalStatusHistory,
  toFiscalDocumentEvent,
} from '@/modules/fiscal/data/mappers/fiscal-document.mapper'
import { ContractError } from '@/core/errors/contract-error'

const validRaw = {
  id: 'fd-1',
  companyId: 'comp-1',
  establishmentId: 'est-1',
  saleId: 'sale-1',
  modelo: 'NFCE',
  serie: 1,
  numero: 1001,
  chaveAcesso: '3526...',
  ambiente: 'HOMOLOGACAO',
  status: 'AUTORIZADO',
  protocolo: '135240000000001',
  rejeicaoCodigo: null,
  rejeicaoMensagem: null,
  dataEmissao: '2026-08-01T10:00:00.000Z',
  dataAutorizacao: '2026-08-01T10:00:05.000Z',
  dataCancelamento: null,
  valorTotal: '150.50',
  xmlEnviado: '<xml>enviado</xml>',
  xmlAutorizado: '<xml>autorizado</xml>',
  xmlCancelamento: null,
  danfeUrl: 'https://danfe/fd-1.pdf',
  qrCode: 'https://qr/fd-1',
  idempotencyKey: 'idem-1',
  attempts: 1,
  engine: 'nfe-io',
  // Formato real gravado pelo backend desde a versão 2: chaves em português.
  // O fixture anterior usava `sale`/`items`/`payments`, que nunca existiram —
  // por isso o teste passava enquanto a tela mostrava toda nota sem itens.
  snapshot: {
    versao: 2,
    venda: {
      id: 'sale-1',
      numero: 1,
      subtotal: 150.5,
      desconto: 0,
      total: 150.5,
      data: '2026-08-01T10:00:00.000Z',
    },
    emitente: {
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
    },
    itens: [
      {
        numeroItem: 1,
        codigoProduto: 'p-1',
        descricao: 'Produto',
        ncm: '16025000',
        cfop: '5102',
        unidadeComercial: 'UN',
        quantidade: 2,
        valorUnitario: 75.25,
        imposto: {
          icms: { situacao: '102', origem: 0 },
          pis: { situacao: '07' },
          cofins: { situacao: '07' },
        },
      },
    ],
    pagamentos: [{ tipo: 'DINHEIRO', valor: 150.5 }],
    valorTotal: 150.5,
    totais: {
      vProd: 150.5,
      vBC: 0,
      vICMS: 0,
      vST: 0,
      vPIS: 0,
      vCOFINS: 0,
      vNF: 150.5,
    },
  },
  createdAt: '2026-08-01T09:59:00.000Z',
  updatedAt: '2026-08-01T10:00:05.000Z',
  establishment: { id: 'est-1', name: 'Loja Centro' },
  sale: { id: 'sale-1', saleNumber: 'V-1', totalAmount: '150.50' },
  statusHistory: [
    {
      id: 'sh-1',
      fiscalDocumentId: 'fd-1',
      statusFrom: 'PROCESSANDO',
      statusTo: 'AUTORIZADO',
      motivo: null,
      usuarioId: null,
      createdAt: '2026-08-01T10:00:05.000Z',
    },
  ],
  events: [
    {
      id: 'ev-1',
      fiscalDocumentId: 'fd-1',
      tipo: 'AUTORIZACAO',
      detalhes: { protocolo: '135240000000001' },
      usuarioId: null,
      createdAt: '2026-08-01T10:00:05.000Z',
    },
  ],
}

describe('toFiscalDocument', () => {
  it('converte valorTotal string em number e datas em Date', () => {
    const result = toFiscalDocument(validRaw)

    expect(result.isRight).toBe(true)
    const doc = result.right
    expect(doc.valorTotal).toBe(150.5)
    expect(typeof doc.valorTotal).toBe('number')
    expect(doc.dataAutorizacao).toBeInstanceOf(Date)
    expect(doc.dataCancelamento).toBeNull()
    expect(doc.isAuthorized).toBe(true)
    expect(doc.isPending).toBe(false)
    expect(doc.hasXml('autorizado')).toBe(true)
    expect(doc.hasXml('cancelamento')).toBe(false)
    expect(doc.sale?.totalAmount).toBe(150.5)
    expect(doc.snapshot?.itens[0].descricao).toBe('Produto')
    expect(doc.snapshot?.itens[0].imposto?.icms.situacao).toBe('102')
    expect(doc.snapshot?.pagamentos[0].tipo).toBe('DINHEIRO')
    expect(doc.snapshotIlegivel).toBe(false)
    expect(doc.statusHistory[0].statusTo).toBe('AUTORIZADO')
    expect(doc.statusHistory[0].createdAt).toBeInstanceOf(Date)
    expect(doc.events[0].tipo).toBe('AUTORIZACAO')
  })

  it('aplica defaults e preserva nulos quando campos opcionais faltam', () => {
    const result = toFiscalDocument({
      id: 'fd-2',
      companyId: 'comp-1',
      establishmentId: 'est-1',
      modelo: 'NFCE',
      ambiente: 'PRODUCAO',
      status: 'PENDENTE',
      createdAt: '2026-08-02T00:00:00.000Z',
      updatedAt: '2026-08-02T00:00:00.000Z',
    })

    expect(result.isRight).toBe(true)
    const doc = result.right
    expect(doc.serie).toBe(0)
    expect(doc.numero).toBe(0)
    expect(doc.attempts).toBe(0)
    expect(doc.valorTotal).toBeNull()
    expect(doc.saleId).toBeNull()
    expect(doc.snapshot).toBeNull()
    expect(doc.establishment).toBeNull()
    expect(doc.sale).toBeNull()
    expect(doc.statusHistory).toEqual([])
    expect(doc.events).toEqual([])
    expect(doc.isPending).toBe(true)
  })

  it('devolve ContractError quando um campo tem tipo errado', () => {
    const result = toFiscalDocument({ ...validRaw, serie: 'x' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('devolve ContractError quando um campo obrigatório falta', () => {
    const result = toFiscalDocument({ id: 'fd-3' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toFiscalDocumentOrNull', () => {
  it('devolve null quando a venda ainda não emitiu', () => {
    expect(toFiscalDocumentOrNull(null).right).toBeNull()
    expect(toFiscalDocumentOrNull('').right).toBeNull()
  })

  it('mapeia o documento quando presente', () => {
    const result = toFiscalDocumentOrNull(validRaw)
    expect(result.isRight).toBe(true)
    expect(result.right?.id).toBe('fd-1')
  })
})

describe('toFiscalDocumentList', () => {
  it('mapeia o envelope e deriva totalPages e hasNext', () => {
    const result = toFiscalDocumentList({
      data: [validRaw],
      total: 25,
      page: 1,
      limit: 10,
    })

    expect(result.isRight).toBe(true)
    const page = result.right
    expect(page.items).toHaveLength(1)
    expect(page.total).toBe(25)
    expect(page.totalPages).toBe(3)
    expect(page.hasNext).toBe(true)
  })

  it('marca hasNext false na última página', () => {
    const result = toFiscalDocumentList({
      data: [],
      total: 20,
      page: 2,
      limit: 10,
    })

    expect(result.right.totalPages).toBe(2)
    expect(result.right.hasNext).toBe(false)
  })

  it('devolve ContractError quando o envelope é inválido', () => {
    const result = toFiscalDocumentList({ data: 'nope' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toFiscalStatusHistory', () => {
  it('mapeia o array de transições com createdAt em Date', () => {
    const result = toFiscalStatusHistory(validRaw.statusHistory)
    expect(result.isRight).toBe(true)
    expect(result.right[0].createdAt).toBeInstanceOf(Date)
    expect(result.right[0].statusFrom).toBe('PROCESSANDO')
  })

  it('devolve ContractError quando não é um array', () => {
    const result = toFiscalStatusHistory({ nope: true })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toFiscalDocumentEvent', () => {
  it('mapeia o array de eventos preservando detalhes', () => {
    const result = toFiscalDocumentEvent(validRaw.events)
    expect(result.isRight).toBe(true)
    expect(result.right[0].tipo).toBe('AUTORIZACAO')
    expect(result.right[0].createdAt).toBeInstanceOf(Date)
    expect(result.right[0].detalhes).toEqual({
      protocolo: '135240000000001',
    })
  })

  it('devolve ContractError quando não é um array', () => {
    const result = toFiscalDocumentEvent('nope')
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
