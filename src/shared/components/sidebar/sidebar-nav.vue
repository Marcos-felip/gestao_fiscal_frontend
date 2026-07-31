<template>
  <motion.nav
    :class="['sidebar-nav', 'flex-1 overflow-y-auto px-4 py-1 space-y-1']"
    :variants="containerVariants"
    initial="hidden"
    animate="visible"
  >
    <motion.div
      v-for="link in visibleLinks"
      :key="link.to"
      :variants="itemVariants"
    >
      <SidebarLink :to="link.to" :label="link.label">
        <template #icon>
          <Icon :name="link.icon" size="md" />
        </template>
      </SidebarLink>
    </motion.div>
  </motion.nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { SidebarLink, Icon } from '@/shared/ui'
import { usePermissions } from '@/shared/composables/usePermissions'
import type { MembershipRole } from '@/enums/membership-role.enum'

interface NavLink {
  to: string
  label: string
  icon: string
  /** Exige esta permissão para aparecer. */
  permission?: string
  /** Exige este papel (mínimo) para aparecer. */
  role?: MembershipRole
}

const links: NavLink[] = [
  { to: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  {
    to: '/usuarios',
    label: 'Usuários',
    icon: 'Users',
    permission: 'users.list',
  },
  {
    to: '/perfis-de-permissao',
    label: 'Perfis',
    icon: 'ShieldPlus',
    permission: 'permissions.manage',
  },
  {
    to: '/produtos',
    label: 'Produtos',
    icon: 'Package',
    permission: 'products.list',
  },
  {
    to: '/parceiros',
    label: 'Parceiros',
    icon: 'Users',
    permission: 'partners.list',
  },
  { to: '/estoque', label: 'Estoque', icon: 'Layers', permission: 'stock.list' },
  {
    to: '/compras',
    label: 'Compras',
    icon: 'ShoppingCart',
    permission: 'purchases.list',
  },
  {
    to: '/vendas',
    label: 'Vendas',
    icon: 'ShoppingBag',
    permission: 'sales.list',
  },
  {
    to: '/contas-a-receber',
    label: 'Contas a receber',
    icon: 'HandCoins',
    permission: 'receivables.list',
  },
  {
    to: '/pdv',
    label: 'PDV',
    icon: 'ScanBarcode',
    permission: 'sales.create',
  },
  {
    to: '/estabelecimentos',
    label: 'Estabelecimentos',
    icon: 'Store',
    permission: 'establishments.list',
  },
  {
    to: '/empresa',
    label: 'Empresa',
    icon: 'Building',
    permission: 'company.read',
  },
]

const { can, isAtLeast } = usePermissions()

// Esconde itens sem permissão/papel; itens sem restrição sempre aparecem.
const visibleLinks = computed(() =>
  links.filter((link) => {
    if (link.permission && !can(link.permission)) return false
    if (link.role && !isAtLeast(link.role)) return false
    return true
  }),
)

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
