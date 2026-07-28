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

/** Formata CPF progressivamente: `000.000.000-00` (até 11 dígitos). */
export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)

  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
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
 * Sanitiza a digitação de um valor decimal: mantém apenas dígitos e um único
 * separador (vírgula ou ponto). Não formata — só evita caracteres inválidos.
 */
export function formatDecimalInput(value: string): string {
  const cleaned = value.replace(/[^\d.,]/g, '')
  // Preserva apenas o primeiro separador encontrado.
  const match = cleaned.match(/[.,]/)
  if (!match) return cleaned
  const sep = match[0]
  const [head, ...tail] = cleaned.split(sep)
  return tail.length ? `${head}${sep}${tail.join('')}` : cleaned
}

/**
 * Converte uma string decimal (pt-BR ou "en") em número.
 * - Com vírgula: trata vírgula como decimal e pontos como milhar (`1.234,56`).
 * - Sem vírgula: trata ponto como decimal (`1234.56`).
 * Retorna `undefined` quando vazio ou inválido.
 */
export function parseDecimal(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Formata um número como moeda pt-BR sem símbolo (ex.: `1.234,56`). */
export function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Formata um número como quantidade, removendo zeros à direita (ex.: `1,5`). */
export function formatQuantity(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
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
