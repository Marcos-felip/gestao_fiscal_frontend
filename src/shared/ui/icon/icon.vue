<script setup lang="ts">
import { computed } from 'vue'
import { icons, type IconName } from './icons'

const props = defineProps<{
  name: IconName
  size?: number
  strokeWidth?: number
}>()

const component = computed(() => icons[props.name])
</script>

<template>
  <component
    :is="component"
    :size="props.size"
    :stroke-width="props.strokeWidth"
    aria-hidden="true"
  />
</template>
