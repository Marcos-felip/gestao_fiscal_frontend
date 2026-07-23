# AvatarGroup Component

Componente primitivo para exibir um grupo de avatares com indicador de overflow ("+N").

## Uso

```vue
<script setup lang="ts">
import { AvatarGroup } from '@/shared/ui'

const avatars = [
  { name: 'João Silva', initials: 'JS', src: '/avatars/joao.jpg' },
  { name: 'Maria Santos', initials: 'MS' },
  { name: 'Pedro Costa', initials: 'PC' },
]
</script>

<template>
  <!-- Grupo básico (mostra 3 avatares, +N para o resto) -->
  <AvatarGroup :avatars="avatars" />

  <!-- Customizar máximo visível -->
  <AvatarGroup :avatars="avatars" :max-visible="2" />
</template>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `avatars` | `Avatar[]` | — | **Obrigatório**. Lista de avatares |
| `maxVisible` | `number` | `3` | Quantos avatares mostrar antes de "+N" |

## Avatar Interface

```typescript
interface Avatar {
  name: string          // Nome completo
  initials: string      // Letras iniciais (ex: "JS")
  src?: string         // URL da imagem (opcional)
}
```

## Exemplos

### Com Imagens

```vue
<template>
  <AvatarGroup
    :avatars="[
      { name: 'João', initials: 'J', src: '/img1.jpg' },
      { name: 'Maria', initials: 'M', src: '/img2.jpg' },
      { name: 'Pedro', initials: 'P', src: '/img3.jpg' },
    ]"
  />
</template>
```

### Sem Imagens (fallback com iniciais)

```vue
<template>
  <AvatarGroup
    :avatars="[
      { name: 'João Silva', initials: 'JS' },
      { name: 'Maria Santos', initials: 'MS' },
    ]"
  />
</template>
```

---

**Versão**: 1.0
