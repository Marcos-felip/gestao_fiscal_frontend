<template>
  <div :class="['sidebar-accordion', 'space-y-1']">
    <!-- Trigger -->
    <button
      :class="[
        'accordion-trigger',
        'w-full group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-sans',
        'transition-colors duration-200 text-left',
        'hover:bg-muted hover:text-foreground',
        isOpen
          ? 'bg-muted text-foreground'
          : 'text-muted-foreground',
      ]"
      @click="toggle"
    >
      <!-- Ícone -->
      <span :class="['icon', 'h-5 w-5 shrink-0']">
        <slot name="icon" />
      </span>

      <!-- Rótulo -->
      <Span
        size="sm"
        class="flex-1 truncate"
      >
        {{ label }}
      </Span>

      <!-- Chevron -->
      <svg
        :class="[
          'chevron',
          'h-4 w-4 shrink-0 transition-transform duration-200',
          isOpen && 'rotate-180',
        ]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <!-- Content (items) -->
    <Transition
      name="accordion"
      @enter="onEnter"
      @leave="onLeave"
    >
      <div
        v-if="isOpen"
        :class="['accordion-content', 'space-y-1 overflow-hidden']"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Span } from '@/shared/ui'

interface Props {
  label: string
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = ref(props.modelValue)

const toggle = () => {
  isOpen.value = !isOpen.value
  emit('update:modelValue', isOpen.value)
}

const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
  element.style.overflow = 'hidden'
  void element.offsetHeight // trigger reflow
  element.style.height = element.scrollHeight + 'px'
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  void element.offsetHeight // trigger reflow
  element.style.height = '0'
  element.style.overflow = 'hidden'
}
</script>

<style scoped lang="css">
.accordion-enter-active,
.accordion-leave-active {
  transition: height 200ms ease-in-out;
}

.accordion-enter-from,
.accordion-leave-to {
  height: 0;
  overflow: hidden;
}
</style>
