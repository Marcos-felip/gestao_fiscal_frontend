<template>
  <div class="ui-input-wrapper" :class="attrs.class" :style="attrs.style">
    <!-- Slot de label (opcional, antes do input) -->
    <label
      v-if="$slots.label"
      class="block text-sm font-medium text-foreground mb-2"
    >
      <slot name="label" />
    </label>

    <!-- Container do input com animação de erro -->
    <div :class="['ui-input-container relative', error && 'shake-error']">
      <!-- Slot de prefixo (ícone à esquerda, opcional) -->
      <div
        v-if="$slots.prefix"
        class="absolute left-0 top-1/2 flex -translate-y-1/2 items-center ps-3 text-foreground/60"
      >
        <slot name="prefix" />
      </div>

      <input
        v-bind="inputAttrs"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        :aria-describedby="helperId"
        :class="[
          'ui-input',
          // Estilos base do Preline
          'py-2.5 sm:py-3 px-4 block w-full rounded-lg sm:text-sm',
          'bg-background-1 text-foreground',
          'border border-line-2 transition-colors duration-200',
          // Estado de foco com anel primário
          'focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none',
          // Estado de erro - borda vermelha
          error &&
            '!border-error-500 focus:!border-error-500 focus:!ring-error-500',
          success &&
            '!border-success-500 focus:!border-success-500 focus:!ring-success-500',
          // Estado desabilitado (prop ou <fieldset disabled> ancestral)
          disabled && 'opacity-50 cursor-not-allowed bg-background-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-background-2',
          // Estilo do placeholder
          'placeholder:text-foreground/70',
          $slots.prefix && 'ps-10',
          (error || success || $slots.suffix) && 'pe-10',
          inputClass,
        ]"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />

      <div
        v-if="error || success"
        class="absolute inset-y-0 right-0 flex items-center pointer-events-none pe-3"
      >
        <svg
          v-if="error"
          class="shrink-0 size-4 text-error-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <svg
          v-else
          class="shrink-0 size-4 text-success-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div
        v-if="$slots.suffix && !error && !success"
        class="absolute right-0 top-1/2 -translate-y-1/2 pe-3"
      >
        <slot name="suffix" />
      </div>
    </div>

    <!-- Mensagem de dica ou erro (após input) -->
    <div v-if="hint || error || success" class="mt-2">
      <p
        :id="helperId"
        :class="[
          'text-sm transition-colors duration-300',
          error
            ? 'text-error-500 font-medium'
            : success
              ? 'text-success-500 font-medium'
              : 'text-foreground/70',
        ]"
      >
        {{ error || success || hint }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

/**
 * Componente Input
 *
 * Wrapper ao redor do input HTML com estilização do Preline, estados de validação
 * e funcionalidades de acessibilidade.
 *
 * Atributos não declarados (id, maxlength, inputmode, autocomplete, name...)
 * são repassados diretamente ao <input> real; class/style permanecem no wrapper.
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
 * - prefix: ícone/adorno à esquerda do input
 * - suffix: ícone/adorno à direita do input
 *
 * Emits:
 * - update:modelValue: quando o valor do input muda
 * - blur: quando o input perde o foco
 * - focus: quando o input recebe o foco
 *
 * Exemplo:
 * <Input
 *   v-model="email"
 *   type="email"
 *   placeholder="voce@exemplo.com"
 *   :error="emailError"
 *   @blur="validateEmail"
 * >
 *   <template #label>Endereço de E-mail</template>
 * </Input>
 */

interface Props {
  modelValue: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  success?: string
  hint?: string
  inputClass?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
  (e: 'focus'): void
}

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: '',
  success: '',
  hint: '',
  inputClass: '',
})

defineEmits<Emits>()

// class/style ficam no wrapper; o restante (id, maxlength, inputmode...) vai ao input.
const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const helperId = `input-helper-${Math.random().toString(36).slice(2, 9)}`
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
