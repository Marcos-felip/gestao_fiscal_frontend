import { z } from 'zod'

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export interface ProfileFormValues {
  name: string
  email: string
}
