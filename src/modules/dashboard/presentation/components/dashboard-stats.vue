<script setup lang="ts">
import { motion } from 'motion-v'
import { Skeleton } from '@/shared/ui'
import DashboardStatCard from './dashboard-stat-card.vue'

defineProps<{ loading?: boolean }>()

interface Stat {
  key: string
  label: string
  value: string
  hint: string
  icon: string
}

const stats: Stat[] = [
  {
    key: 'faturamento',
    label: 'Faturamento no mês',
    value: 'R$ 0,00',
    hint: 'Nenhuma nota emitida ainda',
    icon: 'TrendingUp',
  },
  {
    key: 'notas',
    label: 'Notas fiscais',
    value: '0',
    hint: 'Emita a primeira nota',
    icon: 'FileText',
  },
  {
    key: 'produtos',
    label: 'Produtos cadastrados',
    value: '0',
    hint: 'Cadastre seu catálogo',
    icon: 'Package',
  },
  {
    key: 'parceiros',
    label: 'Parceiros',
    value: '0',
    hint: 'Clientes e fornecedores',
    icon: 'Users',
  },
]

// Entrada em cascata dos cartões.
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
}
</script>

<template>
  <!-- Estado de carregamento: skeleton dos cartões -->
  <div
    v-if="loading"
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
  >
    <div
      v-for="n in 4"
      :key="`sk-${n}`"
      class="rounded-2xl border border-line-2 bg-background p-5 ui-shadow-soft"
    >
      <div class="flex items-start justify-between gap-3">
        <Skeleton class="h-3 w-24 rounded" />
        <Skeleton class="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton class="mt-5 h-7 w-20 rounded" />
      <Skeleton class="mt-2 h-3 w-28 rounded" />
    </div>
  </div>

  <!-- Conteúdo carregado -->
  <motion.section
    v-else
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    :variants="container"
    initial="hidden"
    animate="visible"
  >
    <motion.div v-for="stat in stats" :key="stat.key" :variants="item">
      <DashboardStatCard
        :label="stat.label"
        :value="stat.value"
        :hint="stat.hint"
        :icon="stat.icon"
      />
    </motion.div>
  </motion.section>
</template>
