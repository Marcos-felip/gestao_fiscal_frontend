<script setup lang="ts">
import ErrorView from '@/modules/errors/presentation/components/error-view.vue'
</script>

<template>
  <ErrorView
    code="404"
    tone="primary"
    icon="Compass"
    title="Página não encontrada"
    description="O endereço que você tentou acessar não existe ou foi movido. Confira o link e tente novamente."
  />
</template>
