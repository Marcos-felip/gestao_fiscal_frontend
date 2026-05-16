<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'ui-button',
      // Estilos base
      'font-medium rounded-lg transition-all duration-300',
      'focus:ui-focus-ring active:scale-95',
      'disabled:ui-disabled',
      // Classes de tamanho
      sizeClasses,
      // Classes de variante
      variantClasses,
      // Estados
      loading && 'opacity-80',
    ]"
  >
    <!-- Spinner de carregamento -->
    <span v-if="loading" class="inline-block animate-spin mr-2">
      <svg
        class="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
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

/**
 * Componente ButtonUi
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
 * <ButtonUi variant="primary" size="md" @click="handleClick">
 *   <template #icon>
 *     <LogIn class="h-4 w-4" />
 *   </template>
 *   Login
 * </ButtonUi>
 */

interface Props {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})

/**
 * Calcula classes de tamanho baseadas na prop size
 */
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
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
      'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive-hover active:opacity-80',
    ghost:
      'bg-transparent text-foreground border border-line-2 hover:bg-muted active:bg-muted-active',
  }
  return variants[props.variant]
})
</script>

<style scoped>
/* Espaçamento do ícone */
:deep(.ui-button [class*='icon']) {
  @apply mr-2;
}

/* Animação de hover (levantamento sutil) */
.ui-button:not(:disabled) {
  @apply hover:shadow-md hover:scale-[1.02];
}

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
