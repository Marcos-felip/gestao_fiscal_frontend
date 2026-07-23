<script setup lang="ts">
import { useProgress } from '@/shared/composables'

const { progress, visible } = useProgress()
</script>

<template>
  <div
    class="progress-root fixed inset-x-0 top-0 z-[70] h-[3px]"
    :class="visible ? 'opacity-100' : 'opacity-0'"
    role="progressbar"
    aria-hidden="true"
  >
    <div class="progress-bar h-full" :style="{ width: `${progress}%` }" />
  </div>
</template>

<style scoped lang="css">
.progress-root {
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.progress-bar {
  background: linear-gradient(
    90deg,
    var(--color-primary),
    var(--color-secondary)
  );
  /* Brilho na ponta da barra */
  box-shadow:
    0 0 8px color-mix(in srgb, var(--color-primary) 70%, transparent),
    0 0 4px color-mix(in srgb, var(--color-primary) 60%, transparent);
  transition: width 0.22s ease-out;
}
</style>
