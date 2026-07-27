import { z } from 'zod'

export const inviteSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  role: z.string().min(1, 'Selecione o papel'),
})

export type InviteFormData = z.infer<typeof inviteSchema>

export interface InviteFormValues {
  name: string
  email: string
  role: string
}
