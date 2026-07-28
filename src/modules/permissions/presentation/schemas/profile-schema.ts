import { z } from 'zod'

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe um nome com ao menos 2 caracteres')
    .max(60, 'O nome deve ter no máximo 60 caracteres'),
  description: z
    .string()
    .trim()
    .max(255, 'A descrição deve ter no máximo 255 caracteres')
    .optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
