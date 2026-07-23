<template>
  <label
    :class="[
      'switch-ui',
      'relative inline-flex cursor-pointer items-center',
      disabled && 'opacity-50 cursor-not-allowed',
    ]"
  >
    <input
      :id="id"
      type="checkbox"
      class="sr-only peer"
      :checked="modelValue"
      :disabled="disabled"
      :aria-label="ariaLabel"
      @change="onChange"
    />

    <span
      :class="[
        'track',
        'rounded-full border border-border bg-muted transition-colors',
        modelValue && 'bg-primary',
        sizeClasses.track,
      ]"
      aria-hidden="true"
    />

    <span
      :class="[
        'thumb',
        'absolute top-1/2 -translate-y-1/2 rounded-full border border-border bg-background transition-transform',
        sizeClasses.thumb,
        modelValue && sizeClasses.thumbChecked,
      ]"
      aria-hidden="true"
    />
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  disabled?: boolean
  id?: string
  ariaLabel?: string
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  id: undefined,
  ariaLabel: 'Alternar',
  size: 'md',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return {
      track: 'h-4 w-8',
      thumb: 'left-0.5 h-3 w-3',
      thumbChecked: 'translate-x-4',
    }
  }

  return {
    track: 'h-5 w-9',
    thumb: 'left-0.5 h-4 w-4',
    thumbChecked: 'translate-x-4',
  }
})

const onChange = (e: Event) => {
  const el = e.target as HTMLInputElement
  emit('update:modelValue', el.checked)
}
</script>

<style scoped lang="css">
.switch-ui {
  user-select: none;
}
</style>
