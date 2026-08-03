<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { motion } from 'motion-v'
import { DatePicker, Icon, Select, Skeleton } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import CashSessionStatusBadge from '@/modules/cash/presentation/components/cash-session-status-badge.vue'
import { makeCashSessionsListController } from '@/modules/cash/factories/cash.factory'
import type { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'
import type { CashSessionStatus } from '@/enums/cash-session-status.enum'
import { cashSessionStatusOptions } from '@/enums/cash-session-status.enum'
import { formatDateTime } from '@/core/utils/date'
import { formatMoney } from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'

const controller = makeCashSessionsListController()

const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: 'Todos os status' },
  ...cashSessionStatusOptions,
])
const registerOptions = computed<SelectOption[]>(() => [
  { value: '', label: 'Todos os caixas' },
  ...controller.registerOptions.value,
])

onMounted(() => {
  controller.loadRegisterOptions()
  controller.loadList()
})

function goDetail(session: CashSession): void {
  controller.router.push({
    name: routeNames.CASH_SESSION_DETAIL,
    params: { id: session.id },
  })
}

function differenceTone(session: CashSession): string {
  if (session.isShort) return 'bg-error-500/10 text-error-600'
  if (session.isSurplus) return 'bg-warning-500/10 text-warning-600'
  return 'bg-success-500/10 text-success-600'
}
</script>

<template>
  <header class="mb-6">
    <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
      Sessões de caixa
    </h1>
    <p class="mt-1 text-sm text-muted-foreground">
      Histórico de aberturas e fechamentos, com conferência e quebras.
    </p>
  </header>

  <!-- Filtros -->
  <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <Select
      :model-value="controller.statusFilter.value"
      :options="statusOptions"
      @update:model-value="controller.setStatus($event as CashSessionStatus | '')"
    />
    <Select
      :model-value="controller.registerFilter.value"
      :options="registerOptions"
      @update:model-value="controller.setRegister($event as string)"
    />
    <DatePicker
      :model-value="controller.startDate.value"
      align="start"
      placeholder="De"
      @update:model-value="controller.setDateRange($event, controller.endDate.value)"
    />
    <DatePicker
      :model-value="controller.endDate.value"
      align="end"
      placeholder="Até"
      @update:model-value="controller.setDateRange(controller.startDate.value, $event)"
    />
  </div>

  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <!-- Skeleton -->
  <div v-if="!controller.loaded.value" class="space-y-2">
    <Skeleton v-for="n in 6" :key="`sk-${n}`" class="h-16 w-full rounded-xl" />
  </div>

  <!-- Vazio -->
  <div
    v-else-if="controller.sessions.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="Archive" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhuma sessão encontrada
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      As sessões abertas no PDV aparecem aqui.
    </p>
  </div>

  <!-- Lista -->
  <motion.div
    v-else
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
  >
    <button
      v-for="session in controller.sessions.value"
      :key="session.id"
      type="button"
      class="flex w-full items-center gap-4 border-b border-line-2 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/40"
      @click="goDetail(session)"
    >
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="truncate font-medium text-foreground">
            {{ session.cashRegisterName ?? 'Caixa' }}
          </p>
          <CashSessionStatusBadge :status="session.status" />
        </div>
        <p class="truncate text-sm text-muted-foreground">
          {{ session.operatorName ?? 'Operador' }} ·
          {{ formatDateTime(session.openedAt) }}
        </p>
      </div>

      <div class="hidden text-right sm:block">
        <p class="text-xs text-muted-foreground">Fundo</p>
        <p class="font-medium tabular-nums text-foreground">
          R$ {{ formatMoney(session.openingAmount) }}
        </p>
      </div>

      <span
        v-if="session.difference !== null"
        :class="[
          'hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex',
          differenceTone(session),
        ]"
      >
        <Icon name="Scale" size="sm" />
        R$ {{ formatMoney(session.difference) }}
      </span>

      <Icon name="ChevronRight" size="sm" class="shrink-0 text-muted-foreground" />
    </button>
  </motion.div>

  <!-- Paginação -->
  <div
    v-if="controller.loaded.value && controller.totalPages.value > 1"
    class="mt-4 flex items-center justify-between gap-4"
  >
    <p class="text-sm text-muted-foreground">
      Página {{ controller.page.value }} de {{ controller.totalPages.value }}
    </p>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="rounded-lg border border-line-2 p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
        :disabled="controller.page.value <= 1"
        @click="controller.goToPage(controller.page.value - 1)"
      >
        <Icon name="ChevronLeft" size="sm" />
      </button>
      <button
        type="button"
        class="rounded-lg border border-line-2 p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
        :disabled="controller.page.value >= controller.totalPages.value"
        @click="controller.goToPage(controller.page.value + 1)"
      >
        <Icon name="ChevronRight" size="sm" />
      </button>
    </div>
  </div>
</template>
