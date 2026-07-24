<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, Input, Select, Tooltip } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import { companyTypeOptions } from '@/enums/company-type.enum'
import { taxRegimeOptions } from '@/enums/tax-regime.enum'
import { formatCnpj, formatPhone, onlyDigits } from '@/shared/ui/utils/masks'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  companySchema,
  type CompanyFormData,
  type CompanyFormValues,
} from '@/modules/companies/presentation/schemas/company-schema'

const props = defineProps<{
  initial: CompanyFormValues
  loading: boolean
}>()

const emit = defineEmits<{
  submit: [values: CompanyFormValues]
}>()

const form = reactive<CompanyFormValues>({
  name: '',
  type: '',
  cnpj: '',
  stateRegistration: '',
  phone: '',
  taxRegime: '',
})

const errors = ref<Partial<Record<keyof CompanyFormData, string>>>({})

// Semeia o formulário com os dados carregados (e re-semeia após salvar).
watch(
  () => props.initial,
  (value) => Object.assign(form, value),
  { immediate: true, deep: true },
)

// Há alterações não salvas em relação ao estado carregado?
const isDirty = computed(() =>
  (Object.keys(form) as (keyof CompanyFormValues)[]).some(
    (key) => form[key] !== props.initial[key],
  ),
)

function handleSubmit(): void {
  const result = companySchema.safeParse({
    name: form.name,
    type: form.type,
    cnpj: form.cnpj,
    stateRegistration: form.stateRegistration,
    phone: form.phone,
    taxRegime: form.taxRegime,
  })

  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }

  errors.value = {}
  emit('submit', { ...form })
}

function discard(): void {
  Object.assign(form, props.initial)
  errors.value = {}
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
              hint="Usado nas notas fiscais."
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
                    text="Cadastro Nacional da Pessoa Jurídica, no formato 00.000.000/0000-00."
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
                    text="Registro estadual da empresa. Mínimo de 11 dígitos."
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
    </motion.div>

    <!-- Barra de ações flutuante com estado de alterações -->
    <div class="sticky bottom-4 z-10 mt-6">
      <div
        class="ui-shadow-float flex items-center justify-between gap-3 rounded-xl border border-line-2 bg-background/90 px-4 py-3 backdrop-blur-md"
      >
        <p class="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            :class="[
              'size-2 rounded-full transition-colors',
              isDirty ? 'bg-warning' : 'bg-success',
            ]"
          />
          {{ isDirty ? 'Alterações não salvas' : 'Tudo salvo' }}
        </p>

        <div class="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            :disabled="props.loading || !isDirty"
            @click="discard"
          >
            Descartar
          </Button>
          <Button
            type="submit"
            variant="primary"
            text-class="text-white"
            :loading="props.loading"
            :disabled="!isDirty"
            loading-text="Salvando…"
          >
            <template #icon>
              <Icon name="Check" size="sm" />
            </template>
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  </form>
</template>
