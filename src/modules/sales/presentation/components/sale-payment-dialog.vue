<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button, Icon, Input, Select } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import type { CreateSalePaymentInput } from '@/modules/sales/domain/dto/create-sale-dto'
import { PaymentMethod, paymentMethodOptions } from '@/core/enums/payment-method.enum'
import { formatDecimalInput, formatMoney, parseDecimal } from '@/shared/ui/utils/masks'

const props = withDefaults(
  defineProps<{ modelValue: boolean; total: number; loading?: boolean }>(),
  { loading: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [payments: CreateSalePaymentInput[]]
}>()

interface Row {
  method: string
  amount: string
  amountReceived: string
}

const rows = ref<Row[]>([])

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Começa com uma linha em dinheiro cobrindo o total (1 clique finaliza). */
function reset(): void {
  rows.value = [
    { method: PaymentMethod.DINHEIRO, amount: formatMoney(props.total), amountReceived: '' },
  ]
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) reset()
  },
)

const paid = computed(() =>
  round2(rows.value.reduce((sum, r) => sum + (parseDecimal(r.amount) ?? 0), 0)),
)
const remaining = computed(() => round2(props.total - paid.value))

/** Troco total (soma do que sobra nas linhas de dinheiro com valor recebido). */
const changeTotal = computed(() =>
  round2(
    rows.value.reduce((sum, r) => {
      if (r.method !== PaymentMethod.DINHEIRO) return sum
      const received = parseDecimal(r.amountReceived)
      const amount = parseDecimal(r.amount) ?? 0
      if (received === undefined || received <= amount) return sum
      return sum + (received - amount)
    }, 0),
  ),
)

function isCash(row: Row): boolean {
  return row.method === PaymentMethod.DINHEIRO
}

function changeOf(row: Row): number {
  const received = parseDecimal(row.amountReceived)
  const amount = parseDecimal(row.amount) ?? 0
  if (!isCash(row) || received === undefined || received <= amount) return 0
  return round2(received - amount)
}

function addRow(): void {
  rows.value.push({
    method: '',
    amount: remaining.value > 0 ? formatMoney(remaining.value) : '',
    amountReceived: '',
  })
}

function removeRow(index: number): void {
  rows.value.splice(index, 1)
}

/** Motivo que impede finalizar (também vira a legenda do botão). */
const blockReason = computed<string | null>(() => {
  for (const row of rows.value) {
    if (!row.method) return 'Selecione a forma de pagamento'
    const amount = parseDecimal(row.amount)
    if (amount === undefined || amount <= 0) return 'Informe o valor de cada forma'
    if (isCash(row)) {
      const received = parseDecimal(row.amountReceived)
      if (received !== undefined && received < amount) {
        return 'Recebido menor que o valor em dinheiro'
      }
    }
  }
  if (Math.abs(remaining.value) > 0.01) {
    return remaining.value > 0
      ? `Faltam R$ ${formatMoney(remaining.value)}`
      : `Sobram R$ ${formatMoney(-remaining.value)}`
  }
  return null
})

const canFinalize = computed(() => blockReason.value === null)

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  if (!canFinalize.value) return

  const payments: CreateSalePaymentInput[] = rows.value.map((row) => {
    const amount = parseDecimal(row.amount) ?? 0
    const received = parseDecimal(row.amountReceived)
    const base: CreateSalePaymentInput = {
      method: row.method as PaymentMethod,
      amount,
    }
    if (isCash(row) && received !== undefined) base.amountReceived = received
    return base
  })

  emit('confirm', payments)
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="Pagamento"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <!-- Total a pagar -->
      <div
        class="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
      >
        <span class="text-sm text-muted-foreground">Total a pagar</span>
        <span class="font-display text-2xl font-bold tabular-nums text-foreground">
          R$ {{ formatMoney(props.total) }}
        </span>
      </div>

      <!-- Linhas de pagamento -->
      <div class="space-y-3">
        <div
          v-for="(row, index) in rows"
          :key="index"
          class="rounded-xl border border-line-2 p-3"
        >
          <div class="flex items-start gap-2">
            <div class="w-40 shrink-0">
              <Select
                v-model="row.method"
                :options="paymentMethodOptions"
                placeholder="Forma"
              />
            </div>
            <div class="flex-1">
              <Input
                :model-value="row.amount"
                :sanitize="formatDecimalInput"
                inputmode="decimal"
                placeholder="0,00"
                input-class="text-right"
                @update:model-value="row.amount = $event"
              >
                <template #prefix>
                  <span class="text-xs text-muted-foreground">R$</span>
                </template>
              </Input>
            </div>
            <button
              type="button"
              class="mt-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
              title="Remover forma"
              :disabled="rows.length === 1"
              @click="removeRow(index)"
            >
              <Icon name="Trash2" size="sm" />
            </button>
          </div>

          <!-- Dinheiro: valor recebido + troco -->
          <div v-if="isCash(row)" class="mt-2 flex items-center gap-3 pl-1">
            <div class="w-40 shrink-0">
              <Input
                :model-value="row.amountReceived"
                :sanitize="formatDecimalInput"
                inputmode="decimal"
                placeholder="Recebido"
                input-class="text-right"
                @update:model-value="row.amountReceived = $event"
              >
                <template #prefix>
                  <span class="text-xs text-muted-foreground">R$</span>
                </template>
              </Input>
            </div>
            <span
              v-if="changeOf(row) > 0"
              class="text-sm font-medium text-success-600"
            >
              Troco R$ {{ formatMoney(changeOf(row)) }}
            </span>
            <span v-else class="text-xs text-muted-foreground">
              Valor entregue (opcional)
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        @click="addRow"
      >
        <Icon name="Plus" size="sm" />
        Adicionar forma
      </button>

      <!-- Resumo: restante / troco -->
      <dl class="space-y-1 border-t border-line-2 pt-3 text-sm tabular-nums">
        <div class="flex justify-between gap-4">
          <dt class="text-muted-foreground">Recebido</dt>
          <dd class="font-medium text-foreground">R$ {{ formatMoney(paid) }}</dd>
        </div>
        <div
          v-if="Math.abs(remaining) > 0.01"
          :class="[
            'flex justify-between gap-4 font-medium',
            remaining > 0 ? 'text-error-600' : 'text-warning-600',
          ]"
        >
          <dt>{{ remaining > 0 ? 'Falta' : 'Excede' }}</dt>
          <dd>R$ {{ formatMoney(Math.abs(remaining)) }}</dd>
        </div>
        <div
          v-if="changeTotal > 0"
          class="flex justify-between gap-4 font-medium text-success-600"
        >
          <dt>Troco</dt>
          <dd>R$ {{ formatMoney(changeTotal) }}</dd>
        </div>
      </dl>
    </div>

    <template #footer>
      <Button variant="ghost" :disabled="props.loading" @click="close">
        Voltar
      </Button>
      <Button
        variant="primary"
        text-class="text-white"
        :loading="props.loading"
        :disabled="!canFinalize"
        @click="submit"
      >
        <template #icon><Icon name="CircleCheck" size="sm" /></template>
        {{ canFinalize ? 'Finalizar venda' : blockReason }}
      </Button>
    </template>
  </Modal>
</template>
