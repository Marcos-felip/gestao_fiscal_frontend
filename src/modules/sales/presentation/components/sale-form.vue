<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, Combobox, Icon, Input, Select } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import SupervisorAuthDialog from '@/shared/components/dialog/supervisor-auth-dialog.vue'
import PdvOperatorBar from '@/modules/sales/presentation/components/pdv-operator-bar.vue'
import PdvProductSearch from '@/modules/sales/presentation/components/pdv-product-search.vue'
import PdvShortcutsHelp from '@/modules/sales/presentation/components/pdv-shortcuts-help.vue'
import {
  validateSale,
  type SaleFormErrors,
  type SaleFormValues,
  type SaleItemErrors,
  type SaleItemRow,
  type SaleProductOption,
} from '@/modules/sales/presentation/schemas/sale-schema'
import { paymentMethodOptions } from '@/enums/payment-method.enum'
import { unitOfMeasureShortLabels } from '@/enums/unit-of-measure.enum'
import { membershipRoleLabels } from '@/enums/membership-role.enum'
import {
  formatDecimalInput,
  formatMoney,
  parseDecimal,
} from '@/shared/ui/utils/masks'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { usePermissions, useFullscreen, useToast } from '@/shared/composables'

const props = defineProps<{
  products: SaleProductOption[]
  customerOptions: SelectOption[]
  establishmentOptions: SelectOption[]
  loading: boolean
  finalizing: boolean
  resolvePrice: (productId: string) => number | null
}>()

const emit = defineEmits<{
  submit: [values: SaleFormValues, confirm: boolean]
  exit: []
}>()

const authStore = useAuthStore()
const { can, role } = usePermissions()
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
const toast = useToast()

const form = reactive({
  establishmentId:
    props.establishmentOptions.length === 1
      ? props.establishmentOptions[0].value
      : '',
  customerId: '',
  paymentMethod: '',
  discount: '',
  notes: '',
})

const cart = ref<SaleItemRow[]>([])
const errors = ref<SaleFormErrors>({})
const itemErrors = ref<SaleItemErrors[]>([])

const searchRef = ref<{ focus: () => void } | null>(null)
const helpOpen = ref(false)
const cancelConfirmOpen = ref(false)
const supervisorOpen = ref(false)

const sellerName = computed(() => authStore.user?.name ?? 'Operador')
const sellerRole = computed(() =>
  role.value ? (membershipRoleLabels[role.value] ?? role.value) : null,
)
const establishmentName = computed(
  () =>
    props.establishmentOptions.find((o) => o.value === form.establishmentId)
      ?.label ?? null,
)

const paymentOptions = computed<SelectOption[]>(() => [
  { value: '', label: 'Não informar' },
  ...paymentMethodOptions,
])

function unitLabel(unit: SaleItemRow['unit']): string {
  if (!unit) return ''
  return unitOfMeasureShortLabels[unit] ?? unit
}

function onPickProduct(productId: string): void {
  if (!productId) return

  const existing = cart.value.find((line) => line.productId === productId)
  if (existing) {
    const current = parseDecimal(existing.quantity) ?? 0
    existing.quantity = String(current + 1)
    return
  }

  const product = props.products.find((p) => p.id === productId)
  const price = props.resolvePrice(productId) ?? 0
  cart.value.push({
    productId,
    name: product?.name ?? 'Produto',
    unit: product?.unit ?? null,
    quantity: '1',
    unitPrice: price > 0 ? formatMoney(price) : '0',
  })
  itemErrors.value.push({})
}

function removeLine(index: number): void {
  cart.value.splice(index, 1)
  itemErrors.value.splice(index, 1)
}

function stepQuantity(index: number, delta: number): void {
  const line = cart.value[index]
  if (!line) return
  const current = parseDecimal(line.quantity) ?? 0
  line.quantity = String(Math.max(1, current + delta))
}

