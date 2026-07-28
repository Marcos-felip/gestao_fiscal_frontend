<script setup lang="ts">
import { computed } from 'vue'
import { PartnerType, partnerTypeLabels } from '@/enums/partner-type.enum'

const props = defineProps<{ type: PartnerType }>()

const label = computed(() => partnerTypeLabels[props.type] ?? props.type)

const toneClasses = computed(() => {
  switch (props.type) {
    case PartnerType.CLIENT:
      return 'bg-primary/10 text-primary'
    case PartnerType.SUPPLIER:
      return 'bg-secondary/10 text-secondary'
    default:
      return 'bg-muted text-muted-foreground'
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      toneClasses,
    ]"
  >
    {{ label }}
  </span>
</template>
