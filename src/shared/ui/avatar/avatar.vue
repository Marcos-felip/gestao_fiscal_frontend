<template>
  <div
    :class="[
      'ui-avatar',
      'shrink-0',
      sizeClasses,
      shapeClasses,
      variantClasses,
    ]"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="h-full w-full object-cover"
    />
    <span
      v-else
      :class="['ui-avatar-initials', textSizeClasses]"
    >
      {{ displayInitials }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  src?: string
  alt?: string
  initials?: string
  size?: 'sm' | 'md' | 'lg'
  shape?: 'circle' | 'rounded'
  variant?: 'primary' | 'secondary' | 'muted'
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: 'Avatar',
  initials: '',
  size: 'sm',
  shape: 'circle',
  variant: 'primary',
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }
  return sizes[props.size]
})

const textSizeClasses = computed(() => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }
  return sizes[props.size]
})

const shapeClasses = computed(() => {
  return props.shape === 'rounded' ? 'rounded-lg' : 'rounded-full'
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-secondary-foreground',
    muted: 'bg-muted text-foreground',
  }
  return variants[props.variant]
})

const displayInitials = computed(() => {
  const value = props.initials?.trim() || 'U'
  return value.slice(0, 2).toUpperCase()
})
</script>

<style scoped lang="css">
.ui-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  overflow: hidden;
}
</style>
