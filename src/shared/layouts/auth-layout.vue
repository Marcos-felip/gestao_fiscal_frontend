<script setup lang="ts">
import { Building2 } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-md">
      <div class="flex flex-col items-center mb-8">
        <div class="flex items-center gap-2 mb-2">
          <Building2 class="h-8 w-8 text-primary" />
          <h1 class="text-2xl font-bold text-foreground">Gestão Fiscal</h1>
        </div>
        <p class="text-muted-foreground-1 text-sm">Sistema de gestão fiscal para empresas brasileiras</p>
      </div>
      <div class="bg-card border border-card-line rounded-xl shadow-sm p-8">
        <slot />
      </div>
    </div>
  </div>
</template>