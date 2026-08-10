<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/shared/ui'
import { SaleStatus, saleStatusLabels } from '@/core/enums/sale-status.enum'

const props = defineProps<{ status: SaleStatus }>()

const label = computed(() => saleStatusLabels[props.status] ?? props.status)

const config = computed(() => {
  switch (props.status) {
    case SaleStatus.EM_ABERTO:
      return { tone: 'bg-primary/10 text-primary', icon: 'Clock' }
    case SaleStatus.CONCLUIDA:
      return { tone: 'bg-success-500/10 text-success-600', icon: 'CircleCheck' }
    case SaleStatus.CANCELADA:
      return { tone: 'bg-error-500/10 text-error-600', icon: 'CircleX' }
    default:
      return { tone: 'bg-warning-500/10 text-warning-600', icon: 'FileText' }
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
