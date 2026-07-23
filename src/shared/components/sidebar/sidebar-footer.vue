<template>
  <div :class="['sidebar-footer', 'block border-t border-border px-4 py-2']">
    <ProjectDropdown />
  </div>
</template>

<script setup lang="ts">
import ProjectDropdown from './project-dropdown.vue'
</script>

<style scoped lang="css">
.sidebar-footer {
  background-color: var(--color-background);
}
</style>
