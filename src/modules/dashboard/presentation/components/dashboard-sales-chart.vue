<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon, Skeleton, Spinner } from '@/shared/ui'
import DashboardBlockError from './dashboard-block-error.vue'
import type { DashboardSalesChart } from '@/modules/dashboard/domain/responses/dashboard-sales-chart'
import type { BlockStatus } from '@/modules/dashboard/presentation/controllers/dashboard-controller'
import {
  SalesChartRange,
  salesChartRangeLabels,
} from '@/core/enums/sales-chart-range.enum'
import { formatMoney } from '@/shared/ui/utils/masks'
import { buildAxisScale } from '@/modules/dashboard/presentation/utils/chart-scale'

const props = defineProps<{
  chart: DashboardSalesChart | null
  status: BlockStatus
  range: SalesChartRange
}>()

const emit = defineEmits<{
  retry: []
  'update:range': [range: SalesChartRange]
}>()

/** Espaço de coordenadas do traçado. É esticado pelo CSS, não pelo viewport. */
const WIDTH = 720
const HEIGHT = 200

const ranges = [
  SalesChartRange.LAST_30_DAYS,
  SalesChartRange.LAST_12_MONTHS,
] as const

const MONTHS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

const points = computed(() => props.chart?.points ?? [])
const byDay = computed(() => props.range === SalesChartRange.LAST_30_DAYS)

const periodTotal = computed(() =>
  points.value.reduce((sum, point) => sum + point.total, 0),
)

const isEmpty = computed(
  () => points.value.length > 0 && periodTotal.value === 0,
)

const maxValue = computed(() =>
  points.value.reduce((max, point) => Math.max(max, point.total), 0),
)

/**
 * Escala vertical do gráfico.
 *
 * Sem marcações no eixo Y o gráfico mostra a forma e esconde a grandeza: dá
 * para ver qual foi o pico, mas não se ele foi R$ 500 ou R$ 50 mil — e essa é a
 * primeira pergunta de quem olha.
 */
const axisScale = computed(() => buildAxisScale(maxValue.value))
const axisMax = computed(() => axisScale.value.max)
const yTicks = computed(() => axisScale.value.ticks)

/**
 * Resumo do período, no rodapé do cartão.
 *
 * O gráfico responde "como variou"; estes três respondem "quanto, quando e com
 * que regularidade" — que é o que alguém pergunta logo depois de olhar a linha.
 * Tudo sai dos pontos que já estão em mãos: nenhuma requisição a mais.
 */
const periodStats = computed(() => {
  const list = points.value
  if (list.length === 0) return []

  const unidade = byDay.value ? 'dia' : 'mês'
  const plural = byDay.value ? 'dias' : 'meses'
  const comVenda = list.filter((point) => point.count > 0).length
  const melhor = list.reduce((best, point) =>
    point.total > best.total ? point : best,
  )

  return [
    {
      key: 'average',
      label: `Média por ${unidade}`,
      value: `R$ ${formatMoney(periodTotal.value / list.length)}`,
      detail: `${list.length} ${plural} no período`,
    },
    {
      key: 'best',
      label: `Melhor ${unidade}`,
      value: melhor.total > 0 ? `R$ ${formatMoney(melhor.total)}` : '—',
      detail: melhor.total > 0 ? longLabel(melhor.key) : 'sem venda no período',
    },
    {
      key: 'active',
      label: `${plural.charAt(0).toUpperCase()}${plural.slice(1)} com venda`,
      value: `${comVenda}`,
      detail: `de ${list.length}`,
    },
  ]
})

function y(value: number): number {
  if (axisMax.value <= 0) return HEIGHT
  return HEIGHT - (value / axisMax.value) * HEIGHT
}

function x(index: number): number {
  if (points.value.length <= 1) return 0
  return (index / (points.value.length - 1)) * WIDTH
}

const linePath = computed(() =>
  points.value
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${x(index)},${y(point.total)}`,
    )
    .join(' '),
)

const areaPath = computed(() => {
  if (points.value.length === 0) return ''
  return `${linePath.value} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`
})

/** `AAAA-MM-DD` → `21/07`; `AAAA-MM` → `jul/26`. */
function shortLabel(key: string): string {
  const parts = key.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`
  return `${MONTHS[Number(parts[1]) - 1]}/${parts[0].slice(2)}`
}

