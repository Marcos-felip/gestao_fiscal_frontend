<template>
  <div ref="rootRef" class="ui-datepicker-wrapper">
    <!-- Label opcional (mesma API do Input/Select) -->
    <label
      v-if="$slots.label"
      :for="pickerId"
      class="mb-2 block text-sm font-medium text-foreground"
    >
      <slot name="label" />
    </label>

    <div :class="['relative', error && 'shake-error']">
      <!-- Gatilho: parece um input, abre o calendário -->
      <button
        :id="pickerId"
        type="button"
        :disabled="disabled"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :aria-invalid="Boolean(error)"
        :aria-describedby="helperId"
        :class="[
          'flex w-full items-center gap-2 rounded-lg py-2.5 pe-4 ps-4 text-start sm:py-3 sm:text-sm',
          'border border-line-2 bg-background-1 text-foreground transition-colors duration-200',
          'focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none',
          error &&
            '!border-error-500 focus:!border-error-500 focus:!ring-error-500',
          disabled && 'cursor-not-allowed bg-background-2 opacity-50',
          !disabled && 'cursor-pointer',
        ]"
        @click="toggle"
      >
        <Icon name="Calendar" size="sm" class="shrink-0 text-foreground/60" />
        <span :class="['block flex-1 truncate', !displayLabel && 'text-foreground/60']">
          {{ displayLabel || placeholder }}
        </span>
        <button
          v-if="displayLabel && !disabled"
          type="button"
          class="-me-1 shrink-0 rounded-md p-0.5 text-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Limpar data"
          @click.stop="clear"
        >
          <Icon name="X" size="sm" />
        </button>
      </button>

      <!-- Painel do calendário -->
      <AnimatePresence>
        <motion.div
          v-if="open"
          key="datepicker-panel"
          role="dialog"
          :tabindex="-1"
          :initial="{ opacity: 0, y: -6, scale: 0.98 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, y: -6, scale: 0.98 }"
          :transition="{ type: 'spring', stiffness: 480, damping: 34 }"
          class="ui-shadow-float absolute z-50 mt-2 w-72 rounded-xl border border-line-2 bg-background p-3"
          :class="alignClass"
        >
          <!-- Cabeçalho: navegação -->
          <div class="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              :aria-label="mode === 'days' ? 'Mês anterior' : 'Ano anterior'"
              @click="goPrev"
            >
              <Icon name="ChevronLeft" size="sm" />
            </button>

            <button
              type="button"
              class="rounded-lg px-3 py-1 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              @click="mode = mode === 'days' ? 'months' : 'days'"
            >
              <span v-if="mode === 'days'">
                {{ MONTHS[viewMonth] }} de {{ viewYear }}
              </span>
              <span v-else>{{ viewYear }}</span>
            </button>

            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              :aria-label="mode === 'days' ? 'Próximo mês' : 'Próximo ano'"
              @click="goNext"
            >
              <Icon name="ChevronRight" size="sm" />
            </button>
          </div>

          <!-- Visão de dias -->
          <div v-if="mode === 'days'">
            <!-- Cabeçalho de dias da semana -->
            <div class="mb-1 grid grid-cols-7">
              <span
                v-for="weekday in WEEKDAYS"
                :key="weekday"
                class="py-1 text-center text-xs font-medium text-muted-foreground"
              >
                {{ weekday }}
              </span>
            </div>

            <!-- Grade de dias -->
            <div class="grid grid-cols-7 gap-0.5">
              <button
                v-for="cell in dayCells"
                :key="cell.key"
                type="button"
                :disabled="cell.disabled"
                :aria-label="cell.label"
                :aria-current="cell.isSelected ? 'date' : undefined"
                :class="[
                  'flex size-9 items-center justify-center rounded-lg text-sm transition-colors',
                  'disabled:cursor-not-allowed disabled:opacity-30',
                  cell.isSelected
                    ? 'bg-primary font-semibold text-white hover:bg-primary'
                    : cell.inMonth
                      ? 'text-foreground hover:bg-muted'
                      : 'text-foreground/35 hover:bg-muted',
                  !cell.isSelected &&
                    cell.isToday &&
                    'font-semibold text-primary ring-1 ring-primary/40',
                ]"
                @click="selectDay(cell.date)"
              >
                {{ cell.day }}
              </button>
            </div>
          </div>

          <!-- Visão de meses -->
          <div v-else class="grid grid-cols-3 gap-1.5">
            <button
              v-for="(monthName, index) in MONTHS_SHORT"
              :key="monthName"
              type="button"
              :class="[
                'rounded-lg py-2 text-sm transition-colors',
                index === viewMonth && viewYear === selectedYearOrView
                  ? 'bg-primary font-semibold text-white'
                  : 'text-foreground hover:bg-muted',
              ]"
              @click="selectMonth(index)"
            >
              {{ monthName }}
            </button>
          </div>

          <!-- Rodapé: atalhos -->
          <div
            class="mt-2 flex items-center justify-between border-t border-line-2 pt-2"
          >
            <button
              type="button"
              class="rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              @click="selectToday"
            >
              Hoje
            </button>
            <button
              v-if="displayLabel"
              type="button"
              class="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              @click="clear"
            >
              Limpar
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
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
import { motion, AnimatePresence } from 'motion-v'
import Icon from '@/shared/ui/icon/icon.vue'

