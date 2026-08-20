<template>
  <div class="app-layout min-h-screen bg-background">
    <!-- Navbar -->
    <Navbar />

    <div class="flex flex-1">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main content -->
      <main
        :class="[
          'main-content',
          'flex min-h-svh flex-1 flex-col pt-[80px] lg:ml-64',
        ]"
      >
        <div class="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <RouterView :key="`${route.path}#${refreshKey}`" />
        </div>
        <AppFooter />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { useViewRefresh } from '@/shared/composables/useViewRefresh'
import Navbar from '@/shared/components/navbar/navbar.vue'
import Sidebar from '@/shared/components/sidebar/sidebar.vue'
import AppFooter from '@/shared/components/layouts/app-footer.vue'

const route = useRoute()
const { refreshKey } = useViewRefresh()
</script>

<style scoped lang="css">
.app-layout {
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  color: var(--color-foreground);
}

.main-content {
  flex: 1;
}

/* Responsividade */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding-top: 5rem; /* altura do navbar (breadcrumb + abas) */
  }
}
</style>
