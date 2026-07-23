<template>
  <component
    v-if="IconComponent"
    :is="IconComponent"
    :class="sizeClass"
    :stroke-width="props.strokeWidth"
    :style="colorResolution.style"
  />
  <span v-else class="text-destructive text-xs" title="Ícone não encontrado"
    >⚠️</span
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import * as LucideIcons from 'lucide-vue-next'
import { resolveColor } from '@/shared/ui/utils/color'

interface Props {
  /**
   * Nome do ícone do Lucide Icons (ex: 'Bell', 'Users', 'Building2')
   * @see https://lucide.dev
   */
  name: string
  /**
   * Tamanho: 'xs', 'sm', 'md', 'lg', 'xl'
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Espessura da linha (1-3)
   * @default 2
   */
  strokeWidth?: 1 | 1.5 | 2 | 2.5 | 3
  /**
   * Classes CSS adicionais
   */
  className?: string
  /**
   * Cor do icone (classe ou CSS var)
   */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  strokeWidth: 2,
  className: '',
  color: '',
})

const sizeMap: Record<string, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
}

const IconComponent = computed<Component | null>(() => {
  if (!props.name) {
    console.warn('[Icon] Nenhum nome fornecido')
    return null
  }

  const icon = (LucideIcons as Record<string, unknown>)[props.name] as
    | Component
    | undefined
  if (!icon) {
    console.warn(`[Icon] Ícone "${props.name}" não encontrado no Lucide Icons`)
    return null
  }

  return icon
})

const colorResolution = computed(() => resolveColor(props.color))

const sizeClass = computed(() => {
  const baseClass = sizeMap[props.size] || sizeMap.md
  return `icon ${baseClass} ${colorResolution.value.className || ''} ${props.className}`.trim()
})
</script>

<style scoped lang="css">
.icon {
  display: inline-flex;
  flex-shrink: 0;
  color: currentColor;
}
</style>
