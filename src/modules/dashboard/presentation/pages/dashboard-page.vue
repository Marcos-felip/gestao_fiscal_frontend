<script setup lang="ts">
import DashboardGreeting from '@/modules/dashboard/presentation/components/dashboard-greeting.vue'
import DashboardStats from '@/modules/dashboard/presentation/components/dashboard-stats.vue'
import DashboardEmptyState from '@/modules/dashboard/presentation/components/dashboard-empty-state.vue'
</script>

<template>
  <div class="space-y-8">
    <DashboardGreeting />
    <DashboardStats />
    <DashboardEmptyState />
  </div>
</template>
