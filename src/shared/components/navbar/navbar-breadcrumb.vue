<template>
  <nav aria-label="Trilha de navegação" class="flex min-w-0 items-center gap-1.5 text-xs">
    <span class="text-white/40">/</span>
    <template v-for="(crumb, index) in items" :key="index">
      <RouterLink
        v-if="crumb.to && index < items.length - 1"
        :to="crumb.to"
        class="truncate text-white/60 transition-colors hover:text-white"
      >
        {{ crumb.label }}
      </RouterLink>
      <span v-else class="truncate font-medium text-white">
        {{ crumb.label }}
      </span>
      <span v-if="index < items.length - 1" class="text-white/40">/</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useNavigation } from '@/shared/composables'

const { breadcrumbs } = useNavigation()

// O composable prefixa "Dashboard" sempre; remove duplicados adjacentes.
const items = computed(() =>
  breadcrumbs.value.filter(
    (crumb, index, list) =>
      index === 0 || crumb.label !== list[index - 1].label,
  ),
)
</script>
