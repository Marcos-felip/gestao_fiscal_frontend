<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { Icon, Input, Select } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FormActionBar from '@/shared/components/form/form-action-bar.vue'
import ReadOnlyNotice from '@/shared/components/permission/read-only-notice.vue'
import { unitOfMeasureOptions } from '@/core/enums/unit-of-measure.enum'
import { productOriginOptions } from '@/core/enums/product-origin.enum'
import {
  csosnOptions,
  cstIcmsOptions,
} from '@/core/enums/fiscal-tax-situation.enum'
import {
  cstContribuicaoOptions,
  exigeAliquota,
} from '@/core/enums/cst-contribuicao.enum'
import { formatDecimalInput, onlyDigits } from '@/shared/ui/utils/masks'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  productSchema,
  type ProductFormData,
  type ProductFormValues,
} from '@/modules/products/presentation/schemas/product-schema'

const props = withDefaults(
  defineProps<{
    initial: ProductFormValues
    loading: boolean
    submitLabel: string
    readonly?: boolean
  }>(),
  { readonly: false },
)

const emit = defineEmits<{
  submit: [values: ProductFormValues]
  cancel: []
}>()

const form = reactive<ProductFormValues>({
  ...props.initial,
  attributes: props.initial.attributes.map((a) => ({ ...a })),
})
const errors = ref<Partial<Record<keyof ProductFormData, string>>>({})

watch(
  () => props.initial,
  (value) =>
    Object.assign(form, {
      ...value,
      attributes: value.attributes.map((a) => ({ ...a })),
    }),
  { deep: true },
)

// Origem é opcional: primeira opção limpa o valor.
const originOptions = [
  { value: '', label: 'Não informar' },
  ...productOriginOptions,
]

// CSOSN/CST ICMS restritos aos valores aceitos pelo motor fiscal.
const csosnSelectOptions = [
  { value: '', label: 'Não informar' },
  ...csosnOptions,
]
const cstIcmsSelectOptions = [
  { value: '', label: 'Não informar' },
  ...cstIcmsOptions,
]

// PIS/COFINS não têm "não informar": são obrigatórios para o produto emitir.
const cstContribuicaoSelectOptions = cstContribuicaoOptions.map((opcao) => ({
  value: opcao.value,
  label: opcao.label,
}))

/** A alíquota só faz sentido quando a situação tributária é tributada. */
const exigeAliquotaPis = computed(() => exigeAliquota(form.cstPis))
const exigeAliquotaCofins = computed(() => exigeAliquota(form.cstCofins))

// Trocar para uma situação não tributada limpa a alíquota: deixá-la para trás
// gravaria valor num campo que o motor recusa preenchido.
watch(
  () => form.cstPis,
  () => {
    if (!exigeAliquotaPis.value) form.aliquotaPis = ''
  },
)
watch(
  () => form.cstCofins,
  () => {
    if (!exigeAliquotaCofins.value) form.aliquotaCofins = ''
  },
)

function addAttribute(): void {
  form.attributes.push({ key: '', value: '' })
}

function removeAttribute(index: number): void {
  form.attributes.splice(index, 1)
}

