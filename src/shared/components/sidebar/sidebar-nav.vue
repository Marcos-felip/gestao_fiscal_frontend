<template>
  <nav :class="['sidebar-nav', 'flex-1 overflow-y-auto px-4 py-4 space-y-1']">
    <!-- Simple links -->
    <SidebarLink to="/" label="Dashboard">
      <template #icon>
        <Icon name="LayoutDashboard" size="md" />
      </template>
    </SidebarLink>

    <SidebarLink to="/users" label="Usuários">
      <template #icon>
        <Icon name="Users" size="md" />
      </template>
    </SidebarLink>

    <!-- Produtos -->
    <SidebarLink to="/products" label="Produtos">
      <template #icon>
        <Icon name="Package" size="md" />
      </template>
    </SidebarLink>

    <!-- Parceiros -->
    <SidebarLink to="/partners" label="Parceiros">
      <template #icon>
        <Icon name="Users" size="md" />
      </template>
    </SidebarLink>

    <!-- Estoque -->
    <SidebarLink to="/stock" label="Estoque">
      <template #icon>
        <Icon name="Layers" size="md" />
      </template>
    </SidebarLink>

    <!-- Compras -->
    <SidebarLink to="/purchases" label="Compras">
      <template #icon>
        <Icon name="ShoppingCart" size="md" />
      </template>
    </SidebarLink>

    <!-- Empresa -->
    <SidebarLink to="/companies" label="Empresa">
      <template #icon>
        <Icon name="Building" size="md" />
      </template>
    </SidebarLink>

    <!-- Membros removido -->
  </nav>
</template>

<script setup lang="ts">
import { /* ref */ } from 'vue'
import { SidebarLink, Icon } from '@/shared/ui'
</script>

<style scoped lang="css">
.sidebar-nav {
  background-color: var(--color-background);
}
</style>
