# NavbarButton Component

Botão primitivo otimizado para navbar com suporte a tooltip, ícone e estados hover.

## Uso

```vue
<script setup lang="ts">
import { NavbarButton, Icon } from '@/shared/ui'
</script>

<template>
  <!-- Botão simples com tooltip -->
  <NavbarButton tooltip="Configurações">
    <Icon name="Settings" size="md" />
  </NavbarButton>

  <!-- Com ícone e badge -->
  <NavbarButton tooltip="Notificações" @click="openNotifications">
    <Icon name="Bell" size="md" />
    <Badge :count="5" variant="destructive" />
  </NavbarButton>

  <!-- Desabilitado -->
  <NavbarButton disabled tooltip="Desabilitado">
    <Icon name="Lock" size="md" />
  </NavbarButton>
</template>

<script setup lang="ts">
const openNotifications = () => {
  console.log('Abrir notificações')
}
</script>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo do botão HTML |
| `disabled` | `boolean` | `false` | Estado desabilitado |
| `tooltip` | `string` | `''` | Texto do tooltip ao hover |
| `className` | `string` | `''` | Classes CSS adicionais |

## Slots

| Slot | Descrição |
|------|-----------|
| default | Ícone ou conteúdo |

## Exemplos

### Com Dropdown

```vue
<NavbarButton @click="toggleDropdown" tooltip="Menu">
  <Icon name="Menu" size="md" />
</NavbarButton>
<Dropdown v-model="isDropdownOpen">
  <!-- Menu items -->
</Dropdown>
```

### Group de Botões

```vue
<div class="flex items-center gap-1">
  <NavbarButton tooltip="Buscar">
    <Icon name="Search" />
  </NavbarButton>
  <NavbarButton tooltip="Atividades">
    <Icon name="Activity" />
  </NavbarButton>
  <NavbarButton tooltip="Idioma">
    <Icon name="Globe" />
  </NavbarButton>
</div>
```

---

**Versão**: 1.0
