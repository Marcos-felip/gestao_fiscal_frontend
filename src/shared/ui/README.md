# Design System — UI Components

Este diretório contém **wrappers customizados** dos componentes Preline com animações, estados interativos e máxima flexibilidade.

## 🎯 Princípios

### 1. Wrapper Leve
### 1️⃣ **Button**
- Não duplica markup — apenas estende com props, slots e animações
- **Atualizações do Preline**: aplicadas automaticamente sem quebrar nossos wrappers

  <Button
  </Button>
  <Button variant="destructive">
  </Button>
  <Button variant="ghost">
  </Button>
- Todos os componentes usam **slots** para máxima flexibilidade
- Props para variantes e states comuns
import { Button } from '@/shared/ui'

### 2️⃣ **Input**

## 📦 Componentes

    <Input
    </Input>
    <Input
    </Input>
    <Button type="submit" variant="primary" class="mt-6">
    </Button>
variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'  // default: 'primary'
size?: 'sm' | 'md' | 'lg'                                     // default: 'md'
import { Input, Button } from '@/shared/ui'
loading?: boolean                                             // default: false
### 3️⃣ **Card**
```

#### Slots
  <Card>
  </Card>
      <Button variant="ghost" size="sm">
      </Button>
  </Card>
  <Card variant="elevated" padding="lg">
  </Card>
@click: MouseEvent
```
import { Card, Button } from '@/shared/ui'
#### Exemplo
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
    Login
  </ButtonUi>

  <!-- Variante destruir -->
  <ButtonUi variant="destructive">
    Delete
  </ButtonUi>

  <!-- Ghost (transparent) -->
  <ButtonUi variant="ghost">
    Cancel
  </ButtonUi>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ButtonUi } from '@/shared/components/ui'
import { LogIn } from 'lucide-vue-next'

const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  await loginUser()
  isLoading.value = false
}
</script>
```

---

### 2️⃣ **InputUi**

Input com validação, hint, label e animações de erro.

#### Props
```typescript
modelValue: string                                   // v-model binding
type?: 'text' | 'email' | 'password' | ...         // default: 'text'
placeholder?: string                                 // default: ''
disabled?: boolean                                   // default: false
error?: string                                       // mensagem de erro (exibe em vermelho)
hint?: string                                        // dica/help text
```

#### Slots
```typescript
label?: VNode  // Label customizado (opcional)
```

#### Emits
```typescript
@update:modelValue: string
@blur: FocusEvent
@focus: FocusEvent
```

#### Exemplo
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Email input com error -->
    <InputUi
      v-model="email"
      type="email"
      placeholder="you@example.com"
      :error="emailError"
      @blur="validateEmail"
    >
      <template #label>Email Address</template>
    </InputUi>

    <!-- Password input com hint -->
    <InputUi
      v-model="password"
      type="password"
      placeholder="••••••••"
      hint="Mínimo 8 caracteres"
    >
      <template #label>Password</template>
    </InputUi>

    <ButtonUi type="submit" variant="primary" class="mt-6">
      Register
    </ButtonUi>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InputUi, ButtonUi } from '@/shared/components/ui'

const email = ref('')
const password = ref('')
const emailError = ref('')

const validateEmail = () => {
  if (!email.value.includes('@')) {
    emailError.value = 'Email inválido'
  } else {
    emailError.value = ''
  }
}

const handleSubmit = () => {
  console.log({ email: email.value, password: password.value })
}
</script>
```

---

### 3️⃣ **CardUi**

Card container com header, content, footer e variantes.

#### Props
```typescript
variant?: 'default' | 'elevated'  // default: 'default'
padding?: 'sm' | 'md' | 'lg'      // default: 'md'
border?: boolean                   // default: true
```

#### Slots
```typescript
header?: VNode   // Seção de header (acima de divider)
default: VNode   // Conteúdo principal
footer?: VNode   // Seção de footer (abaixo de divider)
```

