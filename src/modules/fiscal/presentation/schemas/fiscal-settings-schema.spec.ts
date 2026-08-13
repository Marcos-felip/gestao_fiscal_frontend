import { describe, expect, it } from 'vitest'
import { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'
import {
  validateFiscalSettings,
  type FiscalSettingsFormValues,
} from './fiscal-settings-schema'

/** CSC no formato que MG emite: 32 caracteres hexadecimais. Valor fictício. */
const CSC_VALIDO = 'A1B2C3D4E5F60718293A4B5C6D7E8F90'

const values = (
  overrides: Partial<FiscalSettingsFormValues> = {},
): FiscalSettingsFormValues => ({
  ambiente: FiscalEnvironment.HOMOLOGACAO,
  serieNfce: '1',
  proximoNumeroNfce: '1',
  serieNfe: '1',
  proximoNumeroNfe: '1',
  codigoCsc: CSC_VALIDO,
  idCsc: '000001',
  ativo: true,
  ...overrides,
})

describe('validateFiscalSettings — código CSC', () => {
  it('aceita o CSC de 32 hexadecimais que MG emite', () => {
    expect(validateFiscalSettings(values(), true).ok).toBe(true)
  })

  it('aceita CSC vazio: a configuração é preenchida em etapas', () => {
    const resultado = validateFiscalSettings(values({ codigoCsc: '' }), true)

    expect(resultado.ok).toBe(true)
    expect(resultado.errors.codigoCsc).toBeUndefined()
  })

  // O CSC de 6 dígitos é o caso real que gerou a rejeição 464 em 10/08/2026:
  // foi salvo por esta tela, emitiu, consumiu numeração e só falhou na SEFAZ.
  it('recusa CSC de 6 dígitos', () => {
    const resultado = validateFiscalSettings(
      values({ codigoCsc: '123456' }),
      true,
    )

    expect(resultado.ok).toBe(false)
    expect(resultado.errors.codigoCsc).toMatch(/16 a 64 caracteres/)
  })

  it('recusa CSC com 15 caracteres e aceita com 16', () => {
    expect(
      validateFiscalSettings(values({ codigoCsc: 'a'.repeat(15) }), true).ok,
    ).toBe(false)
    expect(
      validateFiscalSettings(values({ codigoCsc: 'a'.repeat(16) }), true).ok,
    ).toBe(true)
  })

  it('aceita 64 caracteres e recusa 65', () => {
    expect(
      validateFiscalSettings(values({ codigoCsc: 'a'.repeat(64) }), true).ok,
    ).toBe(true)
    expect(
      validateFiscalSettings(values({ codigoCsc: 'a'.repeat(65) }), true).ok,
    ).toBe(false)
  })

  it('recusa CSC com pontuação', () => {
    const resultado = validateFiscalSettings(
      values({ codigoCsc: 'ABCD-EFGH-IJKL-MNOP-QRST' }),
      true,
    )

    expect(resultado.ok).toBe(false)
    expect(resultado.errors.codigoCsc).toMatch(/apenas letras e números/)
  })

  it('orienta a não confundir o código com o ID', () => {
    const resultado = validateFiscalSettings(
      values({ codigoCsc: '123456' }),
      true,
    )

    expect(resultado.errors.codigoCsc).toMatch(/portal da SEFAZ/i)
    expect(resultado.errors.codigoCsc).toMatch(/ID do CSC/i)
  })

  it('não devolve o valor digitado na mensagem de erro', () => {
    const resultado = validateFiscalSettings(
      values({ codigoCsc: 'SEGREDO123' }),
      true,
    )

    expect(resultado.errors.codigoCsc).not.toContain('SEGREDO123')
  })
})

describe('validateFiscalSettings — ID do CSC', () => {
  it.each(['1', '000001', '123456'])('aceita %s', (idCsc) => {
    expect(validateFiscalSettings(values({ idCsc }), true).ok).toBe(true)
  })

  it('aceita ID vazio', () => {
    expect(validateFiscalSettings(values({ idCsc: '' }), true).ok).toBe(true)
  })

  it('recusa ID com letras', () => {
    const resultado = validateFiscalSettings(values({ idCsc: 'ABC' }), true)

    expect(resultado.ok).toBe(false)
    expect(resultado.errors.idCsc).toMatch(/numérico/)
  })

  it('recusa ID com 7 dígitos', () => {
    expect(validateFiscalSettings(values({ idCsc: '1234567' }), true).ok).toBe(
      false,
    )
  })
})

describe('validateFiscalSettings — criação', () => {
  it('aplica a mesma regra de CSC na criação', () => {
    const resultado = validateFiscalSettings(
      values({ codigoCsc: '123456' }),
      false,
    )

    expect(resultado.ok).toBe(false)
    expect(resultado.errors.codigoCsc).toBeDefined()
  })
})
