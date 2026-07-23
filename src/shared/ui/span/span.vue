<template>
  <span
    :class="[
      'ui-span',
      sizeClasses,
      weightClasses,
      fontClasses,
      !colorResolution.style && variantClasses,
      colorResolution.className,
    ]"
    :style="colorResolution.style"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveColor } from '@/shared/ui/utils/color'

interface Props {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  weight?:
    | 'extralight'
    | 'light'
    | 'normal'
    | 'medium'
    | 'semibold'
    | 'bold'
    | 'extrabold'
    | 'black'
  variant?: 'default' | 'muted' | 'primary' | 'destructive'
  color?: string
  font?: 'sans' | 'serif' | 'mono'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'base',
  weight: 'normal',
  variant: 'default',
  color: '',
  font: 'sans',
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }
  return sizes[props.size]
})

const weightClasses = computed(() => {
  const weights = {
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  }
  return weights[props.weight]
})

const fontClasses = computed(() => {
  const fonts = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  }
  return fonts[props.font]
})

const variantClasses = computed(() => {
  const variants = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    destructive: 'text-destructive',
  }
  return variants[props.variant]
})

const colorResolution = computed(() => resolveColor(props.color))
</script>

<style scoped lang="css">
.ui-span {
  display: inline-flex;
}

.ui-span.truncate {
  display: block;
  min-width: 0;
  max-width: 100%;
}
</style>
