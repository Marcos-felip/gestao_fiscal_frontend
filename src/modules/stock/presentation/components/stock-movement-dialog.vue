<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Modal from '@/shared/components/dialog/modal.vue'
import { Button, Icon, Input, Select } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import { StockMovementType, stockMovementTypeOptions } from '@/enums/stock-movement-type.enum'
import { formatDecimalInput } from '@/shared/ui/utils/masks'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  stockMovementSchema,
  type StockMovementFormData,
  type StockMovementFormValues,
} from '@/modules/stock/presentation/schemas/stock-movement-schema'

const props = defineProps<{
  modelValue: boolean
  productOptions: SelectOption[]
  saving: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: StockMovementFormValues]
}>()

function emptyForm(): StockMovementFormValues {
  return { productId: '', type: StockMovementType.ENTRADA, quantity: '', reason: '' }
}

const form = reactive<StockMovementFormValues>(emptyForm())
const errors = ref<Partial<Record<keyof StockMovementFormData, string>>>({})

// Reseta o formulário sempre que o modal abre.
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      Object.assign(form, emptyForm())
      errors.value = {}
    }
  },
)

// Dica contextual conforme o tipo escolhido.
const quantityHint = computed(() => {
  switch (form.type) {
    case StockMovementType.ENTRADA:
      return 'Soma esta quantidade ao estoque atual.'
    case StockMovementType.SAIDA:
      return 'Subtrai do estoque atual (não pode ficar negativo).'
    default:
      return 'Define o estoque final exatamente com este valor.'
  }
})

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  const result = stockMovementSchema.safeParse({ ...form })
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }
  errors.value = {}
  emit('submit', { ...form })
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="Nova movimentação"
    description="Registre uma entrada, saída ou ajuste manual de estoque."
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-5" @submit.prevent="submit">
      <Select
        v-model="form.productId"
        :options="props.productOptions"
        placeholder="Selecione o produto"
        :error="errors.productId"
      >
        <template #label>Produto</template>
      </Select>

      <Select
        v-model="form.type"
        :options="stockMovementTypeOptions"
        placeholder="Tipo"
        :error="errors.type"
      >
        <template #label>Tipo de movimentação</template>
      </Select>

      <Input
        :model-value="form.quantity"
        inputmode="decimal"
        placeholder="0"
        :error="errors.quantity"
        :hint="errors.quantity ? '' : quantityHint"
        @update:model-value="form.quantity = formatDecimalInput($event)"
      >
        <template #prefix><Icon name="Hash" size="sm" /></template>
        <template #label>Quantidade</template>
      </Input>

      <Input
        v-model="form.reason"
        maxlength="255"
        placeholder="Ex.: inventário, perda, devolução…"
        :error="errors.reason"
      >
        <template #label>Motivo (opcional)</template>
      </Input>
    </form>

    <template #footer>
      <Button variant="ghost" :disabled="props.saving" @click="close">
        Cancelar
      </Button>
      <Button
        variant="primary"
        text-class="text-white"
        :loading="props.saving"
        loading-text="Salvando…"
        @click="submit"
      >
        <template #icon><Icon name="Check" size="sm" /></template>
        Registrar
      </Button>
    </template>
  </Modal>
</template>
