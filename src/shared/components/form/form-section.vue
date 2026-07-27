<template>
  <Card class="ui-shadow-soft">
    <template #header>
      <div class="flex items-start gap-3.5">
        <span
          class="ui-shadow-soft flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 not-even:text-white"
        >
          <Icon :name="icon" size="md" />
        </span>
        <div class="min-w-0 pt-0.5">
          <h3
            class="font-display text-base font-semibold tracking-tight text-foreground"
          >
            {{ title }}
          </h3>
          <p v-if="description" class="mt-0.5 text-sm text-muted-foreground">
            {{ description }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-5">
      <slot />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card, Icon } from '@/shared/ui'

/**
 * FormSection
 *
 * Seção de formulário baseada em Card, com cabeçalho de tile em gradiente +
 * título + descrição. Agrupa campos relacionados (ex.: "Informações básicas").
 * A animação de entrada em cascata é orquestrada pelo componente pai.
 */

defineProps<{
  icon: string
  title: string
  description?: string
}>()
</script>
