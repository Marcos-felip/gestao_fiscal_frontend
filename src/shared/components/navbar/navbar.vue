<template>
  <nav
    class="navbar fixed top-0 left-0 z-40 w-full lg:left-64 lg:w-[calc(100%-16rem)]"
  >
    <!-- Linha 1: menu (mobile) + breadcrumb + ações -->
    <div class="flex h-11 items-center gap-3 px-4">
      <NavbarButton
        class="lg:hidden"
        tone="light"
        tooltip="Menu"
        @click="toggleSidebar"
      >
        <Icon name="Menu" size="md" />
      </NavbarButton>

      <NavbarBreadcrumb class="min-w-0 flex-1" />

      <div class="flex-shrink-0">
        <NavbarActions />
      </div>
    </div>

    <!-- Linha 2: abas de páginas abertas -->
    <NavbarTabs />
  </nav>
</template>

<script setup lang="ts">
import { NavbarButton, Icon } from '@/shared/ui'
import { useSidebar } from '@/shared/composables'
import NavbarBreadcrumb from './navbar-breadcrumb.vue'
import NavbarTabs from './navbar-tabs.vue'
import NavbarActions from './navbar-actions.vue'

const { toggle: toggleSidebar } = useSidebar()
</script>

<style scoped lang="css">
.navbar {
  background:
    radial-gradient(
      120% 140% at 0% 0%,
      var(--color-primary-700),
      transparent 55%
    ),
    linear-gradient(
      120deg,
      var(--color-primary-900),
      var(--color-primary-950) 60%,
      var(--color-secondary-950)
    );
}
</style>
