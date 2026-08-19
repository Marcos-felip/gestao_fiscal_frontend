<script setup lang="ts">
/**
 * O que está acabando.
 *
 * A lista é uma amostra dos mais críticos, não o catálogo: o cartão existe para
 * disparar uma ação, e quem quer conferir tudo vai para a tela de produtos.
 */
import { computed } from 'vue'
import DashboardPanelCard from './dashboard-panel-card.vue'
import DashboardPanelLink from './dashboard-panel-link.vue'
import type { PanelBadge, PanelTone } from './dashboard-panel-card.vue'
import type { DashboardStockAlerts } from '@/modules/dashboard/domain/responses/dashboard-stock-alerts'
import type { BlockStatus } from '@/modules/dashboard/presentation/controllers/dashboard-controller'
import { formatQuantity } from '@/shared/ui/utils/masks'

const props = defineProps<{
  stock: DashboardStockAlerts | null
  status: BlockStatus
}>()
defineEmits<{ retry: []; open: [] }>()

/**
 * Zerados e "no mínimo" são grupos disjuntos no backend — quem está no mínimo
 * ainda tem saldo. Por isso a soma é o total de produtos que pedem reposição,
 * sem contar ninguém duas vezes.
 */
const total = computed(
  () => (props.stock?.outOfStock ?? 0) + (props.stock?.belowMinimum ?? 0),
)

const tone = computed<PanelTone>(() => {
  if ((props.stock?.outOfStock ?? 0) > 0) return 'danger'
  if ((props.stock?.belowMinimum ?? 0) > 0) return 'warning'
  return 'success'
})

const badge = computed<PanelBadge | null>(() => {
  if (!props.stock) return null
  if (total.value === 0) return { label: 'Em dia', tone: 'success' }
  if (props.stock.outOfStock > 0)
    return { label: 'Repor agora', tone: 'danger' }
  return { label: 'Atenção', tone: 'warning' }
})

const headline = computed(() => {
  const stock = props.stock
  if (!stock) return { value: '', support: '' }

  if (total.value === 0) {
    return { value: '—', support: 'nenhum produto zerado ou no mínimo' }
  }

  const partes: string[] = []
  if (stock.outOfStock > 0) {
    partes.push(
      `${stock.outOfStock} ${stock.outOfStock === 1 ? 'zerado' : 'zerados'}`,
    )
  }
  if (stock.belowMinimum > 0) partes.push(`${stock.belowMinimum} no mínimo`)

  return {
    value: String(total.value),
    support: `${total.value === 1 ? 'produto precisa' : 'produtos precisam'} de reposição · ${partes.join(' · ')}`,
  }
})
</script>

<template>
  <DashboardPanelCard
    label="Estoque"
    icon="Boxes"
    error-label="os alertas de estoque"
    :state="status"
    :badge="badge"
    :value="headline.value"
    :support="headline.support"
    :value-tone="tone"
    @retry="$emit('retry')"
  >
    <template v-if="stock && stock.items.length > 0" #detail>
      <ul class="divide-y divide-line-2">
        <li
          v-for="item in stock.items"
          :key="item.id"
          class="flex items-center justify-between gap-3 py-2.5"
        >
          <span class="min-w-0 truncate text-sm text-foreground">
            {{ item.name }}
          </span>
          <span
            class="shrink-0 text-sm font-semibold tabular-nums"
            :class="item.currentStock <= 0 ? 'text-error' : 'text-warning-700'"
          >
            {{ formatQuantity(item.currentStock) }} {{ item.unit }}
          </span>
        </li>
      </ul>
    </template>

    <template #footer>
      <DashboardPanelLink @click="$emit('open')">
        Ver produtos
      </DashboardPanelLink>
    </template>
  </DashboardPanelCard>
</template>
