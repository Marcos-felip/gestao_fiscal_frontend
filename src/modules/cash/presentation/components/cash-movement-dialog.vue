<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Button, Icon, Input } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import {
  validateCashMovement,
  type CashMovementErrors,
} from '@/modules/cash/presentation/schemas/cash-movement-schema'
import { CreateCashMovementDto } from '@/modules/cash/domain/dto/create-cash-movement-dto'
import {
  CashMovementType,
  cashMovementTypeLabels,
} from '@/enums/cash-movement-type.enum'
import { formatMoneyInput, parseDecimal } from '@/shared/ui/utils/masks'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    type: CashMovementType
    loading?: boolean
  }>(),
  { loading: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [dto: CreateCashMovementDto]
}>()

const form = reactive({ amount: '', reason: '' })
const errors = ref<CashMovementErrors>({})

const isSangria = computed(() => props.type === CashMovementType.SANGRIA)
const title = computed(() => cashMovementTypeLabels[props.type])
const description = computed(() =>
  isSangria.value
    ? 'Retirada de dinheiro da gaveta (reduz o esperado no fechamento).'
    : 'Entrada de dinheiro na gaveta (aumenta o esperado no fechamento).',
)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.amount = ''
      form.reason = ''
      errors.value = {}
    }
  },
)

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  const result = validateCashMovement({ ...form })
  errors.value = result.errors
  if (!result.ok) return

  emit(
    'confirm',
    new CreateCashMovementDto({
      type: props.type,
      amount: parseDecimal(form.amount) ?? 0,
      reason: form.reason.trim() || undefined,
    }),
  )
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    :title="title"
    :description="description"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <Input
        :model-value="form.amount"
        :sanitize="formatMoneyInput"
        inputmode="decimal"
        placeholder="0,00"
        input-class="text-right"
        :error="errors.amount"
        @update:model-value="form.amount = $event"
      >
        <template #label>Valor</template>
        <template #prefix><span class="text-xs text-muted-foreground">R$</span></template>
      </Input>

      <Input v-model="form.reason" maxlength="200" placeholder="Opcional">
        <template #label>Motivo</template>
        <template #prefix><Icon name="StickyNote" size="sm" /></template>
      </Input>

      <button type="submit" class="hidden" aria-hidden="true"></button>
    </form>

    <template #footer>
      <Button variant="ghost" :disabled="props.loading" @click="close">
        Cancelar
      </Button>
      <Button
        variant="primary"
        text-class="text-white"
        :loading="props.loading"
        @click="submit"
      >
        <template #icon>
          <Icon :name="isSangria ? 'ArrowUpFromLine' : 'ArrowDownToLine'" size="sm" />
        </template>
        Registrar {{ title.toLowerCase() }}
      </Button>
    </template>
  </Modal>
</template>
