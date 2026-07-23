# Badge Component

Componente primitivo para badges de notificação, contadores e indicadores de status.

## Uso

```vue
<script setup lang="ts">
import { Badge } from '@/shared/ui'
</script>

<template>
  <!-- Badge básico (padrão: vermelho) -->
  <Badge :count="5" />

  <!-- Com variante -->
  <Badge :count="3" variant="primary" />
  <Badge :count="2" variant="secondary" />
  <Badge :count="1" variant="destructive" />

  <!-- Overflow (acima de 99) -->
  <Badge :count="150" />  <!-- Mostra: 99+ -->
</template>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `count` | `number` | — | **Obrigatório**. Número a exibir (máx: 99) |
| `variant` | `'primary' \| 'secondary' \| 'destructive'` | `'primary'` | Cor do badge |

## Exemplos

### Em NavbarButton

```vue
<NavbarButton tooltip="Notificações">
  <Icon name="Bell" size="md" />
  <Badge :count="unreadCount" variant="destructive" class="absolute -top-2 -right-2" />
</NavbarButton>
```

### Em SidebarLink

```vue
<SidebarLink to="/users" label="Usuários">
  <template #icon>
    <Icon name="Users" />
  </template>
  <template #badge>
    <Badge :count="3" />
  </template>
</SidebarLink>
```

---

**Versão**: 1.0