/** `AAAA-MM-DD` → `21 de julho`; `AAAA-MM` → `julho de 2026`. */
function longLabel(key: string): string {
  const parts = key.split('-')
  const nome = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ][Number(parts[1]) - 1]

  if (parts.length === 3) return `${Number(parts[2])} de ${nome}`
  return `${nome} de ${parts[0]}`
}

/**
 * Rótulos do eixo, distribuídos por igual do primeiro ao último ponto.
 *
 * A densidade é resolvida no CSS, e não medindo o container: geram-se até 12
 * marcações e metade delas some no celular, onde 12 não caberiam em 340px.
 * Pegar a largura real exigiria `ResizeObserver` para um ganho que a media
 * query já entrega.
 */
const axisLabels = computed(() => {
  const list = points.value
  const total = list.length
  if (total === 0) return []
  if (total === 1) {
    return [{ index: 0, label: shortLabel(list[0].key), left: 0, always: true }]
  }

  const wanted = Math.min(12, total)
  const seen = new Set<number>()

  return Array.from({ length: wanted }, (_, position) => ({
    position,
    index: Math.round((position * (total - 1)) / (wanted - 1)),
  }))
    .filter(({ index }) => {
      if (seen.has(index)) return false
      seen.add(index)
      return true
    })
    .map(({ position, index }) => ({
      index,
      label: shortLabel(list[index].key),
      left: (index / (total - 1)) * 100,
      always: position % 2 === 0,
    }))
})

const hoverIndex = ref<number | null>(null)

const hovered = computed(() =>
  hoverIndex.value === null ? null : (points.value[hoverIndex.value] ?? null),
)

const hoverLeft = computed(() => {
  if (hoverIndex.value === null || points.value.length <= 1) return 0
  return (hoverIndex.value / (points.value.length - 1)) * 100
})

function onMove(event: MouseEvent): void {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  if (rect.width === 0 || points.value.length === 0) return

  const ratio = (event.clientX - rect.left) / rect.width
  const index = Math.round(ratio * (points.value.length - 1))
  hoverIndex.value = Math.min(Math.max(index, 0), points.value.length - 1)
}
</script>

