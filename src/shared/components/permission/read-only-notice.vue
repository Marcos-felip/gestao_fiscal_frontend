<script setup lang="ts">
import { motion } from 'motion-v'
import { Icon } from '@/shared/ui'

/**
 * Aviso de acesso somente leitura, exibido no topo de um formulário quando o
 * usuário pode ver os dados mas não tem permissão para editá-los.
 */
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: -6 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
    class="mb-6 flex items-center gap-2.5 rounded-lg border border-line-2 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
  >
    <Icon name="Lock" size="sm" class="shrink-0" />
    <span>
      Você tem acesso
      <span class="font-medium text-foreground">somente leitura</span>
      a esta tela.
    </span>
  </motion.div>
</template>
