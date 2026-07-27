import { z } from 'zod'
import { EstablishmentType } from '@/enums/establishment-type.enum'
import { isValidCnpj, onlyDigits } from '@/shared/ui/utils/masks'

export const establishmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  type: z.nativeEnum(EstablishmentType, {
    errorMap: () => ({ message: 'Selecione o tipo' }),
  }),
  cnpj: z
    .string()
    .optional()
    .refine((v) => !v || isValidCnpj(v), 'CNPJ inválido'),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  cep: z
    .string()
    .optional()
    .refine((v) => !v || onlyDigits(v).length === 8, 'CEP inválido'),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z
    .string()
    .optional()
    .refine((v) => !v || v.length === 2, 'UF inválida'),
})

export type EstablishmentFormData = z.infer<typeof establishmentSchema>

export interface EstablishmentFormValues {
  name: string
  type: string
  cnpj: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}
