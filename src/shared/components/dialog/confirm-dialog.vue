<script setup lang="ts">
import { computed, watch } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { Button, Icon } from '@/shared/ui'

interface Props {
  modelValue: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'destructive'
  icon?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Tem certeza?',
  description: '',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  variant: 'primary',
  icon: '',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const isDestructive = computed(() => props.variant === 'destructive')

const resolvedIcon = computed(
  () => props.icon || (isDestructive.value ? 'TriangleAlert' : 'Info'),
)

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
        class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-md"
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
          class="dialog-card relative w-full max-w-md overflow-hidden rounded-3xl border border-line-2 bg-background p-7 ui-shadow-float"
          :class="isDestructive ? 'accent-destructive' : 'accent-primary'"
          :initial="{ opacity: 0, scale: 0.92, y: 16 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.96, y: 8 }"
          :transition="{ type: 'spring', stiffness: 380, damping: 30 }"
        >
          <!-- Faixa de acento no topo -->
          <span class="accent-bar" aria-hidden="true" />

          <!-- Atmosfera: brilho radial atrás do emblema -->
          <span class="accent-glow" aria-hidden="true" />

          <div class="relative flex flex-col items-center text-center">
            <!-- Emblema do ícone -->
            <motion.span
              :initial="{ scale: 0.6, opacity: 0 }"
              :animate="{ scale: 1, opacity: 1 }"
              :transition="{
                delay: 0.06,
                type: 'spring',
                stiffness: 500,
                damping: 22,
              }"
              class="badge flex h-14 w-14 items-center justify-center rounded-2xl"
            >
              <Icon :name="resolvedIcon" size="lg" :stroke-width="2" />
            </motion.span>

            <h2
              class="mt-5 text-xl font-bold tracking-tight text-foreground text-balance"
            >
              {{ title }}
            </h2>
            <p
              v-if="description"
              class="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground text-balance"
            >
              {{ description }}
            </p>

            <div
              class="mt-7 flex w-full flex-col-reverse gap-2.5 sm:flex-row sm:justify-center"
            >
              <Button
                variant="ghost"
                size="md"
                class="sm:min-w-[130px]"
                :disabled="loading"
                @click="onCancel"
              >
                {{ cancelLabel }}
              </Button>
              <Button
                :variant="variant"
                size="md"
                class="sm:min-w-[130px]"
                text-class="text-white"
                :loading="loading"
                @click="onConfirm"
              >
                {{ confirmLabel }}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped lang="css">
.dialog-card {
  --accent: var(--color-primary);
}

.dialog-card.accent-destructive {
  --accent: var(--color-destructive);
}

/* Faixa fina colorida no topo do card */
.accent-bar {
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.9;
}

/* Brilho radial suave atrás do emblema */
.accent-glow {
  position: absolute;
  top: -80px;
  left: 50%;
  height: 220px;
  width: 220px;
  transform: translateX(-50%);
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent) 22%, transparent),
    transparent 70%
  );
  pointer-events: none;
}

/* Emblema do ícone: fundo tingido + anel externo */
.badge {
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, var(--color-background));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--accent) 22%, transparent),
    0 0 0 8px color-mix(in srgb, var(--accent) 7%, transparent);
}
</style>
