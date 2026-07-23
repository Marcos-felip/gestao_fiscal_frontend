<template>
  <RouterLink
    :to="to"
    :class="[
      'sidebar-link',
      'group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-sans',
      'transition-colors duration-200',
      isActive ? 'bg-primary text-white' : 'text-muted-foreground',
    ]"
    :active-class="'active'"
    :exact-active-class="'exact-active'"
  >
    <!-- Ícone -->
    <span :class="['icon', 'h-5 w-5 shrink-0']">
      <slot name="icon" />
    </span>

    <!-- Rótulo -->
    <Span
      size="sm"
      :color="isActive ? 'text-white' : 'text-muted-foreground'"
      class="flex-1 truncate"
    >
      <slot>{{ label }}</slot>
    </Span>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Span } from '@/shared/ui'
import { RouterLink, useRoute } from 'vue-router'

interface Props {
  to: string | object
  label?: string
}

const props = defineProps<Props>()
const route = useRoute()

const isActive = computed(() => {
  if (typeof props.to === 'string') {
    return route.path === props.to || route.path.startsWith(props.to + '/')
  }
  return false
})
</script>

<style scoped lang="css">
.sidebar-link {
  position: relative;
}

.sidebar-link:hover::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--color-primary);
  border-radius: 0 3px 3px 0;
}

.sidebar-link.active {
  position: relative;
}

.sidebar-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--color-primary-foreground);
  border-radius: 0 3px 3px 0;
}
</style>