function lineTotal(line: SaleItemRow): number {
  const quantity = parseDecimal(line.quantity) ?? 0
  const unitPrice = parseDecimal(line.unitPrice) ?? 0
  return quantity * unitPrice
}

const itemCount = computed(() => cart.value.length)
const subtotal = computed(() =>
  cart.value.reduce((sum, line) => sum + lineTotal(line), 0),
)
const discountValue = computed(() => {
  const value = parseDecimal(form.discount) ?? 0
  return value > 0 ? Math.min(value, subtotal.value) : 0
})
const total = computed(() => Math.max(0, subtotal.value - discountValue.value))
const canSubmit = computed(
  () => cart.value.length > 0 && Boolean(form.establishmentId),
)

function buildValues(): SaleFormValues {
  return {
    establishmentId: form.establishmentId,
    customerId: form.customerId,
    paymentMethod: form.paymentMethod,
    discount: form.discount,
    notes: form.notes,
    items: cart.value.map((line) => ({ ...line })),
  }
}

function submit(confirm: boolean): void {
  const values = buildValues()
  const result = validateSale(values)
  errors.value = result.errors
  itemErrors.value = result.itemErrors
  if (!result.ok) {
    toast.error('Revise os itens da venda antes de continuar.')
    return
  }
  emit('submit', values, confirm)
}

function focusSearch(): void {
  searchRef.value?.focus()
}

// ---- Cancelamento (F8) com autorização de supervisor ----
function requestCancel(): void {
  if (cart.value.length === 0) {
    toast.info('Nenhuma venda em andamento.')
    return
  }
  if (can('sales.cancel')) {
    cancelConfirmOpen.value = true
  } else {
    supervisorOpen.value = true
  }
}

function clearSale(): void {
  cart.value = []
  itemErrors.value = []
  form.discount = ''
  form.notes = ''
  form.customerId = ''
  errors.value = {}
}

function onCancelConfirmed(): void {
  clearSale()
  cancelConfirmOpen.value = false
  toast.success('Venda cancelada.')
  focusSearch()
}

function onSupervisorAuthorized(name: string): void {
  clearSale()
  toast.success(`Venda cancelada — autorizado por ${name}.`)
  focusSearch()
}

