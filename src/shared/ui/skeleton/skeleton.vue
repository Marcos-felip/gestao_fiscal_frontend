<template>
  <div class="ui-skeleton" aria-hidden="true" />
</template>

<script setup lang="ts">
/**
 * Skeleton — bloco de carregamento com brilho (shimmer).
 *
 * O tamanho e o arredondamento vêm de classes utilitárias do consumidor:
 *   <Skeleton class="h-4 w-24 rounded" />
 *   <Skeleton class="h-9 w-9 rounded-xl" />
 */
</script>

<style scoped lang="css">
.ui-skeleton {
  position: relative;
  overflow: hidden;
  background: var(--color-muted);
}

.ui-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-background) 65%, transparent),
    transparent
  );
  animation: ui-skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes ui-skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-skeleton::after {
    animation: none;
  }
}
</style>
