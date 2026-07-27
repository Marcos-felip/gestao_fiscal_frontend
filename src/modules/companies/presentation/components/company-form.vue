<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { Icon, Input, Select, Spinner, Tooltip } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FormActionBar from '@/shared/components/form/form-action-bar.vue'
import { companyTypeOptions } from '@/enums/company-type.enum'
import { taxRegimeOptions } from '@/enums/tax-regime.enum'
import { brazilianStateOptions } from '@/core/constants/brazilian-states'
import { formatCnpj, formatPhone, formatCep, onlyDigits } from '@/shared/ui/utils/masks'
import { fetchAddressByCep } from '@/core/services/via-cep'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  companySchema,
  sedeSchema,
  type CompanyFormData,
  type CompanyFormValues,
  type SedeFormData,
  type SedeFormValues,
} from '@/modules/companies/presentation/schemas/company-schema'

const props = defineProps<{
  company: CompanyFormValues
  sede: SedeFormValues
  hasSede: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  submit: [values: { company: CompanyFormValues; sede: SedeFormValues }]
}>()

const form = reactive<CompanyFormValues>({ ...props.company })
const sedeForm = reactive<SedeFormValues>({ ...props.sede })

const errors = ref<Partial<Record<keyof CompanyFormData, string>>>({})
const sedeErrors = ref<Partial<Record<keyof SedeFormData, string>>>({})
const cepLoading = ref(false)

// Semeia os formulários com os dados carregados (e re-semeia após salvar).
watch(
  () => props.company,
  (value) => Object.assign(form, value),
  { immediate: true, deep: true },
)
watch(
  () => props.sede,
  (value) => Object.assign(sedeForm, value),
  { immediate: true, deep: true },
)

// Há alterações não salvas em relação ao estado carregado?
const isDirty = computed(() => {
  const companyDirty = (Object.keys(form) as (keyof CompanyFormValues)[]).some(
    (key) => form[key] !== props.company[key],
  )
  const sedeDirty =
    props.hasSede &&
    (Object.keys(sedeForm) as (keyof SedeFormValues)[]).some(
      (key) => sedeForm[key] !== props.sede[key],
    )
  return companyDirty || sedeDirty
})

// Autofill por CEP: dispara só na digitação do usuário (não ao semear).
async function onCepInput(value: string): Promise<void> {
  const masked = formatCep(value)
  const changed = masked !== sedeForm.cep
  sedeForm.cep = masked
  if (!changed || onlyDigits(masked).length !== 8) return

  cepLoading.value = true
  const address = await fetchAddressByCep(masked)
  cepLoading.value = false
  if (!address) return

  if (address.street) sedeForm.street = address.street
  if (address.neighborhood) sedeForm.neighborhood = address.neighborhood
  if (address.city) sedeForm.city = address.city
  if (address.state) sedeForm.state = address.state
}

function handleSubmit(): void {
  const companyResult = companySchema.safeParse({ ...form })
  const sedeResult = props.hasSede
    ? sedeSchema.safeParse({ ...sedeForm })
    : null

  errors.value = companyResult.success
    ? {}
    : toFormErrors(companyResult.error)
  sedeErrors.value =
    sedeResult && !sedeResult.success ? toFormErrors(sedeResult.error) : {}

  if (!companyResult.success || (sedeResult && !sedeResult.success)) return

  emit('submit', { company: { ...form }, sede: { ...sedeForm } })
}

function discard(): void {
  Object.assign(form, props.company)
  Object.assign(sedeForm, props.sede)
  errors.value = {}
  sedeErrors.value = {}
}

