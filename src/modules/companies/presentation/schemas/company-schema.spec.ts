import { describe, expect, it } from 'vitest'
import { companySchema } from './company-schema'

const base = {
  name: 'Padaria Eliete',
  contribuinteIcms: false,
}

describe('companySchema — CRT', () => {
  it.each([
    'SIMPLES_NACIONAL',
    'SIMPLES_EXCESSO',
    'REGIME_NORMAL',
    'SIMPLES_MEI',
  ])('aceita o CRT %s', (crt) => {
    expect(companySchema.safeParse({ ...base, crt }).success).toBe(true)
  })

  it('aceita CRT vazio: o campo é opcional', () => {
    expect(companySchema.safeParse({ ...base, crt: '' }).success).toBe(true)
  })

  it('recusa CRT desconhecido', () => {
    expect(companySchema.safeParse({ ...base, crt: 'LUCRO_REAL' }).success).toBe(
      false,
    )
  })
})
