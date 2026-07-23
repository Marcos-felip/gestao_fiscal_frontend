<template>
  <RouterLink
    :to="to"
    :class="[
      'sidebar-link',
      'group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium',
      'transition-colors duration-200',
      isActive
        ? 'text-white'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
    ]"
  >
    <!-- Indicador ativo compartilhado: desliza entre os itens (layoutId) -->
    <motion.span
      v-if="isActive"
      layout-id="sidebar-active-pill"
      class="absolute inset-0 rounded-lg bg-primary ui-shadow-soft"
      :transition="{ type: 'spring', stiffness: 480, damping: 40 }"
    />

    <!-- Ícone -->
    <span class="relative z-10 h-5 w-5 shrink-0">
      <slot name="icon" />
    </span>

    <!-- Rótulo -->
    <span class="relative z-10 min-w-0 flex-1 truncate">
      <slot>{{ label }}</slot>
    </span>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
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
</style>
