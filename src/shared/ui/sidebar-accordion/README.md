# SidebarAccordion Component

Componente primitivo para itens accordion da sidebar com suporte a ícone, chevron animado e slots para items filhos.

## Uso

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SidebarAccordion, SidebarLink, Icon } from '@/shared/ui'

const usersExpanded = ref(true)
</script>

<template>
  <!-- Accordion simples -->
  <SidebarAccordion
    label="Usuários"
    v-model="usersExpanded"
  >
    <template #icon>
      <Icon name="Users" size="sm" />
    </template>

    <SidebarLink to="/users" label="Listar usuários" />
    <SidebarLink to="/users/create" label="Criar usuário" />
  </SidebarAccordion>

  <!-- Com badge -->
  <SidebarAccordion label="Empresas">
    <template #icon>
      <Icon name="Building2" size="sm" />
    </template>

    <SidebarLink to="/companies" label="Listar" />
    <SidebarLink to="/companies/create" label="Criar" :badge="2" />
  </SidebarAccordion>
</template>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `label` | `string` | — | **Obrigatório**. Texto do accordion |
| `modelValue` | `boolean` | `false` | Estado aberto/fechado (v-model) |

## Events

| Event | Descrição |
|-------|-----------|
| `update:modelValue` | Emitido ao abrir/fechar |

## Slots

| Slot | Descrição |
|------|-----------|
| `icon` | Ícone antes do label |
| default | Items filhos (SidebarLink) |

## Exemplos

### Estrutura Hierárquica

```vue
<template>
  <nav class="space-y-1">
    <SidebarAccordion label="Gestão">
      <template #icon>
        <Icon name="Settings" size="sm" />
      </template>

      <SidebarAccordion label="Usuários" class="ml-4">
        <template #icon>
          <Icon name="Users" size="sm" />
        </template>
        <SidebarLink to="/users" label="Listar" />
        <SidebarLink to="/users/roles" label="Funções" />
      </SidebarAccordion>

      <SidebarAccordion label="Empresas" class="ml-4">
        <template #icon>
          <Icon name="Building2" size="sm" />
        </template>
        <SidebarLink to="/companies" label="Listar" />
      </SidebarAccordion>
    </SidebarAccordion>
  </nav>
</template>
```

## CSS Classes

- `.accordion-trigger` — Botão que abre/fecha
- `.accordion-content` — Container dos items filhos
- `.chevron` — Ícone que rotaciona ao abrir/fechar

---

**Versão**: 1.0
