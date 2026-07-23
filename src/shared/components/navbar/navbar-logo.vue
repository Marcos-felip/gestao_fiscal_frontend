<template>
  <RouterLink
    to="/"
    :class="[
      'navbar-logo',
      'flex items-center gap-2 text-lg font-bold text-primary hover:opacity-80 transition-opacity',
    ]"
  >
    <Icon name="DollarSign" size="lg" />
    <Span size="lg" weight="bold" variant="primary">Gestão Fiscal</Span>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Icon, Span } from '@/shared/ui'
</script>

<style scoped lang="css">
.navbar-logo {
  display: inline-flex;
  text-decoration: none;
}
</style>
