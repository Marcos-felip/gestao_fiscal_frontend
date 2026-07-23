<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DashboardGreeting from '@/modules/dashboard/presentation/components/dashboard-greeting.vue'
import DashboardStats from '@/modules/dashboard/presentation/components/dashboard-stats.vue'
import DashboardEmptyState from '@/modules/dashboard/presentation/components/dashboard-empty-state.vue'

// Simula o carregamento das métricas. Quando existir o endpoint real,
// troque o timer pela chamada ao repositório/use-case e mantenha o `loading`.
const loading = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  timer = setTimeout(() => {
    loading.value = false
  }, 700)
})

onBeforeUnmount(() => {
  if (timer !== null) clearTimeout(timer)
})
</script>

<template>
  <div class="space-y-8">
    <DashboardGreeting />
    <DashboardStats :loading="loading" />
    <DashboardEmptyState />
  </div>
</template>
