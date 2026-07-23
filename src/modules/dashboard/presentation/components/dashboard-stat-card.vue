<script setup lang="ts">
import { motion } from 'motion-v'
import { Icon } from '@/shared/ui'

defineProps<{
  label: string
  value: string
  hint: string
  icon: string
}>()
</script>

<template>
  <motion.article
    :while-hover="{ y: -4 }"
    :transition="{ type: 'spring', stiffness: 400, damping: 26 }"
    class="group relative h-full overflow-hidden rounded-2xl border border-line-2 bg-background p-5 ui-shadow-soft"
  >
    <div class="flex items-start justify-between gap-3">
      <span
        class="text-xs font-medium uppercase tracking-wider text-muted-foreground"
      >
        {{ label }}
      </span>
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
      >
        <Icon :name="icon" size="sm" />
      </span>
    </div>
    <p
      class="mt-4 text-2xl font-bold tracking-tight text-foreground tabular-nums"
    >
      {{ value }}
    </p>
    <p class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
  </motion.article>
</template>
