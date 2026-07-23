# SearchInput Component

Componente primitivo de input de busca com ícone integrado e eventos de submit/cancel.

## Uso

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SearchInput } from '@/shared/ui'

const searchQuery = ref('')
</script>

<template>
  <!-- Input básico -->
  <SearchInput v-model="searchQuery" />

  <!-- Com placeholder customizado -->
  <SearchInput
    v-model="searchQuery"
    placeholder="Buscar usuários..."
  />

  <!-- Com eventos -->
  <SearchInput
    v-model="searchQuery"
    @submit="handleSearch"
    @cancel="searchQuery = ''"
  />

  <!-- Desabilitado -->
  <SearchInput v-model="searchQuery" disabled />
</template>

<script setup lang="ts">
const handleSearch = () => {
  console.log('Buscar:', searchQuery.value)
}
</script>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `modelValue` | `string` | `''` | Valor do input (v-model) |
| `placeholder` | `string` | `'Buscar...'` | Texto placeholder |
| `disabled` | `boolean` | `false` | Input desabilitado |

## Events

| Event | Descrição |
|-------|-----------|
| `update:modelValue` | Emitido ao digitar |
| `submit` | Emitido ao apertar Enter |
| `cancel` | Emitido ao apertar Escape |

## Slots

| Slot | Descrição |
|------|-----------|
| `icon` | Ícone customizado (padrão: lupa) |

## Exemplos

### Na Navbar

```vue
<NavbarSearch>
  <SearchInput
    v-model="searchQuery"
    placeholder="Buscar empresas, produtos..."
    @submit="navigateToResults"
  />
</NavbarSearch>
```

### Com Ícone Customizado

```vue
<SearchInput v-model="query">
  <template #icon>
    <Icon name="Zap" size="sm" class="text-warning" />
  </template>
</SearchInput>
```

---

**Versão**: 1.0
