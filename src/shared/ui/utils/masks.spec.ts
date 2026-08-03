import { describe, expect, it } from 'vitest'
import {
  onlyDigits,
  formatCnpj,
  formatCep,
  formatPhone,
  formatDateBr,
  dateBrToIso,
  formatMoneyInput,
  isValidCnpj,
} from '@/shared/ui/utils/masks'

describe('onlyDigits', () => {
  it('remove tudo que não é dígito', () => {
    expect(onlyDigits('11.222.333/0001-81')).toBe('11222333000181')
    expect(onlyDigits('(11) 98765-4321')).toBe('11987654321')
    expect(onlyDigits('abc')).toBe('')
  })
})

describe('formatMoneyInput', () => {
  it('formata a digitação como moeda (base centavos)', () => {
    expect(formatMoneyInput('1')).toBe('0,01')
    expect(formatMoneyInput('100')).toBe('1,00')
    expect(formatMoneyInput('123456')).toBe('1.234,56')
  })

  it('ignora caracteres não numéricos e devolve vazio sem dígitos', () => {
    expect(formatMoneyInput('R$ 1.000,00')).toBe('1.000,00')
    expect(formatMoneyInput('')).toBe('')
    expect(formatMoneyInput('abc')).toBe('')
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

describe('formatDateBr', () => {
  it('formata progressivamente como dd/MM/aaaa', () => {
    expect(formatDateBr('3')).toBe('3')
    expect(formatDateBr('31')).toBe('31')
    expect(formatDateBr('3108')).toBe('31/08')
    expect(formatDateBr('31082026')).toBe('31/08/2026')
  })

  it('ignora dígitos além de 8 e caracteres inválidos', () => {
    expect(formatDateBr('31082026999')).toBe('31/08/2026')
    expect(formatDateBr('31/08/2026')).toBe('31/08/2026')
  })
})

describe('dateBrToIso', () => {
  it('converte data válida para ISO', () => {
    const iso = dateBrToIso('31/08/2026')
    expect(iso).toBeDefined()
    expect(new Date(iso as string).getFullYear()).toBe(2026)
    expect(new Date(iso as string).getDate()).toBe(31)
  })

  it('rejeita data incompleta ou inexistente', () => {
    expect(dateBrToIso('31/08')).toBeUndefined()
    expect(dateBrToIso('')).toBeUndefined()
    expect(dateBrToIso('31/02/2026')).toBeUndefined()
    expect(dateBrToIso('00/13/2026')).toBeUndefined()
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
