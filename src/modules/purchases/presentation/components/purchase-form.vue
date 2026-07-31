<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { motion } from 'motion-v'
import { DatePicker, Icon, Input, Select } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FormActionBar from '@/shared/components/form/form-action-bar.vue'
import {
  validatePurchase,
  type PurchaseFormErrors,
  type PurchaseItemErrors,
  type PurchaseItemRow,
  type PurchaseFormValues,
} from '@/modules/purchases/presentation/schemas/purchase-schema'
import { PaymentCondition } from '@/enums/payment-condition.enum'
import {
  formatDateBr,
  formatDecimalInput,
  formatMoney,
  onlyDigits,
  parseDecimal,
} from '@/shared/ui/utils/masks'

const props = defineProps<{
  establishmentOptions: SelectOption[]
  productOptions: SelectOption[]
  supplierOptions: SelectOption[]
  loading: boolean
  resolvePrice: (productId: string) => number | null
}>()

const emit = defineEmits<{
  submit: [values: PurchaseFormValues]
  cancel: []
}>()

function emptyRow(): PurchaseItemRow {
  return { productId: '', quantity: '', unitPrice: '' }
}

const form = reactive<PurchaseFormValues>({
  establishmentId: '',
  supplierId: '',
  purchaseDate: '',
  paymentCondition: PaymentCondition.A_VISTA,
  installments: '1',
  firstDueDate: '',
  intervalDays: '30',
  notes: '',
  items: [emptyRow()],
})

// ---- Condição de pagamento (à vista / a prazo) ----
const onCredit = computed(
  () => form.paymentCondition === PaymentCondition.A_PRAZO,
)
const installmentsCount = computed(() =>
  Math.max(1, Math.trunc(parseDecimal(form.installments) ?? 1)),
)

function setCondition(condition: PaymentCondition): void {
  form.paymentCondition = condition
}

const errors = ref<PurchaseFormErrors>({})
const itemErrors = ref<PurchaseItemErrors[]>([])

function addRow(): void {
  form.items.push(emptyRow())
}

function removeRow(index: number): void {
  form.items.splice(index, 1)
  itemErrors.value.splice(index, 1)
}

// Ao escolher o produto, sugere o preço de custo se o preço ainda está vazio.
function onProduct(item: PurchaseItemRow, productId: string): void {
  item.productId = productId
  if (!item.unitPrice) {
    const price = props.resolvePrice(productId)
    if (price !== null) item.unitPrice = formatMoney(price)
  }
}

function lineTotal(item: PurchaseItemRow): number {
  const quantity = parseDecimal(item.quantity) ?? 0
  const unitPrice = parseDecimal(item.unitPrice) ?? 0
  return quantity * unitPrice
}

const grandTotal = computed(() =>
  form.items.reduce((sum, item) => sum + lineTotal(item), 0),
)

