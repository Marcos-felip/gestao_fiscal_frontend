<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { motion, AnimatePresence } from 'motion-v'
import { Icon } from '@/shared/ui'
import { usePermissions } from '@/shared/composables'
import { routeNames, type RouteName } from '@/router/route-names'

interface Command {
  id: string
  label: string
  group: 'Navegação' | 'Ações rápidas'
  icon: string
  to: RouteName
  /** Permissão necessária para aparecer (ausente = sempre disponível). */
  permission?: string
  /** Termos extras para casar na busca. */
  keywords?: string
}

const props = withDefaults(defineProps<{ modelValue?: boolean }>(), {
  modelValue: false,
})
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const router = useRouter()
const { can } = usePermissions()

const isOpen = ref(props.modelValue)
const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const COMMANDS: Command[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    group: 'Navegação',
    icon: 'LayoutDashboard',
    to: routeNames.DASHBOARD,
    keywords: 'inicio home painel',
  },
  {
    id: 'products',
    label: 'Produtos',
    group: 'Navegação',
    icon: 'Package',
    to: routeNames.PRODUCTS,
    permission: 'products.list',
    keywords: 'catalogo itens',
  },
  {
    id: 'partners',
    label: 'Parceiros',
    group: 'Navegação',
    icon: 'Contact',
    to: routeNames.PARTNERS,
    permission: 'partners.list',
    keywords: 'clientes fornecedores',
  },
  {
    id: 'stock',
    label: 'Estoque',
    group: 'Navegação',
    icon: 'Layers',
    to: routeNames.STOCK,
    permission: 'stock.list',
    keywords: 'movimentacoes inventario',
  },
  {
    id: 'purchases',
    label: 'Compras',
    group: 'Navegação',
    icon: 'ShoppingCart',
    to: routeNames.PURCHASES,
    permission: 'purchases.list',
    keywords: 'pedidos',
  },
  {
    id: 'establishments',
    label: 'Estabelecimentos',
    group: 'Navegação',
    icon: 'Store',
    to: routeNames.ESTABLISHMENTS,
    permission: 'establishments.list',
    keywords: 'filiais',
  },
  {
    id: 'company',
    label: 'Empresa',
    group: 'Navegação',
    icon: 'Building2',
    to: routeNames.COMPANY,
    permission: 'company.read',
  },
  {
    id: 'users',
    label: 'Usuários',
    group: 'Navegação',
    icon: 'Users',
    to: routeNames.USERS,
    permission: 'users.list',
    keywords: 'equipe membros',
  },
  {
    id: 'profiles',
    label: 'Perfis de permissão',
    group: 'Navegação',
    icon: 'ShieldPlus',
    to: routeNames.PERMISSION_PROFILES,
    permission: 'permissions.manage',
    keywords: 'acessos',
  },
  {
    id: 'account',
    label: 'Minha conta',
    group: 'Navegação',
    icon: 'User',
    to: routeNames.ACCOUNT,
    keywords: 'perfil dados',
  },
  {
    id: 'new-product',
    label: 'Novo produto',
    group: 'Ações rápidas',
    icon: 'Package',
    to: routeNames.PRODUCT_NEW,
    permission: 'products.create',
    keywords: 'criar cadastrar',
  },
  {
    id: 'new-partner',
    label: 'Novo parceiro',
    group: 'Ações rápidas',
    icon: 'Contact',
    to: routeNames.PARTNER_NEW,
    permission: 'partners.create',
    keywords: 'criar cadastrar cliente fornecedor',
  },
  {
    id: 'new-purchase',
    label: 'Nova compra',
    group: 'Ações rápidas',
    icon: 'ShoppingCart',
    to: routeNames.PURCHASE_NEW,
    permission: 'purchases.create',
    keywords: 'criar pedido',
  },
  {
    id: 'new-establishment',
    label: 'Nova filial',
    group: 'Ações rápidas',
    icon: 'Store',
    to: routeNames.ESTABLISHMENT_NEW,
    permission: 'establishments.create',
    keywords: 'criar estabelecimento',
  },
]

// Comandos que o usuário pode ver (por permissão).
const available = computed(() =>
  COMMANDS.filter((c) => !c.permission || can(c.permission)),
)

