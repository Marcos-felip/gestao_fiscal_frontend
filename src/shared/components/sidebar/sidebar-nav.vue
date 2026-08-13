<template>
  <nav class="sidebar-nav flex-1 overflow-y-auto px-3 py-2">
    <!-- Item fixo: início -->
    <SidebarLink :to="home.to" :label="home.label" class="mb-1">
      <template #icon>
        <Icon :name="home.icon" size="md" />
      </template>
    </SidebarLink>

    <!-- Grupos: seção → sub-itens -->
    <div v-for="group in visibleGroups" :key="group.id" class="mt-2 first:mt-1">
      <!-- Cabeçalho da seção (colapsa/expande) — mesma cara do item "Início" -->
      <button
        type="button"
        class="group/sec mb-0.5 flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        :aria-expanded="isOpen(group.id)"
        @click="toggle(group.id)"
      >
        <span class="flex h-5 w-5 shrink-0 items-center justify-center">
          <Icon :name="group.icon" size="md" />
        </span>
        <span class="min-w-0 flex-1 truncate text-left">{{ group.label }}</span>
        <Icon
          name="ChevronDown"
          size="sm"
          :class="[
            'shrink-0 transition-transform duration-200',
            isOpen(group.id) ? '' : '-rotate-90',
          ]"
        />
      </button>

      <!-- Sub-itens: compactos e indentados sob a seção -->
      <Transition name="collapse" @enter="onEnter" @leave="onLeave">
        <div
          v-show="isOpen(group.id)"
          class="ml-4 space-y-0.5 overflow-hidden border-l border-line-2 pl-2"
        >
          <SidebarLink
            v-for="link in group.links"
            :key="link.to"
            :to="link.to"
            :label="link.label"
            size="sm"
          >
            <template #icon>
              <Icon :name="link.icon" size="sm" />
            </template>
          </SidebarLink>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { SidebarLink, Icon } from '@/shared/ui'
import { usePermissions } from '@/shared/composables/usePermissions'
import { StorageKeys } from '@/core/constants/storage-keys'
import type { MembershipRole } from '@/core/enums/membership-role.enum'

interface NavLink {
  to: string
  label: string
  icon: string
  /** Exige esta permissão para aparecer. */
  permission?: string
  /** Exige este papel (mínimo) para aparecer. */
  role?: MembershipRole
}

interface NavGroup {
  id: string
  label: string
  icon: string
  links: NavLink[]
}

const home: NavLink = { to: '/', label: 'Início', icon: 'LayoutDashboard' }

