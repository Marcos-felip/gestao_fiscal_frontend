<script setup lang="ts">
import { Icon } from '@/shared/ui'

// Ano corrente para o aviso de copyright (evita data fixa que envelhece).
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer border-t border-line-2">
    <div
      class="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-4 sm:px-6 lg:px-8"
    >
      <p class="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          class="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary"
        >
          <Icon name="ShieldCheck" size="xs" />
        </span>
        © {{ year }} Gestão Fiscal — todos os direitos reservados.
      </p>
    </div>
  </footer>
</template>

<style scoped lang="css">
.app-footer {
  background-color: var(--color-background);
}
</style>
