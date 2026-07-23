<template>
  <nav
    :class="[
      'navbar',
      'fixed top-0 left-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:left-64 lg:w-[calc(100%-16rem)]',
    ]"
  >
    <div class="mx-auto w-full max-w-full px-4 sm:px-4 lg:px-4">
      <div class="flex h-14 items-center">
        <!-- Sidebar toggle (mobile) -->
        <div class="flex items-center gap-4 flex-shrink-0">
          <!-- Sidebar toggle button (mobile) -->
          <NavbarButton class="lg:hidden" tooltip="Menu" @click="toggleSidebar">
            <Icon name="Menu" size="md" />
          </NavbarButton>
        </div>

        <!-- Search (desktop) -->
        <NavbarSearch />

        <!-- Actions (notifications, account, etc) -->
        <div class="ml-auto">
          <NavbarActions />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { NavbarButton, Icon } from '@/shared/ui'
import { useSidebar } from '@/shared/composables'
import NavbarSearch from './navbar-search.vue'
import NavbarActions from './navbar-actions.vue'

const { toggle: toggleSidebar } = useSidebar()
</script>

<style scoped lang="css">
.navbar {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}
</style>
