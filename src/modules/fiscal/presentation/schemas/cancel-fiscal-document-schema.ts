import { z } from 'zod'

/** Limites da justificativa de cancelamento exigidos pela SEFAZ. */
export const JUSTIFICATIVA_MIN = 15
export const JUSTIFICATIVA_MAX = 255

export const cancelFiscalDocumentSchema = z.object({
  justificativa: z
    .string()
    .trim()
    .min(
      JUSTIFICATIVA_MIN,
      `Justificativa deve ter no mínimo ${JUSTIFICATIVA_MIN} caracteres`,
    )
    .max(
      JUSTIFICATIVA_MAX,
      `Justificativa deve ter no máximo ${JUSTIFICATIVA_MAX} caracteres`,
    ),
})

export type CancelFiscalDocumentFormData = z.infer<
  typeof cancelFiscalDocumentSchema
>
