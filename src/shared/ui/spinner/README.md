# Spinner Component

Componente primitivo de carregamento (loading spinner) com animação rotativa contínua.

## Uso

```vue
<script setup lang="ts">
import { Spinner } from '@/shared/ui'
</script>

<template>
  <!-- Spinner básico -->
  <Spinner />

  <!-- Em um Button loading -->
  <Button :loading="true">Salvando...</Button>

  <!-- Com classe customizada -->
  <Spinner class="text-primary" />
</template>
```

## Props

Nenhuma prop obrigatória. Herda cor via `currentColor` (Tailwind).

## Exemplos

### Estado de Carregamento

```vue
<template>
  <div v-if="isLoading" class="flex items-center gap-2">
    <Spinner />
    <span>Carregando dados...</span>
  </div>
</template>
```

### Com Cores

```vue
<template>
  <Spinner class="text-primary" />      <!-- Azul -->
  <Spinner class="text-green-500" />    <!-- Verde -->
  <Spinner class="text-destructive" />  <!-- Vermelho -->
</template>
```

---

**Versão**: 1.0
