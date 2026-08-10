<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/shared/ui'
import {
  FinancialStatus,
  financialStatusLabels,
} from '@/core/enums/financial-status.enum'

const props = withDefaults(
  defineProps<{ status: FinancialStatus; isOverdue?: boolean }>(),
  { isOverdue: false },
)

/** Vencido só se ainda em cobrança (aberto/parcial). */
const overdue = computed(
  () =>
    props.isOverdue &&
    (props.status === FinancialStatus.ABERTO ||
      props.status === FinancialStatus.PARCIAL),
)

const config = computed(() => {
  if (overdue.value) {
    return {
      label: 'Vencido',
      tone: 'bg-error-500/10 text-error-600',
      icon: 'CalendarClock',
    }
  }
  switch (props.status) {
    case FinancialStatus.PAGO:
      return {
        label: financialStatusLabels.PAGO,
        tone: 'bg-success-500/10 text-success-600',
        icon: 'CircleCheck',
      }
    case FinancialStatus.PARCIAL:
      return {
        label: financialStatusLabels.PARCIAL,
        tone: 'bg-warning-500/10 text-warning-600',
        icon: 'CircleDashed',
      }
    case FinancialStatus.CANCELADO:
      return {
        label: financialStatusLabels.CANCELADO,
        tone: 'bg-muted text-muted-foreground',
        icon: 'Ban',
      }
    default:
      return {
        label: financialStatusLabels.ABERTO,
        tone: 'bg-primary/10 text-primary',
        icon: 'Clock',
      }
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
      config.tone,
    ]"
  >
    <Icon :name="config.icon" size="sm" />
    {{ config.label }}
  </span>
</template>
