<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { Icon } from '@/shared/ui'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'

const authStore = useAuthStore()

const firstName = computed(() => {
  const name = authStore.user?.name?.trim()
  return name ? name.split(/\s+/)[0] : 'por aqui'
})

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
  <div class="space-y-8">
    <!-- Cabeçalho -->
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

    <!-- Métricas -->
    <motion.section
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      :variants="container"
      initial="hidden"
      animate="visible"
    >
      <motion.article
        v-for="stat in stats"
        :key="stat.key"
        :variants="item"
        :while-hover="{ y: -4 }"
        :transition="{ type: 'spring', stiffness: 400, damping: 26 }"
        class="group relative overflow-hidden rounded-2xl border border-line-2 bg-background p-5 ui-shadow-soft"
      >
        <div class="flex items-start justify-between gap-3">
          <span
            class="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {{ stat.label }}
          </span>
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
          >
            <Icon :name="stat.icon" size="sm" />
          </span>
        </div>
        <p
          class="mt-4 text-2xl font-bold tracking-tight text-foreground tabular-nums"
        >
          {{ stat.value }}
        </p>
        <p class="mt-1 text-xs text-muted-foreground">{{ stat.hint }}</p>
      </motion.article>
    </motion.section>

    <!-- Estado vazio / próximos passos -->
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
  </div>
</template>
