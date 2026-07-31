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
        v-for="tab in tabs"
        :key="tab.path"
        type="button"
        :data-active="isActive(tab) || undefined"
        :class="[
          'group flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 text-xs whitespace-nowrap transition-colors',
          isActive(tab)
            ? 'bg-background font-medium text-foreground'
            : 'text-white/70 hover:bg-white/10 hover:text-white',
        ]"
        @click="go(tab)"
      >
        <Icon :name="tab.icon" size="xs" />
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
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@/shared/ui'
import { useTabs, type AppTab } from '@/shared/composables'

const route = useRoute()
const router = useRouter()
const { tabs, openFromRoute, closeTab } = useTabs()

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

function isActive(tab: AppTab): boolean {
  if (route.path === tab.path) return true
  // Rotas aninhadas (ex.: /establishments/new) mantêm a aba do pai ativa.
  return tab.path !== '/' && route.path.startsWith(`${tab.path}/`)
}

function go(tab: AppTab): void {
  if (route.path !== tab.path) router.push(tab.path)
}

function close(tab: AppTab): void {
  const target = closeTab(tab.path)
  if (isActive(tab) && target) router.push(target)
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
