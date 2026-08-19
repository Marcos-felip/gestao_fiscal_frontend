import { z } from 'zod'
import { PartnerType } from '@/core/enums/partner-type.enum'
import { PersonType } from '@/core/enums/person-type.enum'
import { IndIeDest } from '@/core/enums/ind-ie-dest.enum'
import { onlyDigits } from '@/shared/ui/utils/masks'

export const partnerSchema = z.object({
  type: z.nativeEnum(PartnerType, {
    errorMap: () => ({ message: 'Selecione o tipo de parceiro' }),
  }),
  personType: z.nativeEnum(PersonType, {
    errorMap: () => ({ message: 'Selecione o tipo de pessoa' }),
  }),
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  tradeName: z.string().max(120, 'Máximo 120 caracteres').optional(),
  cpfCnpj: z.string().optional(),
  rgIe: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine(
      (v) => !v || z.string().email().safeParse(v).success,
      'E-mail inválido',
    ),
  phone: z.string().optional(),
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
  ibgeCode: z
    .string()
    .optional()
    .refine(
      (v) => !v || onlyDigits(v).length === 7,
      'Código IBGE deve ter 7 dígitos',
    ),
  indIeDest: z
    .union([z.literal(1), z.literal(2), z.literal(9)])
    .nullable()
    .optional(),
})
  .refine(
    (data) =>
      data.indIeDest !== IndIeDest.CONTRIBUINTE ||
      onlyDigits(data.rgIe ?? '').length > 0,
    {
      message:
        'Contribuinte de ICMS precisa de inscrição estadual — preencha "RG / Inscrição estadual"',
      path: ['rgIe'],
    },
  )

export type PartnerFormData = z.infer<typeof partnerSchema>

export interface PartnerFormValues {
  type: string
  personType: string
  name: string
  tradeName: string
  cpfCnpj: string
  rgIe: string
  email: string
  phone: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  ibgeCode: string
  indIeDest: string
}
