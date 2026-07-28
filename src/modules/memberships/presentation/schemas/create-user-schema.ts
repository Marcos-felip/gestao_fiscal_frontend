import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  role: z.string().min(1, 'Selecione o papel'),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

export interface CreateUserFormValues {
  name: string
  email: string
  role: string
}
