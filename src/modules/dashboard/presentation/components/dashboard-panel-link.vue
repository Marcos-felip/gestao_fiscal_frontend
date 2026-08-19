<script setup lang="ts">
/**
 * Ação de rodapé dos cartões.
 *
 * Discreta de propósito: é um caminho para aprofundar, não a ação principal do
 * cartão. Âncora azul sublinhada competiria com os números.
 */
import { Icon } from '@/shared/ui'

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="group inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
    @click="$emit('click')"
  >
    <slot />
    <Icon
      name="ChevronRight"
      size="sm"
      class="transition-transform group-hover:translate-x-0.5"
    />
  </button>
</template>
