import { inject, type InjectionKey, type Ref } from 'vue'
import { z } from 'zod'
import { TaxRegime } from '@/enums/tax-regime.enum'
import { CompanyType } from '@/enums/company-type.enum'
import { isValidCnpj, onlyDigits } from '@/shared/ui/utils/masks'

export const onboardingSchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  type: z
    .union([z.nativeEnum(CompanyType), z.literal('')])
    .optional(),
  cnpj: z.string().refine((v) => isValidCnpj(v), 'CNPJ inválido'),
  taxRegime: z.nativeEnum(TaxRegime, {
    errorMap: () => ({ message: 'Selecione o regime tributário' }),
  }),
  phone: z.string().optional(),
  establishmentName: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
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

export type OnboardingFormData = z.infer<typeof onboardingSchema>

export interface OnboardingFormValues {
  name: string
  type: string
  cnpj: string
  taxRegime: string
  phone: string
  establishmentName: string
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

export type OnboardingErrors = Partial<Record<keyof OnboardingFormData, string>>

export interface OnboardingStep {
  key: 'empresa' | 'fiscal' | 'matriz'
  icon: string
  title: string
  description: string
  fields: (keyof OnboardingFormData)[]
}

// Contexto compartilhado do wizard: a página provê, os campos injetam. Evita
// passar o form por props (e a mutação de prop que o lint bloquearia).
export const ONBOARDING_FORM: InjectionKey<OnboardingFormValues> =
  Symbol('onboarding-form')
export const ONBOARDING_ERRORS: InjectionKey<Ref<OnboardingErrors>> =
  Symbol('onboarding-errors')

/** Injeta o contexto do wizard (form + errors), garantindo que exista. */
export function useOnboardingContext(): {
  form: OnboardingFormValues
  errors: Ref<OnboardingErrors>
} {
  const form = inject(ONBOARDING_FORM)
  const errors = inject(ONBOARDING_ERRORS)
  if (!form || !errors) throw new Error('Contexto de onboarding ausente')
  return { form, errors }
}
