<template>
  <div
    :class="[
      'ui-card',
      // Estilos base do Preline
      'bg-card rounded-lg border transition-all duration-300',
      // Estilos de variante
      variantClasses,
      // Padding customizado
      paddingClasses,
      // Efeito de hover para variante elevated
      variant === 'elevated' && 'hover:shadow-lg hover:shadow-primary/10',
    ]"
  >
    <!-- Slot de header (opcional) -->
    <div
      v-if="$slots.header"
      class="border-card-divider px-6 py-4 border-b"
    >
      <slot name="header" />
    </div>

    <!-- Slot de conteúdo principal -->
    <div :class="['ui-card-content', $slots.header && 'pt-0']">
      <slot />
    </div>

    <!-- Slot de footer (opcional) -->
    <div
      v-if="$slots.footer"
      class="border-card-divider bg-muted/20 px-6 py-4 border-t mt-auto"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Componente CardUi
 *
 * Wrapper ao redor do componente de card do Preline com múltiplas variantes,
 * slots flexíveis de layout e animações suaves.
 *
 * Props:
 * - variant: 'default' (card branco/claro), 'elevated' (com sombra e efeito hover)
 * - padding: 'sm' (12px), 'md' (24px, padrão), 'lg' (32px)
 * - border: booleano - mostra borda (padrão: true)
 *
 * Slots:
 * - header: seção de header opcional (acima do divisor)
 * - default: área de conteúdo principal
 * - footer: seção de footer opcional (abaixo do divisor)
 *
 * Exemplo:
 * <CardUi variant="elevated" padding="md">
 *   <template #header>
 *     <h3 class="text-lg font-semibold">Título do Card</h3>
 *   </template>
 *
 *   <p>Conteúdo do card vai aqui</p>
 *
 *   <template #footer>
 *     <button>Ação</button>
 *   </template>
 * </CardUi>
 */

interface Props {
  variant?: 'default' | 'elevated'
  padding?: 'sm' | 'md' | 'lg'
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  border: true,
})

/**
 * Calcula classes de variante - controla background e sombra
 */
const variantClasses = computed(() => {
  const variants = {
    default: `border-card-line ${props.border ? '' : 'border-transparent'}`,
    elevated: `border-card-line shadow-md hover:shadow-xl ${
      props.border ? '' : 'border-transparent'
    }`,
  }
  return variants[props.variant]
})

/**
 * Calcula classes de padding para o conteúdo
 */
const paddingClasses = computed(() => {
  const paddings = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  }
  return paddings[props.padding]
})
</script>

<style scoped>
.ui-card {
  @apply flex flex-col;
  /* Animação de entrada - desliza para cima sutilmente */
  animation: entrance-slide-up 300ms ease-out;
}

.ui-card-content {
  @apply p-6 flex-1;
}

/* Transição suave para efeitos de hover */
.ui-card {
  @apply ui-transition;
}

/**
 * Animação de entrada: cards deslizam para cima levemente quando montados
 * Dá uma sensação de hierarquia e movimento
 */
@keyframes entrance-slide-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
