<script setup lang="ts">
import ErrorView from '@/modules/errors/presentation/components/error-view.vue'
</script>

<template>
  <ErrorView
    code="403"
    tone="destructive"
    icon="ShieldX"
    title="Acesso negado"
    description="Você não tem permissão para acessar esta página. Se acredita que isto é um engano, fale com o administrador da sua empresa."
  />
</template>
