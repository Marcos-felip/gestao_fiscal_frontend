<script setup lang="ts">
/**
 * A fileira de indicadores do topo.
 *
 * Os quatro cartões vêm de **três** blocos independentes (vendas, a receber, a
 * pagar): cada um aparece, some ou falha sozinho, e a grade se reorganiza sem
 * deixar buraco quando falta permissão.
 */
import { computed } from 'vue'
import { motion } from 'motion-v'
import DashboardStatCard from './dashboard-stat-card.vue'
import DashboardCardSkeleton from './dashboard-card-skeleton.vue'
import DashboardBlockError from './dashboard-block-error.vue'
import type { DashboardSales } from '@/modules/dashboard/domain/responses/dashboard-sales'
import type { DashboardFinancial } from '@/modules/dashboard/domain/responses/dashboard-financial'
import type {
  BlockStatus,
  DashboardBlock,
} from '@/modules/dashboard/presentation/controllers/dashboard-controller'
import { formatMoney } from '@/shared/ui/utils/masks'

const props = defineProps<{
  sales: DashboardSales | null
  salesStatus: BlockStatus
  receivables: DashboardFinancial | null
  receivablesStatus: BlockStatus
  payables: DashboardFinancial | null
  payablesStatus: BlockStatus
}>()

defineEmits<{ retry: [block: DashboardBlock] }>()

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`

const today = computed(() => props.sales?.today ?? null)
const yesterday = computed(() => props.sales?.yesterday ?? null)

const todayTone = computed(() => {
  const atual = today.value?.total ?? 0
  const anterior = yesterday.value?.total ?? 0
  return anterior > 0 && atual >= anterior ? 'success' : 'default'
})

const todayHint = computed(() => {
  if (!today.value || !yesterday.value) return ''
  const vendas = plural(today.value.count, 'venda', 'vendas')
  return `${vendas} · ontem ${formatMoney(yesterday.value.total)}`
})

const monthHint = computed(() => {
  if (!props.sales) return ''
  const { count, averageTicket } = props.sales.month
  if (count === 0) return 'Nenhuma venda concluída no mês'
  return `${plural(count, 'venda', 'vendas')} · ticket médio ${formatMoney(averageTicket)}`
})

function financialCard(
  data: DashboardFinancial | null,
  overdueLabel: string,
  openLabel: string,
) {
  if (!data) return null

  if (data.overdue.count > 0) {
    return {
      label: overdueLabel,
      value: `R$ ${formatMoney(data.overdue.total)}`,
      tone: 'danger' as const,
      hint: `${plural(data.overdue.count, 'título', 'títulos')} · ${formatMoney(data.open.total)} em aberto`,
    }
  }

  const vencendo = data.dueToday.total + data.dueNext7Days.total
  return {
    label: openLabel,
    value: `R$ ${formatMoney(data.open.total)}`,
    tone: vencendo > 0 ? ('warning' as const) : ('default' as const),
    hint:
      data.open.count === 0
        ? 'Nenhum título em aberto'
        : `hoje ${formatMoney(data.dueToday.total)} · 7 dias ${formatMoney(data.dueNext7Days.total)}`,
  }
}

const receivableCard = computed(() =>
  financialCard(props.receivables, 'A receber vencido', 'A receber'),
)
const payableCard = computed(() =>
  financialCard(props.payables, 'A pagar vencido', 'A pagar'),
)

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
}
</script>

<template>
  <motion.section
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    :variants="container"
    initial="hidden"
    animate="visible"
  >
    <template v-if="salesStatus !== 'hidden'">
      <template v-if="salesStatus === 'loading'">
        <DashboardCardSkeleton v-for="n in 2" :key="`sk-sales-${n}`" />
      </template>

      <template v-else-if="salesStatus === 'failed'">
        <DashboardBlockError
          class="sm:col-span-2"
          label="o faturamento"
          @retry="$emit('retry', 'sales')"
        />
      </template>

      <template v-else-if="sales">
        <motion.div :variants="item">
          <DashboardStatCard
            label="Vendas de hoje"
            :value="`R$ ${formatMoney(sales.today.total)}`"
            :hint="todayHint"
            :tone="todayTone"
            icon="TrendingUp"
          />
        </motion.div>

        <motion.div :variants="item">
          <DashboardStatCard
            label="Faturamento do mês"
            :value="`R$ ${formatMoney(sales.month.total)}`"
            :hint="monthHint"
            icon="Receipt"
          >
            <template #hint>
              <p class="mt-1 text-xs text-muted-foreground">
                mês passado fechou em
                {{ formatMoney(sales.previousMonth.total) }}
              </p>
            </template>
          </DashboardStatCard>
        </motion.div>
      </template>
    </template>

    <template v-if="receivablesStatus !== 'hidden'">
      <DashboardCardSkeleton v-if="receivablesStatus === 'loading'" />

      <DashboardBlockError
        v-else-if="receivablesStatus === 'failed'"
        label="o contas a receber"
        @retry="$emit('retry', 'receivables')"
      />

      <motion.div v-else-if="receivableCard" :variants="item">
        <DashboardStatCard
          :label="receivableCard.label"
          :value="receivableCard.value"
          :hint="receivableCard.hint"
          :tone="receivableCard.tone"
          icon="ArrowDownLeft"
        />
      </motion.div>
    </template>

    <template v-if="payablesStatus !== 'hidden'">
      <DashboardCardSkeleton v-if="payablesStatus === 'loading'" />

      <DashboardBlockError
        v-else-if="payablesStatus === 'failed'"
        label="o contas a pagar"
        @retry="$emit('retry', 'payables')"
      />

      <motion.div v-else-if="payableCard" :variants="item">
        <DashboardStatCard
          :label="payableCard.label"
          :value="payableCard.value"
          :hint="payableCard.hint"
          :tone="payableCard.tone"
          icon="ArrowUpRight"
        />
      </motion.div>
    </template>
  </motion.section>
</template>
