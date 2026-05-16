<script setup lang="ts">
import { ref } from 'vue'
import { Building2, Menu, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/modules/auth/presenter/stores/auth-store'
import { useRouter } from 'vue-router'
import { StorageService } from '@/core/utils/storage'

const sidebarOpen = ref(false)
const authStore = useAuthStore()
const router = useRouter()

async function handleLogout(): Promise<void> {
  authStore.clear()
  StorageService.clearAll()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background flex">
    <aside
      :class="[sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-sidebar-line transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto']"
    >
      <div class="flex items-center gap-2 p-4 border-b border-sidebar-divider">
        <Building2 class="h-6 w-6 text-primary" />
        <span class="text-lg font-semibold text-sidebar-nav-foreground">Gestão Fiscal</span>
      </div>
      <nav class="p-4">
        <ul class="space-y-1">
          <li>
            <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-nav-foreground hover:bg-sidebar-nav-hover transition-colors">
              Dashboard
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 border-b border-navbar-line bg-navbar flex items-center px-4 gap-4">
        <button
          class="lg:hidden p-2 rounded-lg text-navbar-nav-foreground hover:bg-navbar-nav-hover"
          @click="sidebarOpen = !sidebarOpen"
        >
          <Menu class="h-5 w-5" />
        </button>
        <div class="flex-1" />
        <div class="flex items-center gap-3">
          <span class="text-sm text-navbar-nav-foreground">{{ authStore.user?.name }}</span>
          <button
            class="p-2 rounded-lg text-navbar-nav-foreground hover:bg-navbar-nav-hover transition-colors"
            @click="handleLogout"
            title="Sair"
          >
            <LogOut class="h-5 w-5" />
          </button>
        </div>
      </header>

      <main class="flex-1 p-6 bg-background-1 overflow-auto">
        <slot />
      </main>
    </div>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-20 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>