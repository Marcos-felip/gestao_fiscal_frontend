<template>
  <div
    ref="dropdownRef"
    :class="['dropdown', 'relative']"
    @click.stop
    @keydown.escape="close"
  >
    <!-- Trigger -->
    <button
      :class="[
        'dropdown-trigger',
        'inline-flex items-center justify-center gap-2 rounded-lg p-2.5 text-sm font-medium',
        'transition-colors duration-200',
        'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40',
        isOpen && 'bg-muted',
      ]"
      @click="toggle"
    >
      <slot name="trigger" :open="isOpen">
        <span>Menu</span>
      </slot>
    </button>

    <!-- Content -->
    <Teleport to="body">
      <Transition name="dropdown-fade">
        <div
          v-if="isOpen"
          :class="[
            'dropdown-backdrop',
            'fixed inset-0 z-40',
          ]"
          @click="close"
        />
      </Transition>
      <Transition name="dropdown-scale">
        <div
          v-if="isOpen"
          :class="[
            'dropdown-content',
            'absolute top-full right-0 mt-2 z-50',
            'rounded-lg border border-border bg-background shadow-lg',
            'min-w-56 max-h-96 overflow-y-auto',
            positionClass,
          ]"
        >
          <slot :close="close" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue?: boolean
  align?: 'left' | 'right'
  closeOnClickOutside?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  align: 'right',
  closeOnClickOutside: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = ref(props.modelValue)
const dropdownRef = ref<HTMLDivElement>()

const positionClass = computed(() => {
  return props.align === 'left' ? 'left-0' : 'right-0'
})

watch(
  () => props.modelValue,
  (newVal) => {
    isOpen.value = newVal
  },
)

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
})

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (
    props.closeOnClickOutside &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    close()
  }
}

onMounted(() => {
  if (props.closeOnClickOutside) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (props.closeOnClickOutside) {
    document.removeEventListener('click', handleClickOutside)
  }
})

import { computed } from 'vue'
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
  transition: transform 150ms ease-in-out, opacity 150ms ease-in-out;
}

.dropdown-scale-enter-from,
.dropdown-scale-leave-to {
  transform: scale(0.95) translateY(-4px);
  opacity: 0;
}
</style>
