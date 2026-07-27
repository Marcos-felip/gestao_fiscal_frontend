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

/**
 * Dados da sede (estabelecimento MATRIZ) editados dentro da página de Empresa.
 * CNPJ e Inscrição Estadual NÃO entram aqui — são governados pela empresa
 * (fonte única) e propagados para a matriz ao salvar.
 */
export const sedeSchema = z.object({
  name: z.string().optional(),
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

export type SedeFormData = z.infer<typeof sedeSchema>

export interface SedeFormValues {
  name: string
  inscricaoMunicipal: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}
