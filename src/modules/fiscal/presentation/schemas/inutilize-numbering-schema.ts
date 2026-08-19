import { z } from 'zod'
import { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'

/** Limites da justificativa da inutilização exigidos pela SEFAZ. */
export const INUTILIZACAO_JUSTIFICATIVA_MIN = 15
export const INUTILIZACAO_JUSTIFICATIVA_MAX = 255

export const inutilizeNumberingSchema = z
  .object({
    modelo: z.nativeEnum(FiscalDocumentModel),
    serie: z.number().int().min(0, 'Série inválida'),
    numeroInicial: z
      .number()
      .int()
      .min(1, 'A numeração fiscal começa em 1'),
    numeroFinal: z.number().int().min(1, 'A numeração fiscal começa em 1'),
    justificativa: z
      .string()
      .trim()
      .min(
        INUTILIZACAO_JUSTIFICATIVA_MIN,
        `A justificativa deve ter no mínimo ${INUTILIZACAO_JUSTIFICATIVA_MIN} caracteres`,
      )
      .max(
        INUTILIZACAO_JUSTIFICATIVA_MAX,
        `A justificativa deve ter no máximo ${INUTILIZACAO_JUSTIFICATIVA_MAX} caracteres`,
      ),
  })
  // Conferido aqui e no servidor: a faixa invertida é o erro de digitação mais
  // provável, e vale recusá-la antes de chegar perto da SEFAZ.
  .refine((v) => v.numeroFinal >= v.numeroInicial, {
    message: 'O número final deve ser maior ou igual ao inicial',
    path: ['numeroFinal'],
  })

export type InutilizeNumberingFormData = z.infer<typeof inutilizeNumberingSchema>
