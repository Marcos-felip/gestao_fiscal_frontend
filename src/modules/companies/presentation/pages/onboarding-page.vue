<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, Input, Select, Spinner } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import { makeOnboardingController } from '@/modules/companies/factories/companies.factory'
import {
  onboardingSchema,
  type OnboardingFormData,
  type OnboardingFormValues,
} from '@/modules/companies/presentation/schemas/onboarding-schema'
import { companyTypeOptions } from '@/enums/company-type.enum'
import { taxRegimeOptions } from '@/enums/tax-regime.enum'
import { brazilianStateOptions } from '@/core/constants/brazilian-states'
import {
  formatCnpj,
  formatCep,
  formatPhone,
  onlyDigits,
} from '@/shared/ui/utils/masks'
import { fetchAddressByCep } from '@/core/services/via-cep'
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
const errors = ref<Partial<Record<keyof OnboardingFormData, string>>>({})
const cepLoading = ref(false)

const needsCreation = computed(() => controller.needsCompanyCreation.value)

onMounted(async () => {
  await controller.prepare()
  // Empresa já existe (criada, mas não configurada): semeia e trava o nome.
  if (!needsCreation.value) {
    form.name = controller.existingCompanyName
  }
})

async function onCepInput(value: string): Promise<void> {
  const masked = formatCep(value)
  const changed = masked !== form.cep
  form.cep = masked
  if (!changed || onlyDigits(masked).length !== 8) return

  cepLoading.value = true
  const address = await fetchAddressByCep(masked)
  cepLoading.value = false
  if (!address) return
  if (address.street) form.street = address.street
  if (address.neighborhood) form.neighborhood = address.neighborhood
  if (address.city) form.city = address.city
  if (address.state) form.state = address.state
}

function handleSubmit(): void {
  const result = onboardingSchema.safeParse({ ...form })
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }
  errors.value = {}
  void controller.save({ ...form })
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 30 },
  },
}
</script>

