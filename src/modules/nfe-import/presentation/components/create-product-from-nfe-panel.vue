<script setup lang="ts">
import { computed } from 'vue'
import SidePanel from '@/shared/components/dialog/side-panel.vue'
import ProductForm from '@/modules/products/presentation/components/product-form.vue'
import {
  emptyProductForm,
  type ProductFormValues,
} from '@/modules/products/presentation/schemas/product-schema'
import type { NfeImportItem } from '@/modules/nfe-import/domain/entities/nfe-import.entity'
import { UnitOfMeasure } from '@/core/enums/unit-of-measure.enum'
import { CST_CONTRIBUICAO_SUPORTADOS } from '@/core/enums/cst-contribuicao.enum'
import { formatMoney } from '@/shared/ui/utils/masks'

const props = defineProps<{
  modelValue: boolean
  item: NfeImportItem | null
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: ProductFormValues]
}>()

/** Unidade da nota que não existe no nosso cadastro cai em UN. */
function toUnit(raw: string): string {
  const normalized = raw.trim().toUpperCase()
  const known = Object.values(UnitOfMeasure) as string[]
  return known.includes(normalized) ? normalized : UnitOfMeasure.UN
}

/**
 * CSOSN tem 3 dígitos (Simples) e CST de ICMS tem 2 (Regime Normal). A nota diz
 * qual dos dois é pelo próprio comprimento, e o cadastro tem um campo para cada.
 */
function icmsFields(situacao: string | null): {
  csosn: string
  cstIcms: string
} {
  if (!situacao) return { csosn: '', cstIcms: '' }
  return situacao.length === 3
    ? { csosn: situacao, cstIcms: '' }
    : { csosn: '', cstIcms: situacao }
}

/** Só entra o CST que o nosso cadastro aceita; o resto o contador escolhe. */
function supportedCst(cst: string | null): string {
  if (!cst) return ''
  return (CST_CONTRIBUICAO_SUPORTADOS as readonly string[]).includes(cst)
    ? cst
    : ''
}

const initial = computed<ProductFormValues>(() => {
  const item = props.item
  if (!item) return emptyProductForm()

  const icms = icmsFields(item.situacaoIcms)

  return {
    ...emptyProductForm(),
    name: item.description,
    barcode: item.gtin ?? '',
    unit: toUnit(item.unit),
    ncm: item.ncm ?? '',
    cest: item.cest ?? '',
    costPrice: formatMoney(item.unitPrice),
    origin: item.origem !== null ? String(item.origem) : '',
    csosn: icms.csosn,
    cstIcms: icms.cstIcms,
    cstPis: supportedCst(item.cstPis),
    cstCofins: supportedCst(item.cstCofins),
  }
})

/** O que veio da nota, para o cabeçalho dizer de onde saiu cada campo. */
const fromNfe = computed(() => {
  const item = props.item
  if (!item) return []

  return [
    { label: 'Nome', value: item.description },
    { label: 'GTIN', value: item.gtin },
    { label: 'NCM', value: item.ncm },
    { label: 'CEST', value: item.cest },
    { label: 'Unidade', value: item.unit },
    { label: 'Custo', value: `R$ ${formatMoney(item.unitPrice)}` },
    {
      label: 'Origem',
      value: item.origem !== null ? String(item.origem) : null,
    },
    { label: 'ICMS', value: item.situacaoIcms },
    { label: 'PIS', value: item.cstPis },
    { label: 'COFINS', value: item.cstCofins },
  ].filter((field) => !!field.value)
})

function close(): void {
  emit('update:modelValue', false)
}
</script>

<template>
  <SidePanel
    :model-value="props.modelValue"
    width="xl"
    title="Cadastrar produto a partir da nota"
    :description="props.item?.description"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div
      v-if="props.item"
      class="mb-5 rounded-xl border border-line-2 bg-muted/40 px-4 py-3"
    >
      <p class="text-xs tracking-wide text-muted-foreground uppercase">
        Preenchido pela nota
      </p>

      <dl class="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
        <div v-for="field in fromNfe" :key="field.label" class="text-xs">
          <dt class="inline text-muted-foreground">{{ field.label }}:</dt>
          <dd class="ml-1 inline font-medium text-foreground">
            {{ field.value }}
          </dd>
        </div>
      </dl>

      <p class="mt-3 text-xs text-muted-foreground">
        <strong class="font-medium text-foreground">
          Confira a situação tributária.
        </strong>
        ICMS, PIS e COFINS vieram da venda
        <em>do fornecedor</em>, sob o regime dele servem de ponto de partida.
        Quem define a da sua empresa é o contador.
      </p>
    </div>

    <ProductForm
      :initial="initial"
      :loading="props.loading"
      submit-label="Cadastrar e vincular"
      always-show-actions
      @submit="emit('submit', $event)"
      @cancel="close"
    />
  </SidePanel>
</template>
