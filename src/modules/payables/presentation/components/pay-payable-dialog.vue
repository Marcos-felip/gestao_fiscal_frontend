<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button, Icon, Input, Select } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import {
  validatePayPayable,
  type PayPayableErrors,
} from '@/modules/payables/presentation/schemas/payable-schema'
import { PayPayableDto } from '@/modules/payables/domain/dto/pay-payable-dto'
import type { PaymentMethod } from '@/core/enums/payment-method.enum'
import { paymentMethodOptions } from '@/core/enums/payment-method.enum'
import { formatDecimalInput, formatMoney, parseDecimal } from '@/shared/ui/utils/masks'

const props = withDefaults(
  defineProps<{ modelValue: boolean; balance: number; loading?: boolean }>(),
  { loading: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [dto: PayPayableDto]
}>()

const amount = ref('')
const method = ref('')
const notes = ref('')
const errors = ref<PayPayableErrors>({})

const methodOptions: SelectOption[] = [
  { value: '', label: 'Não informar' },
  ...paymentMethodOptions,
]

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      amount.value = props.balance > 0 ? formatMoney(props.balance) : ''
      method.value = ''
      notes.value = ''
      errors.value = {}
    }
  },
)

function fillTotal(): void {
  amount.value = formatMoney(props.balance)
}

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  const result = validatePayPayable(
    { amount: amount.value, method: method.value, notes: notes.value },
    props.balance,
  )
  errors.value = result.errors
  if (!result.ok) return

  emit(
    'confirm',
    new PayPayableDto({
      amount: parseDecimal(amount.value) ?? 0,
      method: (method.value as PaymentMethod) || undefined,
      notes: notes.value.trim() || undefined,
    }),
  )
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="Registrar pagamento"
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div
        class="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
      >
        <span class="text-muted-foreground">Saldo em aberto</span>
        <span class="font-semibold tabular-nums text-foreground">
          R$ {{ formatMoney(props.balance) }}
        </span>
      </div>

      <Input
        :model-value="amount"
        :sanitize="formatDecimalInput"
        inputmode="decimal"
        placeholder="0,00"
        input-class="text-right"
        :error="errors.amount"
        @update:model-value="amount = $event"
      >
        <template #label>Valor do pagamento</template>
        <template #prefix><span class="text-xs text-muted-foreground">R$</span></template>
      </Input>

      <button
        type="button"
        class="text-xs font-medium text-primary hover:underline"
        @click="fillTotal"
      >
        Pagar total (R$ {{ formatMoney(props.balance) }})
      </button>

      <Select v-model="method" :options="methodOptions" placeholder="Forma">
        <template #label>Forma de pagamento</template>
      </Select>

      <Input v-model="notes" maxlength="500" placeholder="Observações do pagamento">
        <template #label>Observações</template>
      </Input>

      <button type="submit" class="hidden" aria-hidden="true"></button>
    </form>

    <template #footer>
      <Button variant="ghost" :disabled="props.loading" @click="close">
        Voltar
      </Button>
      <Button
        variant="primary"
        text-class="text-white"
        :loading="props.loading"
        @click="submit"
      >
        <template #icon><Icon name="CircleCheck" size="sm" /></template>
        Registrar pagamento
      </Button>
    </template>
  </Modal>
</template>
