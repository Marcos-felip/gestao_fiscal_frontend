# Switch Component

Componente de toggle (liga/desliga) reutilizável, compatível com os tokens do tema.

## Props

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `modelValue` | `boolean` | — | Estado atual do switch |
| `disabled` | `boolean` | `false` | Desabilita interação |
| `id` | `string` | `undefined` | Atribui `id` ao input (opcional) |
| `ariaLabel` | `string` | `'Alternar'` | Label acessível para leitores de tela |
| `size` | `'sm' \| 'md'` | `'md'` | Tamanho do switch |

## Emits

- `update:modelValue (value: boolean)`

## Acessibilidade

- Usa `<input type="checkbox">` real (oculto via `sr-only`) com `aria-label`.
- Suporta navegação por teclado (Tab + Space) por padrão.

## Exemplos de Uso

### v-model

```vue
<template>
  <div class="flex items-center gap-3">
    <span class="text-sm">Tema escuro</span>
    <Switch v-model="enabled" aria-label="Alternar tema escuro" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@/shared/ui'

const enabled = ref(false)
</script>
```

### Com `disabled`

```vue
<Switch v-model="enabled" disabled aria-label="Alternar" />
```

## Tokens do tema utilizados

- `bg-muted`, `bg-primary`
- `border-border`, `bg-background`
