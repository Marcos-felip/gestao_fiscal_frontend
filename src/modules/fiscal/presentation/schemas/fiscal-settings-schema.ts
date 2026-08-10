import { z } from 'zod'
import { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'
import { toFormErrors } from '@/core/utils/zod-errors'

/** Valores do formulário de configuração fiscal (números como texto no input). */
export interface FiscalSettingsFormValues {
  ambiente: FiscalEnvironment
  serieNfce: string
  proximoNumeroNfce: string
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

const serieField = z
  .string()
  .trim()
  .min(1, 'Informe a série da NFC-e')
  .regex(/^\d+$/, 'Use apenas números')
  .refine((value) => {
    const parsed = Number(value)
    return parsed >= 1 && parsed <= 999
  }, 'Série deve estar entre 1 e 999')

const proximoNumeroField = z
  .string()
  .trim()
  .min(1, 'Informe o próximo número da NFC-e')
  .regex(/^\d+$/, 'Use apenas números')
  .refine((value) => Number(value) >= 1, 'Número deve ser maior ou igual a 1')

const baseSchema = z.object({
  ambiente: z.nativeEnum(FiscalEnvironment),
  serieNfce: serieField,
  codigoCsc: z.string(),
  idCsc: z.string(),
  ativo: z.boolean(),
})

// Na criação o próximo número é definido pelo backend (começa em 1).
const createSchema = baseSchema.extend({ proximoNumeroNfce: z.string() })

// Na edição a numeração já existe e pode ser ajustada — validada.
const editSchema = baseSchema.extend({ proximoNumeroNfce: proximoNumeroField })

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
