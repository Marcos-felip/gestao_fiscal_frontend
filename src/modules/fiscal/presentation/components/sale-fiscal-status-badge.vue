<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/shared/ui'
import type { FiscalStatusTone } from '@/core/enums/fiscal-document-status.enum'
import {
  fiscalStatusLabels,
  fiscalStatusTones,
  type FiscalStatus,
} from '@/core/enums/fiscal-status.enum'

const props = defineProps<{ status: FiscalStatus }>()

/** Classe (token sólido) e ícone por tom visual. */
const toneConfig: Record<FiscalStatusTone, { classes: string; icon: string }> =
  {
    success: {
      classes: 'bg-success-500/10 text-success-600',
      icon: 'CircleCheck',
    },
    error: { classes: 'bg-error-500/10 text-error-600', icon: 'CircleX' },
    warning: { classes: 'bg-warning-500/10 text-warning-700', icon: 'Clock' },
    muted: { classes: 'bg-muted text-muted-foreground', icon: 'CircleDashed' },
  }

const tone = computed(() => fiscalStatusTones[props.status])
const config = computed(() => toneConfig[tone.value])
const label = computed(() => fiscalStatusLabels[props.status])
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
      config.classes,
    ]"
  >
    <Icon :name="config.icon" size="sm" />
    {{ label }}
  </span>
</template>
