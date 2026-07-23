<template>
  <div :class="['sidebar-header', 'flex items-center justify-between gap-3 px-4 py-2']">
    <!-- Logo with text -->
    <RouterLink
      to="/"
      :class="[
        'logo',
        'flex items-center hover:opacity-80 transition-opacity',
      ]"
    >
      <img
        src="/apple-touch-icon.png"
        alt="Gestão Fiscal"
        class="h-12 w-12"
      />

      <div class="leading-none">
        <Span
          size="2xl"
          weight="bold"
          class="mr-1"
        >
          Gestão
        </Span>
        <Span
          size="2xl"
          weight="bold"
          variant="primary"
        >
          Fiscal
        </Span>
      </div>
    </RouterLink>

    <!-- Close button (mobile) -->
    <button
      :class="['close-btn', 'lg:hidden']"
      @click="closeSidebar"
      aria-label="Fechar menu"
    >
      <Icon name="X" size="md" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Icon, Span } from '@/shared/ui'
import { useSidebar } from '@/composables'

const { close: closeSidebar } = useSidebar()
</script>

<style scoped lang="css">
.sidebar-header {
  background-color: var(--color-background);
}

.close-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: var(--color-muted-foreground);
  transition: all 200ms;
}

.close-btn:hover {
  background-color: var(--color-muted);
  color: var(--color-foreground);
}
</style>
