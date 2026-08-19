<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/shared/ui'
import {
  fiscalDocumentStatusLabels,
  fiscalDocumentStatusTones,
  type FiscalDocumentStatus,
  type FiscalStatusTone,
} from '@/core/enums/fiscal-document-status.enum'

const props = defineProps<{ status: FiscalDocumentStatus }>()

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

const tone = computed(() => fiscalDocumentStatusTones[props.status])
const config = computed(() => toneConfig[tone.value])
const label = computed(() => fiscalDocumentStatusLabels[props.status])
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
