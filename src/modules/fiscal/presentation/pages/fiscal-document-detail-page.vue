<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Icon, Skeleton } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FiscalDocumentStatusBadge from '@/modules/fiscal/presentation/components/fiscal-document-status-badge.vue'
import { makeFiscalDocumentDetailController } from '@/modules/fiscal/factories/fiscal.factory'
import type { FiscalXmlType } from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import { fiscalDocumentModelLabels } from '@/enums/fiscal-document-model.enum'
import { fiscalEnvironmentLabels } from '@/enums/fiscal-environment.enum'
import { fiscalDocumentStatusLabels } from '@/enums/fiscal-document-status.enum'
import { formatDateTime } from '@/core/utils/date'
import { formatMoney, formatQuantity } from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'

const controller = makeFiscalDocumentDetailController()
const route = useRoute()

const document = computed(() => controller.document.value)

onMounted(() => controller.load(String(route.params.id)))

function goBack(): void {
  controller.router.push({ name: routeNames.FISCAL_DOCUMENTS })
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

      <!-- Fase B: cancelar, reprocessar, consultar SEFAZ, DANFE/QR Code -->
    </aside>
  </div>
</template>
