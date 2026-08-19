<script setup lang="ts">
/**
 * Anatomia única dos cartões de painel.
 *
 * Antes cada um inventava a sua: um tinha caixa cinza aninhada, outro número
 * grande, outro lista solta — três cartões lado a lado que não liam como
 * família e não alinhavam em nada. Aqui o esqueleto é o mesmo em todos:
 * sobrancelha com ícone e selo de situação, um número para o olho pousar, a
 * frase de apoio, o detalhe atrás de um filete e a ação no rodapé.
 *
 * O rodapé usa `mt-auto`: numa fileira de cartões de conteúdo desigual, é o que
 * faz todas as ações pararem na mesma linha em vez de flutuarem no meio.
 */
import { computed } from 'vue'
import { motion } from 'motion-v'
import { Icon, Skeleton } from '@/shared/ui'
import DashboardBlockError from './dashboard-block-error.vue'
import type { BlockStatus } from '@/modules/dashboard/presentation/controllers/dashboard-controller'

export type PanelTone = 'default' | 'success' | 'warning' | 'danger'

export interface PanelBadge {
  label: string
  tone: PanelTone
}

const props = withDefaults(
  defineProps<{
    label: string
    icon: string
    state: BlockStatus
    errorLabel: string
    badge?: PanelBadge | null
    value?: string
    support?: string
    valueTone?: PanelTone
  }>(),
  { badge: null, value: '', support: '', valueTone: 'default' },
)

defineEmits<{ retry: [] }>()

const badgeClasses: Record<PanelTone, string> = {
  default: 'border-line-2 bg-background-1 text-muted-foreground',
  success: 'border-success-200 bg-success-50 text-success-700',
  warning: 'border-warning-200 bg-warning-50 text-warning-700',
  danger: 'border-error-200 bg-error-50 text-error',
}

const dotClasses: Record<PanelTone, string> = {
  default: 'bg-muted-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-error',
}

const valueClasses = computed(() => {
  switch (props.valueTone) {
    case 'danger':
      return 'text-error'
    case 'warning':
      return 'text-warning-700'
    case 'success':
      return 'text-success-700'
    default:
      return 'text-foreground'
  }
})
</script>

<template>
  <motion.section
    :initial="{ opacity: 0, y: 14 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ type: 'spring', stiffness: 320, damping: 30 }"
    class="flex h-full flex-col rounded-2xl border border-line-2 bg-background p-5 ui-shadow-soft"
  >
    <header class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <Icon :name="icon" size="sm" class="shrink-0 text-muted-foreground" />
        <h2
          class="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {{ label }}
        </h2>
      </div>

      <span
        v-if="badge && state === 'ready'"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
        :class="badgeClasses[badge.tone]"
      >
        <span
          class="h-1.5 w-1.5 rounded-full"
          :class="dotClasses[badge.tone]"
        />
        {{ badge.label }}
      </span>
    </header>

    <div v-if="state === 'loading'" class="mt-4 space-y-2">
      <Skeleton class="h-8 w-32 rounded" />
      <Skeleton class="h-3 w-40 rounded" />
      <Skeleton class="mt-4 h-12 w-full rounded-lg" />
    </div>

    <DashboardBlockError
      v-else-if="state === 'failed'"
      class="mt-4"
      :label="errorLabel"
      @retry="$emit('retry')"
    />

    <template v-else>
      <p
        v-if="value"
        class="mt-3 text-3xl font-bold tracking-tight tabular-nums"
        :class="valueClasses"
      >
        {{ value }}
      </p>
      <p v-if="support" class="mt-1 text-xs text-muted-foreground">
        {{ support }}
      </p>

      <div v-if="$slots.detail" class="mt-4 border-t border-line-2 pt-1">
        <slot name="detail" />
      </div>

      <div
        v-if="$slots.footer"
        class="mt-auto flex justify-end border-t border-line-2 pt-3"
      >
        <slot name="footer" />
      </div>
    </template>
  </motion.section>
</template>