// Agrupamento por objetivo (operação do dia a dia → cadastros → configurações),
// no espírito dos ERPs/PDVs modernos. Cada item segue gated por permissão.
const groups: NavGroup[] = [
  {
    id: 'operacao',
    label: 'Operação',
    icon: 'Zap',
    links: [
      {
        to: '/pdv',
        label: 'PDV',
        icon: 'ScanBarcode',
        permission: 'sales.create',
      },
      {
        to: '/vendas',
        label: 'Vendas',
        icon: 'ShoppingBag',
        permission: 'sales.list',
      },
      {
        to: '/compras',
        label: 'Compras',
        icon: 'ShoppingCart',
        permission: 'purchases.list',
      },
      {
        to: '/sessoes-de-caixa',
        label: 'Sessões de caixa',
        icon: 'Archive',
        permission: 'cash.list',
      },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: 'CircleDollarSign',
    links: [
      {
        to: '/contas-a-receber',
        label: 'Contas a receber',
        icon: 'HandCoins',
        permission: 'receivables.list',
      },
      {
        to: '/contas-a-pagar',
        label: 'Contas a pagar',
        icon: 'Wallet',
        permission: 'payables.list',
      },
    ],
  },
  {
    id: 'fiscal',
    label: 'Fiscal',
    icon: 'ScrollText',
    links: [
      {
        to: '/documentos-fiscais',
        label: 'Documentos fiscais',
        icon: 'FileText',
        permission: 'fiscal.read',
      },
    ],
  },
  {
    // Grupo próprio, e não um item dentro de "Fiscal": configurar é uma tarefa
    // de instalação, não de operação do dia. Quem vende abre "Documentos
    // fiscais"; quem instala vem aqui uma vez e não volta.
    id: 'configuracao-fiscal',
    label: 'Configuração fiscal',
    icon: 'Settings2',
    links: [
      {
        to: '/configuracao-fiscal',
        label: 'Estabelecimentos',
        icon: 'Store',
        permission: 'fiscal.settings.read',
      },
      {
        to: '/configuracao-fiscal?secao=ambiente',
        label: 'Ambiente e emissão',
        icon: 'ToggleRight',
        permission: 'fiscal.settings.read',
      },
      {
        to: '/configuracao-fiscal?secao=nfce',
        label: 'Venda ao consumidor',
        icon: 'ScrollText',
        permission: 'fiscal.settings.read',
      },
      {
        to: '/configuracao-fiscal?secao=nfe',
        label: 'Venda a empresa',
        icon: 'FileText',
        permission: 'fiscal.settings.read',
      },
      {
        to: '/configuracao-fiscal?secao=certificado',
        label: 'Certificado digital',
        icon: 'ShieldCheck',
        permission: 'fiscal.settings.read',
      },
      {
        to: '/configuracao-fiscal?secao=producao',
        label: 'Liberação para produção',
        icon: 'Rocket',
        permission: 'fiscal.settings.read',
      },
    ],
  },
  {
    id: 'cadastros',
    label: 'Cadastros',
    icon: 'Database',
    links: [
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
      {
        to: '/estoque',
        label: 'Estoque',
        icon: 'Layers',
        permission: 'stock.list',
      },
      {
        to: '/caixas',
        label: 'Caixas',
        icon: 'Monitor',
        permission: 'cash-registers.list',
      },
      {
        to: '/estabelecimentos',
        label: 'Estabelecimentos',
        icon: 'Store',
        permission: 'establishments.list',
      },
    ],
  },
  {
    id: 'config',
    label: 'Configurações',
    icon: 'Settings',
    links: [
      {
        to: '/empresa',
        label: 'Empresa',
        icon: 'Building',
        permission: 'company.read',
      },
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
    ],
  },
]

const route = useRoute()
const { can, isAtLeast } = usePermissions()

function isVisible(link: NavLink): boolean {
  if (link.permission && !can(link.permission)) return false
  if (link.role && !isAtLeast(link.role)) return false
  return true
}

// Esconde grupos sem nenhum item visível.
const visibleGroups = computed<NavGroup[]>(() =>
  groups
    .map((group) => ({ ...group, links: group.links.filter(isVisible) }))
    .filter((group) => group.links.length > 0),
)

// ---- Estado de colapso (persistido) ----
function loadCollapsed(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(StorageKeys.SIDEBAR_GROUPS)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, boolean>)
      : {}
  } catch {
    return {}
  }
}

const collapsed = reactive<Record<string, boolean>>(loadCollapsed())

watch(
  collapsed,
  (value) =>
    localStorage.setItem(StorageKeys.SIDEBAR_GROUPS, JSON.stringify(value)),
  { deep: true },
)

function isRouteActive(to: string): boolean {
  return route.path === to || route.path.startsWith(to + '/')
}

// Abre automaticamente o grupo que contém a rota atual (item nunca fica oculto).
watch(
  () => route.path,
  () => {
    const active = groups.find((g) => g.links.some((l) => isRouteActive(l.to)))
    if (active) collapsed[active.id] = false
  },
  { immediate: true },
)

function isOpen(id: string): boolean {
  return !collapsed[id]
}

function toggle(id: string): void {
  collapsed[id] = !collapsed[id]
}

// Transição de altura suave ao colapsar/expandir.
function onEnter(el: Element): void {
  const element = el as HTMLElement
  element.style.height = '0'
  void element.offsetHeight
  element.style.height = element.scrollHeight + 'px'
}
function onLeave(el: Element): void {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  void element.offsetHeight
  element.style.height = '0'
}
</script>

<style scoped lang="css">
.sidebar-nav {
  background-color: var(--color-background);
}

.collapse-enter-active,
.collapse-leave-active {
  transition: height 200ms ease-in-out;
}

.collapse-enter-from,
.collapse-leave-to {
  height: 0;
}
</style>