function handleSubmit(): void {
  const result = productSchema.safeParse({
    name: form.name,
    sku: form.sku,
    barcode: form.barcode,
    unit: form.unit,
    description: form.description,
    costPrice: form.costPrice,
    salePrice: form.salePrice,
    minStock: form.minStock,
    ncm: form.ncm,
    cest: form.cest,
    cfop: form.cfop,
    origin: form.origin,
    csosn: form.csosn,
    cstIcms: form.cstIcms,
    cstPis: form.cstPis,
    cstCofins: form.cstCofins,
    aliquotaIcms: form.aliquotaIcms,
    aliquotaPis: form.aliquotaPis,
    aliquotaCofins: form.aliquotaCofins,
  })
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }
  errors.value = {}
  emit('submit', {
    ...form,
    attributes: form.attributes.map((a) => ({ ...a })),
  })
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
        <!-- Linha principal: informações + preços (duas colunas no desktop) -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Coluna principal -->
          <motion.div :variants="item" class="min-w-0 lg:col-span-2">
            <FormSection
              icon="Package"
              title="Informações do produto"
              description="Identificação e descrição do item."
            >
              <div class="space-y-5">
                <Input
                  v-model="form.name"
                  maxlength="120"
                  placeholder="Ex.: Tênis Nike Air Jordan 1"
                  :error="errors.name"
                >
                  <template #label>Nome</template>
                </Input>

                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    v-model="form.sku"
                    maxlength="60"
                    placeholder="Código interno"
                    :error="errors.sku"
                  >
                    <template #prefix><Icon name="Hash" size="sm" /></template>
                    <template #label>SKU</template>
                  </Input>

                  <Input
                    v-model="form.barcode"
                    maxlength="14"
                    inputmode="numeric"
                    :sanitize="onlyDigits"
                    placeholder="EAN / GTIN"
                    :error="errors.barcode"
                  >
                    <template #prefix
                      ><Icon name="Barcode" size="sm"
                    /></template>
                    <template #label>Código de barras</template>
                  </Input>
                </div>

                <Select
                  v-model="form.unit"
                  :options="unitOfMeasureOptions"
                  placeholder="Selecione"
                  :error="errors.unit"
                >
                  <template #label>Unidade de medida</template>
                </Select>

                <div>
                  <label
                    class="mb-2 block text-sm font-medium text-foreground"
                    for="product-description"
                  >
                    Descrição
                  </label>
                  <textarea
                    id="product-description"
                    v-model="form.description"
                    rows="4"
                    maxlength="1000"
                    placeholder="Detalhes, características e observações do produto…"
                    class="block w-full rounded-lg border border-line-2 bg-background-1 px-4 py-2.5 text-foreground transition-colors duration-200 placeholder:text-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-background-2 disabled:opacity-50 sm:py-3 sm:text-sm"
                  />
                  <p
                    v-if="errors.description"
                    class="mt-2 text-sm font-medium text-error-500"
                  >
                    {{ errors.description }}
                  </p>
                </div>
              </div>
            </FormSection>
          </motion.div>

          <!-- Coluna lateral: preços e estoque -->
          <motion.div :variants="item" class="min-w-0 lg:col-span-1">
            <FormSection
              icon="Tag"
              title="Preços e estoque"
              description="Valores e ponto de reposição."
            >
              <div class="space-y-5">
                <Input
                  :model-value="form.costPrice"
                  inputmode="decimal"
                  placeholder="0,00"
                  :error="errors.costPrice"
                  @update:model-value="
                    form.costPrice = formatDecimalInput($event)
                  "
                >
                  <template #prefix
                    ><span class="text-sm text-muted-foreground"
                      >R$</span
                    ></template
                  >
                  <template #label>Preço de custo</template>
                </Input>

                <Input
                  :model-value="form.salePrice"
                  inputmode="decimal"
                  placeholder="0,00"
                  :error="errors.salePrice"
                  @update:model-value="
                    form.salePrice = formatDecimalInput($event)
                  "
                >
                  <template #prefix
                    ><span class="text-sm text-muted-foreground"
                      >R$</span
                    ></template
                  >
                  <template #label>Preço de venda</template>
                </Input>

                <Input
                  :model-value="form.minStock"
                  inputmode="decimal"
                  placeholder="0"
                  :error="errors.minStock"
                  @update:model-value="
                    form.minStock = formatDecimalInput($event)
                  "
                >
                  <template #prefix
                    ><Icon name="TriangleAlert" size="sm"
                  /></template>
                  <template #label>Estoque mínimo</template>
                </Input>

                <p class="text-xs text-muted-foreground">
                  O estoque atual é ajustado pelas movimentações e compras, não
                  por aqui.
                </p>
              </div>
            </FormSection>
          </motion.div>
        </div>

        <!-- Seção fiscal -->
        <motion.div :variants="item">
          <FormSection
            icon="ScrollText"
            title="Dados fiscais"
            description="Códigos e alíquotas usados na emissão de documentos fiscais (opcionais). A unidade comercial e o GTIN ficam em “Informações do produto”."
          >
            <div class="space-y-5">
              <!-- Indicador de completude fiscal (somente leitura) -->
              <div>
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                    form.fiscalComplete
                      ? 'bg-success-500/10 text-success-600'
                      : 'bg-warning-500/10 text-warning-700',
                  ]"
                >
                  <Icon
                    :name="form.fiscalComplete ? 'CircleCheck' : 'CircleAlert'"
                    size="sm"
                  />
                  {{
                    form.fiscalComplete
                      ? 'Fiscalmente completo'
                      : 'Fiscalmente pendente'
                  }}
                </span>
                <p class="mt-1.5 text-xs text-muted-foreground">
                  Calculado automaticamente pelo sistema ao salvar.
                </p>
              </div>

              <!-- Classificação: NCM / CEST / CFOP / Origem -->
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  v-model="form.ncm"
                  maxlength="8"
                  inputmode="numeric"
                  :sanitize="onlyDigits"
                  placeholder="00000000"
                  :error="errors.ncm"
                >
                  <template #label>NCM</template>
                </Input>

                <Input
                  v-model="form.cest"
                  maxlength="7"
                  inputmode="numeric"
                  :sanitize="onlyDigits"
                  placeholder="0000000"
                  :error="errors.cest"
                >
                  <template #label>CEST</template>
                </Input>

                <Input
                  v-model="form.cfop"
                  maxlength="4"
                  inputmode="numeric"
                  :sanitize="onlyDigits"
                  placeholder="5102"
                  :error="errors.cfop"
                >
                  <template #label>CFOP</template>
                </Input>

                <Select
                  v-model="form.origin"
                  :options="originOptions"
                  placeholder="Origem"
                  :error="errors.origin"
                >
                  <template #label>Origem</template>
                </Select>
              </div>

              <!-- Situação tributária: CSOSN / CST ICMS / PIS / COFINS -->
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Select
                  v-model="form.csosn"
                  :options="csosnSelectOptions"
                  placeholder="CSOSN"
                  :error="errors.csosn"
                >
                  <template #label>CSOSN</template>
                </Select>

                <Select
                  v-model="form.cstIcms"
                  :options="cstIcmsSelectOptions"
                  placeholder="CST ICMS"
                  :error="errors.cstIcms"
                >
                  <template #label>CST ICMS</template>
                </Select>

                <Select
                  v-model="form.cstPis"
                  :options="cstContribuicaoSelectOptions"
                  placeholder="Selecione"
                  :error="errors.cstPis"
                >
                  <template #label>CST PIS *</template>
                </Select>

                <Select
                  v-model="form.cstCofins"
                  :options="cstContribuicaoSelectOptions"
                  placeholder="Selecione"
                  :error="errors.cstCofins"
                >
                  <template #label>CST COFINS *</template>
                </Select>
              </div>

              <div
                v-if="!form.cstPis || !form.cstCofins"
                class="flex items-start gap-2 rounded-lg border border-warning-500/30 bg-warning-500/10 px-3 py-2 text-xs text-warning-700"
              >
                <Icon name="TriangleAlert" size="sm" class="mt-0.5 shrink-0" />
                <span>
                  Sem CST de PIS e COFINS o produto <strong>não emite nota</strong>.
                  O código vem do contador — bebida fria costuma ser monofásica
                  (04) e alimento preparado costuma ser isento (07), mas confirme
                  antes de cadastrar.
                </span>
              </div>

              <!-- Alíquotas (%) -->
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Input
                  :model-value="form.aliquotaIcms"
                  inputmode="decimal"
                  placeholder="0,00"
                  :error="errors.aliquotaIcms"
                  @update:model-value="
                    form.aliquotaIcms = formatDecimalInput($event)
                  "
                >
                  <template #label>Alíquota ICMS</template>
                  <template #suffix
                    ><span class="text-sm text-muted-foreground"
                      >%</span
                    ></template
                  >
                </Input>

                <Input
                  v-if="exigeAliquotaPis"
                  :model-value="form.aliquotaPis"
                  inputmode="decimal"
                  placeholder="0,00"
                  :error="errors.aliquotaPis"
                  @update:model-value="
                    form.aliquotaPis = formatDecimalInput($event)
                  "
                >
                  <template #label>Alíquota PIS</template>
                  <template #suffix
                    ><span class="text-sm text-muted-foreground"
                      >%</span
                    ></template
                  >
                </Input>

                <Input
                  v-if="exigeAliquotaCofins"
                  :model-value="form.aliquotaCofins"
                  inputmode="decimal"
                  placeholder="0,00"
                  :error="errors.aliquotaCofins"
                  @update:model-value="
                    form.aliquotaCofins = formatDecimalInput($event)
                  "
                >
                  <template #label>Alíquota COFINS</template>
                  <template #suffix
                    ><span class="text-sm text-muted-foreground"
                      >%</span
                    ></template
                  >
                </Input>
              </div>
            </div>
          </FormSection>
        </motion.div>

        <!-- Atributos técnicos -->
        <motion.div :variants="item">
          <FormSection
            icon="ListPlus"
            title="Atributos técnicos"
            description="Características livres em pares de chave e valor (ex.: material, cor)."
          >
            <div class="space-y-3">
              <p
                v-if="form.attributes.length === 0"
                class="text-sm text-muted-foreground"
              >
                Nenhum atributo adicionado.
              </p>

              <div
                v-for="(attr, index) in form.attributes"
                :key="index"
                class="flex items-start gap-3"
              >
                <div class="flex-1">
                  <Input
                    v-model="attr.key"
                    maxlength="60"
                    placeholder="Chave (ex.: Material)"
                  />
                </div>
                <div class="flex-1">
                  <Input
                    v-model="attr.value"
                    maxlength="120"
                    placeholder="Valor (ex.: Alumínio)"
                  />
                </div>
                <button
                  v-if="!props.readonly"
                  type="button"
                  class="mt-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remover atributo"
                  @click="removeAttribute(index)"
                >
                  <Icon name="X" size="sm" />
                </button>
              </div>

              <button
                v-if="!props.readonly"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                @click="addAttribute"
              >
                <Icon name="Plus" size="sm" />
                Adicionar atributo
              </button>
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
