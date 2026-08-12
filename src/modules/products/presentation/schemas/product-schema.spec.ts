import { describe, expect, it } from 'vitest'
import { UnitOfMeasure } from '@/core/enums/unit-of-measure.enum'
import { productSchema } from './product-schema'

/**
 * O CST de PIS e COFINS passou a ser obrigatório: o motor fiscal deixou de
 * completá-lo com um código fixo, e sem ele o produto não compõe quadro
 * tributário nem emite nota.
 */

const produto = (overrides: Record<string, unknown> = {}) => ({
  name: 'Refrigerante Lata 350ml',
  unit: UnitOfMeasure.UN,
  cstPis: '07',
  cstCofins: '07',
  ...overrides,
})

const parse = (overrides: Record<string, unknown> = {}) =>
  productSchema.safeParse(produto(overrides))

const mensagemDe = (
  resultado: ReturnType<typeof parse>,
  campo: string,
): string | undefined =>
  resultado.error?.issues.find((issue) => issue.path[0] === campo)?.message

describe('productSchema — situação tributária de PIS e COFINS', () => {
  it('aceita produto com os dois CST informados', () => {
    expect(parse().success).toBe(true)
  })

  it('recusa produto sem CST de PIS', () => {
    const resultado = parse({ cstPis: '' })

    expect(resultado.success).toBe(false)
    expect(mensagemDe(resultado, 'cstPis')).toBe(
      'Selecione a situação tributária de PIS',
    )
  })

  it('recusa produto sem CST de COFINS', () => {
    const resultado = parse({ cstCofins: '' })

    expect(resultado.success).toBe(false)
    expect(mensagemDe(resultado, 'cstCofins')).toBe(
      'Selecione a situação tributária de COFINS',
    )
  })

  it('recusa CST que a emissão não suporta', () => {
    const resultado = parse({ cstPis: '77' })

    expect(resultado.success).toBe(false)
    expect(mensagemDe(resultado, 'cstPis')).toMatch(/não suportado/)
  })
})

describe('productSchema — alíquota conforme a situação tributária', () => {
  it('exige alíquota quando o CST é tributado por percentual', () => {
    const resultado = parse({ cstPis: '01' })

    expect(resultado.success).toBe(false)
    expect(mensagemDe(resultado, 'aliquotaPis')).toBe(
      'Informe a alíquota de PIS para a situação escolhida',
    )
  })

  it('aceita quando a alíquota acompanha o CST tributado', () => {
    expect(parse({ cstPis: '01', aliquotaPis: '1,65' }).success).toBe(true)
  })

  it('exige alíquota também na apuração por quantidade', () => {
    const resultado = parse({ cstCofins: '03' })

    expect(resultado.success).toBe(false)
    expect(mensagemDe(resultado, 'aliquotaCofins')).toMatch(/COFINS/)
  })

  it('dispensa alíquota na situação não tributada', () => {
    // 04 é o caso da bebida monofásica: alíquota zero na revenda.
    expect(parse({ cstPis: '04', cstCofins: '04' }).success).toBe(true)
  })

  it('dispensa alíquota no CST 07, que é isento', () => {
    expect(parse().success).toBe(true)
  })

  it('cobra as duas alíquotas de forma independente', () => {
    const resultado = parse({
      cstPis: '01',
      aliquotaPis: '1,65',
      cstCofins: '01',
    })

    expect(resultado.success).toBe(false)
    expect(mensagemDe(resultado, 'aliquotaPis')).toBeUndefined()
    expect(mensagemDe(resultado, 'aliquotaCofins')).toMatch(/COFINS/)
  })
})
