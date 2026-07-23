<template>
  <div :class="['search-input-wrapper', 'relative w-full']">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'search-input',
        'w-full rounded-lg border border-border bg-background/95',
        sizeClasses.input,
        'text-sm text-foreground placeholder:text-muted-foreground',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keydown.enter="$emit('submit')"
      @keydown.escape="$emit('cancel')"
      @keydown="onKeydown"
    />
    <div :class="['search-icon', 'absolute inset-y-0 flex items-center', sizeClasses.icon]">
      <slot name="icon">
        <Icon
          name="Search"
          :size="sizeClasses.iconSize"
          :stroke-width="1.5"
        />
      </slot>
    </div>

    <div
      :class="[
        'search-shortcut',
        'absolute inset-y-0 right-3 flex items-center gap-1 text-muted-foreground pointer-events-none',
        sizeClasses.shortcut,
      ]"
      aria-hidden="true"
    >
      <kbd class="rounded border border-border px-1.5 py-0.5 font-sans">
        {{ shortcutLabel }}
      </kbd>
      <kbd class="rounded border border-border px-1.5 py-0.5 font-sans">/</kbd>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/shared/ui'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar...',
  disabled: false,
  size: 'sm',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  cancel: []
  shortcut: []
}>()

const isMac = computed(() => {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
})

const shortcutLabel = computed(() => (isMac.value ? '⌘' : 'Ctrl'))

const onKeydown = (event: KeyboardEvent) => {
  const isShortcut = (event.metaKey || event.ctrlKey) && event.key === '/'
  if (isShortcut) {
    event.preventDefault()
    emit('shortcut')
  }
}

const sizeClasses = computed(() => {
  const sizes = {
    sm: {
      input: 'px-3 py-2 pl-9 pr-14 text-sm',
      icon: 'left-3',
      iconSize: 'sm' as const,
      shortcut: 'text-[11px]',
    },
    md: {
      input: 'px-4 py-2.5 pl-10 pr-16 text-sm',
      icon: 'left-3.5',
      iconSize: 'sm' as const,
      shortcut: 'text-xs',
    },
    lg: {
      input: 'px-4 py-3 pl-11 pr-16 text-base',
      icon: 'left-4',
      iconSize: 'md' as const,
      shortcut: 'text-sm',
    },
  }
  return sizes[props.size]
})
</script>

<style scoped lang="css">
.search-input:focus {
  background-color: var(--color-background);
}
</style>
