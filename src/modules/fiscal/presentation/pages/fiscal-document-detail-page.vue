<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Icon, Skeleton } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FiscalDocumentStatusBadge from '@/modules/fiscal/presentation/components/fiscal-document-status-badge.vue'
import CancelFiscalDocumentDialog from '@/modules/fiscal/presentation/components/cancel-fiscal-document-dialog.vue'
import { makeFiscalDocumentDetailController } from '@/modules/fiscal/factories/fiscal.factory'
import type { FiscalXmlType } from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import { fiscalDocumentModelLabels } from '@/core/enums/fiscal-document-model.enum'
import { fiscalEnvironmentLabels } from '@/core/enums/fiscal-environment.enum'
import { fiscalDocumentStatusLabels } from '@/core/enums/fiscal-document-status.enum'
import { formatDateTime } from '@/core/utils/date'
import { formatMoney, formatQuantity } from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'
import { usePermissions } from '@/shared/composables'

const controller = makeFiscalDocumentDetailController()
const route = useRoute()
const { can } = usePermissions()

const document = computed(() => controller.document.value)

const canCancel = computed(() => can('fiscal.cancel'))
const canRead = computed(() => can('fiscal.read'))
const canEmit = computed(() => can('fiscal.emit'))

/** Cancelar só faz sentido para documento autorizado. */
const showCancel = computed(
  () => canCancel.value && document.value?.status === 'AUTORIZADO',
)
/** Reprocessar disponível para documentos em falha. */
const showRetry = computed(
  () =>
    canEmit.value &&
    (document.value?.status === 'REJEITADO' ||
      document.value?.status === 'ERRO'),
)
/** DANFE só quando autorizado e há URL de DANFE. */
const showDanfe = computed(
  () =>
    canRead.value &&
    document.value?.status === 'AUTORIZADO' &&
    Boolean(document.value?.danfeUrl),
)
const hasActions = computed(
  () => showCancel.value || canRead.value || showRetry.value,
)

const cancelOpen = ref(false)
const qrCopied = ref(false)

onMounted(() => controller.load(String(route.params.id)))
onUnmounted(() => controller.dispose())

function goBack(): void {
  controller.router.push({ name: routeNames.FISCAL_DOCUMENTS })
}

async function onCancelConfirm(justificativa: string): Promise<void> {
  const ok = await controller.cancel(justificativa)
  if (ok) cancelOpen.value = false
}

async function copyQrCode(): Promise<void> {
  const url = document.value?.qrCode
  if (!url) return
  try {
    await navigator.clipboard.writeText(url)
    qrCopied.value = true
    window.setTimeout(() => (qrCopied.value = false), 2000)
  } catch {
    qrCopied.value = false
  }
}

/** Documento em falha (rejeição/erro) — destaca o motivo. */
const hasRejection = computed(() => {
  const d = document.value
  return Boolean(
    d &&
    (d.status === 'REJEITADO' || d.status === 'ERRO') &&
    d.rejeicaoMensagem,
  )
})

const snapshotItems = computed(() => document.value?.snapshot?.items ?? [])
const snapshotPayments = computed(
  () => document.value?.snapshot?.payments ?? [],
)

/** Tipos de XML disponíveis para download (só os que existem). */
const xmlTypes: { tipo: FiscalXmlType; label: string; icon: string }[] = [
  { tipo: 'enviado', label: 'XML enviado', icon: 'FileUp' },
  { tipo: 'autorizado', label: 'XML autorizado', icon: 'FileCheck' },
  { tipo: 'cancelamento', label: 'XML de cancelamento', icon: 'FileX' },
]

const availableXmlTypes = computed(() =>
  document.value ? xmlTypes.filter((x) => document.value?.hasXml(x.tipo)) : [],
)

function fmtDate(value: Date | null): string {
  return value ? formatDateTime(value.toISOString()) : '—'
}

