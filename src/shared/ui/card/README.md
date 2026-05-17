# Card Component

Card com múltiplas variantes, slots flexíveis de layout e animações de entrada suave.

## Props

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `variant` | `'default' \| 'elevated'` | `'default'` | Variante visual do card |
| `padding` | `'sm' \| 'md' \| 'lg'` | `'md'` | Espaçamento interno |
| `border` | `boolean` | `true` | Mostra borda ao redor |

## Slots

- **header**: Seção de cabeçalho opcional (acima do divisor)
- **default**: Área de conteúdo principal
- **footer**: Seção de rodapé opcional (abaixo do divisor)

## Variantes

| Variante | Descrição | Caso de Uso |
|---|---|---|
| `default` | Card simples com borda sutil | Conteúdo padrão, listagens |
| `elevated` | Card com sombra e efeito hover | Destaques, cards importantes |

## Espaçamento (Padding)

| Tamanho | Pixels | Caso de Uso |
|---|---|---|
| `sm` | 12px | Cards compactos, placeholders |
| `md` | 24px | Padrão para a maioria dos cards |
| `lg` | 32px | Cards destaque, conteúdo importante |

## Animações

- **Entrance**: Desliza para cima levemente ao montar (300ms)
- **Hover (elevated)**: Sombra e escala aumentam suavemente
- **Transition**: Transições suaves para todos os efeitos

## Exemplos de Uso

### Card Simplificado

```vue
<template>
  <Card>
    <h3 class="text-lg font-semibold mb-2">Título</h3>
    <p class="text-muted-foreground">
      Conteúdo do card aqui.
    </p>
  </Card>
</template>

<script setup lang="ts">
import { Card } from '@/shared/ui'
</script>
```

### Card com Header e Footer

```vue
<template>
  <Card variant="elevated" padding="md">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Título do Card</h3>
        <button class="text-muted-foreground hover:text-foreground">
          <MoreVertical class="h-4 w-4" />
        </button>
      </div>
    </template>

    <p class="text-foreground mb-4">
      Conteúdo principal do card.
    </p>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <Button variant="ghost">Cancelar</Button>
        <Button variant="primary">Salvar</Button>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card, Button } from '@/shared/ui'
import { MoreVertical } from 'lucide-vue-next'
</script>
```

### Card Compacto (sm)

```vue
<Card padding="sm">
  <p class="text-sm">
    Informação rápida ou placeholder.
  </p>
</Card>
```

### Card Espaçoso (lg)

```vue
<Card variant="elevated" padding="lg">
  <h2 class="text-2xl font-bold mb-4">Destaque</h2>
  <p class="text-lg text-muted-foreground mb-4">
    Este é um card importante com mais espaço.
  </p>
  <Button variant="primary">Ação Principal</Button>
</Card>
```

### Card Sem Borda

```vue
<Card :border="false" variant="elevated">
  <p>Card sem borda visual</p>
</Card>
```

### Listagem de Cards

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card
      v-for="item in items"
      :key="item.id"
      variant="default"
    >
      <template #header>
        <h4 class="font-semibold">{{ item.title }}</h4>
      </template>
      
      <p class="text-muted-foreground">{{ item.description }}</p>
      
      <template #footer>
        <Button variant="ghost" size="sm">
          Detalhes
        </Button>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card, Button } from '@/shared/ui'

const items = ref([
  { id: 1, title: 'Item 1', description: 'Descrição aqui' },
  { id: 2, title: 'Item 2', description: 'Descrição aqui' },
  { id: 3, title: 'Item 3', description: 'Descrição aqui' },
])
</script>
```

## Estrutura de Layout

```
┌─────────────────────────┐
│       Header (slot)     │  ← Opcional
├─────────────────────────┤
│                         │
│   Content (default slot)│  ← Obrigatório
│                         │
├─────────────────────────┤
│       Footer (slot)     │  ← Opcional
└─────────────────────────┘
```

## Estados de Hover

- **default**: Sem mudança visual no hover
- **elevated**: Sombra aumenta, escala cresce levemente

## Tokens Preline Utilizados

- `bg-card` / `text-foreground`
- `border-card-line` / `border-card-divider`
- `rounded-lg`
- `shadow-md` / `shadow-xl`
- `shadow-primary/10` (hover elevated)
- `bg-muted/20`
- `ui-transition`

## Notas de Implementação

- A animação de entrada (entrance-slide-up) aplica-se a todos os cards ao montar
- Divisores entre header/content/footer são renderizados apenas se os slots estão preenchidos
- O footer fica fixo no topo se houver espaço (flex-1 no content)
- Suporta nesting de componentes dentro (Button, Input, etc.)
