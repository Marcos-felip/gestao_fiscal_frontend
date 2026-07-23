<template>
  <!-- Mobile drawer (teleport) -->
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop-fade">
      <div
        v-if="isOpen && isMobile"
        :class="[
          'sidebar-backdrop',
          'fixed inset-0 z-40 bg-black/20 lg:hidden',
        ]"
        @click="closeSidebar"
      />
    </Transition>

    <!-- Drawer (mobile) -->
    <Transition name="slide-right">
      <div
        v-if="isOpen && isMobile"
        :class="[
          'sidebar-drawer',
          'fixed left-0 top-0 bottom-0 z-50 w-68 lg:hidden flex flex-col border-r border-border bg-background',
        ]"
      >
        <SidebarHeader />
        <SidebarNav />
        <SidebarFooter />
      </div>
    </Transition>
  </Teleport>

  <!-- Desktop sidebar -->
  <aside
    v-if="!isMobile"
    :class="[
      'sidebar-desktop',
      'hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 w-64 z-30 border-r border-border bg-background',
    ]"
  >
    <SidebarHeader />
    <SidebarNav />
    <SidebarFooter />
  </aside>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useSidebar } from '@/composables'
import SidebarHeader from './sidebar-header.vue'
import SidebarNav from './sidebar-nav.vue'
import SidebarFooter from './sidebar-footer.vue'

const { isOpen, isMobile, close: closeSidebar } = useSidebar()

// Fechar sidebar quando breakpoint muda de mobile para desktop
watch(isMobile, (newVal) => {
  if (!newVal) {
    closeSidebar()
  }
})
</script>

<style scoped lang="css">
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 200ms ease-in-out;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 300ms ease-in-out;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(-100%);
}

.sidebar-drawer,
.sidebar-desktop {
  background-color: var(--color-background);
}
</style>
