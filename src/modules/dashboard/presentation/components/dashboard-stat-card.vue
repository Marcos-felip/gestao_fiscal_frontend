<script setup lang="ts">
/**
 * Cartão de indicador.
 *
 * `tone` tinge o cartão pelo que o número significa, não pelo domínio: título
 * vencido é vermelho, vencendo é âmbar, o resto é neutro. Um painel em que tudo
 * tem a mesma cor obriga a ler seis números para descobrir qual pede ação.
 */
import { computed } from 'vue'
import { motion } from 'motion-v'
import { Icon } from '@/shared/ui'

type Tone = 'default' | 'warning' | 'danger' | 'success'

const props = withDefaults(
  defineProps<{
    label: string
    value: string
    hint?: string
    icon: string
    tone?: Tone
    to?: string
  }>(),
  { tone: 'default', hint: '', to: '' },
)

const iconClasses = computed(() => {
  switch (props.tone) {
    case 'danger':
      return 'bg-error-50 text-error group-hover:bg-error group-hover:text-white'
    case 'warning':
      return 'bg-warning-50 text-warning-700 group-hover:bg-warning group-hover:text-white'
    case 'success':
      return 'bg-success-50 text-success-700 group-hover:bg-success group-hover:text-white'
    default:
      return 'bg-primary-50 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
  }
})

const valueClasses = computed(() =>
  props.tone === 'danger' ? 'text-error' : 'text-foreground',
)
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
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
        :class="iconClasses"
      >
        <Icon :name="icon" size="sm" />
      </span>
    </div>

    <p
      class="mt-4 text-2xl font-bold tracking-tight tabular-nums"
      :class="valueClasses"
    >
      {{ value }}
    </p>

    <p v-if="hint" class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
    <slot name="hint" />
  </motion.article>
</template>
