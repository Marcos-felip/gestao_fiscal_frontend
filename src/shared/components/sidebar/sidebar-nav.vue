<template>
  <motion.nav
    :class="['sidebar-nav', 'flex-1 overflow-y-auto px-4 py-1 space-y-1']"
    :variants="containerVariants"
    initial="hidden"
    animate="visible"
  >
    <motion.div v-for="link in links" :key="link.to" :variants="itemVariants">
      <SidebarLink :to="link.to" :label="link.label">
        <template #icon>
          <Icon :name="link.icon" size="md" />
        </template>
      </SidebarLink>
    </motion.div>
  </motion.nav>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import { SidebarLink, Icon } from '@/shared/ui'

interface NavLink {
  to: string
  label: string
  icon: string
}

const links: NavLink[] = [
  { to: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { to: '/users', label: 'Usuários', icon: 'Users' },
  { to: '/products', label: 'Produtos', icon: 'Package' },
  { to: '/partners', label: 'Parceiros', icon: 'Users' },
  { to: '/stock', label: 'Estoque', icon: 'Layers' },
  { to: '/purchases', label: 'Compras', icon: 'ShoppingCart' },
  { to: '/companies', label: 'Empresa', icon: 'Building' },
]

// Entrada encenada: os itens surgem em cascata a partir da esquerda.
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
}
</script>

<style scoped lang="css">
.sidebar-nav {
  background-color: var(--color-background);
}
</style>
