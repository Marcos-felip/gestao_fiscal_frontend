<script setup lang="ts">
/**
 * Tela de início.
 *
 * Sete blocos independentes, carregados em paralelo: um financeiro lento não
 * segura o faturamento do dia, e o bloco que falha mostra o próprio erro sem
 * derrubar os outros.
 *
 * A tela **não pede** o que o usuário não pode ver — o gating usa a mesma
 * permissão que cada endpoint exige, então falta de acesso vira ausência do
 * cartão, e não mensagem de erro.
 */
import { onMounted } from 'vue'
import { Button, Icon } from '@/shared/ui'
import DashboardGreeting from '@/modules/dashboard/presentation/components/dashboard-greeting.vue'
import DashboardStats from '@/modules/dashboard/presentation/components/dashboard-stats.vue'
import DashboardSalesChart from '@/modules/dashboard/presentation/components/dashboard-sales-chart.vue'
import DashboardCashCard from '@/modules/dashboard/presentation/components/dashboard-cash-card.vue'
import DashboardFiscalCard from '@/modules/dashboard/presentation/components/dashboard-fiscal-card.vue'
import DashboardStockCard from '@/modules/dashboard/presentation/components/dashboard-stock-card.vue'
import DashboardEmptyState from '@/modules/dashboard/presentation/components/dashboard-empty-state.vue'
import { makeDashboardController } from '@/modules/dashboard/factories/dashboard.factory'
import type { DashboardBlock } from '@/modules/dashboard/presentation/controllers/dashboard-controller'
import type { SalesChartRange } from '@/core/enums/sales-chart-range.enum'
import type { RouteName } from '@/router/route-names'
import { routeNames } from '@/router/route-names'

const controller = makeDashboardController()

onMounted(() => {
  void controller.load()
})

function retry(block: DashboardBlock): void {
  void controller.retry(block)
}

function changeRange(range: SalesChartRange): void {
  void controller.setChartRange(range)
}

function go(name: RouteName): void {
  void controller.router.push({ name })
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <DashboardGreeting />

      <Button
        variant="ghost"
        size="sm"
        :loading="controller.isLoadingAny.value"
        @click="controller.load()"
      >
        <template #icon><Icon name="RefreshCw" size="sm" /></template>
        Atualizar
      </Button>
    </div>

    <DashboardEmptyState v-if="controller.isFresh.value" @go="go" />

    <template v-else>
      <DashboardStats
        :sales="controller.sales.value"
        :sales-status="controller.statusOf('sales')"
        :receivables="controller.receivables.value"
        :receivables-status="controller.statusOf('receivables')"
        :payables="controller.payables.value"
        :payables-status="controller.statusOf('payables')"
        @retry="retry"
      />

      <!--
        O gráfico ocupa a linha inteira e os cartões vêm numa linha própria.

        Lado a lado, o card do gráfico esticava para acompanhar a altura da
        coluna de três cartões empilhados e sobrava um vão enorme embaixo do
        traçado — o gráfico tem altura própria, e altura de card não se resolve
        esticando conteúdo.
      -->
      <DashboardSalesChart
        v-if="controller.isVisible('chart')"
        :chart="controller.chart.value"
        :status="controller.statusOf('chart')"
        :range="controller.chartRange.value"
        @retry="retry('chart')"
        @update:range="changeRange"
      />

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCashCard
          v-if="controller.isVisible('cash')"
          :cash="controller.cash.value"
          :status="controller.statusOf('cash')"
          @retry="retry('cash')"
          @open="go(routeNames.CASH_SESSIONS)"
        />

        <DashboardFiscalCard
          v-if="controller.isVisible('fiscal')"
          :fiscal="controller.fiscal.value"
          :status="controller.statusOf('fiscal')"
          @retry="retry('fiscal')"
          @open="go(routeNames.FISCAL_DOCUMENTS)"
        />

        <DashboardStockCard
          v-if="controller.isVisible('stock')"
          :stock="controller.stock.value"
          :status="controller.statusOf('stock')"
          @retry="retry('stock')"
          @open="go(routeNames.PRODUCTS)"
        />
      </div>
    </template>
  </div>
</template>
