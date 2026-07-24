import { z } from 'zod'
import { CompanyType } from '@/enums/company-type.enum'
import { TaxRegime } from '@/enums/tax-regime.enum'
import { isValidCnpj, onlyDigits } from '@/shared/ui/utils/masks'

export const companySchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  type: z.union([z.nativeEnum(CompanyType), z.literal('')]).optional(),
  cnpj: z
    .string()
    .optional()
    .refine((v) => !v || isValidCnpj(v), 'CNPJ inválido'),
  stateRegistration: z
    .string()
    .optional()
    .refine(
      (v) => !v || onlyDigits(v).length >= 11,
      'Mínimo 11 dígitos',
    ),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || onlyDigits(v).length >= 10, 'Telefone inválido'),
  taxRegime: z.union([z.nativeEnum(TaxRegime), z.literal('')]).optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>

/** Valores do formulário como strings (o que os campos realmente controlam). */
export interface CompanyFormValues {
  name: string
  type: string
  cnpj: string
  stateRegistration: string
  phone: string
  taxRegime: string
}
