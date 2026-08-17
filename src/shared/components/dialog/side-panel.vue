<script setup lang="ts">
/**
 * Painel lateral para formulários longos.
 *
 * O modal é caixa: centraliza, limita altura e sufoca um formulário de trinta
 * campos. O painel ocupa a altura inteira da janela, rola por dentro e deixa a
 * tela de origem visível ao lado — quem está conferindo uma nota não perde de
 * vista o item que está resolvendo.
 *
 * Usa `Modal` como referência de comportamento (Teleport, Escape, backdrop),
 * mas não o estende: a geometria é outra, e herdar largura centralizada só para
 * sobrescrevê-la deixaria as duas difíceis de mudar.
 */
import { computed, watch } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { Icon } from '@/shared/ui'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    description?: string
    closeOnBackdrop?: boolean
    width?: 'md' | 'lg' | 'xl'
  }>(),
  {
    title: '',
    description: '',
    closeOnBackdrop: false,
    width: 'lg',
  },
)

const widthClass = computed(
  () =>
    ({ md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-3xl' })[
      props.width
    ],
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function close(): void {
  emit('update:modelValue', false)
}

function onBackdrop(): void {
  if (props.closeOnBackdrop) close()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      document.addEventListener('keydown', onKeydown)
      // Sem isto a página de trás rola junto com o painel.
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="props.modelValue"
        key="panel-backdrop"
        class="fixed inset-0 z-[60] bg-slate-950/45 backdrop-blur-sm"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.2 }"
        @click.self="onBackdrop"
      />

      <motion.aside
        v-if="props.modelValue"
        key="panel-card"
        role="dialog"
        aria-modal="true"
        :class="[
          'ui-shadow-float fixed inset-y-0 right-0 z-[61] flex w-full flex-col border-l border-line-2 bg-background',
          widthClass,
        ]"
        :initial="{ x: '100%' }"
        :animate="{ x: 0 }"
        :exit="{ x: '100%' }"
        :transition="{ type: 'spring', stiffness: 320, damping: 34 }"
      >
        <header
          class="flex shrink-0 items-start justify-between gap-4 border-b border-line-2 px-6 py-4"
        >
          <div class="min-w-0">
            <slot name="header">
              <h2
                class="font-display text-lg font-semibold tracking-tight text-foreground"
              >
                {{ props.title }}
              </h2>
              <p
                v-if="props.description"
                class="mt-0.5 text-sm text-muted-foreground"
              >
                {{ props.description }}
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

        <!-- A rolagem é daqui: o `FormActionBar` sticky gruda no rodapé dela. -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <slot />
        </div>
      </motion.aside>
    </AnimatePresence>
  </Teleport>
</template>
