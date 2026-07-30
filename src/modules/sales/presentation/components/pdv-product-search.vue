<script setup lang="ts">
import { computed, ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { Icon } from '@/shared/ui'
import type { SaleProductOption } from '@/modules/sales/presentation/schemas/sale-schema'
import { unitOfMeasureShortLabels } from '@/enums/unit-of-measure.enum'
import { formatMoney, formatQuantity } from '@/shared/ui/utils/masks'

const props = defineProps<{ products: SaleProductOption[] }>()
const emit = defineEmits<{ pick: [productId: string] }>()

const MAX_RESULTS = 8

const query = ref('')
const activeIndex = ref(0)
const focused = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

/** Normaliza para busca sem acento/caixa. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

const results = computed<SaleProductOption[]>(() => {
  const term = normalize(query.value.trim())
  if (!term) return []
  return props.products
    .filter((p) => {
      const haystack = normalize(
        `${p.name} ${p.sku ?? ''} ${p.barcode ?? ''}`,
      )
      return haystack.includes(term)
    })
    .slice(0, MAX_RESULTS)
})

const open = computed(() => focused.value && results.value.length > 0)

function unitLabel(unit: SaleProductOption['unit']): string {
  if (!unit) return ''
  return unitOfMeasureShortLabels[unit] ?? unit
}

function pick(product: SaleProductOption): void {
  emit('pick', product.id)
  query.value = ''
  activeIndex.value = 0
  // mantém o foco para a próxima leitura
  inputRef.value?.focus()
}

function onInput(): void {
  activeIndex.value = 0
}

function onKeydown(event: KeyboardEvent): void {
  const count = results.value.length
  switch (event.key) {
    case 'ArrowDown':
      if (!count) return
      event.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % count
      break
    case 'ArrowUp':
      if (!count) return
      event.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + count) % count
      break
    case 'Enter': {
      if (!count) return
      event.preventDefault()
      const product = results.value[activeIndex.value]
      if (product) pick(product)
      break
    }
    case 'Escape':
      if (query.value) {
        event.preventDefault()
        event.stopPropagation()
        query.value = ''
      }
      break
  }
}

function focus(): void {
  inputRef.value?.focus()
  inputRef.value?.select()
}

defineExpose({ focus })
</script>

<template>
  <div class="relative">
    <div
      :class="[
        'flex items-center gap-3 rounded-xl border bg-background px-4 transition-colors',
        focused ? 'border-primary ring-2 ring-primary/30' : 'border-line-2',
      ]"
    >
      <Icon name="ScanBarcode" size="md" class="shrink-0 text-muted-foreground" />
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        inputmode="search"
        placeholder="Buscar por nome ou código do produto…"
        class="w-full bg-transparent py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        autocomplete="off"
        @input="onInput"
        @keydown="onKeydown"
        @focus="focused = true"
        @blur="focused = false"
      />
      <kbd
        class="hidden shrink-0 rounded-md border border-line-2 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground sm:inline"
      >
        F2
      </kbd>
    </div>

    <!-- Resultados -->
    <AnimatePresence>
      <motion.div
        v-if="open"
        key="pdv-results"
        class="ui-shadow-float absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-line-2 bg-background p-1.5"
        :initial="{ opacity: 0, y: -6 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -6 }"
        :transition="{ duration: 0.14 }"
      >
        <button
          v-for="(product, index) in results"
          :key="product.id"
          type="button"
          :class="[
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
            index === activeIndex ? 'bg-primary/10' : 'hover:bg-muted',
          ]"
          @mousedown.prevent="pick(product)"
          @mousemove="activeIndex = index"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-foreground">{{ product.name }}</p>
            <p class="truncate text-xs text-muted-foreground">
              <span v-if="product.sku">Cód. {{ product.sku }} · </span>
              <span v-else-if="product.barcode">
                {{ product.barcode }} ·
              </span>
              Estoque:
              <span
                :class="
                  product.currentStock <= 0
                    ? 'font-medium text-error-600'
                    : 'text-muted-foreground'
                "
              >
                {{ formatQuantity(product.currentStock) }} {{ unitLabel(product.unit) }}
              </span>
            </p>
          </div>
          <div class="shrink-0 text-right">
            <p class="font-semibold tabular-nums text-foreground">
              R$ {{ formatMoney(product.salePrice ?? 0) }}
            </p>
            <p
              v-if="index === activeIndex"
              class="flex items-center justify-end gap-1 text-[11px] text-primary"
            >
              <Icon name="CornerDownLeft" size="xs" /> adicionar
            </p>
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
