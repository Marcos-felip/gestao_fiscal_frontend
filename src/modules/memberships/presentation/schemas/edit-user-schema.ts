import { z } from 'zod'

export const editUserSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
})

export type EditUserFormData = z.infer<typeof editUserSchema>
