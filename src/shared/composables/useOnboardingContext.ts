import { inject, type InjectionKey, type Ref } from 'vue'
import type {
  OnboardingErrors,
  OnboardingFormValues,
} from '@/modules/companies/presentation/schemas/onboarding-schema'

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
