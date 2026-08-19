<template>
  <div class="navbar-tabs flex h-9 items-stretch">
    <!-- Seta esquerda (só quando há transbordo) -->
    <button
      v-show="overflowing"
      type="button"
      class="flex items-center px-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
      :disabled="!canScrollLeft"
      aria-label="Abas anteriores"
      @click="scrollByDir(-1)"
    >
      <Icon name="ChevronLeft" size="sm" />
    </button>

    <!-- Trilho rolável -->
    <div
      ref="strip"
      class="tab-strip flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto px-3"
      @scroll="updateEdges"
    >
      <button
        v-for="tab in tabsOrdenadas"
        :key="tab.id"
        type="button"
        :data-active="isActive(tab) || undefined"
        :class="[
          'group flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 text-xs whitespace-nowrap transition-colors',
          isActive(tab)
            ? 'bg-background font-medium text-foreground'
            : 'text-white/70 hover:bg-white/10 hover:text-white',
        ]"
        @click="go(tab)"
        @contextmenu.prevent="abrirMenu($event, tab)"
      >
        <Icon v-if="tab.pinned" name="Pin" size="xs" class="shrink-0" />
        <Icon v-else :name="tab.icon" size="xs" />

        <span class="max-w-[150px] truncate">{{ tab.label }}</span>

        <span
          v-if="tab.closable"
          role="button"
          :aria-label="`Fechar ${tab.label}`"
          :class="[
            'ml-1 inline-flex rounded p-0.5 transition-colors',
            isActive(tab) ? 'hover:bg-muted' : 'hover:bg-white/20',
          ]"
          @click.stop="close(tab)"
        >
          <Icon name="X" size="xs" />
        </span>
      </button>
    </div>

    <!-- Seta direita (só quando há transbordo) -->
    <button
      v-show="overflowing"
      type="button"
      class="flex items-center px-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
      :disabled="!canScrollRight"
      aria-label="Próximas abas"
      @click="scrollByDir(1)"
    >
      <Icon name="ChevronRight" size="sm" />
    </button>

    <!--
      Sempre montado, aberto por prop: com `v-if` aqui o componente desmontaria
      junto com o `AnimatePresence` dele, e a animação de saída nunca rodaria.
    -->
    <TabContextMenu
      :aberto="menu !== null"
      :x="menu?.x ?? 0"
      :y="menu?.y ?? 0"
      :actions="menuActions"
      :contexto="menu?.tab.label"
      @select="executarAcao"
      @close="menu = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@/shared/ui'
import { useTabs, type AppTab } from '@/shared/composables'
import { useFavorites } from '@/shared/composables/useFavorites'
import { useViewRefresh } from '@/shared/composables/useViewRefresh'
import TabContextMenu, {
  type TabMenuAction,
} from '@/shared/components/navbar/tab-context-menu.vue'

const route = useRoute()
const router = useRouter()
const {
  tabs,
  openFromRoute,
  closeTab,
  closeOthers,
  closeAll,
  togglePin,
  ordenar,
  tabIdOf,
} = useTabs()
const { isFavorite, toggleFavorite } = useFavorites()
const { refreshView } = useViewRefresh()

const tabsOrdenadas = computed(() => ordenar(tabs.value))

const strip = ref<HTMLElement | null>(null)
const overflowing = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
let resizeObserver: ResizeObserver | null = null

/** Recalcula transbordo e limites com base na posição do scroll. */
function updateEdges(): void {
  const el = strip.value
  if (!el) return
  const maxScroll = el.scrollWidth - el.clientWidth
  overflowing.value = maxScroll > 1
  canScrollLeft.value = el.scrollLeft > 1
  canScrollRight.value = el.scrollLeft < maxScroll - 1
}

/** Rola ~60% da largura visível para o lado indicado. */
function scrollByDir(direction: 1 | -1): void {
  const el = strip.value
  if (!el) return
  el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: 'smooth' })
}

