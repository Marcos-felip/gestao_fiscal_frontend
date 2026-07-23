# Dropdown Component

Componente primitivo de dropdown genérico com Teleport para renderizar fora do container pai e suporte a click-outside.

## Uso

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Dropdown, NavbarButton, Icon } from '@/shared/ui'

const isOpen = ref(false)
</script>

<template>
  <Dropdown v-model="isOpen">
    <!-- Trigger (slot padrão) -->
    <template #trigger="{ open }">
      <NavbarButton @click="open">
        <Icon name="Menu" />
      </NavbarButton>
    </template>

    <!-- Content (slot padrão) -->
    <div class="p-4">
      <a href="#" class="block py-2">Item 1</a>
      <a href="#" class="block py-2">Item 2</a>
      <a href="#" class="block py-2">Item 3</a>
    </div>
  </Dropdown>
</template>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `modelValue` | `boolean` | `false` | Estado aberto/fechado (v-model) |
| `align` | `'left' \| 'right'` | `'right'` | Alinhamento horizontal |
| `closeOnClickOutside` | `boolean` | `true` | Fechar ao clicar fora |

## Events

| Event | Descrição |
|-------|-----------|
| `update:modelValue` | Emitido ao abrir/fechar |

## Slots

| Slot | Descrição | Scope |
|------|-----------|-------|
| `trigger` | Botão que abre dropdown | `{ open: () => void }` |
| default | Conteúdo do dropdown | `{ close: () => void }` |

## Exemplos

### Menu de Notificações

```vue
<Dropdown v-model="showNotifications">
  <template #trigger>
    <NavbarButton @click="showNotifications = true">
      <Icon name="Bell" />
    </NavbarButton>
  </template>

  <div class="w-80">
    <div class="p-4 border-b">
      <h3 class="font-semibold">Notificações</h3>
    </div>
    <div class="max-h-96 overflow-y-auto">
      <!-- Items -->
    </div>
  </div>
</Dropdown>
```

### Menu de Conta

```vue
<Dropdown v-model="showAccountMenu" align="right">
  <template #trigger="{ open }">
    <button @click="open" class="flex items-center gap-2">
      <img :src="userAvatar" class="h-8 w-8 rounded-full" />
    </button>
  </template>

  <div class="w-56">
    <RouterLink to="/account/settings" class="block px-4 py-2">
      Configurações
    </RouterLink>
    <button @click="logout" class="w-full text-left px-4 py-2 text-destructive">
      Sair
    </button>
  </div>
</Dropdown>
```

---

**Versão**: 1.0
