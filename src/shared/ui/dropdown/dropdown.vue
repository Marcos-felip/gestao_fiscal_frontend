<template>
  <div class="dropdown relative" @keydown.escape="close">
    <!-- Gatilho -->
    <button
      type="button"
      :class="[triggerClass, isOpen && triggerActiveClass]"
      :aria-label="triggerLabel || undefined"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="toggle"
    >
      <slot name="trigger" :open="isOpen">
        <span>Menu</span>
      </slot>
    </button>

    <!-- Backdrop: fecha ao clicar fora -->
    <Transition name="dropdown-fade">
      <div
        v-if="isOpen && closeOnClickOutside"
        class="fixed inset-0 z-40"
        @click="close"
      />
    </Transition>

    <!-- Conteúdo -->
    <Transition name="dropdown-scale">
      <div
        v-if="isOpen"
        role="menu"
        :class="[
          'dropdown-content ui-shadow-float absolute top-full z-50 mt-2 min-w-56 whitespace-nowrap rounded-lg border border-line-2 bg-background py-1',
          alignClass,
          menuClass,
        ]"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  modelValue?: boolean
  /** Alinhamento do menu em relação ao gatilho. */
  align?: 'left' | 'right'
  closeOnClickOutside?: boolean
  /** Classes do botão-gatilho (permite um gatilho discreto, ex.: ícone). */
  triggerClass?: string
  /** Fundo do gatilho enquanto aberto (padrão claro; ajuste sobre fundos escuros). */
  triggerActiveClass?: string
  /** Rótulo acessível do gatilho. */
  triggerLabel?: string
  /** Classes extras do menu (ex.: largura mínima ou `max-h`). */
  menuClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  align: 'right',
  closeOnClickOutside: true,
  triggerClass:
    'inline-flex items-center justify-center gap-2 rounded-lg p-2.5 text-sm font-medium transition-colors duration-200 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40',
  triggerActiveClass: 'bg-muted',
  triggerLabel: '',
  menuClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = ref(props.modelValue)

const alignClass = computed(() =>
  props.align === 'left' ? 'left-0' : 'right-0',
)

watch(
  () => props.modelValue,
  (value) => {
    isOpen.value = value
  },
)

watch(isOpen, (value) => {
  emit('update:modelValue', value)
})

function toggle(): void {
  isOpen.value = !isOpen.value
}

function close(): void {
  isOpen.value = false
}
</script>

<style scoped lang="css">
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 150ms ease-in-out;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
}

.dropdown-scale-enter-active,
.dropdown-scale-leave-active {
  transition:
    transform 150ms ease-in-out,
    opacity 150ms ease-in-out;
}

.dropdown-scale-enter-from,
.dropdown-scale-leave-to {
  transform: scale(0.95) translateY(-4px);
  opacity: 0;
}
</style>