/** Traz a aba ativa para dentro da área visível do trilho. */
function scrollActiveIntoView(): void {
  const active = strip.value?.querySelector<HTMLElement>('[data-active]')
  active?.scrollIntoView({
    behavior: 'smooth',
    inline: 'nearest',
    block: 'nearest',
  })
}

// Abre/foca a aba a cada navegação e reposiciona o trilho.
watch(
  () => route.fullPath,
  () => {
    openFromRoute(route)
    nextTick(() => {
      updateEdges()
      scrollActiveIntoView()
    })
  },
  { immediate: true },
)

// Abrir/fechar abas muda a largura total do trilho.
watch(
  () => tabs.value.length,
  () => nextTick(updateEdges),
)

onMounted(() => {
  updateEdges()
  if (strip.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => updateEdges())
    resizeObserver.observe(strip.value)
  }
  window.addEventListener('resize', updateEdges)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateEdges)
})

/**
 * A aba ativa é a do assunto da rota atual.
 *
 * Antes isso era comparação de caminho, com um `startsWith` para as rotas
 * aninhadas — o que deixava duas abas acesas quando existiam a do pai e a do
 * filho. Com a identidade por assunto, só há uma aba para ficar acesa.
 */
function isActive(tab: AppTab): boolean {
  return tab.id === tabIdOf(route)
}

/** Volta para a aba na tela em que ela estava, não no começo do assunto. */
function go(tab: AppTab): void {
  if (route.path !== tab.path) router.push(tab.path)
}

function close(tab: AppTab): void {
  const target = closeTab(tab.id)
  if (isActive(tab) && target) router.push(target)
}

// ──────────────────────────────────────────────
// Menu de contexto
// ──────────────────────────────────────────────

const menu = ref<{ x: number; y: number; tab: AppTab } | null>(null)

function abrirMenu(event: MouseEvent, tab: AppTab): void {
  menu.value = { x: event.clientX, y: event.clientY, tab }
}

const menuActions = computed<TabMenuAction[]>(() => {
  const tab = menu.value?.tab
  if (!tab) return []

  const restantes = tabs.value.filter(
    (t) => t.closable && !t.pinned && t.id !== tab.id,
  ).length

  return [
    { id: 'atualizar', label: 'Atualizar', icon: 'RefreshCw' },
    {
      id: 'fixar',
      label: tab.pinned ? 'Desafixar' : 'Fixar',
      icon: 'Pin',
      disabled: !tab.closable,
    },
    {
      id: 'favoritar',
      label: isFavorite(tab.path) ? 'Remover dos favoritos' : 'Favoritar',
      icon: 'Star',
      disabled: !tab.closable,
    },
    {
      id: 'fechar',
      label: 'Fechar',
      icon: 'X',
      separado: true,
      destrutivo: true,
      disabled: !tab.closable,
    },
    {
      id: 'fechar-outras',
      label: 'Fechar outras',
      icon: 'CircleX',
      destrutivo: true,
      disabled: restantes === 0,
    },
    {
      id: 'fechar-todas',
      label: 'Fechar todas',
      icon: 'Ban',
      destrutivo: true,
      disabled: restantes === 0 && !tab.closable,
    },
  ]
})

function executarAcao(id: string): void {
  const tab = menu.value?.tab
  menu.value = null
  if (!tab) return

  switch (id) {
    case 'atualizar':
      if (!isActive(tab)) router.push(tab.path)
      refreshView()
      return

    case 'fixar':
      togglePin(tab.id)
      return

    case 'favoritar':
      toggleFavorite({ path: tab.path, label: tab.label, icon: tab.icon })
      return

    case 'fechar':
      close(tab)
      return

    case 'fechar-outras': {
      const destino = closeOthers(tab.id)
      if (destino && route.path !== destino) router.push(destino)
      return
    }

    case 'fechar-todas': {
      const destino = closeAll()
      if (destino && route.path !== destino) router.push(destino)
      return
    }
  }
}
</script>

<style scoped>
.tab-strip {
  scrollbar-width: none;
  scroll-behavior: smooth;
}
.tab-strip::-webkit-scrollbar {
  display: none;
}
</style>
