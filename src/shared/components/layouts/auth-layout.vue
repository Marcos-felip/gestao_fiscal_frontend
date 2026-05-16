<script setup lang="ts">
import { Building2 } from 'lucide-vue-next'
import { CardUi } from '@/shared/ui'
</script>

<template>
  <!-- Container com fundo hero-gradient do Preline -->
  <div
    class="flex flex-col items-center justify-center min-h-screen relative overflow-hidden p-4 before:absolute before:top-0 before:inset-x-0 before:bg-[url('https://preline.co/assets/svg/component/hero-gradient.svg')] dark:before:bg-[url('https://preline.co/assets/svg/component-dark/hero-gradient.svg')] before:bg-no-repeat before:bg-center before:bg-cover before:size-full before:-z-10"
  >
    <div class="w-full max-w-md z-10 relative">
      <!-- Logo centralizado no topo -->
      <div class="flex justify-center mb-12">
        <div class="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10">
          <Building2 class="h-8 w-8 text-primary" />
        </div>
      </div>

      <!-- Card com formulário usando CardUi -->
      <CardUi variant="elevated" padding="lg" class="w-full">
        <!-- Slot de título -->
        <div v-if="$slots.title" class="mb-4">
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
