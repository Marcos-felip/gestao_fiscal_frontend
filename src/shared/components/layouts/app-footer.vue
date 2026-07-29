<script setup lang="ts">

const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer border-t border-line-2">
    <div
      class="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-4 sm:px-6 lg:px-8"
    >
      <p class="flex items-center gap-1 text-sm text-muted-foreground">
        <img
          src="/apple-touch-icon.png"
          alt="Gestão Fiscal"
          class="size-6 rounded-md"
        />
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
