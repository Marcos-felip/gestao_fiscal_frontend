# InputUi Component

Input com validação, mensagens de erro/dica e animações de estado.

## Props

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `modelValue` | `string` | — | Vinculação v-model para o valor do input |
| `type` | `string` | `'text'` | Tipo do input HTML (`'text'`, `'email'`, `'password'`, etc.) |
| `placeholder` | `string` | `''` | Texto de placeholder |
| `disabled` | `boolean` | `false` | Desabilita o input |
| `error` | `string` | `''` | Mensagem de erro (exibe em vermelho) |
| `hint` | `string` | `''` | Texto de dica (exibe em cor muted abaixo do input) |

## Slots

- **label**: Conteúdo de label opcional (renderizado antes do input)

## Emits

- **@update:modelValue**: Quando o valor do input muda
- **@blur**: Quando o input perde o foco
- **@focus**: Quando o input recebe o foco

## Animações

- **Error State**: Animação de tremida (shake) de 0.4s
- **Focus Ring**: Anel de foco com cor primária
- **Transition**: Transições suaves de cor e borda

## Exemplos de Uso

### Input de E-mail com Validação

```vue
<template>
  <InputUi
    v-model="email"
    type="email"
    placeholder="voce@exemplo.com"
    :error="emailError"
    @blur="validateEmail"
  >
    <template #label>Endereço de E-mail</template>
  </InputUi>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InputUi } from '@/shared/components/ui'

const email = ref('')
const emailError = ref('')

const validateEmail = () => {
  if (!email.value.includes('@')) {
    emailError.value = 'E-mail inválido'
  } else {
    emailError.value = ''
  }
}
</script>
```

### Input de Senha com Dica

```vue
<InputUi
  v-model="password"
  type="password"
  placeholder="Digite sua senha"
  hint="Mínimo 8 caracteres"
>
  <template #label>Senha</template>
</InputUi>
```

### Input Desabilitado

```vue
<InputUi
  v-model="value"
  disabled
>
  <template #label>Campo Desabilitado</template>
</InputUi>
```

### Input com Erro em Tempo Real

```vue
<template>
  <InputUi
    v-model="username"
    placeholder="Nome de usuário"
    :error="usernameError"
    @blur="checkUsername"
  >
    <template #label>Nome de Usuário</template>
  </InputUi>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { InputUi } from '@/shared/components/ui'

const username = ref('')
const usernameError = ref('')

watch(username, (value) => {
  if (value.length < 3) {
    usernameError.value = 'Mínimo 3 caracteres'
  } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    usernameError.value = 'Apenas letras, números e underscore'
  } else {
    usernameError.value = ''
  }
})

const checkUsername = async () => {
  // Verificação de disponibilidade
}
</script>
```

### Input de Texto Simples

```vue
<InputUi
  v-model="name"
  type="text"
  placeholder="Digite seu nome completo"
>
  <template #label>Nome Completo</template>
</InputUi>
```

## Estados

- **Normal**: Borda cinza clara, fundo padrão
- **Focus**: Borda primária com anel de foco
- **Error**: Borda vermelha (destructive), animação de tremida
- **Disabled**: Opacidade reduzida, cursor not-allowed
- **Hint Visible**: Texto em cor muted abaixo do input

## Tokens Preline Utilizados

- `bg-background` / `text-foreground`
- `border-line-2`
- `border-primary` / `border-destructive`
- `focus:ring-primary/20` / `focus:ring-destructive/20`
- `bg-muted` / `text-muted-foreground`
- `ui-transition`

## Notas de Implementação

- O input usa `v-model` para vinculação bidirecional
- A animação de erro (shake) é acionada quando a prop `error` é definida
- O hint pode ser usado para instruções ou conselhos
- Suporta todos os tipos de input HTML padrão
