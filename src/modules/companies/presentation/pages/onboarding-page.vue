<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { Button, Icon, Spinner } from '@/shared/ui'
import OnboardingBrandPanel from '@/modules/companies/presentation/components/onboarding-brand-panel.vue'
import OnboardingCompanyFields from '@/modules/companies/presentation/components/onboarding-company-fields.vue'
import OnboardingFiscalFields from '@/modules/companies/presentation/components/onboarding-fiscal-fields.vue'
import OnboardingMatrizFields from '@/modules/companies/presentation/components/onboarding-matriz-fields.vue'
import { makeOnboardingController } from '@/modules/companies/factories/companies.factory'
import {
  onboardingSchema,
  ONBOARDING_ERRORS,
  ONBOARDING_FORM,
  type OnboardingErrors,
  type OnboardingFormValues,
  type OnboardingStep,
} from '@/modules/companies/presentation/schemas/onboarding-schema'
import { toFormErrors } from '@/core/utils/zod-errors'

const controller = makeOnboardingController()

const form = reactive<OnboardingFormValues>({
  name: '',
  type: '',
  cnpj: '',
  taxRegime: '',
  phone: '',
  establishmentName: '',
  inscricaoEstadual: '',
  inscricaoMunicipal: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
})
const errors = ref<OnboardingErrors>({})

// Contexto do wizard consumido pelos componentes de campos.
provide(ONBOARDING_FORM, form)
provide(ONBOARDING_ERRORS, errors)

const needsCreation = computed(() => controller.needsCompanyCreation.value)

const ALL_STEPS: OnboardingStep[] = [
  {
    key: 'empresa',
    icon: 'Building2',
    title: 'Sua empresa',
    description: 'Como sua empresa se chama',
    fields: ['name', 'type'],
  },
  {
    key: 'fiscal',
    icon: 'ReceiptText',
    title: 'Dados fiscais',
    description: 'CNPJ e regime tributário',
    fields: ['cnpj', 'taxRegime', 'phone'],
  },
  {
    key: 'matriz',
    icon: 'Store',
    title: 'Estabelecimento matriz',
    description: 'A sede e seu endereço',
    fields: [
      'establishmentName',
      'inscricaoEstadual',
      'inscricaoMunicipal',
      'cep',
      'street',
      'number',
      'complement',
      'neighborhood',
      'city',
      'state',
    ],
  },
]

// Sem empresa: cria antes de configurar (3 passos). Com empresa: só configura.
const steps = computed(() =>
  needsCreation.value ? ALL_STEPS : ALL_STEPS.filter((s) => s.key !== 'empresa'),
)

const current = ref(0)
const direction = ref(1)
const currentStep = computed(() => steps.value[current.value])
const isFirst = computed(() => current.value === 0)
const isLast = computed(() => current.value === steps.value.length - 1)

onMounted(async () => {
  await controller.prepare()
  if (!needsCreation.value) form.name = controller.existingCompanyName
})

/** Valida o formulário inteiro, mas só bloqueia pelos campos do passo atual. */
function validateStep(): boolean {
  const result = onboardingSchema.safeParse({ ...form })
  const all = result.success ? {} : toFormErrors(result.error)
  const stepErrors: OnboardingErrors = {}
  for (const field of currentStep.value.fields) {
    if (all[field]) stepErrors[field] = all[field]
  }
  errors.value = stepErrors
  return Object.keys(stepErrors).length === 0
}

function next(): void {
  if (!validateStep()) return
  if (isLast.value) {
    submit()
    return
  }
  direction.value = 1
  current.value += 1
}

function back(): void {
  if (isFirst.value) return
  direction.value = -1
  current.value -= 1
  errors.value = {}
}

function submit(): void {
  const result = onboardingSchema.safeParse({ ...form })
  if (!result.success) {
    const all = toFormErrors(result.error)
    errors.value = all
    // Leva ao primeiro passo com erro.
    const idx = steps.value.findIndex((s) => s.fields.some((f) => all[f]))
    if (idx >= 0) {
      direction.value = idx < current.value ? -1 : 1
      current.value = idx
    }
    return
  }
  void controller.save({ ...form })
}

// Transição horizontal entre passos, conforme a direção da navegação.
const stepVariants = {
  enter: (dir: unknown) => ({ x: (dir as number) > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: unknown) => ({ x: (dir as number) > 0 ? -48 : 48, opacity: 0 }),
}
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
    <OnboardingBrandPanel :steps="steps" :current="current" />

    <!-- Painel do wizard -->
    <main class="relative flex flex-col justify-center overflow-hidden bg-background-1 px-6 py-10 sm:px-10 lg:px-16">
      <div class="pointer-events-none absolute inset-0 lg:hidden">
        <div
          class="ui-aurora absolute -top-20 left-1/2 h-[360px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-200/60 to-transparent blur-[90px]" />
      </div>

      <div class="relative z-10 mx-auto w-full max-w-xl">
        <!-- Logo + progresso compacto (mobile) -->
        <div class="mb-6 lg:hidden">
          <div class="flex items-center justify-center gap-2.5">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-line-2">
              <img src="/apple-touch-icon.png" alt="Gestão Fiscal" class="h-6 w-6" />
            </span>
            <span class="font-display text-base font-bold tracking-tight">
              <span class="text-foreground">Gestão</span>
              <span class="text-primary">Fiscal</span>
            </span>
          </div>
          <div class="mt-5 flex items-center gap-1.5">
            <span v-for="(step, index) in steps" :key="step.key" :class="[
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              index <= current ? 'bg-primary' : 'bg-line-2',
            ]" />
          </div>
        </div>

        <!-- Cabeçalho do passo -->
        <div class="mb-6 flex items-center gap-3">
          <span
            class="ui-shadow-soft flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <Icon :name="currentStep.icon" size="md" />
          </span>
          <div>
            <p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Passo {{ current + 1 }} de {{ steps.length }}
            </p>
            <h2 class="font-display text-xl font-bold tracking-tight text-foreground">
              {{ currentStep.title }}
            </h2>
          </div>
        </div>

        <!-- Erro do controller -->
        <div v-if="controller.hasError"
          class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {{ controller.errorMessage }}
        </div>

        <!-- Carregando estado inicial -->
        <div v-if="!controller.loaded.value" class="flex justify-center py-16 text-primary">
          <Spinner size="lg" />
        </div>

        <form v-else @submit.prevent="next">
          <div class="relative overflow-x-clip">
            <AnimatePresence :custom="direction" mode="wait">
              <motion.div :key="currentStep.key" :custom="direction" :variants="stepVariants" initial="enter"
                animate="center" exit="exit" :transition="{ type: 'spring', stiffness: 380, damping: 34 }">
                <OnboardingCompanyFields v-if="currentStep.key === 'empresa'" />
                <OnboardingFiscalFields v-else-if="currentStep.key === 'fiscal'" />
                <OnboardingMatrizFields v-else />
              </motion.div>
            </AnimatePresence>
          </div>

          <!-- Navegação -->
          <div class="mt-8 flex items-center justify-between gap-3">
            <Button v-if="!isFirst" type="button" variant="ghost" :disabled="controller.isLoading" @click="back">
              <template #icon>
                <Icon name="ArrowLeft" size="sm" />
              </template>
              Voltar
            </Button>
            <span v-else />

            <Button type="submit" variant="primary" text-class="text-white" :loading="controller.isLoading"
              loading-text="Configurando…">
              <span>{{ isLast ? 'Concluir configuração' : 'Continuar' }}</span>
              <Icon :name="isLast ? 'Check' : 'ArrowRight'" size="sm" />
            </Button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
