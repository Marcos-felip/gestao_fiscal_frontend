<template>
  <span
    :class="[
      'badge',
      'inline-flex items-center justify-center rounded-full text-xs font-bold',
      'h-6 w-6 min-w-6',
      variantClasses,
    ]"
  >
    {{ count > 99 ? '99+' : count }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  count: number
  variant?: 'primary' | 'destructive' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'destructive':
      return 'bg-destructive text-destructive-foreground'
    case 'secondary':
      return 'bg-secondary text-secondary-foreground'
    case 'primary':
    default:
      return 'bg-primary text-primary-foreground'
  }
})
</script>

<style scoped lang="css">
.badge {
  display: inline-flex;
  flex-shrink: 0;
}
</style>
