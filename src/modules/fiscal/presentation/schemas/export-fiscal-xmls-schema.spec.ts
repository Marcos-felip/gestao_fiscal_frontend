import { describe, expect, it } from 'vitest'
import {
  diasDoPeriodo,
  exportFiscalXmlsSchema,
  mesFechado,
  PERIODO_MAXIMO_DIAS,
} from './export-fiscal-xmls-schema'

const parse = (dataInicio: string, dataFim: string) =>
  exportFiscalXmlsSchema.safeParse({ dataInicio, dataFim })

describe('exportFiscalXmlsSchema', () => {
  it('aceita um mês fechado', () => {
    expect(parse('2026-08-01', '2026-08-31').success).toBe(true)
  })

  it('exige as duas datas', () => {
    expect(parse('', '2026-08-31').success).toBe(false)
    expect(parse('2026-08-01', '').success).toBe(false)
  })

  it('recusa data de fim anterior à de início', () => {
    const resultado = parse('2026-08-31', '2026-08-01')

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues[0].message).toMatch(/anterior/)
  })

  it('aceita o mesmo dia como início e fim', () => {
    expect(parse('2026-08-10', '2026-08-10').success).toBe(true)
  })

  it('recusa período acima do limite', () => {
    const resultado = parse('2026-01-01', '2026-12-31')

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues[0].message).toMatch(
      new RegExp(String(PERIODO_MAXIMO_DIAS)),
    )
  })

  it('aceita o maior período que o backend aceita', () => {
    // O backend recusa quando passa de 92 dias contando o dia final inteiro:
    // 91 dias de diferença dão 91,99… e passam; 92 dariam 92,99… e não.
    expect(diasDoPeriodo('2026-01-01', '2026-04-02')).toBeLessThanOrEqual(
      PERIODO_MAXIMO_DIAS,
    )
    expect(parse('2026-01-01', '2026-04-02').success).toBe(true)

    expect(diasDoPeriodo('2026-01-01', '2026-04-03')).toBeGreaterThan(
      PERIODO_MAXIMO_DIAS,
    )
    expect(parse('2026-01-01', '2026-04-03').success).toBe(false)
  })
})

describe('mesFechado', () => {
  it('preenche o mês passado do primeiro ao último dia', () => {
    expect(mesFechado(-1, new Date(2026, 7, 12))).toEqual({
      dataInicio: '2026-07-01',
      dataFim: '2026-07-31',
    })
  })

  it('preenche o mês atual', () => {
    expect(mesFechado(0, new Date(2026, 7, 12))).toEqual({
      dataInicio: '2026-08-01',
      dataFim: '2026-08-31',
    })
  })

  it('acerta o último dia de mês com 30 dias', () => {
    expect(mesFechado(0, new Date(2026, 3, 15)).dataFim).toBe('2026-04-30')
  })

  it('acerta fevereiro em ano bissexto', () => {
    expect(mesFechado(0, new Date(2028, 1, 15))).toEqual({
      dataInicio: '2028-02-01',
      dataFim: '2028-02-29',
    })
  })

  it('atravessa a virada do ano ao voltar um mês', () => {
    expect(mesFechado(-1, new Date(2026, 0, 5))).toEqual({
      dataInicio: '2025-12-01',
      dataFim: '2025-12-31',
    })
  })

  it('gera um período que o schema aceita', () => {
    const periodo = mesFechado(-1, new Date(2026, 7, 12))

    expect(
      exportFiscalXmlsSchema.safeParse(periodo).success,
    ).toBe(true)
  })
})