#### Exemplo
```vue
<template>
  <!-- Default card -->
  <CardUi>
    <template #header>
      <h3 class="text-lg font-semibold">Card Title</h3>
    </template>

    <p class="text-foreground/80">
      Card content Lorem ipsum dolor sit amet.
    </p>

    <template #footer>
      <ButtonUi variant="ghost" size="sm">
        Learn More
      </ButtonUi>
    </template>
  </CardUi>

  <!-- Elevated variant (with shadow + hover) -->
  <CardUi variant="elevated" padding="lg">
    <div class="flex gap-4">
      <div class="h-12 w-12 rounded bg-primary/10" />
      <div>
        <h4 class="font-semibold">Feature Card</h4>
        <p class="text-sm text-muted-foreground">
          Elevated cards are perfect for highlighting key content.
        </p>
      </div>
    </div>
  </CardUi>
</template>

<script setup lang="ts">
import { CardUi, ButtonUi } from '@/shared/components/ui'
</script>
```

---

## 🎨 Animações Incluídas

Todos os componentes incluem animações suaves via Tailwind Keyframes:

| Animação | Uso | Duração |
|----------|-----|---------|
| `entrance-fade` | Fade in ao aparecer | 300ms |
| `entrance-slide-up` | Slide up + fade ao aparecer | 300ms |
| `entrance-scale` | Scale + fade ao aparecer | 300ms |
| `shake` | Erro/input inválido | 400ms |
| `spin-slow` | Loading spinner | 2s |
| `pulse-gentle` | Hover/focus subtil | 2s |

### Usando Animações em Componentes Customizados

```vue
<template>
  <!-- Entrada suave -->
  <div class="animate-entrance-slide-up">
    Conteúdo com slide-up animation
  </div>

  <!-- Erro com shake -->
  <div class="animate-shake">
    Campo com erro
  </div>

  <!-- Spinner customizado -->
  <div class="animate-spin-slow">
    <Icon />
  </div>
</template>
```

---

## 🏗️ Como Estender (Adicionar Novos Componentes)

### Padrão a Seguir

```vue
<template>
  <div :class="['ui-component', variantClasses]">
    <!-- Slots para customização -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * YourComponentUi Component
 *
 * Descrição breve do que faz.
 *
 * Props:
 * - prop1: tipo — descrição
 *
 * Slots:
 * - default: conteúdo principal
 *
 * Example:
 * <YourComponentUi prop1="value">
 *   Content here
 * </YourComponentUi>
 */

interface Props {
  variant?: 'default' | 'custom'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variantClasses = computed(() => {
  const variants = {
    default: 'bg-card border border-card-line',
    custom: 'bg-surface border-2 border-line-2',
  }
  return variants[props.variant]
})
</script>

<style scoped>
/* Animações scoped que não conflitam */
.ui-component {
  @apply ui-transition;
}
</style>
```

### Checklist de Novo Componente

- [ ] Nome do arquivo: `component-name-ui.vue` (kebab-case)
- [ ] Props com tipos TypeScript
- [ ] Slots bem documentados
- [ ] Comentário JSDoc explicando uso
- [ ] Classe `.ui-transition` para transições suaves
- [ ] Variantes usando tokens Preline
- [ ] Exemplos de uso no comentário
- [ ] Exportar em `index.ts`
- [ ] Adicionar ao README com exemplo

---

## 🔧 Customização Avançada

### Usar CSS Variables do Preline

Todos os tokens Preline estão disponíveis como CSS variables:

```vue
<style scoped>
.my-custom-element {
  background-color: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--border-line-2);
  /* Automáticamente responde a mudanças de tema (light/dark) */
}
</style>
```

### Estender tailwind.config.ts

Novos keyframes, durations ou utilities podem ser adicionados a `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    animation: {
      'my-custom': 'my-custom-animation 500ms ease-out forwards',
    },
    keyframes: {
      'my-custom-animation': {
        'from': { opacity: '0', transform: 'scale(0.5)' },
        'to': { opacity: '1', transform: 'scale(1)' },
      },
    },
  },
},
```

---

## 📚 Recursos

- [Preline Documentation](https://preline.co/)
- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)
- [Vue SFC](https://vuejs.org/guide/scaling-up/sfc.html)

---

## ✅ Checklist de Uso

- [ ] Importar de `@/shared/components/ui`
- [ ] Usar props nomeadas para variantes (não classes diretas)
- [ ] Passar `v-model` para inputs bidirecionais
- [ ] Adicionar comentários JSDoc ao componente pai
- [ ] Testar dark mode (Preline automático)
- [ ] Validar accessibility (aria-labels em forms)

---

**Last Updated:** 16 de maio de 2026
