<template>
  <div :class="['sidebar-section', 'relative my-4']">
    <div :class="['divider', 'absolute inset-x-0 top-1/2 h-px bg-border']" />
    <div :class="['label', 'relative flex justify-center']">
      <span class="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-background">
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
}

defineProps<Props>()
</script>

<style scoped lang="css">
.sidebar-section {
  background-color: var(--color-background);
  margin-left: 1rem;
  margin-right: 1rem;
}

.label {
  background-color: var(--color-background);
}
</style>
