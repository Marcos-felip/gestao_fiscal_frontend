<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'navbar-button',
      'inline-flex items-center justify-center gap-2 rounded-lg p-1.5 text-sm font-medium',
      'transition-colors duration-200 cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      toneClasses,
      className,
    ]"
    :title="tooltip"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  tooltip?: string
  className?: string
  /** 'light' para uso sobre fundo escuro (navbar da marca). */
  tone?: 'default' | 'light'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
  tone: 'default',
})

const toneClasses = computed(() =>
  props.tone === 'light'
    ? 'text-white/85 hover:text-white hover:bg-white/10'
    : 'text-foreground hover:bg-muted',
)
</script>
