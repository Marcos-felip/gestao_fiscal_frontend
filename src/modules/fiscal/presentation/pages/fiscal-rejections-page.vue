<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { motion } from 'motion-v'
import { DatePicker, Icon, Skeleton } from '@/shared/ui'
import FiscalDocumentStatusBadge from '@/modules/fiscal/presentation/components/fiscal-document-status-badge.vue'
import { makeFiscalRejectionsController } from '@/modules/fiscal/factories/fiscal.factory'
import type { FiscalRejectionItem } from '@/modules/fiscal/domain/responses/fiscal-rejection-item'
import { formatDateTime } from '@/core/utils/date'
import { formatMoney } from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'
import { usePermissions } from '@/shared/composables'

const controller = makeFiscalRejectionsController()
const { can } = usePermissions()

const canEmit = computed(() => can('fiscal.emit'))

function canRetry(item: FiscalRejectionItem): boolean {
  return canEmit.value && item.reprocessavel
}

function onRetry(item: FiscalRejectionItem): void {
  void controller.retry(item)
}

function goDetail(item: FiscalRejectionItem): void {
  controller.router.push({
    name: routeNames.FISCAL_DOCUMENT_DETAIL,
    params: { id: item.document.id },
  })
}

onMounted(() => {
  controller.loadList()
})
</script>

<template>
  <header class="mb-6">
    <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
      Central de rejeições
    </h1>
    <p class="mt-1 text-sm text-muted-foreground">
      Documentos fiscais rejeitados ou com erro, prontos para análise e
      reprocessamento.
    </p>
  </header>

  <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
    <DatePicker
      :model-value="controller.startDate.value"
      align="start"
      placeholder="De"
      @update:model-value="
        controller.setDateRange($event, controller.endDate.value)
      "
    />
    <DatePicker
      :model-value="controller.endDate.value"
      align="end"
      placeholder="Até"
      @update:model-value="
        controller.setDateRange(controller.startDate.value, $event)
      "
    />
  </div>

  <div v-if="controller.hasFilters.value" class="mb-4 flex justify-end">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border border-line-2 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
      @click="controller.clearFilters()"
    >
      <Icon name="FilterX" size="sm" />
      Limpar filtros
    </button>
  </div>

  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <div v-if="!controller.loaded.value" class="space-y-2">
    <Skeleton v-for="n in 6" :key="`sk-${n}`" class="h-16 w-full rounded-xl" />
  </div>

  <div
    v-else-if="controller.rejections.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="CircleCheck" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhuma rejeição
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Todos os documentos fiscais foram processados com sucesso.
    </p>
  </div>

  <motion.div
    v-else
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
  >
    <div
      v-for="item in controller.rejections.value"
      :key="item.document.id"
      role="button"
      tabindex="0"
      class="flex w-full cursor-pointer items-center gap-4 border-b border-line-2 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/40"
      @click="goDetail(item)"
      @keydown.enter="goDetail(item)"
      @keydown.space.prevent="goDetail(item)"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-error-500/10 text-error-600"
      >
        <Icon name="TriangleAlert" size="sm" />
      </span>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="truncate font-medium text-foreground">
            Nº <span class="tabular-nums">{{ item.document.numero }}</span>
            <span class="text-muted-foreground">
              · Série <span class="tabular-nums">{{ item.document.serie }}</span>
            </span>
          </p>
          <FiscalDocumentStatusBadge :status="item.document.status" />
        </div>
        <p class="mt-0.5 truncate text-sm text-muted-foreground">
          <template v-if="item.document.rejeicaoMensagem">
            {{ item.document.rejeicaoMensagem }}
          </template>
          <template v-else>
            {{ formatDateTime(item.document.createdAt.toISOString()) }}
          </template>
        </p>
        <p
          v-if="item.ultimaTentativa"
          class="mt-0.5 text-xs text-muted-foreground"
        >
          Última tentativa:
          {{ formatDateTime(item.ultimaTentativa.data) }}
          <span v-if="item.ultimaTentativa.motivo">
            · {{ item.ultimaTentativa.motivo }}
          </span>
        </p>
      </div>

      <div class="hidden text-right sm:block">
        <p class="text-xs text-muted-foreground">Valor</p>
        <p class="font-medium tabular-nums text-foreground">
          <template v-if="item.document.valorTotal !== null">
            R$ {{ formatMoney(item.document.valorTotal) }}
          </template>
          <template v-else>—</template>
        </p>
      </div>

      <button
        v-if="canRetry(item)"
        type="button"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line-2 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        :disabled="controller.retryingId.value !== null"
        @click.stop="onRetry(item)"
      >
        <Icon
          name="RefreshCw"
          size="xs"
          :class="
            controller.retryingId.value === item.document.id
              ? 'animate-spin text-primary'
              : 'text-primary'
          "
        />
        Reprocessar
      </button>

      <Icon
        name="ChevronRight"
        size="sm"
        class="shrink-0 text-muted-foreground"
      />
    </div>
  </motion.div>

  <div
    v-if="controller.loaded.value && controller.totalPages.value > 1"
    class="mt-4 flex items-center justify-between gap-4"
  >
    <p class="text-sm text-muted-foreground">
      Página {{ controller.page.value }} de {{ controller.totalPages.value }}
      <span class="text-muted-foreground/70">
        · {{ controller.total.value }} documento(s)
      </span>
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
        :disabled="!controller.hasNext.value"
        @click="controller.goToPage(controller.page.value + 1)"
      >
        <Icon name="ChevronRight" size="sm" />
      </button>
    </div>
  </div>
</template>
