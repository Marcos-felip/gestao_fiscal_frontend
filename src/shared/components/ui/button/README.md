# ButtonUi Component

Botão com múltiplas variantes, tamanhos, estado de carregamento e animações.

## Props

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'destructive' \| 'ghost'` | `'primary'` | Variante visual do botão |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho do botão |
| `disabled` | `boolean` | `false` | Desabilita o botão |
| `loading` | `boolean` | `false` | Mostra spinner de carregamento |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo do elemento button HTML |

## Slots

- **default**: Conteúdo/texto do botão
- **icon**: Ícone opcional antes do texto

## Emits

- **@click**: Evento de clique do botão

## Animações

- **Hover**: Levantamento sutil (scale-up) + sombra
- **Active**: Compressão visual (scale-95)
- **Loading**: Spinner rotativo contínuo
- **Disabled**: Redução de opacidade

## Exemplos de Uso

### Botão Primário com Ícone

```vue
<template>
  <ButtonUi
    variant="primary"
    size="md"
    :loading="isLoading"
    @click="handleLogin"
  >
    <template #icon>
      <LogIn class="h-4 w-4" />
    </template>
    Entrar
  </ButtonUi>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ButtonUi } from '@/shared/components/ui'
import { LogIn } from 'lucide-vue-next'

const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  try {
    await loginUser()
  } finally {
    isLoading.value = false
  }
}
</script>
```

### Botão Destrutivo

```vue
<ButtonUi variant="destructive">
  Deletar
</ButtonUi>
```

### Botão Ghost (Transparente)

```vue
<ButtonUi variant="ghost">
  Cancelar
</ButtonUi>
```

### Botão Secundário

```vue
<ButtonUi variant="secondary" size="lg">
  Ação Secundária
</ButtonUi>
```

### Botão Pequeno Desabilitado

```vue
<ButtonUi size="sm" disabled>
  Desabilitado
</ButtonUi>
```

## Variantes

- **primary**: Cor primária do tema, melhor para ações principais
- **secondary**: Cor secundária, para ações alternativas
- **destructive**: Cor vermelha, para ações destrutivas (deletar, remover)
- **ghost**: Transparente com borda, para ações menos importantes

## Tokens Preline Utilizados

- `bg-primary` / `bg-primary-hover` / `bg-primary-active`
- `bg-secondary` / `bg-secondary-hover` / `bg-secondary-active`
- `bg-destructive` / `bg-destructive-hover`
- `text-primary-foreground` / `text-secondary-foreground` / `text-destructive-foreground`
- `border-line-2`
- `bg-muted` / `bg-muted-active`
- `disabled:ui-disabled`
- `ui-focus-ring`
