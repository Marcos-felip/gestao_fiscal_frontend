<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Button, Icon, Input } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import {
  validateCloseCashSession,
  type CloseCashSessionErrors,
} from '@/modules/cash/presentation/schemas/close-cash-session-schema'
import { CloseCashSessionDto } from '@/modules/cash/domain/dto/close-cash-session-dto'
import type { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'
import { formatMoneyInput, formatMoney, parseDecimal } from '@/shared/ui/utils/masks'

const props = withDefaults(
  defineProps<{ modelValue: boolean; session: CashSession; loading?: boolean }>(),
  { loading: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [dto: CloseCashSessionDto]
}>()

const form = reactive({ countedCash: '', notes: '' })
const errors = ref<CloseCashSessionErrors>({})

const blind = computed(() => props.session.isBlind)
const expected = computed(() => props.session.summary?.expectedCash ?? null)

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Diferença ao vivo — só quando o esperado é conhecido (fora do cego). */
const difference = computed<number | null>(() => {
  if (blind.value || expected.value === null) return null
  const counted = parseDecimal(form.countedCash)
  if (counted === undefined) return null
  return round2(counted - expected.value)
})

const requireNotes = computed(
  () => difference.value !== null && Math.abs(difference.value) > 0.01,
)

const differenceTone = computed(() => {
  const diff = difference.value
  if (diff === null) return ''
  if (diff < -0.01) return 'text-error-600'
  if (diff > 0.01) return 'text-warning-600'
  return 'text-success-600'
})

const differenceLabel = computed(() => {
  const diff = difference.value
  if (diff === null) return ''
  if (diff < -0.01) return 'Falta na gaveta'
  if (diff > 0.01) return 'Sobra na gaveta'
  return 'Caixa confere'
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.countedCash = ''
      form.notes = ''
      errors.value = {}
    }
  },
)

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  const result = validateCloseCashSession({ ...form }, requireNotes.value)
  errors.value = result.errors
  if (!result.ok) return

  emit(
    'confirm',
    new CloseCashSessionDto({
      countedCash: parseDecimal(form.countedCash) ?? 0,
      notes: form.notes.trim() || undefined,
    }),
  )
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="Fechar caixa"
    description="Confira o dinheiro em gaveta para encerrar a sessão."
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <!-- Aviso do fechamento às cegas -->
      <div
        v-if="blind"
        class="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground"
      >
        <Icon name="EyeOff" size="sm" />
        Fechamento às cegas: informe o valor contado sem ver o esperado.
      </div>

      <!-- Esperado (fora do cego) -->
      <div
        v-else
        class="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
      >
        <span class="text-sm text-muted-foreground">Esperado em gaveta</span>
        <span class="font-display text-xl font-bold tabular-nums text-foreground">
          R$ {{ formatMoney(expected ?? 0) }}
        </span>
      </div>

      <Input
        :model-value="form.countedCash"
        :sanitize="formatMoneyInput"
        inputmode="decimal"
        placeholder="0,00"
        input-class="text-right"
        :error="errors.countedCash"
        @update:model-value="form.countedCash = $event"
      >
        <template #label>Dinheiro contado</template>
        <template #prefix><span class="text-xs text-muted-foreground">R$</span></template>
      </Input>

      <!-- Diferença ao vivo -->
      <div
        v-if="difference !== null"
        :class="['flex items-center justify-between text-sm font-medium', differenceTone]"
      >
        <span>{{ differenceLabel }}</span>
        <span class="tabular-nums">R$ {{ formatMoney(Math.abs(difference)) }}</span>
      </div>

      <Input
        v-model="form.notes"
        maxlength="300"
        :placeholder="requireNotes ? 'Justifique a diferença' : 'Opcional'"
        :error="errors.notes"
      >
        <template #label>
          Observação{{ requireNotes ? ' (obrigatória)' : '' }}
        </template>
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
        <template #icon><Icon name="Lock" size="sm" /></template>
        Fechar caixa
      </Button>
    </template>
  </Modal>
</template>