/**
 * Componente DatePicker
 *
 * Seletor de data acessível com calendário animado (motion-v), espelhando a API
 * de label/hint/error do Input/Select. O `modelValue` é uma string no formato
 * `aaaa-MM-dd` (mesmo formato do `<input type="date">`), então é substituto
 * direto — combina com `dateInputToIso`/`isoToDateInput` de `@/core/utils/date`.
 */

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
  id?: string
  /** Limita a seleção (formato `aaaa-MM-dd`). */
  min?: string
  max?: string
  /** Alinhamento do painel em relação ao gatilho. */
  align?: 'start' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecione a data',
  disabled: false,
  error: '',
  hint: '',
  id: '',
  min: '',
  max: '',
  align: 'start',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
const MONTHS_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

const generatedId = useId()
const pickerId = computed(() => props.id || `datepicker-${generatedId}`)
const helperId = computed(() => `${pickerId.value}-helper`)

const rootRef = ref<HTMLElement | null>(null)
const open = ref(false)
const mode = ref<'days' | 'months'>('days')

const alignClass = computed(() => (props.align === 'end' ? 'end-0' : 'start-0'))

interface ParsedDate {
  y: number
  m: number
  d: number
}

function parseModel(value: string): ParsedDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) }
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toModel(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const selected = computed(() => parseModel(props.modelValue))

const displayLabel = computed(() => {
  const parsed = selected.value
  if (!parsed) return ''
  return `${pad(parsed.d)}/${pad(parsed.m + 1)}/${parsed.y}`
})

// Mês/ano em exibição no calendário.
const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth())

// Referência para destacar o mês selecionado na visão de meses.
const selectedYearOrView = computed(() => selected.value?.y ?? viewYear.value)

// Ao abrir, posiciona a visão no mês da data selecionada (ou no mês atual).
function syncView(): void {
  const parsed = selected.value
  if (parsed) {
    viewYear.value = parsed.y
    viewMonth.value = parsed.m
  } else {
    viewYear.value = now.getFullYear()
    viewMonth.value = now.getMonth()
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    mode.value = 'days'
    syncView()
  }
})

interface DayCell {
  key: string
  date: Date
  day: number
  inMonth: boolean
  isToday: boolean
  isSelected: boolean
  disabled: boolean
  label: string
}

function isDisabled(model: string): boolean {
  if (props.min && model < props.min) return true
  if (props.max && model > props.max) return true
  return false
}

const dayCells = computed<DayCell[]>(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const startOffset = first.getDay() // 0 = domingo
  const start = new Date(viewYear.value, viewMonth.value, 1 - startOffset)
  const todayModel = toModel(now)
  const selectedModel = props.modelValue

  const cells: DayCell[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
    )
    const model = toModel(date)
    cells.push({
      key: model,
      date,
      day: date.getDate(),
      inMonth: date.getMonth() === viewMonth.value,
      isToday: model === todayModel,
      isSelected: model === selectedModel,
      disabled: isDisabled(model),
      label: `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`,
    })
  }
  return cells
})

function goPrev(): void {
  if (mode.value === 'months') {
    viewYear.value -= 1
    return
  }
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}

function goNext(): void {
  if (mode.value === 'months') {
    viewYear.value += 1
    return
  }
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

function selectMonth(index: number): void {
  viewMonth.value = index
  mode.value = 'days'
}

function selectDay(date: Date): void {
  emit('update:modelValue', toModel(date))
  open.value = false
}

function selectToday(): void {
  const model = toModel(now)
  if (isDisabled(model)) return
  emit('update:modelValue', model)
  open.value = false
}

function clear(): void {
  emit('update:modelValue', '')
  open.value = false
}

function toggle(): void {
  if (props.disabled) return
  open.value = !open.value
}

function onClickOutside(event: MouseEvent): void {
  if (!open.value) return
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
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
