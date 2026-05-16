<template>
  <div class="ui-input-wrapper">
    <!-- Slot de label (opcional, antes do input) -->
    <label v-if="$slots.label" class="block text-sm font-medium text-foreground mb-2">
      <slot name="label" />
    </label>

    <!-- Container do input com animação de erro -->
    <div :class="['ui-input-container', error && 'shake-error']">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'ui-input',
          // Estilos base do Preline
          'w-full px-4 py-2.5 rounded-lg',
          'bg-background text-foreground',
          'border-2 border-line-2 transition-all duration-300',
          // Estado de foco com anel primário
          'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
          // Estado de erro - borda vermelha
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          // Estado desabilitado
          disabled && 'opacity-50 cursor-not-allowed bg-muted',
          // Estilo do placeholder
          'placeholder:text-muted-foreground',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />
    </div>

    <!-- Mensagem de dica ou erro (após input) -->
    <div v-if="hint || error" class="mt-2">
      <p
        :class="[
          'text-sm transition-colors duration-300',
          error ? 'text-destructive font-medium' : 'text-muted-foreground-1',
        ]"
      >
        {{ error || hint }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Componente InputUi
 *
 * Wrapper ao redor do input HTML com estilização do Preline, estados de validação
 * e funcionalidades de acessibilidade.
 *
 * Props:
 * - modelValue: vinculação v-model para valor do input
 * - type: tipo do input ('text', 'email', 'password', etc.)
 * - placeholder: texto de placeholder
 * - disabled: booleano - desabilita o input
 * - error: string - mensagem de erro (exibe em vermelho)
 * - hint: string - texto de dica (exibe abaixo do input em cor muted)
 *
 * Slots:
 * - label: conteúdo de label opcional (renderizado antes do input)
 *
 * Emits:
 * - update:modelValue: quando o valor do input muda
 * - blur: quando o input perde o foco
 * - focus: quando o input recebe o foco
 *
 * Exemplo:
 * <InputUi
 *   v-model="email"
 *   type="email"
 *   placeholder="voce@exemplo.com"
 *   :error="emailError"
 *   @blur="validateEmail"
 * >
 *   <template #label>Endereço de E-mail</template>
 * </InputUi>
 */

interface Props {
  modelValue: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
  (e: 'focus'): void
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: '',
  hint: '',
})

defineEmits<Emits>()
</script>

<style scoped>
/* Animação de tremida ao errar */
.shake-error {
  animation: shake-error 0.4s ease-in-out;
}

@keyframes shake-error {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-4px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(4px);
  }
}
</style>