<template>
  <div class="min-h-screen bg-background-2 px-4 py-10">
    <div class="mx-auto max-w-2xl">
      <!-- Cabeçalho -->
      <div class="mb-8 text-center">
        <span
          class="ui-shadow-soft mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-white"
        >
          <Icon name="Rocket" size="lg" />
        </span>
        <h1
          class="font-display mt-4 text-2xl font-bold tracking-tight text-foreground"
        >
          {{ needsCreation ? 'Vamos configurar sua empresa' : 'Configure sua empresa' }}
        </h1>
        <p class="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Precisamos de alguns dados fiscais e do seu estabelecimento matriz
          para liberar o sistema.
        </p>
      </div>

      <!-- Erro -->
      <div
        v-if="controller.hasError"
        class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {{ controller.errorMessage }}
      </div>

      <!-- Carregando estado inicial -->
      <div
        v-if="!controller.loaded.value"
        class="flex justify-center py-16 text-primary"
      >
        <Spinner size="lg" />
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <motion.div
          class="space-y-6"
          :variants="container"
          initial="hidden"
          animate="visible"
        >
          <!-- Sua empresa -->
          <motion.div :variants="item">
            <FormSection
              icon="Building2"
              title="Sua empresa"
              description="Identificação e regime tributário."
            >
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  v-model="form.name"
                  maxlength="120"
                  placeholder="Razão social"
                  :disabled="!needsCreation"
                  :error="errors.name"
                >
                  <template #label>Nome da empresa</template>
                </Input>

                <Select
                  v-model="form.type"
                  :options="companyTypeOptions"
                  placeholder="Não informar"
                  :disabled="!needsCreation"
                  :error="errors.type"
                >
                  <template #label>Tipo de empresa</template>
                </Select>

                <Input
                  :model-value="form.cnpj"
                  maxlength="18"
                  inputmode="numeric"
                  placeholder="00.000.000/0000-00"
                  :error="errors.cnpj"
                  @update:model-value="form.cnpj = formatCnpj($event)"
                >
                  <template #prefix><Icon name="Landmark" size="sm" /></template>
                  <template #label>CNPJ</template>
                </Input>

                <Select
                  v-model="form.taxRegime"
                  :options="taxRegimeOptions"
                  placeholder="Selecione"
                  :error="errors.taxRegime"
                >
                  <template #label>Regime tributário</template>
                </Select>

                <Input
                  :model-value="form.phone"
                  maxlength="15"
                  inputmode="tel"
                  placeholder="(00) 00000-0000"
                  :error="errors.phone"
                  @update:model-value="form.phone = formatPhone($event)"
                >
                  <template #prefix><Icon name="Phone" size="sm" /></template>
                  <template #label>Telefone</template>
                </Input>
              </div>
            </FormSection>
          </motion.div>

          <!-- Estabelecimento matriz -->
          <motion.div :variants="item">
            <FormSection
              icon="Store"
              title="Estabelecimento matriz"
              description="A sede da empresa e seu endereço."
            >
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <Input
                    v-model="form.establishmentName"
                    maxlength="120"
                    placeholder="Nome da matriz"
                    :error="errors.establishmentName"
                  >
                    <template #label>Nome do estabelecimento</template>
                  </Input>
                </div>

                <div class="sm:col-span-3">
                  <Input
                    v-model="form.inscricaoEstadual"
                    maxlength="20"
                    inputmode="numeric"
                    placeholder="Inscrição Estadual"
                    :error="errors.inscricaoEstadual"
                  >
                    <template #label>Inscrição Estadual</template>
                  </Input>
                </div>

                <div class="sm:col-span-3">
                  <Input
                    v-model="form.inscricaoMunicipal"
                    maxlength="20"
                    inputmode="numeric"
                    placeholder="Inscrição Municipal"
                  >
                    <template #label>Inscrição Municipal</template>
                  </Input>
                </div>

                <div class="sm:col-span-3">
                  <Input
                    :model-value="form.cep"
                    maxlength="9"
                    inputmode="numeric"
                    placeholder="00000-000"
                    :error="errors.cep"
                    @update:model-value="onCepInput($event)"
                  >
                    <template #prefix><Icon name="MapPin" size="sm" /></template>
                    <template #suffix>
                      <Spinner v-if="cepLoading" size="sm" class="text-primary" />
                    </template>
                    <template #label>CEP</template>
                  </Input>
                </div>

                <div class="sm:col-span-4">
                  <Input v-model="form.street" placeholder="Rua / Logradouro">
                    <template #label>Logradouro</template>
                  </Input>
                </div>

                <div class="sm:col-span-2">
                  <Input v-model="form.number" placeholder="Número">
                    <template #label>Número</template>
                  </Input>
                </div>

                <div class="sm:col-span-2">
                  <Input v-model="form.complement" placeholder="Sala, andar…">
                    <template #label>Complemento</template>
                  </Input>
                </div>

                <div class="sm:col-span-2">
                  <Input v-model="form.neighborhood" placeholder="Bairro">
                    <template #label>Bairro</template>
                  </Input>
                </div>

                <div class="sm:col-span-1">
                  <Input v-model="form.city" placeholder="Cidade">
                    <template #label>Cidade</template>
                  </Input>
                </div>

                <div class="sm:col-span-1">
                  <Select
                    v-model="form.state"
                    :options="brazilianStateOptions"
                    placeholder="UF"
                    :error="errors.state"
                  >
                    <template #label>UF</template>
                  </Select>
                </div>
              </div>
            </FormSection>
          </motion.div>

          <div class="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              text-class="text-white"
              :loading="controller.isLoading"
              loading-text="Configurando…"
            >
              <template #icon><Icon name="Check" size="sm" /></template>
              Concluir configuração
            </Button>
          </div>
        </motion.div>
      </form>
    </div>
  </div>
</template>
