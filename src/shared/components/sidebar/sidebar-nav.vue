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
import { usePermissions } from '@/modules/permissions/presentation/composables/usePermissions'
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
    to: '/users',
    label: 'Usuários',
    icon: 'Users',
    permission: 'users.list',
  },
  {
    to: '/permission-profiles',
    label: 'Perfis',
    icon: 'ShieldPlus',
    permission: 'permissions.manage',
  },
  { to: '/products', label: 'Produtos', icon: 'Package' },
  { to: '/partners', label: 'Parceiros', icon: 'Users' },
  { to: '/stock', label: 'Estoque', icon: 'Layers' },
  { to: '/purchases', label: 'Compras', icon: 'ShoppingCart' },
  { to: '/establishments', label: 'Estabelecimentos', icon: 'Store' },
  { to: '/companies', label: 'Empresa', icon: 'Building' },
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
