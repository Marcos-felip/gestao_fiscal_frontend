<script setup lang="ts">
import ErrorView from '@/modules/errors/presentation/components/error-view.vue'
</script>

<template>
  <ErrorView
    code="502"
    tone="destructive"
    icon="Unplug"
    retry
    title="Servidor indisponível"
    description="Não conseguimos falar com o servidor no momento. Isto costuma ser temporário — tente novamente em alguns segundos."
  />
</template>
