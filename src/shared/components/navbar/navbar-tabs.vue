<template>
  <div class="navbar-tabs flex h-9 items-stretch gap-1 overflow-x-auto px-3">
    <button
      v-for="tab in tabs"
      :key="tab.path"
      type="button"
      :class="[
        'group flex items-center gap-1.5 rounded-t-lg px-3 text-xs whitespace-nowrap transition-colors',
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
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@/shared/ui'
import { useTabs, type AppTab } from '@/shared/composables'

const route = useRoute()
const router = useRouter()
const { tabs, openFromRoute, closeTab } = useTabs()

// Abre/foca a aba a cada navegação.
watch(() => route.fullPath, () => openFromRoute(route), { immediate: true })

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
.navbar-tabs {
  scrollbar-width: none;
}
.navbar-tabs::-webkit-scrollbar {
  display: none;
}
</style>