function ncmOf(item: { ncm?: string; ncm_code?: string }): string {
  return item.ncm ?? item.ncm_code ?? '—'
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <h1
        class="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        Documento fiscal
      </h1>
      <FiscalDocumentStatusBadge v-if="document" :status="document.status" />
    </div>
    <Button variant="ghost" @click="goBack">
      <template #icon><Icon name="ArrowLeft" size="sm" /></template>
      Voltar
    </Button>
  </header>

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
    class="grid grid-cols-1 gap-6 lg:grid-cols-3"
  >
    <Skeleton class="h-80 rounded-xl lg:col-span-2" />
    <Skeleton class="h-56 rounded-xl" />
  </div>

  <!-- Não encontrado -->
  <div
    v-else-if="!document"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center text-sm text-muted-foreground"
  >
    Documento fiscal não encontrado.
  </div>

  <!-- Conteúdo -->
  <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <!-- Principal -->
    <div class="space-y-6 lg:col-span-2">
      <!-- Rejeição / erro em destaque -->
      <div
        v-if="hasRejection"
        class="rounded-xl border border-error-500/30 bg-error-500/10 p-4"
      >
        <div class="flex items-center gap-2 text-error-600">
          <Icon name="TriangleAlert" size="sm" />
          <p class="text-sm font-semibold">
            {{
              document.rejeicaoCodigo
                ? `Rejeição ${document.rejeicaoCodigo}`
                : 'Falha na emissão'
            }}
          </p>
        </div>
        <p class="mt-1 text-sm text-foreground">
          {{ document.rejeicaoMensagem }}
        </p>
      </div>

      <!-- Itens do snapshot -->
      <FormSection
        icon="ShoppingBag"
        title="Itens"
        :description="
          snapshotItems.length
            ? `${snapshotItems.length} item(ns) na nota.`
            : 'Sem itens no snapshot.'
        "
      >
        <div v-if="snapshotItems.length" class="divide-y divide-line-2">
          <div
            v-for="(item, index) in snapshotItems"
            :key="`${item.productId}-${index}`"
            class="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-foreground">
                {{ item.name }}
              </p>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {{ formatQuantity(item.quantity) }} × R$
                {{ formatMoney(item.unitPrice) }}
                <span v-if="item.ncm || item.ncm_code">
                  · NCM {{ ncmOf(item) }}
                </span>
                <span v-if="item.cfop"> · CFOP {{ item.cfop }} </span>
              </p>
            </div>
            <span
              class="shrink-0 text-sm font-semibold tabular-nums text-foreground"
            >
              R$ {{ formatMoney(item.total) }}
            </span>
          </div>
        </div>
        <p v-else class="text-sm text-muted-foreground">
          Nenhum item registrado.
        </p>
      </FormSection>

      <!-- Pagamentos do snapshot -->
      <FormSection
        v-if="snapshotPayments.length"
        icon="CreditCard"
        title="Pagamentos"
        :description="`${snapshotPayments.length} forma(s) de pagamento.`"
      >
        <div class="divide-y divide-line-2">
          <div
            v-for="(payment, index) in snapshotPayments"
            :key="`pay-${index}`"
            class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <p class="text-sm text-foreground">
              {{ payment.method || 'Pagamento' }}
            </p>
            <span class="text-sm font-semibold tabular-nums text-foreground">
              R$ {{ formatMoney(payment.amount) }}
            </span>
          </div>
        </div>
      </FormSection>

      <!-- Histórico de status -->
      <FormSection
        v-if="document.statusHistory.length"
        icon="History"
        title="Histórico de status"
        :description="`${document.statusHistory.length} transição(ões).`"
      >
        <ol class="space-y-4">
          <li
            v-for="entry in document.statusHistory"
            :key="entry.id"
            class="flex gap-3"
          >
            <span
              class="mt-1 flex size-2 shrink-0 rounded-full bg-primary"
              aria-hidden="true"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm text-foreground">
                <span class="text-muted-foreground">
                  {{ fiscalDocumentStatusLabels[entry.statusFrom] }}
                </span>
                <Icon
                  name="ArrowRight"
                  size="xs"
                  class="mx-1 inline text-muted-foreground"
                />
                <span class="font-medium">
                  {{ fiscalDocumentStatusLabels[entry.statusTo] }}
                </span>
              </p>
              <p
                v-if="entry.motivo"
                class="mt-0.5 text-xs text-muted-foreground"
              >
                {{ entry.motivo }}
              </p>
              <p class="mt-0.5 text-xs text-muted-foreground/70">
                {{ formatDateTime(entry.createdAt.toISOString()) }}
              </p>
            </div>
          </li>
        </ol>
      </FormSection>

      <!-- Eventos técnicos -->
      <FormSection
        v-if="document.events.length"
        icon="Activity"
        title="Eventos"
        :description="`${document.events.length} evento(s) registrado(s).`"
      >
        <div class="divide-y divide-line-2">
          <div
            v-for="event in document.events"
            :key="event.id"
            class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <p class="text-sm font-medium text-foreground">{{ event.tipo }}</p>
            <span class="shrink-0 text-xs text-muted-foreground">
              {{ formatDateTime(event.createdAt.toISOString()) }}
            </span>
          </div>
        </div>
      </FormSection>
    </div>

    <!-- Lateral -->
    <aside class="space-y-6">
      <!-- Identificação -->
      <div class="rounded-xl border border-line-2 bg-background p-5">
        <div class="flex items-center gap-3">
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <Icon name="FileText" size="md" />
          </span>
          <div class="min-w-0">
            <p class="truncate font-semibold text-foreground">
              {{ fiscalDocumentModelLabels[document.modelo] }}
            </p>
            <p class="truncate text-sm text-muted-foreground">
              {{ document.establishment?.name ?? '—' }}
            </p>
          </div>
        </div>

        <dl class="mt-4 space-y-3 border-t border-line-2 pt-4 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Série / Número</dt>
            <dd class="font-medium tabular-nums text-foreground">
              {{ document.serie }} / {{ document.numero }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Ambiente</dt>
            <dd class="font-medium text-foreground">
              {{ fiscalEnvironmentLabels[document.ambiente] }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Valor total</dt>
            <dd class="font-medium tabular-nums text-foreground">
              <template v-if="document.valorTotal !== null">
                R$ {{ formatMoney(document.valorTotal) }}
              </template>
              <template v-else>—</template>
            </dd>
          </div>
          <div v-if="document.protocolo" class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Protocolo</dt>
            <dd class="font-medium tabular-nums text-foreground">
              {{ document.protocolo }}
            </dd>
          </div>
        </dl>

        <!-- Chave de acesso -->
        <div
          v-if="document.chaveAcesso"
          class="mt-4 border-t border-line-2 pt-4"
        >
          <p
            class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            Chave de acesso
          </p>
          <p class="mt-1 font-mono text-xs break-all text-foreground">
            {{ document.chaveAcesso }}
          </p>
        </div>
      </div>

      <!-- Datas -->
      <div class="rounded-xl border border-line-2 bg-background p-5">
        <p
          class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          Datas
        </p>
        <dl class="mt-3 space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Emissão</dt>
            <dd class="font-medium text-foreground">
              {{ fmtDate(document.dataEmissao) }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Autorização</dt>
            <dd class="font-medium text-foreground">
              {{ fmtDate(document.dataAutorizacao) }}
            </dd>
          </div>
          <div
            v-if="document.dataCancelamento"
            class="flex justify-between gap-4"
          >
            <dt class="text-muted-foreground">Cancelamento</dt>
            <dd class="font-medium text-foreground">
              {{ fmtDate(document.dataCancelamento) }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Criado em</dt>
            <dd class="font-medium text-foreground">
              {{ formatDateTime(document.createdAt.toISOString()) }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Download de XML -->
      <div
        v-if="availableXmlTypes.length"
        class="rounded-xl border border-line-2 bg-background p-5"
      >
        <p
          class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          Arquivos XML
        </p>
        <div class="mt-3 space-y-2">
          <button
            v-for="xml in availableXmlTypes"
            :key="xml.tipo"
            type="button"
            class="flex w-full items-center gap-2.5 rounded-lg border border-line-2 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            :disabled="controller.downloadingXml.value !== null"
            @click="controller.downloadXml(xml.tipo)"
          >
            <Icon
              :name="
                controller.downloadingXml.value === xml.tipo
                  ? 'LoaderCircle'
                  : xml.icon
              "
              size="sm"
              :class="
                controller.downloadingXml.value === xml.tipo
                  ? 'animate-spin text-primary'
                  : 'text-primary'
              "
            />
            <span class="flex-1 text-left">{{ xml.label }}</span>
            <Icon name="Download" size="sm" class="text-muted-foreground" />
          </button>
        </div>
      </div>

      <!-- QR Code (NFC-e) -->
      <div
        v-if="document.qrCode"
        class="rounded-xl border border-line-2 bg-background p-5"
      >
        <p
          class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          QR Code
        </p>
        <p class="mt-2 font-mono text-xs break-all text-foreground">
          {{ document.qrCode }}
        </p>
        <div class="mt-3 flex items-center gap-2">
          <a
            :href="document.qrCode"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Icon name="ExternalLink" size="sm" class="text-primary" />
            Abrir link
          </a>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            @click="copyQrCode"
          >
            <Icon
              :name="qrCopied ? 'Check' : 'Copy'"
              size="sm"
              :class="qrCopied ? 'text-success-600' : 'text-muted-foreground'"
            />
            {{ qrCopied ? 'Copiado' : 'Copiar' }}
          </button>
        </div>
      </div>

      <!-- Ações -->
      <div
        v-if="hasActions"
        class="rounded-xl border border-line-2 bg-background p-5"
      >
        <p
          class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          Ações
        </p>
        <div class="mt-3 space-y-2">
          <!-- Baixar DANFE -->
          <Button
            v-if="showDanfe"
            variant="primary"
            text-class="text-white"
            class="w-full justify-center"
            :loading="controller.downloadingDanfe.value"
            @click="controller.downloadDanfe()"
          >
            <template #icon><Icon name="Download" size="sm" /></template>
            Baixar DANFE
          </Button>

          <!-- Reprocessar -->
          <Button
            v-if="showRetry"
            variant="ghost"
            class="w-full justify-center"
            :loading="controller.retrying.value"
            @click="controller.retry()"
          >
            <template #icon><Icon name="RefreshCw" size="sm" /></template>
            Reprocessar
          </Button>

          <!-- Consultar situação -->
          <Button
            v-if="canRead"
            variant="ghost"
            class="w-full justify-center"
            :loading="controller.consulting.value"
            @click="controller.consult()"
          >
            <template #icon><Icon name="Search" size="sm" /></template>
            Consultar situação
          </Button>

          <!-- Cancelar -->
          <Button
            v-if="showCancel"
            variant="ghost"
            class="w-full justify-center text-error-600 hover:bg-error-500/10"
            :disabled="controller.cancelling.value"
            @click="cancelOpen = true"
          >
            <template #icon><Icon name="Ban" size="sm" /></template>
            Cancelar documento
          </Button>
        </div>

        <!-- Indicador de processamento (polling) -->
        <div
          v-if="controller.polling.value"
          class="mt-3 flex items-center gap-2 rounded-lg bg-warning-500/10 px-3 py-2 text-xs text-warning-700"
        >
          <Icon name="LoaderCircle" size="sm" class="animate-spin" />
          Acompanhando o processamento na SEFAZ…
        </div>
      </div>
    </aside>
  </div>

  <!-- Diálogo de cancelamento -->
  <CancelFiscalDocumentDialog
    v-model="cancelOpen"
    :loading="controller.cancelling.value"
    @confirm="onCancelConfirm"
  />
</template>
