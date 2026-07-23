<script setup lang="ts">
import ErrorView from '@/modules/errors/presentation/components/error-view.vue'
</script>

<template>
  <ErrorView
    code="500"
    tone="destructive"
    icon="ServerCrash"
    retry
    title="Erro no servidor"
    description="Algo deu errado do nosso lado ao processar a sua solicitação. Já estamos cientes — tente novamente em instantes."
  />
</template>
