# SidebarLink Component

Componente primitivo de link da sidebar com suporte a ícone, badge e estado ativo.

## Uso

```vue
<script setup lang="ts">
import { SidebarLink, Icon, Badge } from '@/shared/ui'
</script>

<template>
  <!-- Link simples -->
  <SidebarLink to="/dashboard" label="Dashboard">
    <template #icon>
      <Icon name="LayoutDashboard" size="sm" />
    </template>
  </SidebarLink>

  <!-- Com badge de notificação -->
  <SidebarLink to="/users" label="Usuários" :badge="3">
    <template #icon>
      <Icon name="Users" size="sm" />
    </template>
  </SidebarLink>

  <!-- Com conteúdo customizado -->
  <SidebarLink to="/settings" label="Configurações">
    <template #icon>
      <Icon name="Settings" size="sm" />
    </template>
    <template #badge>
      <span class="text-xs font-bold text-destructive">!</span>
    </template>
  </SidebarLink>
</template>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `to` | `string \| object` | — | **Obrigatório**. Rota de destino (RouterLink) |
| `label` | `string` | `''` | Texto do link |
| `badge` | `number \| undefined` | `undefined` | Número para exibir badge |

## Slots

| Slot | Descrição |
|------|-----------|
| `icon` | Ícone antes do texto (obrigatório) |
| `badge` | Badge customizado (opcional) |
| default | Conteúdo do link (sobrescreve label) |

## Exemplos

### Navegação Completa

```vue
<nav class="space-y-1">
  <SidebarLink to="/" label="Dashboard">
    <template #icon>
      <Icon name="LayoutDashboard" size="sm" />
    </template>
  </SidebarLink>

  <SidebarLink to="/users" label="Usuários" :badge="5">
    <template #icon>
      <Icon name="Users" size="sm" />
    </template>
  </SidebarLink>

  <SidebarLink to="/companies" label="Empresas">
    <template #icon>
      <Icon name="Building2" size="sm" />
    </template>
  </SidebarLink>
</nav>
```

---

**Versão**: 1.0
