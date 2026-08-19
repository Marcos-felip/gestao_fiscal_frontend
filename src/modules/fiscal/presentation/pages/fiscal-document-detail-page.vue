<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Icon, Skeleton } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FiscalDocumentStatusBadge from '@/modules/fiscal/presentation/components/fiscal-document-status-badge.vue'
import CancelFiscalDocumentDialog from '@/modules/fiscal/presentation/components/cancel-fiscal-document-dialog.vue'
import CorrectionLetterDialog from '@/modules/fiscal/presentation/components/correction-letter-dialog.vue'
import CorrectionLettersSection from '@/modules/fiscal/presentation/components/correction-letters-section.vue'
import type { FiscalCorrectionLetter } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'
import {
  makeCorrectionLettersController,
  makeFiscalDocumentDetailController,
} from '@/modules/fiscal/factories/fiscal.factory'
import type { FiscalXmlType } from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import { fiscalDocumentModelLabels } from '@/core/enums/fiscal-document-model.enum'
import { fiscalEnvironmentLabels } from '@/core/enums/fiscal-environment.enum'
import { fiscalDocumentStatusLabels } from '@/core/enums/fiscal-document-status.enum'
import {
  fiscalPaymentCodeLabels,
  type FiscalPaymentCode,
} from '@/core/enums/fiscal-payment-code.enum'
import type { FiscalSnapshotItem } from '@/modules/fiscal/domain/value-objects/fiscal-snapshot'
import { formatDateTime } from '@/core/utils/date'
import { formatMoney, formatQuantity } from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'
import { usePermissions } from '@/shared/composables'

const controller = makeFiscalDocumentDetailController()
const lettersController = makeCorrectionLettersController()
const route = useRoute()
const { can } = usePermissions()

const document = computed(() => controller.document.value)

const canCancel = computed(() => can('fiscal.cancel'))
const canRead = computed(() => can('fiscal.read'))
const canEmit = computed(() => can('fiscal.emit'))
const canCce = computed(() => can('fiscal.cce'))

