<template>
  <div class="ui-password-input">
    <!-- Label (opcional) -->
    <label
      v-if="$slots.label || label"
      :for="id"
      class="mb-2 block text-sm font-medium text-foreground"
    >
      <slot name="label">{{ label }}</slot>
    </label>

    <div :class="['relative', error && 'shake-error']">
      <input
        :id="id"
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error || hint ? helperId : undefined"
        :class="[
          'block w-full rounded-lg px-4 py-2.5 pe-11 sm:py-3 sm:text-sm',
          'bg-background-1 text-foreground',
          'border border-line-2 transition-colors duration-200',
          'focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none',
          'placeholder:text-foreground/70',
          error &&
            '!border-error-500 focus:!border-error-500 focus:!ring-error-500',
          disabled && 'cursor-not-allowed bg-background-2 opacity-50',
        ]"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />

      <!-- Alternar visibilidade -->
      <button
        type="button"
        tabindex="-1"
        :aria-label="visible ? 'Ocultar senha' : 'Mostrar senha'"
        :aria-pressed="visible"
        class="absolute top-1/2 right-0 flex -translate-y-1/2 items-center pe-3 text-muted-foreground transition-colors hover:text-foreground"
        @click="toggle"
      >
        <Icon :name="visible ? 'EyeOff' : 'Eye'" size="sm" />
      </button>
    </div>

    <!-- Dica ou erro -->
    <div v-if="error || hint" class="mt-2">
      <p
        :id="helperId"
        :class="[
          'text-sm transition-colors duration-300',
          error ? 'font-medium text-error-500' : 'text-muted-foreground',
        ]"
      >
        {{ error || hint }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { Icon } from '@/shared/ui'

/**
 * Componente PasswordInput
 *
 * Campo dedicado a senhas: encapsula o alternar mostrar/ocultar (com ícone
 * Eye/EyeOff) para não poluir o Input genérico. Mesmo visual do Input.
 *
 * Props:
 * - modelValue: v-model do valor
 * - id: id do input (liga o label)
 * - autocomplete: 'current-password' (login) | 'new-password' (cadastro)
 * - error / hint: mensagens abaixo do campo
 *
 * Slots:
 * - label: rótulo (ou use a prop `label`)
 */

interface Props {
  modelValue: string
  id?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
  autocomplete?: 'current-password' | 'new-password'
}

withDefaults(defineProps<Props>(), {
  id: undefined,
  label: '',
  placeholder: '',
  disabled: false,
  error: '',
  hint: '',
  autocomplete: 'current-password',
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  focus: []
}>()

const visible = ref(false)
const helperId = useId()

function toggle(): void {
  visible.value = !visible.value
}
</script>

<style scoped>
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
