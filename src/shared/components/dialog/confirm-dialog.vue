<script setup lang="ts">
import { watch } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { Button } from '@/shared/ui'

interface Props {
  modelValue: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'destructive'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Tem certeza?',
  description: '',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  variant: 'primary',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function close(): void {
  emit('update:modelValue', false)
}

function onCancel(): void {
  emit('cancel')
  close()
}

function onConfirm(): void {
  emit('confirm')
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') onCancel()
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
        key="confirm-backdrop"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.2 }"
        @click.self="onCancel"
      >
        <motion.div
          key="confirm-card"
          role="alertdialog"
          aria-modal="true"
          class="w-full max-w-sm rounded-2xl border border-line-2 bg-background p-6 ui-shadow-float"
          :initial="{ opacity: 0, scale: 0.94, y: 12 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.96, y: 8 }"
          :transition="{ type: 'spring', stiffness: 400, damping: 30 }"
        >
          <h2 class="text-lg font-bold tracking-tight text-foreground">
            {{ title }}
          </h2>
          <p v-if="description" class="mt-2 text-sm text-muted-foreground">
            {{ description }}
          </p>

          <div class="mt-6 flex justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              :disabled="loading"
              @click="onCancel"
            >
              {{ cancelLabel }}
            </Button>
            <Button
              :variant="variant"
              size="sm"
              :loading="loading"
              text-class="text-white"
              @click="onConfirm"
            >
              {{ confirmLabel }}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>
