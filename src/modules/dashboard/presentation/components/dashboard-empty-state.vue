<script setup lang="ts">
import { motion } from 'motion-v'
import { Icon } from '@/shared/ui'
</script>

<template>
  <motion.section
    :initial="{ opacity: 0, y: 18 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ delay: 0.35, type: 'spring', stiffness: 300, damping: 30 }"
    class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-3 bg-background-1 px-6 py-14 text-center"
  >
    <span
      class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary"
    >
      <Icon name="Sparkles" size="md" />
    </span>
    <h2 class="mt-4 text-lg font-bold tracking-tight text-foreground">
      Tudo pronto para começar
    </h2>
    <p class="mt-1 max-w-sm text-sm text-muted-foreground">
      Seus indicadores fiscais aparecerão aqui assim que você registrar as
      primeiras movimentações.
    </p>
  </motion.section>
</template>
