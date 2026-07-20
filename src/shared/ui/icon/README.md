# Icon Component

Wrapper central para ícones. Abstrai a biblioteca de ícones (hoje `lucide-vue-next`)
atrás de um registro por nome, para que **nenhum outro arquivo importe a lib direto**.

## Por que existe

- **Uma importação só**: consumidores usam `<Icon name="..." />`, sem importar `lucide-vue-next`.
- **Troca de biblioteca em um lugar**: para migrar de lib, basta remapear os componentes
  em `icons.ts`. Nenhum componente de feature precisa mudar.
- **Type-safe**: `name` é tipado pela união das chaves do registro — erro de compilação em nome inválido.

## Uso

```vue
<script setup lang="ts">
import { Icon } from '@/shared/ui'
</script>

<template>
  <Icon name="eye" class="h-4 w-4" />
  <Icon :name="showPassword ? 'eye-off' : 'eye'" class="h-4 w-4" />
</template>
```

## Props

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `name` | `IconName` | — | Nome do ícone registrado em `icons.ts` |
| `size` | `number` | lib (24) | Tamanho em px. Prefira classes Tailwind (`h-4 w-4`) para seguir o padrão do projeto |
| `strokeWidth` | `number` | lib (2) | Espessura do traço |

> Sizing e cor também funcionam via `class` (fallthrough): `class="h-4 w-4 text-primary"`.

## Adicionar um ícone

Editar apenas `src/shared/ui/icon/icons.ts`:

```ts
import { Eye, EyeOff, LogIn, MoreVertical, X, Search } from 'lucide-vue-next'

export const icons = {
  eye: Eye,
  'eye-off': EyeOff,
  close: X,
  'log-in': LogIn,
  'more-vertical': MoreVertical,
  search: Search, // nova chave kebab-case semântica
} satisfies Record<string, Component>
```

O tipo `IconName` é atualizado automaticamente.
