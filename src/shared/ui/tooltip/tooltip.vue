<template>
  <span
    class="relative inline-flex"
    @mouseenter="show = true"
    @mouseleave="show = false"
  >
    <span
      class="inline-flex"
      tabindex="0"
      :aria-describedby="show ? tooltipId : undefined"
      @focus="show = true"
      @blur="show = false"
    >
      <slot />
    </span>

    <AnimatePresence>
      <motion.span
        v-if="show"
        :id="tooltipId"
        key="tooltip"
        role="tooltip"
        :initial="{ opacity: 0, scale: 0.96, y: placement === 'top' ? 4 : -4 }"
        :animate="{ opacity: 1, scale: 1, y: 0 }"
        :exit="{ opacity: 0, scale: 0.96 }"
        :transition="{ duration: 0.14 }"
        :class="[
          'ui-shadow-float pointer-events-none absolute left-1/2 z-[60] w-max max-w-[260px] -translate-x-1/2 rounded-md bg-inverse px-2.5 py-1.5 text-left text-xs font-medium leading-snug text-background',
          placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        ]"
      >
        {{ text }}
      </motion.span>
    </AnimatePresence>
  </span>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { motion, AnimatePresence } from 'motion-v'

/**
 * Componente Tooltip
 *
 * Dica contextual acionada por hover e foco (acessível via teclado).
 * O slot padrão é o gatilho (normalmente um ícone de ajuda ao lado do label).
 */

withDefaults(
  defineProps<{
    text: string
    placement?: 'top' | 'bottom'
  }>(),
  { placement: 'top' },
)

const show = ref(false)
const tooltipId = `tooltip-${useId()}`
</script>
