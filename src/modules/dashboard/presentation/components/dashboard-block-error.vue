<script setup lang="ts">
/**
 * Falha de um bloco, dentro do próprio cartão.
 *
 * A home carrega sete blocos independentes: uma faixa de erro única no topo
 * diria "algo falhou" sem dizer o quê, e sumiria com os números que chegaram
 * bem. Aqui a falha fica no lugar do dado que não veio.
 */
import { Icon } from '@/shared/ui'

defineProps<{ label: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-3 bg-background-1 px-4 py-6 text-center"
  >
    <span
      class="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground"
    >
      <Icon name="CloudOff" size="sm" />
    </span>
    <p class="text-xs text-muted-foreground">
      Não foi possível carregar {{ label }}.
    </p>
    <button
      type="button"
      class="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-50"
      @click="$emit('retry')"
    >
      Tentar novamente
    </button>
  </div>
</template>
