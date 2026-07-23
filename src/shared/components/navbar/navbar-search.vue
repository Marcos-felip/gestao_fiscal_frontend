<template>
  <div :class="['navbar-search', 'hidden md:flex md:flex-1 md:max-w-md']">
    <SearchInput
      v-model="searchQuery"
      placeholder="Pesquisar ou digite comando..."
      @submit="handleSearch"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { SearchInput } from '@/shared/ui'
import { useNavbar } from '@/shared/composables'

const { searchQuery } = useNavbar()

const handleSearch = () => {
  console.log('Search for:', searchQuery.value)
  // TODO: Implementar busca global
}

const handleCancel = () => {
  searchQuery.value = ''
}
</script>

<style scoped lang="css">
.navbar-search {
  flex-shrink: 1;
}
</style>
