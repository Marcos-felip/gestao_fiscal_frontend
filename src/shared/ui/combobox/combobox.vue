<template>
  <div class="ui-combobox-wrapper">
    <!-- Label opcional (mesma API do Input/Select) -->
    <label
      v-if="$slots.label"
      :for="comboId"
      class="mb-2 block text-sm font-medium text-foreground"
    >
      <slot name="label" />
    </label>

    <div :class="['relative', error && 'shake-error']">
      <!-- Ícone de busca à esquerda -->
      <span
        class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-foreground/60"
      >
        <Icon name="Search" size="sm" :stroke-width="1.5" />
      </span>

      <input
        :id="comboId"
        :ref="setTriggerRef"
        :value="query"
        type="text"
        role="combobox"
        autocomplete="off"
        :placeholder="placeholder"
        :disabled="disabled"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-invalid="Boolean(error)"
        :aria-describedby="helperId"
        :class="[
          'w-full rounded-lg py-2.5 ps-10 pe-10 sm:py-3 sm:text-sm',
          'border border-line-2 bg-background-1 text-foreground transition-colors duration-200',
          'placeholder:text-foreground/60',
          'focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none',
          error &&
            '!border-error-500 focus:!border-error-500 focus:!ring-error-500',
          disabled && 'cursor-not-allowed bg-background-2 opacity-50',
        ]"
        @input="onInput"
        @focus="onFocus"
        @keydown="onKeydown"
      />

      <!-- Limpar (quando há seleção) ou chevron -->
      <button
        v-if="modelValue && !disabled"
        type="button"
        class="absolute inset-y-0 end-0 flex items-center pe-3 text-foreground/50 transition-colors hover:text-foreground"
        aria-label="Limpar seleção"
        @click="clear"
      >
        <Icon name="X" size="sm" />
      </button>
      <span
        v-else
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
            key="combobox-panel"
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
            v-for="(option, index) in filteredOptions"
            :key="option.value"
            role="option"
            :aria-selected="option.value === modelValue"
            :class="[
              'flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              index === activeIndex
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-muted',
            ]"
            @mousedown.prevent="choose(option)"
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

          <li
            v-if="filteredOptions.length === 0"
            class="px-3 py-2 text-sm text-muted-foreground"
          >
            {{ emptyText }}
            </li>
          </motion.ul>
        </AnimatePresence>
      </Teleport>
    </div>

    <!-- Dica ou erro (mesma API do Input/Select) -->
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

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useAnchoredPanel } from '@/shared/composables/useAnchoredPanel'
import { motion, AnimatePresence } from 'motion-v'
import Icon from '@/shared/ui/icon/icon.vue'
import type { SelectOption } from '@/shared/ui/select/select.vue'

/**
 * Componente Combobox (select com busca)
 *
 * Um seletor que se digita: mostra um input com ícone de busca, filtra as
 * opções conforme o texto e resolve para um `value` ao escolher. Ideal para
 * listas grandes (produtos, fornecedores) onde um `Select` puro é lento de
 * percorrer. Espelha a API de label/hint/error do Input/Select; o `modelValue`
 * é o `value` da opção selecionada (`''` = nada selecionado).
 */

interface Props {
  modelValue: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
  id?: string
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar…',
  disabled: false,
  error: '',
  hint: '',
  id: '',
  emptyText: 'Nenhum resultado',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const generatedId = useId()
const comboId = computed(() => props.id || `combobox-${generatedId}`)
const helperId = computed(() => `${comboId.value}-helper`)

const open = ref(false)

const { setTriggerRef, setPanelRef, panelStyle, anchor, isOutside } =
  useAnchoredPanel(open)
const activeIndex = ref(-1)
const query = ref('')
// Enquanto o usuário digita, filtramos; ao fechar, o texto volta ao rótulo.
const searching = ref(false)

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
)

// Mantém o texto do input sincronizado com a seleção externa.
watch(
  () => [props.modelValue, props.options] as const,
  () => {
    if (!searching.value) query.value = selectedOption.value?.label ?? ''
  },
  { immediate: true },
)

const filteredOptions = computed(() => {
  if (!searching.value || !query.value.trim()) return props.options
  const term = query.value.trim().toLowerCase()
  return props.options.filter((option) =>
    option.label.toLowerCase().includes(term),
  )
})

function openPanel(): void {
  if (props.disabled) return
  anchor()
  open.value = true
  const current = filteredOptions.value.findIndex(
    (o) => o.value === props.modelValue,
  )
  activeIndex.value = current >= 0 ? current : 0
}

function closePanel(): void {
  open.value = false
  activeIndex.value = -1
  searching.value = false
  // Restaura o rótulo da seleção atual (descarta texto não confirmado).
  query.value = selectedOption.value?.label ?? ''
}

function onFocus(): void {
  openPanel()
}

function onInput(event: Event): void {
  searching.value = true
  query.value = (event.target as HTMLInputElement).value
  if (!open.value) open.value = true
  activeIndex.value = 0
}

function choose(option: SelectOption): void {
  emit('update:modelValue', option.value)
  searching.value = false
  query.value = option.label
  open.value = false
  activeIndex.value = -1
}

function clear(): void {
  emit('update:modelValue', '')
  searching.value = false
  query.value = ''
  open.value = false
}

function moveActive(delta: number): void {
  const count = filteredOptions.value.length
  if (count === 0) return
  const next = activeIndex.value + delta
  activeIndex.value = Math.min(Math.max(next, 0), count - 1)
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (open.value) moveActive(1)
      else openPanel()
      break
    case 'ArrowUp':
      event.preventDefault()
      if (open.value) moveActive(-1)
      break
    case 'Enter':
      if (open.value && activeIndex.value >= 0) {
        event.preventDefault()
        const option = filteredOptions.value[activeIndex.value]
        if (option) choose(option)
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
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
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
