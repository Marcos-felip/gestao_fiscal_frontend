import { z } from 'zod'
import { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'
import { toFormErrors } from '@/core/utils/zod-errors'

/** Valores do formulário de configuração fiscal (números como texto no input). */
export interface FiscalSettingsFormValues {
  ambiente: FiscalEnvironment
  serieNfce: string
  proximoNumeroNfce: string
  /** Série e numeração da NF-e modelo 55, independentes das da NFC-e. */
  serieNfe: string
  proximoNumeroNfe: string
  codigoCsc: string
  idCsc: string
  ativo: boolean
}

export type FiscalSettingsErrors = Partial<
  Record<keyof FiscalSettingsFormValues, string>
>

export interface FiscalSettingsValidation {
  errors: FiscalSettingsErrors
  ok: boolean
}

// Sem citar o modelo na mensagem: o mesmo campo valida NFC-e e NF-e, e o
// rótulo ao lado do input já diz de qual das duas séries se trata.
const serieField = z
  .string()
  .trim()
  .min(1, 'Informe a série')
  .regex(/^\d+$/, 'Use apenas números')
  .refine((value) => {
    const parsed = Number(value)
    return parsed >= 1 && parsed <= 999
  }, 'Série deve estar entre 1 e 999')

const proximoNumeroField = z
  .string()
  .trim()
  .min(1, 'Informe o próximo número')
  .regex(/^\d+$/, 'Use apenas números')
  .refine((value) => Number(value) >= 1, 'Número deve ser maior ou igual a 1')

/**
 * Código CSC: 16 a 64 caracteres alfanuméricos, vindo do portal da SEFAZ da UF.
 *
 * O mínimo é 16 e **não** 32 de propósito: cada UF emite o CSC no seu tamanho
 * (MG usa 32 hexadecimais, outras usam 36) e travar no tamanho de uma delas
 * recusaria o código legítimo das demais. 16 já pega a classe de erro que
 * importa — copiar o campo errado do portal.
 *
 * Vazio continua válido: a configuração fiscal é preenchida em etapas.
 */
const codigoCscField = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || (value.length >= 16 && value.length <= 64),
    'O código CSC deve ter de 16 a 64 caracteres. Copie o código gerado no portal da SEFAZ da sua UF — não confunda com o ID do CSC.',
  )
  .refine(
    (value) => value === '' || /^[A-Za-z0-9]+$/.test(value),
    'O código CSC aceita apenas letras e números, sem espaços ou pontuação.',
  )

/** ID do CSC: o `cIdToken` do QR Code, numérico e de até 6 posições. */
const idCscField = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^\d{1,6}$/.test(value),
    'O ID do CSC deve ser numérico, com no máximo 6 dígitos. É o token que a SEFAZ emite junto com o código — não é o código em si.',
  )

const baseSchema = z.object({
  ambiente: z.nativeEnum(FiscalEnvironment),
  serieNfce: serieField,
  serieNfe: serieField,
  codigoCsc: codigoCscField,
  idCsc: idCscField,
  ativo: z.boolean(),
})

// Na criação o próximo número é definido pelo backend (começa em 1).
const createSchema = baseSchema.extend({
  proximoNumeroNfce: z.string(),
  proximoNumeroNfe: z.string(),
})

// Na edição a numeração já existe e pode ser ajustada — validada.
const editSchema = baseSchema.extend({
  proximoNumeroNfce: proximoNumeroField,
  proximoNumeroNfe: proximoNumeroField,
})

/**
 * Valida o formulário de configuração fiscal. O `isEdit` liga a validação do
 * `proximoNumeroNfce`, que só é editável quando já existe configuração.
 */
export function validateFiscalSettings(
  values: FiscalSettingsFormValues,
  isEdit: boolean,
): FiscalSettingsValidation {
  const schema = isEdit ? editSchema : createSchema
  const result = schema.safeParse(values)
  if (result.success) return { errors: {}, ok: true }
  return { errors: toFormErrors(result.error), ok: false }
}
