<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/shared/ui'
import {
  StockMovementType,
  stockMovementTypeLabels,
} from '@/core/enums/stock-movement-type.enum'

const props = defineProps<{ type: StockMovementType }>()

const label = computed(
  () => stockMovementTypeLabels[props.type] ?? props.type,
)

const config = computed(() => {
  switch (props.type) {
    case StockMovementType.ENTRADA:
      return { tone: 'bg-success-500/10 text-success-600', icon: 'ArrowUp' }
    case StockMovementType.SAIDA:
      return { tone: 'bg-error-500/10 text-error-600', icon: 'ArrowDown' }
    default:
      return {
        tone: 'bg-warning-500/10 text-warning-600',
        icon: 'SlidersHorizontal',
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
    {{ label }}
  </span>
</template>
