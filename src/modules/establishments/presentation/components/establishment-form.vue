<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { Icon, Input, Select, Spinner, Tooltip } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FormActionBar from '@/shared/components/form/form-action-bar.vue'
import ReadOnlyNotice from '@/shared/components/permission/read-only-notice.vue'
import { brazilianStateOptions } from '@/core/constants/brazilian-states'
import { formatCnpj, formatCep, onlyDigits } from '@/shared/ui/utils/masks'
import { fetchAddressByCep } from '@/core/services/via-cep'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  establishmentSchema,
  type EstablishmentFormData,
  type EstablishmentFormValues,
} from '@/modules/establishments/presentation/schemas/establishment-schema'

const props = withDefaults(
  defineProps<{
    initial: EstablishmentFormValues
    loading: boolean
    submitLabel: string
    readonly?: boolean
  }>(),
  { readonly: false },
)

const emit = defineEmits<{
  submit: [values: EstablishmentFormValues]
  cancel: []
}>()

const form = reactive<EstablishmentFormValues>({ ...props.initial })
const errors = ref<Partial<Record<keyof EstablishmentFormData, string>>>({})
const cepLoading = ref(false)

watch(
  () => props.initial,
  (value) => Object.assign(form, value),
  { deep: true },
)

// Autofill por CEP: dispara só na digitação do usuário (não ao semear).
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
  const result = establishmentSchema.safeParse({ ...form })
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }
  errors.value = {}
  emit('submit', { ...form })
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
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
  <form @submit.prevent="handleSubmit">
    <ReadOnlyNotice v-if="props.readonly" />

    <fieldset :disabled="props.readonly" class="min-w-0">
      <motion.div
        class="space-y-6"
        :variants="container"
        initial="hidden"
        animate="visible"
      >
        <!-- Seção 1: Informações básicas -->
        <motion.div :variants="item">
          <FormSection
            icon="Store"
            title="Informações básicas"
            description="Identificação do estabelecimento."
          >
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                v-model="form.name"
                maxlength="120"
                placeholder="Nome do estabelecimento"
                :error="errors.name"
              >
                <template #label>Nome</template>
              </Input>

              <!-- Tipo fixo: a matriz é gerida na página de Empresa. -->
              <div>
                <span
                  class="mb-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground"
                >
                  Tipo
                  <Tooltip
                    text="A sede (matriz) é gerenciada na página de Empresa. Este cadastro cria apenas filiais."
                  >
                    <Icon
                      name="HelpCircle"
                      size="sm"
                      class="text-foreground/40"
                    />
                  </Tooltip>
                </span>
                <div
                  class="flex h-11 items-center gap-2 rounded-lg border border-line-2 bg-muted/40 px-3 text-sm text-muted-foreground"
                >
                  <Icon name="Store" size="sm" class="shrink-0" />
                  Filial
                </div>
              </div>
            </div>
          </FormSection>
        </motion.div>

        <!-- Seção 2: Dados fiscais -->
        <motion.div :variants="item">
          <FormSection
            icon="FileText"
            title="Dados fiscais"
            description="Documentos de identificação fiscal."
          >
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

              <Input
                v-model="form.inscricaoEstadual"
                maxlength="20"
                inputmode="numeric"
                placeholder="Inscrição Estadual"
              >
                <template #prefix><Icon name="Hash" size="sm" /></template>
                <template #label>Inscrição Estadual</template>
              </Input>

              <Input
                v-model="form.inscricaoMunicipal"
                maxlength="20"
                inputmode="numeric"
                placeholder="Inscrição Municipal"
              >
                <template #prefix><Icon name="Hash" size="sm" /></template>
                <template #label>Inscrição Municipal</template>
              </Input>
            </div>
          </FormSection>
        </motion.div>

        <!-- Seção 3: Endereço -->
        <motion.div :variants="item">
          <FormSection
            icon="MapPin"
            title="Endereço"
            description="Digite o CEP para preencher o endereço automaticamente."
          >
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-6">
              <div class="sm:col-span-2">
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

              <div class="sm:col-span-3">
                <Input v-model="form.city" placeholder="Cidade">
                  <template #label>Cidade</template>
                </Input>
              </div>

              <div class="sm:col-span-3">
                <Select
                  v-model="form.state"
                  :options="brazilianStateOptions"
                  placeholder="UF"
                  :error="errors.state"
                >
                  <template #label>Estado</template>
                </Select>
              </div>
            </div>
          </FormSection>
        </motion.div>
      </motion.div>
    </fieldset>

    <FormActionBar
      v-if="!props.readonly"
      :submit-label="props.submitLabel"
      :loading="props.loading"
      @secondary="emit('cancel')"
    />
  </form>
</template>
