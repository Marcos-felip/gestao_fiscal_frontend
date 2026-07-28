<script setup lang="ts">
import { computed, watch } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { Icon } from '@/shared/ui'

/**
 * Modal genérico (Teleport + motion-v) com slot de conteúdo e de rodapé.
 * Diferente do ConfirmDialog (alertdialog fixo), serve para formulários.
 */
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    description?: string
    closeOnBackdrop?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    title: '',
    description: '',
    closeOnBackdrop: true,
    size: 'md',
  },
)

const maxWidthClass = computed(
  () =>
    ({ sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' })[props.size],
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close(): void {
  emit('update:modelValue', false)
}

function onBackdrop(): void {
  if (props.closeOnBackdrop) close()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="modelValue"
        key="modal-backdrop"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-md"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.2 }"
        @click.self="onBackdrop"
      >
        <motion.div
          key="modal-card"
          role="dialog"
          aria-modal="true"
          :class="[
            'ui-shadow-float relative w-full overflow-hidden rounded-3xl border border-line-2 bg-background',
            maxWidthClass,
          ]"
          :initial="{ opacity: 0, scale: 0.92, y: 16 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.96, y: 8 }"
          :transition="{ type: 'spring', stiffness: 380, damping: 30 }"
        >
          <!-- Cabeçalho -->
          <header
            v-if="title || $slots.header"
            class="flex items-start justify-between gap-4 border-b border-line-2 px-6 py-4"
          >
            <div class="min-w-0">
              <slot name="header">
                <h2 class="font-semibold tracking-tight text-foreground">
                  {{ title }}
                </h2>
                <p
                  v-if="description"
                  class="mt-0.5 text-sm text-muted-foreground"
                >
                  {{ description }}
                </p>
              </slot>
            </div>
            <button
              type="button"
              class="-mr-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Fechar"
              @click="close"
            >
              <Icon name="X" size="sm" />
            </button>
          </header>

          <!-- Conteúdo -->
          <div class="px-6 py-5">
            <slot />
          </div>

          <!-- Rodapé -->
          <footer
            v-if="$slots.footer"
            class="flex items-center justify-end gap-2 border-t border-line-2 px-6 py-4"
          >
            <slot name="footer" />
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>
