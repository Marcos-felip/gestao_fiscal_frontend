/**
 * Utilitários de máscara e validação para campos brasileiros.
 *
 * Funções puras (sem dependência externa): recebem qualquer string e devolvem
 * o valor formatado, ignorando caracteres não numéricos. São aplicadas no
 * `@update:modelValue` dos campos e reaproveitadas em produtos/parceiros/etc.
 */

/** Remove tudo que não for dígito. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Formata CNPJ progressivamente: `00.000.000/0000-00` (até 14 dígitos). */
export function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14)

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
}

/** Formata CEP: `00000-000` (até 8 dígitos). */
export function formatCep(value: string): string {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, '$1-$2')
}

/**
 * Formata telefone fixo `(00) 0000-0000` ou celular `(00) 00000-0000`,
 * escolhendo o padrão pela quantidade de dígitos (até 11).
 */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

/**
 * Valida um CNPJ pelos dígitos verificadores (algoritmo módulo 11).
 * Aceita valor com ou sem máscara. Rejeita sequências repetidas (ex.: 111...).
 */
export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const checkDigit = (base: string): number => {
    const length = base.length
    let sum = 0
    let pos = length - 7

    for (let i = length; i >= 1; i--) {
      sum += Number(base[length - i]) * pos
      pos -= 1
      if (pos < 2) pos = 9
    }

    const result = sum % 11
    return result < 2 ? 0 : 11 - result
  }

  const base = cnpj.slice(0, 12)
  const digit1 = checkDigit(base)
  const digit2 = checkDigit(base + String(digit1))

  return cnpj.endsWith(`${digit1}${digit2}`)
}