/** Cancelar só faz sentido para documento autorizado. */
const showCancel = computed(
  () => canCancel.value && document.value?.status === 'AUTORIZADO',
)
/** Corrigir também: nota rejeitada ou cancelada não se corrige, se reemite. */
const showCorrectionLetter = computed(
  () => canCce.value && document.value?.status === 'AUTORIZADO',
)
/** Última condição de uso lida — vem do servidor, não de constante local. */
const lastUsageCondition = computed(
  () =>
    lettersController.letters.value.at(-1)?.condicaoDeUso ?? null,
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
const correctionOpen = ref(false)
const qrCopied = ref(false)

onMounted(() => {
  const id = String(route.params.id)
  void controller.load(id)
  // Só quem lê o documento lê as correções — as duas usam `fiscal.read`.
  if (canRead.value) void lettersController.load(id)
})
onUnmounted(() => controller.dispose())

function goBack(): void {
  controller.router.push({ name: routeNames.FISCAL_DOCUMENTS })
}

async function onCancelConfirm(justificativa: string): Promise<void> {
  const ok = await controller.cancel(justificativa)
  if (ok) cancelOpen.value = false
}

async function onCorrectionConfirm(correcao: string): Promise<void> {
  const ok = await lettersController.create(correcao)
  if (ok) correctionOpen.value = false
}

function onDownloadLetterXml(letter: FiscalCorrectionLetter): void {
  void lettersController.downloadXml(
    letter,
    document.value?.chaveAcesso ?? undefined,
  )
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

const snapshotItems = computed(() => document.value?.snapshot?.itens ?? [])
const snapshotPayments = computed(
  () => document.value?.snapshot?.pagamentos ?? [],
)
const snapshotNfe = computed(() => document.value?.snapshot?.nfe ?? null)
const snapshotTotals = computed(() => document.value?.snapshot?.totais ?? null)
const snapshotReceipt = computed(
  () => document.value?.snapshot?.recebimento ?? null,
)

const FINALIDADES: Record<number, string> = {
  1: 'Normal',
  2: 'Complementar',
  3: 'Ajuste',
  4: 'Devolução',
}

const purposeLabel = computed(() =>
  snapshotNfe.value
    ? (FINALIDADES[snapshotNfe.value.finalidade] ??
      String(snapshotNfe.value.finalidade))
    : '',
)

const INDICADORES_IE: Record<number, string> = {
  1: 'Contribuinte de ICMS',
  2: 'Isento de inscrição estadual',
  9: 'Não contribuinte',
}

/**
 * Destinatário exibido, venha ele do bloco da NF-e (completo e obrigatório) ou
 * do da NFC-e (opcional, só quando o consumidor se identificou).
 */
const recipient = computed(() => {
  const snapshot = document.value?.snapshot
  if (!snapshot) return null

  const nfe = snapshot.destinatarioNfe
  if (nfe) {
    return {
      description: 'Identificado na nota.',
      name: nfe.nome,
      cpfCnpj: nfe.cpfCnpj,
      address: `${nfe.logradouro}, ${nfe.numero} — ${nfe.bairro}, ${nfe.municipio}/${nfe.uf}`,
      indicadorIe: INDICADORES_IE[nfe.indicadorIe] ?? String(nfe.indicadorIe),
      inscricaoEstadual: nfe.inscricaoEstadual ?? null,
    }
  }

  const nfce = snapshot.destinatario
  if (!nfce) return null

  const address =
    nfce.logradouro && nfce.municipio
      ? `${nfce.logradouro}, ${nfce.numero ?? 's/n'} — ${nfce.municipio}/${nfce.uf ?? ''}`
      : null

  return {
    description: 'Consumidor identificado na venda.',
    name: nfce.nome ?? null,
    cpfCnpj: nfce.cpfCnpj ?? null,
    address,
    indicadorIe: null,
    inscricaoEstadual: null,
  }
})

const displayedTotals = computed(() => {
  const totais = snapshotTotals.value
  if (!totais) return []

  return [
    { label: 'Produtos', value: totais.vProd },
    { label: 'Base do ICMS', value: totais.vBC },
    { label: 'ICMS', value: totais.vICMS },
    { label: 'ICMS ST', value: totais.vST },
    { label: 'PIS', value: totais.vPIS },
    { label: 'COFINS', value: totais.vCOFINS },
    { label: 'Total da nota', value: totais.vNF },
  ]
})

/** Situação tributária do item, que é o que o contador procura primeiro. */
function itemTaxStatus(item: FiscalSnapshotItem): string {
  const icms = item.imposto?.icms
  if (!icms) return ''
  return `CSOSN/CST ${icms.situacao} · origem ${icms.origem}`
}

function paymentMethodLabel(tipo: string): string {
  return fiscalPaymentCodeLabels[tipo as FiscalPaymentCode] ?? tipo
}

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

      <!-- Snapshot ilegível: dizer, em vez de mostrar nota sem itens -->
      <div
        v-if="document.snapshotIlegivel"
        class="flex items-start gap-2 rounded-xl border border-warning-500/30 bg-warning-500/10 px-4 py-3 text-sm text-warning-700"
      >
        <Icon name="TriangleAlert" size="sm" class="mt-0.5 shrink-0" />
        <span>
          Não foi possível ler o retrato desta nota — o formato guardado não é
          reconhecido por esta versão do sistema. Os dados enviados à SEFAZ estão
          no XML, que continua disponível para download.
        </span>
      </div>

      <!-- Operação: o cabeçalho que só a NF-e tem -->
      <FormSection
        v-if="snapshotNfe"
        icon="FileSignature"
        title="Operação"
        description="Cabeçalho declarado na emissão da NF-e."
      >
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs text-muted-foreground">Natureza da operação</dt>
            <dd class="text-sm text-foreground">
              {{ snapshotNfe.naturezaOperacao }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-muted-foreground">Tipo</dt>
            <dd class="text-sm text-foreground">
              {{ snapshotNfe.tipoOperacao === 0 ? 'Entrada' : 'Saída' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-muted-foreground">Finalidade</dt>
            <dd class="text-sm text-foreground">{{ purposeLabel }}</dd>
          </div>
          <div>
            <dt class="text-xs text-muted-foreground">Destino da mercadoria</dt>
            <dd class="text-sm text-foreground">
              {{
                snapshotNfe.consumidorFinal
                  ? 'Consumo ou uso do destinatário'
                  : 'Revenda'
              }}
            </dd>
          </div>
        </dl>
      </FormSection>

      <!-- Destinatário: obrigatório na NF-e, opcional na NFC-e -->
      <FormSection
        v-if="recipient"
        icon="UserRound"
        title="Destinatário"
        :description="recipient.description"
      >
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div v-if="recipient.name">
            <dt class="text-xs text-muted-foreground">Nome</dt>
            <dd class="text-sm text-foreground">{{ recipient.name }}</dd>
          </div>
          <div v-if="recipient.cpfCnpj">
            <dt class="text-xs text-muted-foreground">CNPJ / CPF</dt>
            <dd class="text-sm tabular-nums text-foreground">
              {{ recipient.cpfCnpj }}
            </dd>
          </div>
          <div v-if="recipient.address" class="sm:col-span-2">
            <dt class="text-xs text-muted-foreground">Endereço</dt>
            <dd class="text-sm text-foreground">
              {{ recipient.address }}
            </dd>
          </div>
          <div v-if="recipient.indicadorIe">
            <dt class="text-xs text-muted-foreground">
              Indicador de inscrição estadual
            </dt>
            <dd class="text-sm text-foreground">
              {{ recipient.indicadorIe }}
            </dd>
          </div>
          <div v-if="recipient.inscricaoEstadual">
            <dt class="text-xs text-muted-foreground">Inscrição estadual</dt>
            <dd class="text-sm tabular-nums text-foreground">
              {{ recipient.inscricaoEstadual }}
            </dd>
          </div>
        </dl>
      </FormSection>

      <!-- Itens do snapshot -->
      <FormSection
        icon="ShoppingBag"
        title="Itens"
        :description="
          snapshotItems.length
            ? `${snapshotItems.length} item(ns) na nota.`
            : 'Sem itens no retrato da emissão.'
        "
      >
        <div v-if="snapshotItems.length" class="divide-y divide-line-2">
          <div
            v-for="item in snapshotItems"
            :key="`${item.codigoProduto}-${item.numeroItem}`"
            class="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-foreground">
                {{ item.descricao }}
              </p>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {{ formatQuantity(item.quantidade) }} {{ item.unidadeComercial }}
                × R$ {{ formatMoney(item.valorUnitario) }}
                <span> · NCM {{ item.ncm }}</span>
                <span> · CFOP {{ item.cfop }}</span>
                <span v-if="item.imposto">
                  · {{ itemTaxStatus(item) }}
                </span>
              </p>
            </div>
            <span
              class="shrink-0 text-sm font-semibold tabular-nums text-foreground"
            >
              R$ {{ formatMoney(item.quantidade * item.valorUnitario) }}
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
              {{ paymentMethodLabel(payment.tipo) }}
            </p>
            <span class="text-sm font-semibold tabular-nums text-foreground">
              R$ {{ formatMoney(payment.valor) }}
            </span>
          </div>
        </div>

        <p
          v-if="snapshotReceipt"
          class="mt-3 border-t border-line-2 pt-3 text-xs text-muted-foreground"
        >
          Recebido R$ {{ formatMoney(snapshotReceipt.valorRecebido) }} ·
          troco R$ {{ formatMoney(snapshotReceipt.troco) }}
        </p>
      </FormSection>

      <!-- Totais fiscais: o que o contador confere -->
      <FormSection
        v-if="snapshotTotals"
        icon="Calculator"
        title="Totais fiscais"
        description="Somados dos itens no momento da emissão."
      >
        <dl class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div v-for="total in displayedTotals" :key="total.label">
            <dt class="text-xs text-muted-foreground">{{ total.label }}</dt>
            <dd class="text-sm font-medium tabular-nums text-foreground">
              R$ {{ formatMoney(total.value) }}
            </dd>
          </div>
        </dl>
      </FormSection>

      <!-- Transporte e cobrança: presentes só quando informados -->
      <FormSection
        v-if="snapshotNfe?.transporte || snapshotNfe?.cobranca"
        icon="Truck"
        title="Transporte e cobrança"
        description="Grupos informados na emissão."
      >
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div v-if="snapshotNfe?.transporte?.transportadora?.nome">
            <dt class="text-xs text-muted-foreground">Transportadora</dt>
            <dd class="text-sm text-foreground">
              {{ snapshotNfe.transporte.transportadora.nome }}
            </dd>
          </div>
          <div v-if="snapshotNfe?.transporte?.volumes?.length">
            <dt class="text-xs text-muted-foreground">Volumes</dt>
            <dd class="text-sm text-foreground">
              {{ snapshotNfe.transporte.volumes.length }}
            </dd>
          </div>
          <div v-if="snapshotNfe?.cobranca?.duplicatas?.length">
            <dt class="text-xs text-muted-foreground">Duplicatas</dt>
            <dd class="text-sm text-foreground">
              {{ snapshotNfe.cobranca.duplicatas.length }}
            </dd>
          </div>
        </dl>
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

      <!-- Cartas de correção — some quando não há nenhuma -->
      <CorrectionLettersSection
        :letters="lettersController.letters.value"
        :downloading-sequencia="lettersController.downloadingSequencia.value"
        @download="onDownloadLetterXml"
      />

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
      <div class="ui-shadow-soft rounded-xl border border-line-2 bg-background p-5">
        <div class="flex items-center gap-3">
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 not-even:text-white"
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
      <div class="ui-shadow-soft rounded-xl border border-line-2 bg-background p-5">
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
        class="ui-shadow-soft rounded-xl border border-line-2 bg-background p-5"
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
        class="ui-shadow-soft rounded-xl border border-line-2 bg-background p-5"
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
        class="ui-shadow-soft rounded-xl border border-line-2 bg-background p-5"
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

          <!-- Carta de correção -->
          <Button
            v-if="showCorrectionLetter"
            variant="ghost"
            class="w-full justify-center"
            :disabled="lettersController.creating.value"
            @click="correctionOpen = true"
          >
            <template #icon><Icon name="PenLine" size="sm" /></template>
            Carta de correção
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

  <!-- Diálogo da carta de correção -->
  <CorrectionLetterDialog
    v-model="correctionOpen"
    :loading="lettersController.creating.value"
    :restantes="lettersController.restantes.value"
    :condicao-de-uso="lastUsageCondition"
    @confirm="onCorrectionConfirm"
  />
</template>