<template>
  <section
    class="flex h-full flex-col rounded-2xl border border-line-2 bg-background p-5 ui-shadow-soft"
  >
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2
          class="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          Faturamento
        </h2>
        <p
          v-if="status === 'ready'"
          class="mt-1 text-3xl font-bold tracking-tight tabular-nums text-foreground"
        >
          R$ {{ formatMoney(periodTotal) }}
        </p>
        <p class="mt-0.5 text-xs text-muted-foreground">
          <template v-if="status === 'ready'">
            vendas concluídas nos últimos
            {{ salesChartRangeLabels[range].toLowerCase() }}
          </template>
          <template v-else>Vendas concluídas no período</template>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Spinner v-if="status === 'loading' && chart" size="sm" />
        <div class="flex rounded-lg border border-line-2 p-0.5">
          <button
            v-for="option in ranges"
            :key="option"
            type="button"
            class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
            :class="
              option === range
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="emit('update:range', option)"
          >
            {{ salesChartRangeLabels[option] }}
          </button>
        </div>
      </div>
    </header>

    <Skeleton
      v-if="status === 'loading' && !chart"
      class="mt-5 h-64 w-full rounded-xl sm:h-72 xl:h-80"
    />

    <DashboardBlockError
      v-else-if="status === 'failed'"
      class="mt-5"
      label="o gráfico de faturamento"
      @retry="emit('retry')"
    />

    <div v-else-if="chart" class="mt-5 flex-1">
      <div class="flex gap-2">
        <!--
          Marcações do eixo em HTML, não em `<text>` do SVG: o traçado é
          esticado por `preserveAspectRatio="none"`, e um texto dentro dele
          sairia deformado junto.
        -->
        <div
          v-if="yTicks.length > 0"
          class="relative h-64 w-10 shrink-0 sm:h-72 sm:w-12 xl:h-80"
        >
          <span
            v-for="tick in yTicks"
            :key="`tick-${tick.value}`"
            class="absolute right-0 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground"
            :style="{ top: `${tick.top}%` }"
          >
            {{ tick.label }}
          </span>
        </div>

        <div class="min-w-0 flex-1">
          <div
            class="relative h-64 w-full sm:h-72 xl:h-80"
            @mousemove="onMove"
            @mouseleave="hoverIndex = null"
          >
            <svg
              class="h-full w-full overflow-visible"
              :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="dashboardSalesArea"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stop-color="var(--color-primary)"
                    stop-opacity="0.28"
                  />
                  <stop
                    offset="100%"
                    stop-color="var(--color-primary)"
                    stop-opacity="0"
                  />
                </linearGradient>
              </defs>

              <!-- Uma linha por marcação do eixo: a grade passa a ter significado -->
              <line
                v-for="tick in yTicks"
                :key="`grid-${tick.value}`"
                x1="0"
                :y1="(HEIGHT * tick.top) / 100"
                :x2="WIDTH"
                :y2="(HEIGHT * tick.top) / 100"
                stroke="var(--color-line-2)"
                stroke-width="1"
                :stroke-dasharray="tick.value === 0 ? undefined : '3 5'"
                vector-effect="non-scaling-stroke"
              />

              <path
                v-if="!isEmpty"
                :d="areaPath"
                fill="url(#dashboardSalesArea)"
              />
              <path
                :d="linePath"
                fill="none"
                :stroke="
                  isEmpty ? 'var(--color-line-3)' : 'var(--color-primary)'
                "
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
              />

              <line
                v-if="hovered && !isEmpty"
                :x1="x(hoverIndex ?? 0)"
                y1="0"
                :x2="x(hoverIndex ?? 0)"
                :y2="HEIGHT"
                stroke="var(--color-primary)"
                stroke-width="1"
                stroke-dasharray="4 4"
                vector-effect="non-scaling-stroke"
              />
            </svg>

            <span
              v-if="hovered && !isEmpty"
              class="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
              :style="{
                left: `${hoverLeft}%`,
                top: `${(y(hovered.total) / HEIGHT) * 100}%`,
              }"
            />

            <div
              v-if="hovered"
              class="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line-2 bg-background px-2.5 py-1.5 text-xs ui-shadow-soft"
              :style="{ left: `${Math.min(Math.max(hoverLeft, 8), 92)}%` }"
            >
              <p class="font-semibold text-foreground tabular-nums">
                R$ {{ formatMoney(hovered.total) }}
              </p>
              <p class="text-muted-foreground">
                {{ longLabel(hovered.key) }} ·
                {{ hovered.count }}
                {{ hovered.count === 1 ? 'venda' : 'vendas' }}
              </p>
            </div>

            <div
              v-if="isEmpty"
              class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center"
            >
              <Icon
                name="ChartColumn"
                size="md"
                class="text-muted-foreground"
              />
              <p class="text-xs text-muted-foreground">
                Nenhuma venda concluída neste período
              </p>
            </div>
          </div>

          <div class="relative mt-2 h-4">
            <span
              v-for="label in axisLabels"
              :key="`axis-${label.index}`"
              class="absolute -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground"
              :class="label.always ? '' : 'hidden sm:inline'"
              :style="{ left: `${Math.min(Math.max(label.left, 3), 97)}%` }"
            >
              {{ label.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Resumo do período: o gráfico diz como variou, isto diz quanto -->
      <dl
        v-if="periodStats.length > 0 && !isEmpty"
        class="mt-5 grid grid-cols-1 gap-3 border-t border-line-2 pt-4 sm:grid-cols-3"
      >
        <div v-for="stat in periodStats" :key="stat.key">
          <dt
            class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {{ stat.label }}
          </dt>
          <dd class="mt-1 text-base font-semibold tabular-nums text-foreground">
            {{ stat.value }}
          </dd>
          <dd class="text-xs text-muted-foreground">{{ stat.detail }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
