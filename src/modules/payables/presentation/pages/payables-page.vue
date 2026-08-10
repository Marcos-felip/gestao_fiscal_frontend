<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, DatePicker, Icon, Select, Skeleton } from '@/shared/ui'
import PayableStatusBadge from '@/modules/payables/presentation/components/payable-status-badge.vue'
import CreatePayableDialog from '@/modules/payables/presentation/components/create-payable-dialog.vue'
import { makePayablesListController } from '@/modules/payables/factories/payables.factory'
import type { Payable } from '@/modules/payables/domain/entities/payable.entity'
import type { CreatePayableDto } from '@/modules/payables/domain/dto/create-payable-dto'
import { usePermissions } from '@/shared/composables/usePermissions'
import type { FinancialStatus } from '@/core/enums/financial-status.enum'
import { financialStatusOptions } from '@/core/enums/financial-status.enum'
import { formatMoney } from '@/shared/ui/utils/masks'
import { formatDate } from '@/core/utils/date'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makePayablesListController()
const progress = useProgress()
const { can } = usePermissions()

const canCreate = computed(() => can('payables.create'))
const canView = computed(() => can('payables.read'))

const statusValue = ref('')
const startValue = ref('')
const endValue = ref('')
const createOpen = ref(false)

const statusFilterOptions = [
  { value: '', label: 'Todos os status' },
  ...financialStatusOptions,
]

onMounted(() => progress.track(controller.loadList()))

function onStatus(value: string): void {
  statusValue.value = value
  void progress.track(controller.setStatus(value as FinancialStatus | ''))
}

function onStartDate(value: string): void {
  startValue.value = value
  void progress.track(controller.setDateRange(startValue.value, endValue.value))
}

function onEndDate(value: string): void {
  endValue.value = value
  void progress.track(controller.setDateRange(startValue.value, endValue.value))
}

function toggleOverdue(): void {
  void progress.track(controller.setOverdue(!controller.overdueOnly.value))
}

function goDetail(payable: Payable): void {
  if (!canView.value) return
  controller.router.push({
    name: routeNames.PAYABLE_DETAIL,
    params: { id: payable.id },
  })
}

async function onCreate(dto: CreatePayableDto): Promise<void> {
  const ok = await progress.track(controller.create(dto))
  if (ok) createOpen.value = false
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
        Contas a pagar
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Títulos gerados por compras a prazo e lançamentos avulsos.
      </p>
    </div>

    <Button
      v-if="canCreate"
      variant="primary"
      text-class="text-white"
      @click="createOpen = true"
    >
      <template #icon><Icon name="Plus" size="sm" /></template>
      Novo título
    </Button>
  </header>

  <!-- Toolbar: status + vencidos + intervalo -->
  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
    <div class="sm:w-48">
      <Select
        :model-value="statusValue"
        :options="statusFilterOptions"
        placeholder="Status"
        @update:model-value="onStatus"
      />
    </div>
    <button
      type="button"
      :class="[
        'inline-flex h-[46px] items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors',
        controller.overdueOnly.value
          ? 'border-error-500/40 bg-error-500/10 text-error-600'
          : 'border-line-2 text-muted-foreground hover:bg-muted hover:text-foreground',
      ]"
      @click="toggleOverdue"
    >
      <Icon name="CalendarClock" size="sm" />
      Só vencidos
    </button>
    <div class="sm:w-44">
      <DatePicker
        :model-value="startValue"
        :max="endValue || undefined"
        placeholder="De"
        @update:model-value="onStartDate"
      >
        <template #label>Vencimento de</template>
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
      <div class="flex-1 space-y-2">
        <Skeleton class="h-3.5 w-48 rounded" />
        <Skeleton class="h-3 w-24 rounded" />
      </div>
      <Skeleton class="h-5 w-20 rounded-full" />
      <Skeleton class="h-3 w-20 rounded" />
    </div>
  </div>

  <!-- Empty -->
  <div
    v-else-if="controller.payables.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="Wallet" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhum título encontrado
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Compras a prazo geram títulos aqui. Você também pode lançar um título
      avulso.
    </p>
    <div v-if="canCreate" class="mt-5">
      <Button variant="primary" text-class="text-white" @click="createOpen = true">
        <template #icon><Icon name="Plus" size="sm" /></template>
        Novo título
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
      <table class="w-full min-w-[760px] text-left text-sm">
        <thead
          class="border-b border-line-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          <tr>
            <th class="px-4 py-3 font-medium">Título</th>
            <th class="px-4 py-3 font-medium">Fornecedor</th>
            <th class="px-4 py-3 font-medium">Vencimento</th>
            <th class="px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3 text-right font-medium">Saldo</th>
            <th class="px-4 py-3 text-right font-medium">Valor</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line-2">
          <tr
            v-for="payable in controller.payables.value"
            :key="payable.id"
            class="cursor-pointer transition-colors hover:bg-muted/40"
            @click="goDetail(payable)"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-foreground">
                {{ payable.description }}
              </p>
              <p
                v-if="payable.installmentTotal > 1"
                class="text-xs text-muted-foreground"
              >
                Parcela {{ payable.installmentLabel }}
              </p>
            </td>
            <td class="px-4 py-3 text-foreground">
              {{ payable.supplierName ?? '—' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-muted-foreground">
              {{ formatDate(payable.dueDate) }}
            </td>
            <td class="px-4 py-3">
              <PayableStatusBadge
                :status="payable.status"
                :is-overdue="payable.isOverdue"
              />
            </td>
            <td
              class="px-4 py-3 text-right tabular-nums font-medium text-foreground"
            >
              R$ {{ formatMoney(payable.balance) }}
            </td>
            <td class="px-4 py-3 text-right tabular-nums text-muted-foreground">
              R$ {{ formatMoney(payable.amount) }}
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
        {{ controller.total.value === 1 ? 'título' : 'títulos' }}
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
          Página {{ controller.page.value }} de {{ controller.totalPages.value }}
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

  <!-- Novo título avulso -->
  <CreatePayableDialog
    v-model="createOpen"
    :loading="controller.saving.value"
    @confirm="onCreate"
  />
</template>
