<template>
  <div
    :class="[
      'sidebar-mobile-header',
      'lg:hidden px-4 py-3 border-b border-border',
    ]"
  >
    <ProjectDropdown />
  </div>
</template>

<script setup lang="ts">
import ProjectDropdown from './project-dropdown.vue'
</script>

<style scoped lang="css">
.sidebar-mobile-header {
  background-color: var(--color-background);
}
</style>
