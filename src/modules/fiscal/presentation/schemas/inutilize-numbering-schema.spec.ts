import { describe, expect, it } from 'vitest'
import {
  inutilizeNumberingSchema,
  INUTILIZACAO_JUSTIFICATIVA_MIN,
} from '@/modules/fiscal/presentation/schemas/inutilize-numbering-schema'
import {
  correctionLetterSchema,
  CORRECAO_MIN,
  CORRECAO_MAX,
} from '@/modules/fiscal/presentation/schemas/correction-letter-schema'

const faixaValida = {
  modelo: 'NFE',
  serie: 1,
  numeroInicial: 4,
  numeroFinal: 4,
  justificativa: 'Numeracao reservada e nao utilizada por falha na emissao',
}

describe('correctionLetterSchema', () => {
  it('aceita texto dentro dos limites da SEFAZ', () => {
    const result = correctionLetterSchema.safeParse({
      correcao: 'Corrigir o bairro do destinatario',
    })

    expect(result.success).toBe(true)
  })

  it('recusa texto curto demais em português', () => {
    const result = correctionLetterSchema.safeParse({ correcao: 'Bairro' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain(String(CORRECAO_MIN))
  })

  it('recusa texto acima do máximo', () => {
    const result = correctionLetterSchema.safeParse({
      correcao: 'a'.repeat(CORRECAO_MAX + 1),
    })

    expect(result.success).toBe(false)
  })

  it('conta o texto sem os espaços das pontas', () => {
    // Quinze espaços não são uma correção: o backend também apara.
    const result = correctionLetterSchema.safeParse({
      correcao: '   Bairro    ',
    })

    expect(result.success).toBe(false)
  })
})

describe('inutilizeNumberingSchema', () => {
  it('aceita a faixa de um número só, que é o caso comum', () => {
    expect(inutilizeNumberingSchema.safeParse(faixaValida).success).toBe(true)
  })

  it('recusa faixa invertida apontando o campo do fim', () => {
    const result = inutilizeNumberingSchema.safeParse({
      ...faixaValida,
      numeroInicial: 9,
      numeroFinal: 2,
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['numeroFinal'])
  })

  it('recusa numeração começando em zero', () => {
    const result = inutilizeNumberingSchema.safeParse({
      ...faixaValida,
      numeroInicial: 0,
    })

    expect(result.success).toBe(false)
  })

  it('recusa justificativa curta demais', () => {
    const result = inutilizeNumberingSchema.safeParse({
      ...faixaValida,
      justificativa: 'Erro',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain(
      String(INUTILIZACAO_JUSTIFICATIVA_MIN),
    )
  })

  it('recusa modelo fora da tabela', () => {
    const result = inutilizeNumberingSchema.safeParse({
      ...faixaValida,
      modelo: 'NF3E',
    })

    expect(result.success).toBe(false)
  })
})
