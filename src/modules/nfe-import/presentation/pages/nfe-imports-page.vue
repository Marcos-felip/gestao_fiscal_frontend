<script setup lang="ts">
/**
 * Importação de nota de entrada.
 *
 * Existe porque a entrada de mercadoria era digitada à mão: a base tinha 0
 * compras e 34 movimentações de estoque sem documento nenhum. O XML do
 * fornecedor já traz fornecedor, itens, custos e duplicatas — redigitar isso era
 * mais caro que lançar o movimento cru, e por isso ninguém usava o módulo.
 */
import { computed, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, Skeleton } from '@/shared/ui'
import { makeNfeImportsListController } from '@/modules/nfe-import/factories/nfe-import.factory'
import type { NfeImport } from '@/modules/nfe-import/domain/entities/nfe-import.entity'
import { nfeImportStatusLabels } from '@/core/enums/nfe-import-status.enum'
import { usePermissions } from '@/shared/composables/usePermissions'
import { formatMoney } from '@/shared/ui/utils/masks'
import { formatDate } from '@/core/utils/date'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeNfeImportsListController()
const progress = useProgress()
const { can } = usePermissions()

const canImport = computed(() => can('purchases.import'))

const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

onMounted(() => progress.track(controller.loadList()))

function pickFile(): void {
  fileInput.value?.click()
}

async function send(file: File): Promise<void> {
  const id = await controller.importXml(file)
  if (id) {
    void controller.router.push({
      name: routeNames.NFE_IMPORT_DETAIL,
      params: { id },
    })
  }
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) void progress.track(send(file))
}

function onDrop(event: DragEvent): void {
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) void progress.track(send(file))
}

function openDetail(nfeImport: NfeImport): void {
  controller.router.push({
    name: routeNames.NFE_IMPORT_DETAIL,
    params: { id: nfeImport.id },
  })
}

function goPurchases(): void {
  controller.router.push({ name: routeNames.PURCHASES })
}

/** Cor da situação: pendente pede ação, importada já terminou. */
function statusClass(nfeImport: NfeImport): string {
  if (nfeImport.isImported) return 'bg-success-500/10 text-success-600'
  if (nfeImport.unmatchedCount > 0) return 'bg-warning-500/10 text-warning-700'
  return 'bg-primary/10 text-primary'
}
</script>

<template>
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1
        class="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        Importar nota de entrada
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        O XML do fornecedor vira uma compra em rascunho, com fornecedor, itens e
        parcelas já preenchidos.
      </p>
    </div>

    <Button variant="ghost" @click="goPurchases">
      <template #icon><Icon name="ShoppingCart" size="sm" /></template>
      Compras
    </Button>
  </header>

  <!--
    A área de envio fica acima da lista: a ação principal desta tela é trazer
    uma nota nova, não revisitar as antigas.
  -->
  <div
    v-if="canImport"
    :class="[
      'mb-6 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors',
      dragging
        ? 'border-primary bg-primary/5'
        : 'border-line-3 bg-background hover:border-primary/50',
    ]"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
    >
      <Icon name="FileUp" size="lg" />
    </span>

    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Arraste o XML da nota aqui
    </h2>
    <p class="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
      Envie o XML da NF-e recebido do fornecedor. A nota será importada como
      rascunho, sem movimentar o estoque, para que você possa conferir os
      produtos, valores e demais informações antes de confirmar a entrada.
    </p>

    <div class="mt-5">
      <Button
        variant="primary"
        text-class="text-white"
        :loading="controller.importing.value"
        loading-text="Lendo a nota…"
        @click="pickFile"
      >
        <template #icon><Icon name="Upload" size="sm" /></template>
        Escolher arquivo
      </Button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".xml,text/xml,application/xml"
      class="hidden"
      @change="onFileChange"
    />
  </div>

  <!-- Erro do backend exibido como veio: ele nomeia o que há de errado no arquivo -->
  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <div v-if="!controller.loaded.value" class="space-y-3">
    <div
      v-for="n in 3"
      :key="`sk-${n}`"
      class="ui-shadow-soft space-y-3 rounded-xl border border-line-2 bg-background p-4"
    >
      <Skeleton class="h-3.5 w-56 rounded" />
      <Skeleton class="h-3 w-40 rounded" />
    </div>
  </div>

  <div
    v-else-if="controller.imports.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-12 text-center"
  >
    <p class="text-sm text-muted-foreground">
      Nenhuma nota importada ainda.
    </p>
  </div>

  <motion.div
    v-else
    class="space-y-3"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <button
      v-for="nfeImport in controller.imports.value"
      :key="nfeImport.id"
      type="button"
      class="ui-shadow-soft block w-full rounded-xl border border-line-2 bg-background p-4 text-left transition-colors hover:border-primary/40"
      @click="openDetail(nfeImport)"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-medium text-foreground">
            {{ nfeImport.issuerName }}
          </p>
          <p class="mt-0.5 text-xs text-muted-foreground">
            NF-e {{ nfeImport.number }}/{{ nfeImport.series }} ·
            {{ formatDate(nfeImport.issuedAt.toISOString()) }} · R$
            {{ formatMoney(nfeImport.totalAmount) }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span
            :class="[
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
              statusClass(nfeImport),
            ]"
          >
            {{ nfeImportStatusLabels[nfeImport.status] }}
          </span>
          <Icon name="ChevronRight" size="sm" class="text-muted-foreground" />
        </div>
      </div>

      <p
        v-if="nfeImport.unmatchedCount > 0"
        class="mt-2 flex items-center gap-1.5 text-xs text-warning-700"
      >
        <Icon name="CircleAlert" size="xs" />
        {{ nfeImport.unmatchedCount }}
        {{ nfeImport.unmatchedCount === 1 ? 'item precisa' : 'itens precisam' }}
        ser apontados
      </p>
      <p
        v-else-if="nfeImport.purchaseNumber"
        class="mt-2 flex items-center gap-1.5 text-xs text-success-600"
      >
        <Icon name="CircleCheck" size="xs" />
        Compra #{{ nfeImport.purchaseNumber }} em rascunho
      </p>
    </button>
  </motion.div>
</template>