// Filtra por texto (rótulo + palavras-chave), sem acento-sensibilidade simples.
const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return available.value
  return available.value.filter((c) =>
    `${c.label} ${c.keywords ?? ''}`.toLowerCase().includes(term),
  )
})

// Agrupa preservando o índice plano (usado na navegação por teclado).
const grouped = computed(() => {
  const groups: { label: string; items: { cmd: Command; index: number }[] }[] =
    []
  filtered.value.forEach((cmd, index) => {
    let g = groups.find((x) => x.label === cmd.group)
    if (!g) {
      g = { label: cmd.group, items: [] }
      groups.push(g)
    }
    g.items.push({ cmd, index })
  })
  return groups
})

watch(
  () => props.modelValue,
  (value) => {
    isOpen.value = value
    if (value) {
      query.value = ''
      activeIndex.value = 0
      nextTick(() => inputRef.value?.focus())
    }
  },
)

watch(query, () => {
  activeIndex.value = 0
})

function close(): void {
  isOpen.value = false
  emit('update:modelValue', false)
}

function select(cmd: Command): void {
  close()
  void router.push({ name: cmd.to })
}

function onKeydown(event: KeyboardEvent): void {
  const count = filtered.value.length
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (count) activeIndex.value = (activeIndex.value + 1) % count
      break
    case 'ArrowUp':
      event.preventDefault()
      if (count) activeIndex.value = (activeIndex.value - 1 + count) % count
      break
    case 'Enter': {
      event.preventDefault()
      const cmd = filtered.value[activeIndex.value]
      if (cmd) select(cmd)
      break
    }
    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="isOpen"
        key="search-backdrop"
        class="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/50 px-4 pt-[12vh] backdrop-blur-sm"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.15 }"
        @click.self="close"
      >
        <motion.div
          key="search-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Busca"
          class="ui-shadow-float w-full max-w-xl overflow-hidden rounded-2xl border border-line-2 bg-background"
          :initial="{ opacity: 0, scale: 0.97, y: -8 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.98, y: -6 }"
          :transition="{ type: 'spring', stiffness: 420, damping: 32 }"
        >
          <!-- Campo de busca -->
          <div class="flex items-center gap-3 border-b border-line-2 px-4">
            <Icon name="Search" size="sm" class="shrink-0 text-muted-foreground" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Buscar telas e ações…"
              class="w-full bg-transparent py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              @keydown="onKeydown"
            />
            <kbd
              class="shrink-0 rounded border border-line-2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              esc
            </kbd>
          </div>

          <!-- Resultados -->
          <div class="max-h-[52vh] overflow-y-auto p-2">
            <div v-if="filtered.length === 0" class="px-3 py-10 text-center">
              <p class="text-sm text-muted-foreground">
                Nenhum resultado para “{{ query }}”
              </p>
            </div>

            <template v-for="group in grouped" :key="group.label">
              <p
                class="px-3 pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                {{ group.label }}
              </p>
              <button
                v-for="{ cmd, index } in group.items"
                :key="cmd.id"
                type="button"
                :class="[
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                  index === activeIndex
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted',
                ]"
                @click="select(cmd)"
                @mousemove="activeIndex = index"
              >
                <span
                  :class="[
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    index === activeIndex
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground',
                  ]"
                >
                  <Icon :name="cmd.icon" size="sm" />
                </span>
                <span class="flex-1 truncate text-sm font-medium">
                  {{ cmd.label }}
                </span>
                <Icon
                  v-if="index === activeIndex"
                  name="CornerDownLeft"
                  size="sm"
                  class="shrink-0 text-primary/70"
                />
              </button>
            </template>
          </div>

          <!-- Rodapé com atalhos -->
          <div
            class="flex items-center gap-4 border-t border-line-2 px-4 py-2.5 text-[11px] text-muted-foreground"
          >
            <span class="flex items-center gap-1">
              <Icon name="ArrowUp" size="xs" /><Icon name="ArrowDown" size="xs" />
              navegar
            </span>
            <span class="flex items-center gap-1">
              <Icon name="CornerDownLeft" size="xs" /> abrir
            </span>
            <span class="ml-auto flex items-center gap-1">
              <kbd class="rounded border border-line-2 px-1 py-0.5 font-medium"
                >esc</kbd
              >
              fechar
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>
