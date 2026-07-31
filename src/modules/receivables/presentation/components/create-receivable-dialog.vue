<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Button, Icon, Input } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import {
  validateCreateReceivable,
  type CreateReceivableErrors,
} from '@/modules/receivables/presentation/schemas/receivable-schema'
import { CreateReceivableDto } from '@/modules/receivables/domain/dto/create-receivable-dto'
import {
  dateBrToIso,
  formatDateBr,
  formatDecimalInput,
  formatMoney,
  onlyDigits,
  parseDecimal,
} from '@/shared/ui/utils/masks'

const props = withDefaults(
  defineProps<{ modelValue: boolean; loading?: boolean }>(),
  { loading: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [dto: CreateReceivableDto]
}>()

const form = reactive({
  description: '',
  totalAmount: '',
  dueDate: '',
  installments: '1',
  intervalDays: '30',
  category: '',
})
const errors = ref<CreateReceivableErrors>({})

const installmentsCount = computed(() =>
  Math.max(1, Math.trunc(parseDecimal(form.installments) ?? 1)),
)
const installmentAmount = computed(() => {
  const total = parseDecimal(form.totalAmount) ?? 0
  return installmentsCount.value > 0 ? total / installmentsCount.value : 0
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.description = ''
      form.totalAmount = ''
      form.dueDate = ''
      form.installments = '1'
      form.intervalDays = '30'
      form.category = ''
      errors.value = {}
    }
  },
)

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  const result = validateCreateReceivable({ ...form, customerId: '' })
  errors.value = result.errors
  if (!result.ok) return

  emit(
    'confirm',
    new CreateReceivableDto({
      description: form.description.trim(),
      totalAmount: parseDecimal(form.totalAmount) ?? 0,
      dueDate: dateBrToIso(form.dueDate) ?? '',
      installments: installmentsCount.value,
      intervalDays: Math.max(1, Math.trunc(parseDecimal(form.intervalDays) ?? 30)),
      category: form.category.trim() || undefined,
    }),
  )
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="Novo título a receber"
    description="Lance um título avulso (não vinculado a uma venda)."
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <Input
        v-model="form.description"
        maxlength="200"
        placeholder="Ex.: Serviço de manutenção"
        :error="errors.description"
      >
        <template #label>Descrição</template>
      </Input>

      <div class="grid grid-cols-2 gap-3">
        <Input
          :model-value="form.totalAmount"
          :sanitize="formatDecimalInput"
          inputmode="decimal"
          placeholder="0,00"
          input-class="text-right"
          :error="errors.totalAmount"
          @update:model-value="form.totalAmount = $event"
        >
          <template #label>Valor total</template>
          <template #prefix><span class="text-xs text-muted-foreground">R$</span></template>
        </Input>

        <Input
          :model-value="form.dueDate"
          :sanitize="formatDateBr"
          inputmode="numeric"
          maxlength="10"
          placeholder="dd/mm/aaaa"
          :error="errors.dueDate"
          @update:model-value="form.dueDate = $event"
        >
          <template #label>1º vencimento</template>
          <template #prefix><Icon name="CalendarClock" size="sm" /></template>
        </Input>
      </div>

      <div class="grid grid-cols-2 gap-3">
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
      </div>

      <Input
        v-model="form.category"
        maxlength="60"
        placeholder="Ex.: Serviços (opcional)"
      >
        <template #label>Categoria</template>
      </Input>

      <p
        v-if="installmentsCount > 1"
        class="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
      >
        <span class="text-muted-foreground">{{ installmentsCount }} parcelas de</span>
        <span class="font-semibold tabular-nums text-foreground">
          R$ {{ formatMoney(installmentAmount) }}
        </span>
      </p>

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
        <template #icon><Icon name="Plus" size="sm" /></template>
        Criar título
      </Button>
    </template>
  </Modal>
</template>
