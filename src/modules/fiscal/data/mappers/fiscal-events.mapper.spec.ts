import { describe, expect, it } from 'vitest'
import {
  toFiscalCorrectionLetter,
  toFiscalCorrectionLetterList,
  toFiscalInutilization,
  toFiscalPendingRanges,
} from '@/modules/fiscal/data/mappers/fiscal-events.mapper'
import { ContractError } from '@/core/errors/contract-error'

const cartaRaw = {
  id: 'cce-1',
  fiscalDocumentId: 'doc-1',
  sequencia: 1,
  correcao: 'Corrigir o bairro do destinatario para Centro',
  condicaoDeUso: 'A Carta de Correcao e disciplinada pelo art. 7...',
  protocolo: '131260000000001',
  xmlEvento: 'fiscal/empresa/2026/08/chave-cce-1.xml',
  createdAt: '2026-08-14T12:00:00.000Z',
}

const inutilizacaoRaw = {
  id: 'inut-1',
  establishmentId: 'est-1',
  modelo: 'NFE',
  ambiente: 'HOMOLOGACAO',
  serie: 1,
  numeroInicial: 4,
  numeroFinal: 4,
  ano: 2026,
  justificativa: 'Numeracao reservada e nao utilizada por falha na emissao',
  protocolo: '131260000000002',
  createdAt: '2026-08-14T12:00:00.000Z',
}

describe('toFiscalCorrectionLetter', () => {
  it('converte a data e preserva a condição de uso gravada com a carta', () => {
    const result = toFiscalCorrectionLetter(cartaRaw)

    expect(result.isRight).toBe(true)
    const carta = result.right
    expect(carta.sequencia).toBe(1)
    expect(carta.createdAt).toBeInstanceOf(Date)
    // O texto legal vem do servidor, não de uma constante do frontend: a
    // redação muda com o tempo e o que vale é a que foi gravada.
    expect(carta.condicaoDeUso).toContain('art. 7')
    expect(carta.hasXml).toBe(true)
  })

  it('aplica os defaults quando os opcionais faltam', () => {
    const result = toFiscalCorrectionLetter({
      id: 'cce-2',
      fiscalDocumentId: 'doc-1',
      sequencia: 2,
      correcao: 'Corrigir o codigo da transportadora',
      createdAt: '2026-08-14T12:00:00.000Z',
    })

    expect(result.isRight).toBe(true)
    expect(result.right.condicaoDeUso).toBeNull()
    expect(result.right.hasXml).toBe(false)
  })

  it('recusa sequência com tipo errado', () => {
    const result = toFiscalCorrectionLetter({ ...cartaRaw, sequencia: '1' })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('recusa carta sem o texto da correção, citando o campo', () => {
    const semCorrecao = { ...cartaRaw, correcao: undefined }
    const result = toFiscalCorrectionLetter(semCorrecao)

    expect(result.isLeft).toBe(true)
    expect(JSON.stringify(result.left)).toContain('correcao')
  })
})

describe('toFiscalCorrectionLetterList', () => {
  it('mapeia o array cru, sem envelope de paginação', () => {
    const result = toFiscalCorrectionLetterList([
      cartaRaw,
      { ...cartaRaw, id: 'cce-2', sequencia: 2 },
    ])

    expect(result.isRight).toBe(true)
    expect(result.right.map((c) => c.sequencia)).toEqual([1, 2])
  })

  it('aceita lista vazia — a maioria das notas não tem correção', () => {
    const result = toFiscalCorrectionLetterList([])

    expect(result.isRight).toBe(true)
    expect(result.right).toEqual([])
  })

  it('recusa quando a resposta não é array', () => {
    expect(toFiscalCorrectionLetterList(cartaRaw).isLeft).toBe(true)
  })
})

describe('toFiscalInutilization', () => {
  it('constrói a entidade e rotula a faixa de um número só', () => {
    const result = toFiscalInutilization(inutilizacaoRaw)

    expect(result.isRight).toBe(true)
    expect(result.right.faixaLabel).toBe('nº 4')
  })

  it('rotula a faixa com início e fim quando são diferentes', () => {
    const result = toFiscalInutilization({
      ...inutilizacaoRaw,
      numeroInicial: 4,
      numeroFinal: 9,
    })

    expect(result.right.faixaLabel).toBe('nº 4 a 9')
  })

  it('recusa modelo fora da tabela em vez de deixar passar', () => {
    const result = toFiscalInutilization({ ...inutilizacaoRaw, modelo: 'NF3E' })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('recusa ambiente desconhecido', () => {
    const result = toFiscalInutilization({
      ...inutilizacaoRaw,
      ambiente: 'TESTE',
    })

    expect(result.isLeft).toBe(true)
  })
})

describe('toFiscalPendingRanges', () => {
  it('mapeia as faixas sugeridas por modelo e série', () => {
    const result = toFiscalPendingRanges([
      { modelo: 'NFE', serie: 1, faixas: [{ inicio: 1, fim: 1 }] },
    ])

    expect(result.isRight).toBe(true)
    expect(result.right[0].faixas).toEqual([{ inicio: 1, fim: 1 }])
  })

  it('aceita vazio — não ter buraco de numeração é o normal', () => {
    expect(toFiscalPendingRanges([]).right).toEqual([])
  })

  it('recusa faixa sem o fim', () => {
    const result = toFiscalPendingRanges([
      { modelo: 'NFE', serie: 1, faixas: [{ inicio: 1 }] },
    ])

    expect(result.isLeft).toBe(true)
    expect(JSON.stringify(result.left)).toContain('fim')
  })
})