// Entrada em cascata das seções.
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
    <motion.div
      class="space-y-6"
      :variants="container"
      initial="hidden"
      animate="visible"
    >
      <!-- Seção 1: Informações básicas -->
      <motion.div :variants="item">
        <FormSection
          icon="Building2"
          title="Informações básicas"
          description="Identificação e enquadramento da empresa."
        >
          <Input
            v-model="form.name"
            maxlength="120"
            placeholder="Razão social ou nome fantasia"
            :error="errors.name"
          >
            <template #label>
              <span class="inline-flex items-center gap-1.5">
                Nome da empresa
                <Tooltip
                  text="Como a empresa é identificada no sistema (razão social ou nome fantasia)."
                >
                  <Icon name="HelpCircle" size="sm" class="text-foreground/40" />
                </Tooltip>
              </span>
            </template>
          </Input>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Select
              v-model="form.type"
              :options="companyTypeOptions"
              placeholder="Selecione o tipo"
              :error="errors.type"
            >
              <template #label>
                <span class="inline-flex items-center gap-1.5">
                  Tipo de empresa
                  <Tooltip
                    text="Natureza jurídica: MEI, ME, EPP, LTDA, SA, EIRELI ou SLU."
                  >
                    <Icon
                      name="HelpCircle"
                      size="sm"
                      class="text-foreground/40"
                    />
                  </Tooltip>
                </span>
              </template>
            </Select>

            <Select
              v-model="form.taxRegime"
              :options="taxRegimeOptions"
              placeholder="Selecione o regime"
              :error="errors.taxRegime"
            >
              <template #label>
                <span class="inline-flex items-center gap-1.5">
                  Regime tributário
                  <Tooltip
                    text="Como a empresa é tributada: Simples Nacional, Lucro Presumido, Lucro Real ou MEI."
                  >
                    <Icon
                      name="HelpCircle"
                      size="sm"
                      class="text-foreground/40"
                    />
                  </Tooltip>
                </span>
              </template>
            </Select>
          </div>
        </FormSection>
      </motion.div>

      <!-- Seção 2: Dados fiscais -->
      <motion.div :variants="item">
        <FormSection
          icon="FileText"
          title="Dados fiscais"
          description="Documentos de identificação fiscal da empresa."
        >
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              :model-value="form.cnpj"
              maxlength="18"
              inputmode="numeric"
              placeholder="00.000.000/0000-00"
              hint="Compartilhado com a sede (matriz)."
              :error="errors.cnpj"
              @update:model-value="form.cnpj = formatCnpj($event)"
            >
              <template #prefix>
                <Icon name="Landmark" size="sm" />
              </template>
              <template #label>
                <span class="inline-flex items-center gap-1.5">
                  CNPJ
                  <Tooltip
                    text="Cadastro Nacional da Pessoa Jurídica, no formato 00.000.000/0000-00. Aplicado também à matriz."
                  >
                    <Icon
                      name="HelpCircle"
                      size="sm"
                      class="text-foreground/40"
                    />
                  </Tooltip>
                </span>
              </template>
            </Input>

            <Input
              :model-value="form.stateRegistration"
              maxlength="14"
              inputmode="numeric"
              placeholder="Somente números"
              hint="Mínimo de 11 dígitos."
              :error="errors.stateRegistration"
              @update:model-value="form.stateRegistration = onlyDigits($event)"
            >
              <template #prefix>
                <Icon name="Hash" size="sm" />
              </template>
              <template #label>
                <span class="inline-flex items-center gap-1.5">
                  Inscrição Estadual
                  <Tooltip
                    text="Registro estadual da empresa. Mínimo de 11 dígitos. Aplicado também à matriz."
                  >
                    <Icon
                      name="HelpCircle"
                      size="sm"
                      class="text-foreground/40"
                    />
                  </Tooltip>
                </span>
              </template>
            </Input>
          </div>
        </FormSection>
      </motion.div>

      <!-- Seção 3: Contato -->
      <motion.div :variants="item">
        <FormSection
          icon="Phone"
          title="Contato"
          description="Como falar com a empresa."
        >
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              :model-value="form.phone"
              maxlength="15"
              inputmode="tel"
              placeholder="(00) 00000-0000"
              hint="Telefone comercial com DDD."
              :error="errors.phone"
              @update:model-value="form.phone = formatPhone($event)"
            >
              <template #prefix>
                <Icon name="Phone" size="sm" />
              </template>
              <template #label>Telefone</template>
            </Input>
          </div>
        </FormSection>
      </motion.div>

      <!-- Seção 4: Sede / Matriz -->
      <motion.div :variants="item">
        <FormSection
          icon="MapPin"
          title="Sede / Matriz"
          description="Endereço e dados da unidade sede da empresa."
        >
          <div
            v-if="!props.hasSede"
            class="flex items-start gap-2 rounded-lg border border-line-2 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
          >
            <Icon name="Info" size="sm" class="mt-0.5 shrink-0" />
            <span>
              A matriz ainda não foi configurada. Conclua o cadastro da empresa
              para gerenciar a sede aqui.
            </span>
          </div>

          <template v-else>
            <Input
              v-model="sedeForm.name"
              maxlength="120"
              placeholder="Nome da unidade sede"
            >
              <template #label>
                <span class="inline-flex items-center gap-1.5">
                  Nome da sede
                  <Tooltip
                    text="Nome do estabelecimento matriz. Pode diferir do nome da empresa."
                  >
                    <Icon
                      name="HelpCircle"
                      size="sm"
                      class="text-foreground/40"
                    />
                  </Tooltip>
                </span>
              </template>
            </Input>

            <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <Input
                  :model-value="sedeForm.cep"
                  maxlength="9"
                  inputmode="numeric"
                  placeholder="00000-000"
                  :error="sedeErrors.cep"
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
                <Input v-model="sedeForm.street" placeholder="Rua / Logradouro">
                  <template #label>Logradouro</template>
                </Input>
              </div>

              <div class="sm:col-span-2">
                <Input v-model="sedeForm.number" placeholder="Número">
                  <template #label>Número</template>
                </Input>
              </div>

              <div class="sm:col-span-2">
                <Input v-model="sedeForm.complement" placeholder="Sala, andar…">
                  <template #label>Complemento</template>
                </Input>
              </div>

              <div class="sm:col-span-2">
                <Input v-model="sedeForm.neighborhood" placeholder="Bairro">
                  <template #label>Bairro</template>
                </Input>
              </div>

              <div class="sm:col-span-3">
                <Input v-model="sedeForm.city" placeholder="Cidade">
                  <template #label>Cidade</template>
                </Input>
              </div>

              <div class="sm:col-span-3">
                <Select
                  v-model="sedeForm.state"
                  :options="brazilianStateOptions"
                  placeholder="UF"
                  :error="sedeErrors.state"
                >
                  <template #label>Estado</template>
                </Select>
              </div>

              <div class="sm:col-span-3">
                <Input
                  v-model="sedeForm.inscricaoMunicipal"
                  maxlength="20"
                  inputmode="numeric"
                  placeholder="Inscrição Municipal"
                >
                  <template #prefix><Icon name="Hash" size="sm" /></template>
                  <template #label>Inscrição Municipal</template>
                </Input>
              </div>
            </div>
          </template>
        </FormSection>
      </motion.div>
    </motion.div>

    <FormActionBar
      submit-label="Salvar alterações"
      secondary-label="Descartar"
      show-status
      :dirty="isDirty"
      :loading="props.loading"
      @secondary="discard"
    />
  </form>
</template>