// ---- Atalhos de teclado ----
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'F1') {
    event.preventDefault()
    helpOpen.value = !helpOpen.value
    return
  }

  const modalOpen =
    helpOpen.value || cancelConfirmOpen.value || supervisorOpen.value
  if (modalOpen) return

  switch (event.key) {
    case 'F2':
      event.preventDefault()
      focusSearch()
      break
    case 'F4':
      event.preventDefault()
      if (canSubmit.value && !props.loading) submit(true)
      break
    case 'F6':
      event.preventDefault()
      if (canSubmit.value && !props.loading) submit(false)
      break
    case 'F8':
      event.preventDefault()
      requestCancel()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  // foca a busca ao abrir o caixa
  requestAnimationFrame(() => focusSearch())
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="flex h-dvh flex-col bg-muted/30">
    <!-- Barra do operador -->
    <PdvOperatorBar
      :seller-name="sellerName"
      :seller-role="sellerRole"
      :establishment-name="establishmentName"
      :is-fullscreen="isFullscreen"
      @toggle-fullscreen="toggleFullscreen"
      @help="helpOpen = true"
      @exit="emit('exit')"
    />

    <!-- Corpo: carrinho | ticket -->
    <div
      class="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden"
    >
      <!-- Coluna: itens -->
      <section class="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
        <div class="border-b border-line-2 bg-background p-4">
          <PdvProductSearch
            ref="searchRef"
            :products="props.products"
            @pick="onPickProduct"
          />
          <p
            v-if="errors.items"
            class="mt-2 text-sm font-medium text-error-500"
          >
            {{ errors.items }}
          </p>
        </div>

        <div class="flex-1 p-4 lg:overflow-y-auto">
          <!-- Carrinho vazio -->
          <div
            v-if="cart.length === 0"
            class="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-line-3 px-6 py-16 text-center"
          >
            <span
              class="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
            >
              <Icon name="ScanBarcode" size="lg" />
            </span>
            <p class="mt-4 text-sm font-medium text-foreground">
              Nenhum item na venda
            </p>
            <p class="mt-1 max-w-xs text-sm text-muted-foreground">
              Pressione
              <kbd
                class="rounded border border-line-2 px-1 font-mono text-xs"
                >F2</kbd
              >
              e busque um produto para começar.
            </p>
          </div>

          <!-- Linhas -->
          <div v-else class="space-y-2">
            <motion.div
              v-for="(line, index) in cart"
              :key="line.productId"
              class="grid grid-cols-1 items-center gap-3 rounded-xl border border-line-2 bg-background p-3 sm:grid-cols-12"
              :initial="{ opacity: 0, y: 8 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.16 }"
            >
              <div class="min-w-0 sm:col-span-5">
                <p class="truncate font-medium text-foreground">
                  {{ line.name }}
                </p>
                <p v-if="line.unit" class="text-xs text-muted-foreground">
                  {{ unitLabel(line.unit) }}
                </p>
              </div>

              <!-- Quantidade com steppers -->
              <div class="sm:col-span-3">
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Diminuir"
                    @click="stepQuantity(index, -1)"
                  >
                    <Icon name="Minus" size="xs" />
                  </button>
                  <Input
                    :model-value="line.quantity"
                    inputmode="decimal"
                    input-class="text-center"
                    :error="itemErrors[index]?.quantity"
                    @update:model-value="
                      line.quantity = formatDecimalInput($event)
                    "
                  />
                  <button
                    type="button"
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Aumentar"
                    @click="stepQuantity(index, 1)"
                  >
                    <Icon name="Plus" size="xs" />
                  </button>
                </div>
              </div>

              <!-- Preço unitário -->
              <div class="sm:col-span-2">
                <Input
                  :model-value="line.unitPrice"
                  inputmode="decimal"
                  input-class="text-right"
                  :error="itemErrors[index]?.unitPrice"
                  @update:model-value="
                    line.unitPrice = formatDecimalInput($event)
                  "
                >
                  <template #prefix>
                    <span class="text-xs text-muted-foreground">R$</span>
                  </template>
                </Input>
              </div>

              <!-- Total + remover -->
              <div
                class="flex items-center justify-between gap-2 sm:col-span-2 sm:justify-end"
              >
                <span
                  class="text-sm font-semibold tabular-nums text-foreground"
                >
                  R$ {{ formatMoney(lineTotal(line)) }}
                </span>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remover item"
                  @click="removeLine(index)"
                >
                  <Icon name="Trash2" size="sm" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <!-- Coluna: ticket / resumo -->
      <aside
        class="flex w-full flex-col border-t border-line-2 bg-background lg:w-96 lg:border-t-0 lg:border-l lg:overflow-y-auto"
      >
        <div class="flex-1 space-y-4 p-5">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-lg font-semibold text-foreground">
              Ticket
            </h2>
            <span
              class="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {{ itemCount }} {{ itemCount === 1 ? 'item' : 'itens' }}
            </span>
          </div>

          <Combobox
            v-model="form.customerId"
            :options="props.customerOptions"
            placeholder="Consumidor final"
            empty-text="Nenhum cliente encontrado"
          >
            <template #label>Cliente</template>
          </Combobox>

          <Select
            v-model="form.establishmentId"
            :options="props.establishmentOptions"
            placeholder="Selecione o estabelecimento"
            :error="errors.establishmentId"
          >
            <template #label>Estabelecimento</template>
          </Select>

          <Select
            v-model="form.paymentMethod"
            :options="paymentOptions"
            placeholder="Forma de pagamento"
          >
            <template #label>Forma de pagamento</template>
          </Select>

          <Input
            :model-value="form.discount"
            inputmode="decimal"
            placeholder="0,00"
            input-class="text-right"
            @update:model-value="form.discount = formatDecimalInput($event)"
          >
            <template #prefix><Icon name="TicketPercent" size="sm" /></template>
            <template #label>Desconto</template>
          </Input>

          <Input
            v-model="form.notes"
            maxlength="500"
            placeholder="Observações da venda"
          >
            <template #prefix><Icon name="StickyNote" size="sm" /></template>
            <template #label>Observações</template>
          </Input>
        </div>

        <!-- Totais (foco) -->
        <div class="border-t border-line-2 p-5">
          <dl class="space-y-1.5 text-sm tabular-nums">
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Subtotal</dt>
              <dd class="font-medium text-foreground">
                R$ {{ formatMoney(subtotal) }}
              </dd>
            </div>
            <div
              v-if="discountValue > 0"
              class="flex justify-between gap-4 text-error-600"
            >
              <dt>Desconto</dt>
              <dd class="font-medium">– R$ {{ formatMoney(discountValue) }}</dd>
            </div>
          </dl>
          <div class="mt-3 flex items-baseline justify-between gap-4">
            <span class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Total
            </span>
            <motion.span
              :key="total"
              class="font-display text-3xl font-bold tracking-tight text-foreground"
              :initial="{ opacity: 0.5, y: -3 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.2 }"
            >
              R$ {{ formatMoney(total) }}
            </motion.span>
          </div>
        </div>
      </aside>
    </div>

    <!-- Barra de atalhos / ações (F-keys) -->
    <footer
      class="flex items-center gap-2 border-t border-line-2 bg-background px-3 py-2.5 sm:px-4"
    >
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        @click="focusSearch"
      >
        <kbd
          class="rounded-md border border-line-2 bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold"
          >F2</kbd
        >
        <span class="hidden sm:inline">Buscar</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
        :disabled="cart.length === 0"
        @click="requestCancel"
      >
        <kbd
          class="rounded-md border border-line-2 bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold"
          >F8</kbd
        >
        <span class="hidden sm:inline">Cancelar</span>
      </button>

      <div class="ml-auto flex items-center gap-2">
        <Button
          variant="secondary"
          :loading="props.loading && !props.finalizing"
          :disabled="!canSubmit || props.loading"
          @click="submit(false)"
        >
          <template #icon>
            <kbd class="font-mono text-[11px] font-semibold">F6</kbd>
          </template>
          Orçamento
        </Button>
        <Button
          variant="primary"
          text-class="text-white"
          :loading="props.loading && props.finalizing"
          :disabled="!canSubmit || props.loading"
          @click="submit(true)"
        >
          <template #icon>
            <kbd class="font-mono text-[11px] font-semibold">F4</kbd>
          </template>
          Finalizar · R$ {{ formatMoney(total) }}
        </Button>
      </div>
    </footer>

    <!-- Ajuda (F1) -->
    <PdvShortcutsHelp v-model="helpOpen" />

    <!-- Cancelar com permissão própria -->
    <ConfirmDialog
      v-model="cancelConfirmOpen"
      title="Cancelar venda"
      description="Os itens desta venda em andamento serão descartados. Deseja continuar?"
      confirm-label="Cancelar venda"
      cancel-label="Voltar"
      variant="destructive"
      icon="Ban"
      @confirm="onCancelConfirmed"
    />

    <!-- Cancelar sem permissão: autorização de supervisor -->
    <SupervisorAuthDialog
      v-model="supervisorOpen"
      required-permission="sales.cancel"
      title="Autorizar cancelamento"
      description="Você não tem permissão para cancelar vendas. Um administrador ou proprietário precisa autorizar."
      action-label="Autorizar cancelamento"
      @authorized="onSupervisorAuthorized"
    />
  </div>
</template>
