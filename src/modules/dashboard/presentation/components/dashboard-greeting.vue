<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'

const authStore = useAuthStore()

const firstName = computed(() => {
  const name = authStore.user?.name?.trim()
  return name ? name.split(/\s+/)[0] : 'por aqui'
})
</script>

<template>
  <motion.header
    :initial="{ opacity: 0, y: 12 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ type: 'spring', stiffness: 320, damping: 30 }"
  >
    <p
      class="text-sm font-medium uppercase tracking-widest text-muted-foreground"
    >
      Visão geral
    </p>
    <h1
      class="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
    >
      Olá, {{ firstName }}
    </h1>
    <p class="mt-2 max-w-prose text-sm text-muted-foreground">
      Um panorama da sua operação fiscal. Comece cadastrando produtos e
      parceiros para ver os números ganharem vida.
    </p>
  </motion.header>
</template>
