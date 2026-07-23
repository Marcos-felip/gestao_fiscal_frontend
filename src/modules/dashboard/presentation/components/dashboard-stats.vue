<script setup lang="ts">
import { motion } from 'motion-v'
import DashboardStatCard from './dashboard-stat-card.vue'

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
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
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
  <motion.section
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
