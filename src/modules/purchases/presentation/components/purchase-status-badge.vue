<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/shared/ui'
import {
  PurchaseStatus,
  purchaseStatusLabels,
} from '@/core/enums/purchase-status.enum'

const props = defineProps<{ status: PurchaseStatus }>()

const label = computed(
  () => purchaseStatusLabels[props.status] ?? props.status,
)

const config = computed(() => {
  switch (props.status) {
    case PurchaseStatus.CONFIRMED:
      return { tone: 'bg-success-500/10 text-success-600', icon: 'CircleCheck' }
    case PurchaseStatus.CANCELLED:
      return { tone: 'bg-error-500/10 text-error-600', icon: 'CircleX' }
    default:
      return { tone: 'bg-muted text-muted-foreground', icon: 'PencilLine' }
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
