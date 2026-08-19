import { z } from 'zod'

/** Limites do texto da correção exigidos pela SEFAZ. */
export const CORRECAO_MIN = 15
export const CORRECAO_MAX = 1000

export const correctionLetterSchema = z.object({
  correcao: z
    .string()
    .trim()
    .min(
      CORRECAO_MIN,
      `A correção deve ter no mínimo ${CORRECAO_MIN} caracteres`,
    )
    .max(
      CORRECAO_MAX,
      `A correção deve ter no máximo ${CORRECAO_MAX} caracteres`,
    ),
})

export type CorrectionLetterFormData = z.infer<typeof correctionLetterSchema>
