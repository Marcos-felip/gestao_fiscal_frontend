<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { Icon, Input, Select, Spinner } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FormActionBar from '@/shared/components/form/form-action-bar.vue'
import ReadOnlyNotice from '@/shared/components/permission/read-only-notice.vue'
import { brazilianStateOptions } from '@/core/constants/brazilian-states'
import { partnerTypeOptions } from '@/core/enums/partner-type.enum'
import { PersonType, personTypeOptions } from '@/core/enums/person-type.enum'
import { indIeDestOptions } from '@/core/enums/ind-ie-dest.enum'
import {
  formatCpf,
  formatCnpj,
  formatCep,
  formatPhone,
  onlyDigits,
} from '@/shared/ui/utils/masks'
import { fetchAddressByCep } from '@/core/services/via-cep'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  partnerSchema,
  type PartnerFormData,
  type PartnerFormValues,
} from '@/modules/partners/presentation/schemas/partner-schema'

const props = withDefaults(
  defineProps<{
    initial: PartnerFormValues
    loading: boolean
    submitLabel: string
    readonly?: boolean
  }>(),
  { readonly: false },
)

const emit = defineEmits<{
  submit: [values: PartnerFormValues]
  cancel: []
}>()

const form = reactive<PartnerFormValues>({ ...props.initial })

/**
 * Há alteração em relação ao que o formulário recebeu?
 *
 * Comparação por conteúdo, não por referência: `initial` é recriado a cada
 * renderização do pai, e comparar identidade acusaria alteração sem ninguém ter
 * digitado nada — que é justamente o ruído que a barra deveria evitar.
 */
const isDirty = computed(
  () => JSON.stringify(form) !== JSON.stringify(props.initial),
)

const errors = ref<Partial<Record<keyof PartnerFormData, string>>>({})
const cepLoading = ref(false)

watch(
  () => props.initial,
  (value) => Object.assign(form, value),
  { deep: true },
)

// Rótulo/placeholder do documento variam conforme o tipo de pessoa.
const isPessoaFisica = computed(() => form.personType === PersonType.PF)
const documentLabel = computed(() => (isPessoaFisica.value ? 'CPF' : 'CNPJ'))
const documentPlaceholder = computed(() =>
  isPessoaFisica.value ? '000.000.000-00' : '00.000.000/0000-00',
)
const documentMaxlength = computed(() => (isPessoaFisica.value ? '14' : '18'))

function maskDocument(value: string): string {
  return isPessoaFisica.value ? formatCpf(value) : formatCnpj(value)
}

// O `Select` só fala string; o contrato da NF-e usa os números da NT.
const indIeDestSelectOptions = indIeDestOptions.map((opcao) => ({
  value: String(opcao.value),
  label: opcao.label,
}))

/**
 * A dica muda com a escolha porque "contribuinte" e "não contribuinte" não são
 * óbvios para quem não é contador — e a escolha errada é rejeição da SEFAZ.
 */
const indIeDestHint = computed(() => {
  const escolhida = indIeDestOptions.find(
    (opcao) => String(opcao.value) === form.indIeDest,
  )

  return (
    escolhida?.description ??
    'Necessário para emitir NF-e. Não se deduz do tipo de pessoa.'
  )
})

// Ao trocar o tipo de pessoa, reaplica a máscara ao documento já digitado.
watch(
  () => form.personType,
  () => {
    if (form.cpfCnpj) form.cpfCnpj = maskDocument(form.cpfCnpj)
  },
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
  // Vem de graça na mesma consulta e é exigido na NF-e: preencher aqui evita
  // que o lojista precise procurar um número que ele não tem por que conhecer.
  if (address.ibgeCode) form.ibgeCode = address.ibgeCode
}

function handleSubmit(): void {
  // O `Select` trabalha com string; o schema e o backend, com o número da NT.
  const result = partnerSchema.safeParse({
    ...form,
    indIeDest: form.indIeDest ? Number(form.indIeDest) : null,
  })
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
        <!-- Seção 1: Identificação -->
        <motion.div :variants="item">
          <FormSection
            icon="Users"
            title="Identificação"
            description="Tipo e nome do parceiro."
          >
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Select
                v-model="form.type"
                :options="partnerTypeOptions"
                placeholder="Selecione"
                :error="errors.type"
              >
                <template #label>Tipo de parceiro</template>
              </Select>

              <Select
                v-model="form.personType"
                :options="personTypeOptions"
                placeholder="Selecione"
                :error="errors.personType"
              >
                <template #label>Tipo de pessoa</template>
              </Select>

              <Input
                v-model="form.name"
                maxlength="120"
                placeholder="Nome / Razão social"
                :error="errors.name"
              >
                <template #label>Nome</template>
              </Input>

              <Input
                v-model="form.tradeName"
                maxlength="120"
                placeholder="Nome fantasia"
                :error="errors.tradeName"
              >
                <template #label>Nome fantasia</template>
              </Input>
            </div>
          </FormSection>
        </motion.div>

        <!-- Seção 2: Documentos -->
        <motion.div :variants="item">
          <FormSection
            icon="FileText"
            title="Documentos"
            description="Documentos de identificação fiscal."
          >
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                :model-value="form.cpfCnpj"
                :maxlength="documentMaxlength"
                inputmode="numeric"
                :placeholder="documentPlaceholder"
                :error="errors.cpfCnpj"
                @update:model-value="form.cpfCnpj = maskDocument($event)"
              >
                <template #prefix><Icon name="Landmark" size="sm" /></template>
                <template #label>{{ documentLabel }}</template>
              </Input>

              <Input
                v-model="form.rgIe"
                maxlength="20"
                inputmode="numeric"
                placeholder="RG / Inscrição Estadual"
                :error="errors.rgIe"
              >
                <template #prefix><Icon name="Hash" size="sm" /></template>
                <template #label>RG / Inscrição Estadual</template>
              </Input>
            </div>
          </FormSection>
        </motion.div>

        <!-- Seção 3: Contato -->
        <motion.div :variants="item">
          <FormSection
            icon="Phone"
            title="Contato"
            description="Formas de contato do parceiro."
          >
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                v-model="form.email"
                maxlength="120"
                inputmode="email"
                placeholder="email@exemplo.com"
                :error="errors.email"
              >
                <template #prefix><Icon name="Mail" size="sm" /></template>
                <template #label>E-mail</template>
              </Input>

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

        <!-- Seção 4: Endereço -->
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

              <div class="sm:col-span-3">
                <Input
                  v-model="form.ibgeCode"
                  placeholder="3143302"
                  maxlength="7"
                  :error="errors.ibgeCode"
                >
                  <template #label>Código IBGE do município</template>
                  <template #hint>
                    Preenchido pelo CEP. Exigido para emitir NF-e.
                  </template>
                </Input>
              </div>

              <div class="sm:col-span-3">
                <Select
                  v-model="form.indIeDest"
                  :options="indIeDestSelectOptions"
                  placeholder="Selecione"
                  :error="errors.indIeDest"
                >
                  <template #label>Situação perante o ICMS</template>
                  <template #hint>{{ indIeDestHint }}</template>
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
      :dirty="isDirty"
      @secondary="emit('cancel')"
    />
  </form>
</template>
