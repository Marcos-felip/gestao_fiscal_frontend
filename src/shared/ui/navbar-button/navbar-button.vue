<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'navbar-button',
      'inline-flex items-center justify-center gap-2 rounded-lg p-2.5 text-sm font-medium',
      'transition-colors duration-200 cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className,
    ]"
    :title="tooltip"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  tooltip?: string
  className?: string
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
})
</script>

<style scoped lang="css">
.navbar-button:hover:not(:disabled) {
  background-color: var(--color-muted);
}
</style>
