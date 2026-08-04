<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { motion } from 'motion-v'
import { DatePicker, Icon, Select, Skeleton } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import FiscalDocumentStatusBadge from '@/modules/fiscal/presentation/components/fiscal-document-status-badge.vue'
import { makeFiscalDocumentsListController } from '@/modules/fiscal/factories/fiscal.factory'
import type { FiscalDocument } from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import type { FiscalDocumentStatus } from '@/enums/fiscal-document-status.enum'
import { fiscalDocumentStatusOptions } from '@/enums/fiscal-document-status.enum'
import type { FiscalDocumentModel } from '@/enums/fiscal-document-model.enum'
import {
  fiscalDocumentModelLabels,
  fiscalDocumentModelOptions,
} from '@/enums/fiscal-document-model.enum'
import { formatDateTime } from '@/core/utils/date'
import { formatMoney } from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'
import { usePermissions } from '@/shared/composables'

const controller = makeFiscalDocumentsListController()
const { can } = usePermissions()

const canEmit = computed(() => can('fiscal.emit'))

/** Documentos em falha podem ser reprocessados direto da lista. */
function canRetry(document: FiscalDocument): boolean {
  return (
    canEmit.value &&
    (document.status === 'REJEITADO' || document.status === 'ERRO')
  )
}

function onRetry(document: FiscalDocument): void {
  void controller.retry(document)
}

const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: 'Todos os status' },
  ...fiscalDocumentStatusOptions,
])
const modeloOptions = computed<SelectOption[]>(() => [
  { value: '', label: 'Todos os modelos' },
  ...fiscalDocumentModelOptions,
])
const establishmentOptions = computed<SelectOption[]>(() => [
  { value: '', label: 'Todos os estabelecimentos' },
  ...controller.establishmentOptions.value,
])

onMounted(() => {
  controller.loadEstablishmentOptions()
  controller.loadList()
})

function goDetail(document: FiscalDocument): void {
  controller.router.push({
    name: routeNames.FISCAL_DOCUMENT_DETAIL,
    params: { id: document.id },
  })
}

function modeloLabel(modelo: FiscalDocumentModel): string {
  return fiscalDocumentModelLabels[modelo]
}
</script>

<template>
  <header class="mb-6">
    <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
      Documentos fiscais
    </h1>
    <p class="mt-1 text-sm text-muted-foreground">
      NF-e e NFC-e emitidas, com status de autorização e download dos XMLs.
    </p>
  </header>

  <!-- Filtros -->
  <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
    <Select
      :model-value="controller.statusFilter.value"
      :options="statusOptions"
      @update:model-value="
        controller.setStatus($event as FiscalDocumentStatus | '')
      "
    />
    <Select
      :model-value="controller.modeloFilter.value"
      :options="modeloOptions"
      @update:model-value="
        controller.setModelo($event as FiscalDocumentModel | '')
      "
    />
    <Select
      :model-value="controller.establishmentFilter.value"
      :options="establishmentOptions"
      @update:model-value="controller.setEstablishment($event as string)"
    />
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

  <!-- Skeleton -->
  <div v-if="!controller.loaded.value" class="space-y-2">
    <Skeleton v-for="n in 6" :key="`sk-${n}`" class="h-16 w-full rounded-xl" />
  </div>

  <!-- Vazio -->
  <div
    v-else-if="controller.documents.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="FileText" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhum documento fiscal
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      As notas emitidas a partir das vendas aparecem aqui.
    </p>
  </div>

  <!-- Lista -->
  <motion.div
    v-else
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
  >
    <div
      v-for="document in controller.documents.value"
      :key="document.id"
      role="button"
      tabindex="0"
      class="flex w-full cursor-pointer items-center gap-4 border-b border-line-2 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/40"
      @click="goDetail(document)"
      @keydown.enter="goDetail(document)"
      @keydown.space.prevent="goDetail(document)"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
      >
        <Icon name="FileText" size="sm" />
      </span>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="truncate font-medium text-foreground">
            Nº <span class="tabular-nums">{{ document.numero }}</span>
            <span class="text-muted-foreground">
              · Série <span class="tabular-nums">{{ document.serie }}</span>
            </span>
          </p>
          <FiscalDocumentStatusBadge :status="document.status" />
        </div>
        <p class="mt-0.5 truncate text-sm text-muted-foreground">
          {{ modeloLabel(document.modelo) }}
          <template v-if="document.establishment">
            · {{ document.establishment.name }}
          </template>
          · {{ formatDateTime(document.createdAt.toISOString()) }}
        </p>
      </div>

      <div class="hidden text-right sm:block">
        <p class="text-xs text-muted-foreground">Valor</p>
        <p class="font-medium tabular-nums text-foreground">
          <template v-if="document.valorTotal !== null">
            R$ {{ formatMoney(document.valorTotal) }}
          </template>
          <template v-else>—</template>
        </p>
      </div>

      <!-- Ação rápida: reprocessar rejeitados/erros -->
      <button
        v-if="canRetry(document)"
        type="button"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line-2 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        :disabled="controller.retryingId.value !== null"
        @click.stop="onRetry(document)"
      >
        <Icon
          name="RefreshCw"
          size="xs"
          :class="
            controller.retryingId.value === document.id
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

  <!-- Paginação -->
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
