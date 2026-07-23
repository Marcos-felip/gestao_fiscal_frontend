<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'ui-button',
      // Estilos base
      'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      // Classes de tamanho
      sizeClasses,
      // Classes de variante
      variantClasses,
      // Largura total
      fullWidth && 'w-full',
      // Classe de texto customizada
      textClass,
      // Estados
      loading && 'opacity-80',
    ]"
  >
    <!-- Spinner de carregamento -->
    <span v-if="loading" class="mr-2">
      <Spinner />
    </span>

    <!-- Slot de ícone (opcional, antes do texto) -->
    <span v-if="$slots.icon" class="inline-flex items-center">
      <slot name="icon" />
    </span>

    <!-- Conteúdo do botão -->
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Spinner } from '@/shared/ui'

/**
 * Componente Button
 *
 * Wrapper ao redor do componente de botão do Preline com props estendidas,
 * animações e opções de customização.
 *
 * Props:
 * - variant: 'primary' (padrão), 'secondary', 'destructive', 'ghost'
 * - size: 'sm' (pequeno), 'md' (médio, padrão), 'lg' (grande)
 * - disabled: booleano - desabilita o botão
 * - loading: booleano - mostra spinner de carregamento
 * - type: 'button' (padrão), 'submit', 'reset'
 *
 * Slots:
 * - default: conteúdo/texto do botão
 * - icon: ícone opcional antes do texto
 *
 * Exemplo:
 * <Button variant="primary" size="md" @click="handleClick">
 *   <template #icon>
 *     <LogIn class="h-4 w-4" />
 *   </template>
 *   Login
 * </Button>
 */

interface Props {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  textClass?: string
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  textClass: '',
  fullWidth: false,
})

/**
 * Calcula classes de tamanho baseadas na prop size
 */
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-9 px-3',
    md: 'h-10 px-4',
    lg: 'h-11 px-5 text-base',
  }
  return sizes[props.size]
})

/**
 * Calcula classes de variante baseadas na prop variant
 * Todas as variantes usam tokens semânticos do Preline
 */
const variantClasses = computed(() => {
  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary-700',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary-700',
    destructive:
      'bg-destructive text-destructive-foreground hover:opacity-90',
    ghost:
      'bg-background-1 text-foreground border border-line-2 hover:bg-background-2',
  }
  return variants[props.variant]
})
</script>

<style scoped>
/* Animação do estado de carregamento */
.ui-spinner {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
