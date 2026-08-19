<template>
  <div class="ui-select-wrapper">
    <!-- Label opcional (mesma API do Input) -->
    <label
      v-if="$slots.label"
      :for="selectId"
      class="mb-2 block text-sm font-medium text-foreground"
    >
      <slot name="label" />
    </label>

    <div :class="['relative', error && 'shake-error']">
      <button
        :id="selectId"
        :ref="setTriggerRef"
        type="button"
        :disabled="disabled"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-invalid="Boolean(error)"
        :aria-describedby="helperId"
        :class="[
          'flex w-full items-center justify-between rounded-lg py-2.5 pe-10 ps-4 text-start sm:py-3 sm:text-sm',
          'border border-line-2 bg-background-1 text-foreground transition-colors duration-200',
          'focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none',
          error &&
            '!border-error-500 focus:!border-error-500 focus:!ring-error-500',
          disabled && 'cursor-not-allowed bg-background-2 opacity-50',
          !disabled && 'cursor-pointer',
          'disabled:cursor-not-allowed disabled:bg-background-2 disabled:opacity-50',
        ]"
        @click="toggle"
        @keydown="onKeydown"
      >
        <span :class="['block truncate', !selectedOption && 'text-foreground/60']">
          {{ selectedOption ? selectedOption.label : placeholder }}
        </span>
      </button>

      <span
        class="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-foreground/60"
      >
        <Icon
          name="ChevronDown"
          size="sm"
          :class="['transition-transform duration-200', open && 'rotate-180']"
        />
      </span>

      <Teleport to="body">
        <AnimatePresence>
          <motion.ul
            v-if="open"
            key="select-panel"
            :ref="setPanelRef"
            role="listbox"
            :tabindex="-1"
            :style="panelStyle"
            :initial="{ opacity: 0, y: -6, scale: 0.98 }"
            :animate="{ opacity: 1, y: 0, scale: 1 }"
            :exit="{ opacity: 0, y: -6, scale: 0.98 }"
            :transition="{ type: 'spring', stiffness: 480, damping: 34 }"
            class="ui-shadow-float fixed z-[70] max-h-60 overflow-auto rounded-lg border border-line-2 bg-background p-1"
          >
          <li
            v-for="(option, index) in options"
            :key="option.value"
            role="option"
            :aria-selected="option.value === modelValue"
            :class="[
              'flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              index === activeIndex
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-muted',
            ]"
            @click="choose(option)"
            @mousemove="activeIndex = index"
          >
            <span class="truncate">{{ option.label }}</span>
            <Icon
              v-if="option.value === modelValue"
              name="Check"
              size="sm"
              class="shrink-0 text-primary"
              />
            </li>
          </motion.ul>
        </AnimatePresence>
      </Teleport>
    </div>

    <!-- Dica ou erro (mesma API do Input) -->
    <div v-if="hint || error" class="mt-2">
      <p
        :id="helperId"
        :class="[
          'text-sm transition-colors duration-300',
          error ? 'font-medium text-error-500' : 'text-foreground/70',
        ]"
      >
        {{ error || hint }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
export interface SelectOption {
  value: string
  label: string
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import Icon from '@/shared/ui/icon/icon.vue'
import { useAnchoredPanel } from '@/shared/composables/useAnchoredPanel'

/**
 * Componente Select
 *
 * Select acessível para campos de enum (ex.: tipo de empresa, regime
 * tributário). Espelha a API de label/hint/error do Input. Dropdown animado
 * com motion-v, navegação por teclado e fechamento por clique externo.
 */

interface Props {
  modelValue: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecione',
  disabled: false,
  error: '',
  hint: '',
  id: '',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const generatedId = useId()
const selectId = computed(() => props.id || `select-${generatedId}`)
const helperId = computed(() => `${selectId.value}-helper`)

const open = ref(false)
const activeIndex = ref(-1)

const { setTriggerRef, setPanelRef, panelStyle, anchor, isOutside } =
  useAnchoredPanel(open)

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
)

function openPanel(): void {
  if (props.disabled) return
  anchor()
  open.value = true
  const current = props.options.findIndex((o) => o.value === props.modelValue)
  activeIndex.value = current >= 0 ? current : 0
}

function closePanel(): void {
  open.value = false
  activeIndex.value = -1
}

function toggle(): void {
  if (open.value) closePanel()
  else openPanel()
}

function choose(option: SelectOption): void {
  emit('update:modelValue', option.value)
  closePanel()
}

function moveActive(delta: number): void {
  if (props.options.length === 0) return
  const next = activeIndex.value + delta
  activeIndex.value = Math.min(Math.max(next, 0), props.options.length - 1)
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!open.value) {
        openPanel()
      } else if (activeIndex.value >= 0) {
        choose(props.options[activeIndex.value])
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      if (open.value) moveActive(1)
      else openPanel()
      break
    case 'ArrowUp':
      event.preventDefault()
      if (open.value) moveActive(-1)
      else openPanel()
      break
    case 'Home':
      if (open.value) {
        event.preventDefault()
        activeIndex.value = 0
      }
      break
    case 'End':
      if (open.value) {
        event.preventDefault()
        activeIndex.value = props.options.length - 1
      }
      break
    case 'Escape':
      if (open.value) {
        event.preventDefault()
        closePanel()
      }
      break
  }
}

function onClickOutside(event: MouseEvent): void {
  if (open.value && isOutside(event.target as Node)) closePanel()
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() =>
  document.removeEventListener('mousedown', onClickOutside),
)
</script>

<style scoped>
.shake-error {
  animation: shake-error 0.4s ease-in-out;
}

@keyframes shake-error {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-4px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(4px);
  }
}
</style>
