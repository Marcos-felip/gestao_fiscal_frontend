<script setup lang="ts">
import { Building2 } from 'lucide-vue-next'
import { CardUi } from '@/shared/ui'
</script>

<template>
  <!-- Container flexível que cobre toda a tela com SVG de fundo estilo Preline -->
  <div
    class="flex flex-col items-center justify-center min-h-screen relative overflow-hidden p-4 before:absolute before:top-0 before:inset-x-0 before:bg-[url('https://preline.co/assets/svg/component/hero-gradient.svg')] dark:before:bg-[url('https://preline.co/assets/svg/component-dark/hero-gradient.svg')] before:bg-no-repeat before:bg-center before:bg-cover before:size-full before:-z-10"
  >
    <div class="w-full max-w-md z-10 relative">
      <!-- Logo e branding no topo -->
      <div class="flex flex-col items-center mb-10">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
            <Building2 class="h-6 w-6 text-primary" />
          </div>
          <h1 class="text-3xl font-bold text-foreground">Gestão Fiscal</h1>
        </div>
        <p class="text-muted-foreground-1 text-sm text-center">
          Sistema de gestão fiscal para empresas brasileiras
        </p>
      </div>

      <!-- Card com formulário usando CardUi -->
      <CardUi variant="elevated" padding="lg">
        <!-- Slot de título -->
        <div v-if="$slots.title" class="mb-6">
          <slot name="title" />
        </div>

        <!-- Slot de subtítulo -->
        <div v-if="$slots.subtitle" class="mb-6">
          <slot name="subtitle" />
        </div>

        <!-- Conteúdo do formulário -->
        <slot />
      </CardUi>
    </div>
  </div>
</template>
