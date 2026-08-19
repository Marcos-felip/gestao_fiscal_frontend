<script setup lang="ts">
/**
 * Saudação e a data da operação.
 *
 * A data fica visível porque a tela inteira é "hoje" e "este mês", e o recorte
 * é o do fuso da operação — não o do relógio da máquina. Sem a data escrita,
 * quem abre o sistema às 21h não teria como saber a que dia os números se
 * referem.
 */
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'

const authStore = useAuthStore()

const firstName = computed(() => {
  const name = authStore.user?.name?.trim()
  return name ? name.split(/\s+/)[0] : 'por aqui'
})

const today = computed(() =>
  new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date()),
)
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
    <p class="mt-2 text-sm capitalize text-muted-foreground">
      {{ today }}
    </p>
  </motion.header>
</template>
