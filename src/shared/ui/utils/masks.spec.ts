import { describe, expect, it } from 'vitest'
import {
  onlyDigits,
  formatCnpj,
  formatCep,
  formatPhone,
  isValidCnpj,
} from '@/shared/ui/utils/masks'

describe('onlyDigits', () => {
  it('remove tudo que não é dígito', () => {
    expect(onlyDigits('11.222.333/0001-81')).toBe('11222333000181')
    expect(onlyDigits('(11) 98765-4321')).toBe('11987654321')
    expect(onlyDigits('abc')).toBe('')
  })
})

describe('formatCnpj', () => {
  it('formata progressivamente conforme o usuário digita', () => {
    expect(formatCnpj('11')).toBe('11')
    expect(formatCnpj('112')).toBe('11.2')
    expect(formatCnpj('11222')).toBe('11.222')
    expect(formatCnpj('112223330001')).toBe('11.222.333/0001')
    expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81')
  })

  it('ignora dígitos além de 14 e caracteres inválidos', () => {
    expect(formatCnpj('11222333000181999')).toBe('11.222.333/0001-81')
    expect(formatCnpj('11.222.333/0001-81')).toBe('11.222.333/0001-81')
  })
})

describe('formatCep', () => {
  it('formata como 00000-000', () => {
    expect(formatCep('12345')).toBe('12345')
    expect(formatCep('12345678')).toBe('12345-678')
    expect(formatCep('123456789')).toBe('12345-678')
  })
})

describe('formatPhone', () => {
  it('formata telefone fixo com 10 dígitos', () => {
    expect(formatPhone('1132654321')).toBe('(11) 3265-4321')
  })

  it('formata celular com 11 dígitos', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('formata parcialmente durante a digitação', () => {
    expect(formatPhone('11')).toBe('11')
    expect(formatPhone('119')).toBe('(11) 9')
  })
})

describe('isValidCnpj', () => {
  it('aceita CNPJ válido (com ou sem máscara)', () => {
    expect(isValidCnpj('11222333000181')).toBe(true)
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true)
  })

  it('rejeita dígito verificador incorreto', () => {
    expect(isValidCnpj('11222333000182')).toBe(false)
  })

  it('rejeita tamanho inválido e sequências repetidas', () => {
    expect(isValidCnpj('123')).toBe(false)
    expect(isValidCnpj('00000000000000')).toBe(false)
    expect(isValidCnpj('11111111111111')).toBe(false)
  })
})
