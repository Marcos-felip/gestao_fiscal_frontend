<template>
  <div class="app-layout min-h-screen bg-background">
    <!-- Navbar -->
    <Navbar />

    <div class="flex flex-1">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main content -->
      <main :class="['main-content', 'flex-1 pt-16 lg:ml-64']">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/shared/components/navbar/navbar.vue'
import Sidebar from '@/shared/components/sidebar/sidebar.vue'
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
    padding-top: 4rem; /* height navbar */
  }
}
</style>