function handleSubmit(): void {
  const result = validatePurchase(form)
  errors.value = result.errors
  itemErrors.value = result.itemErrors
  if (!result.ok) return
  emit('submit', {
    ...form,
    items: form.items.map((row) => ({ ...row })),
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
    <motion.div
      class="space-y-6"
      :variants="container"
      initial="hidden"
      animate="visible"
    >
      <!-- Dados da compra -->
      <motion.div :variants="item">
        <FormSection
          icon="ShoppingCart"
          title="Dados da compra"
          description="Estabelecimento de destino, fornecedor e data."
        >
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Select
              v-model="form.establishmentId"
              :options="props.establishmentOptions"
              placeholder="Selecione o estabelecimento"
              :error="errors.establishmentId"
            >
              <template #label>Estabelecimento</template>
            </Select>

            <Select
              v-model="form.supplierId"
              :options="props.supplierOptions"
              placeholder="Selecione o fornecedor"
            >
              <template #label>Fornecedor (opcional)</template>
            </Select>

            <DatePicker v-model="form.purchaseDate">
              <template #label>Data da compra</template>
            </DatePicker>

            <Input
              v-model="form.notes"
              maxlength="1000"
              placeholder="Observações da compra"
            >
              <template #prefix><Icon name="StickyNote" size="sm" /></template>
              <template #label>Observações</template>
            </Input>
          </div>
        </FormSection>
      </motion.div>

      <!-- Pagamento -->
      <motion.div :variants="item">
        <FormSection
          icon="Wallet"
          title="Pagamento"
          description="À vista quita a compra; a prazo gera títulos em contas a pagar ao confirmar."
        >
          <div class="space-y-5">
            <!-- Condição: à vista x a prazo -->
            <div
              class="grid grid-cols-2 gap-1 rounded-lg border border-line-2 bg-background-1 p-1 sm:max-w-xs"
            >
              <button
                type="button"
                :class="[
                  'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  !onCredit
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ]"
                @click="setCondition(PaymentCondition.A_VISTA)"
              >
                <Icon name="Banknote" size="sm" />
                À vista
              </button>
              <button
                type="button"
                :class="[
                  'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  onCredit
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                ]"
                @click="setCondition(PaymentCondition.A_PRAZO)"
              >
                <Icon name="CalendarClock" size="sm" />
                A prazo
              </button>
            </div>

            <!-- Parcelamento (só a prazo) -->
            <motion.div
              v-if="onCredit"
              class="grid grid-cols-1 gap-5 sm:grid-cols-3"
              :initial="{ opacity: 0, y: 8 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.2 }"
            >
              <Input
                :model-value="form.installments"
                :sanitize="onlyDigits"
                inputmode="numeric"
                input-class="text-center"
                @update:model-value="form.installments = $event"
              >
                <template #label>Parcelas</template>
              </Input>
              <Input
                :model-value="form.intervalDays"
                :sanitize="onlyDigits"
                inputmode="numeric"
                input-class="text-center"
                @update:model-value="form.intervalDays = $event"
              >
                <template #label>Intervalo (dias)</template>
              </Input>
              <Input
                :model-value="form.firstDueDate"
                :sanitize="formatDateBr"
                inputmode="numeric"
                maxlength="10"
                placeholder="dd/mm/aaaa (opcional)"
                @update:model-value="form.firstDueDate = $event"
              >
                <template #label>1º vencimento</template>
                <template #prefix><Icon name="CalendarClock" size="sm" /></template>
              </Input>

              <p
                class="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm sm:col-span-3"
              >
                <span class="text-muted-foreground">
                  {{ installmentsCount }}× de (aprox.)
                </span>
                <span class="font-semibold tabular-nums text-foreground">
                  R$ {{ formatMoney(grandTotal / installmentsCount) }}
                </span>
              </p>
            </motion.div>
          </div>
        </FormSection>
      </motion.div>

      <!-- Itens -->
      <motion.div :variants="item">
        <FormSection
          icon="Package"
          title="Itens da compra"
          description="Produtos, quantidades e preços unitários."
        >
          <div class="space-y-4">
            <p
              v-if="errors.items"
              class="text-sm font-medium text-error-500"
            >
              {{ errors.items }}
            </p>

            <!-- Cabeçalho da grade (desktop) -->
            <div
              class="hidden grid-cols-12 gap-3 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid"
            >
              <span class="col-span-5">Produto</span>
              <span class="col-span-2 text-right">Qtd.</span>
              <span class="col-span-2 text-right">Preço un.</span>
              <span class="col-span-2 text-right">Total</span>
              <span class="col-span-1"></span>
            </div>

            <div
              v-for="(row, index) in form.items"
              :key="index"
              class="grid grid-cols-1 items-start gap-3 rounded-xl border border-line-2 p-3 sm:grid-cols-12 sm:items-center sm:border-0 sm:p-0"
            >
              <div class="sm:col-span-5">
                <Select
                  :model-value="row.productId"
                  :options="props.productOptions"
                  placeholder="Selecione o produto"
                  :error="itemErrors[index]?.productId"
                  @update:model-value="onProduct(row, $event)"
                />
              </div>
              <div class="sm:col-span-2">
                <Input
                  :model-value="row.quantity"
                  inputmode="decimal"
                  placeholder="0"
                  input-class="text-right"
                  :error="itemErrors[index]?.quantity"
                  @update:model-value="row.quantity = formatDecimalInput($event)"
                />
              </div>
              <div class="sm:col-span-2">
                <Input
                  :model-value="row.unitPrice"
                  inputmode="decimal"
                  placeholder="0,00"
                  input-class="text-right"
                  :error="itemErrors[index]?.unitPrice"
                  @update:model-value="row.unitPrice = formatDecimalInput($event)"
                />
              </div>
              <div
                class="text-right text-sm font-medium tabular-nums text-foreground sm:col-span-2"
              >
                <span class="text-muted-foreground sm:hidden">Total: </span>
                R$ {{ formatMoney(lineTotal(row)) }}
              </div>
              <div class="flex justify-end sm:col-span-1">
                <button
                  type="button"
                  class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                  title="Remover item"
                  :disabled="form.items.length === 1"
                  @click="removeRow(index)"
                >
                  <Icon name="Trash2" size="sm" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between gap-4 pt-1">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                @click="addRow"
              >
                <Icon name="Plus" size="sm" />
                Adicionar item
              </button>

              <div class="text-right">
                <p class="text-xs text-muted-foreground uppercase">Total</p>
                <motion.p
                  :key="grandTotal"
                  class="font-display text-2xl font-bold tracking-tight text-foreground"
                  :initial="{ opacity: 0.4, y: -2 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.2 }"
                >
                  R$ {{ formatMoney(grandTotal) }}
                </motion.p>
              </div>
            </div>
          </div>
        </FormSection>
      </motion.div>
    </motion.div>

    <FormActionBar
      submit-label="Criar compra"
      :loading="props.loading"
      @secondary="emit('cancel')"
    />
  </form>
</template>
