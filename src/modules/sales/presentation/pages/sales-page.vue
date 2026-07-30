<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, DatePicker, Icon, Select, Skeleton } from '@/shared/ui'
import SaleStatusBadge from '@/modules/sales/presentation/components/sale-status-badge.vue'
import { makeSalesListController } from '@/modules/sales/factories/sales.factory'
import type { Sale } from '@/modules/sales/domain/entities/sale.entity'
import { usePermissions } from '@/shared/composables/usePermissions'
import type { SaleStatus } from '@/enums/sale-status.enum'
import { saleStatusOptions } from '@/enums/sale-status.enum'
import { formatMoney } from '@/shared/ui/utils/masks'
import { formatDate } from '@/core/utils/date'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeSalesListController()
const progress = useProgress()
const { can } = usePermissions()

const canCreate = computed(() => can('sales.create'))
const canView = computed(() => can('sales.read'))

const statusValue = ref('')
const startValue = ref('')
const endValue = ref('')

const statusFilterOptions = [
  { value: '', label: 'Todos os status' },
  ...saleStatusOptions,
]

onMounted(() => progress.track(controller.loadList()))

function onStatus(value: string): void {
  statusValue.value = value
  void progress.track(controller.setStatus(value as SaleStatus | ''))
}

function onStartDate(value: string): void {
  startValue.value = value
  void progress.track(controller.setDateRange(startValue.value, endValue.value))
}

function onEndDate(value: string): void {
  endValue.value = value
  void progress.track(controller.setDateRange(startValue.value, endValue.value))
}

function goNew(): void {
  controller.router.push({ name: routeNames.PDV })
}

function goDetail(sale: Sale): void {
  controller.router.push({
    name: routeNames.SALE_DETAIL,
    params: { id: sale.id },
  })
}

function prevPage(): void {
  void progress.track(controller.goToPage(controller.page.value - 1))
}

function nextPage(): void {
  void progress.track(controller.goToPage(controller.page.value + 1))
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1
        class="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        Vendas
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Vendas de balcão, orçamentos e histórico do PDV.
      </p>
    </div>

    <Button
      v-if="canCreate"
      variant="primary"
      text-class="text-white"
      @click="goNew"
    >
      <template #icon><Icon name="Plus" size="sm" /></template>
      Nova venda
    </Button>
  </header>

  <!-- Toolbar: status + intervalo de datas -->
  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
    <div class="sm:w-48">
      <Select
        :model-value="statusValue"
        :options="statusFilterOptions"
        placeholder="Status"
        @update:model-value="onStatus"
      />
    </div>
    <div class="sm:w-44">
      <DatePicker
        :model-value="startValue"
        :max="endValue || undefined"
        placeholder="De"
        @update:model-value="onStartDate"
      >
        <template #label>De</template>
      </DatePicker>
    </div>
    <div class="sm:w-44">
      <DatePicker
        :model-value="endValue"
        :min="startValue || undefined"
        placeholder="Até"
        align="end"
        @update:model-value="onEndDate"
      >
        <template #label>Até</template>
      </DatePicker>
    </div>
  </div>

  <!-- Erro -->
  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <!-- Skeleton -->
  <div
    v-if="!controller.loaded.value"
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
  >
    <div
      v-for="n in 6"
      :key="`sk-${n}`"
      class="flex items-center gap-4 border-b border-line-2 px-4 py-3 last:border-b-0"
    >
      <Skeleton class="h-4 w-10 rounded" />
      <div class="flex-1 space-y-2">
        <Skeleton class="h-3.5 w-40 rounded" />
        <Skeleton class="h-3 w-24 rounded" />
      </div>
      <Skeleton class="h-5 w-20 rounded-full" />
      <Skeleton class="h-3 w-20 rounded" />
    </div>
  </div>

  <!-- Empty -->
  <div
    v-else-if="controller.sales.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="ShoppingBag" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhuma venda encontrada
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Abra o PDV para registrar a primeira venda de balcão.
    </p>
    <div v-if="canCreate" class="mt-5">
      <Button variant="primary" text-class="text-white" @click="goNew">
        <template #icon><Icon name="Plus" size="sm" /></template>
        Nova venda
      </Button>
    </div>
  </div>

  <!-- Tabela -->
  <motion.div
    v-else
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead
          class="border-b border-line-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          <tr>
            <th class="px-4 py-3 font-medium">Nº</th>
            <th class="px-4 py-3 font-medium">Cliente</th>
            <th class="px-4 py-3 font-medium">Data</th>
            <th class="px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3 text-right font-medium">Total</th>
            <th class="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line-2">
          <tr
            v-for="sale in controller.sales.value"
            :key="sale.id"
            class="cursor-pointer transition-colors hover:bg-muted/40"
            @click="canView && goDetail(sale)"
          >
            <td class="px-4 py-3 font-medium tabular-nums text-foreground">
              #{{ sale.saleNumber }}
            </td>
            <td class="px-4 py-3 text-foreground">
              {{ sale.customerName ?? 'Consumidor final' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-muted-foreground">
              {{ formatDate(sale.saleDate) }}
            </td>
            <td class="px-4 py-3">
              <SaleStatusBadge :status="sale.status" />
            </td>
            <td
              class="px-4 py-3 text-right tabular-nums font-medium text-foreground"
            >
              R$ {{ formatMoney(sale.totalAmount) }}
            </td>
            <td class="px-4 py-3" @click.stop>
              <div class="flex items-center justify-end gap-1">
                <button
                  v-if="canView"
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Ver detalhes"
                  @click="goDetail(sale)"
                >
                  <Icon name="Eye" size="sm" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div
      class="flex items-center justify-between gap-4 border-t border-line-2 px-4 py-3"
    >
      <p class="text-sm text-muted-foreground">
        {{ controller.total.value }}
        {{ controller.total.value === 1 ? 'venda' : 'vendas' }}
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="controller.page.value <= 1"
          title="Página anterior"
          @click="prevPage"
        >
          <Icon name="ChevronLeft" size="sm" />
        </button>
        <span class="text-sm tabular-nums text-muted-foreground">
          Página {{ controller.page.value }} de
          {{ controller.totalPages.value }}
        </span>
        <button
          type="button"
          class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="controller.page.value >= controller.totalPages.value"
          title="Próxima página"
          @click="nextPage"
        >
          <Icon name="ChevronRight" size="sm" />
        </button>
      </div>
    </div>
  </motion.div>
</template>
