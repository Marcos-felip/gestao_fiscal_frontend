<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/shared/ui'
import {
  CashSessionStatus,
  cashSessionStatusLabels,
} from '@/enums/cash-session-status.enum'

const props = defineProps<{ status: CashSessionStatus }>()

const config = computed(() => {
  if (props.status === CashSessionStatus.ABERTA) {
    return {
      label: cashSessionStatusLabels.ABERTA,
      tone: 'bg-success-500/10 text-success-600',
      icon: 'LockOpen',
    }
  }
  return {
    label: cashSessionStatusLabels.FECHADA,
    tone: 'bg-error-500/10 text-error-600',
    icon: 'Lock',
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
