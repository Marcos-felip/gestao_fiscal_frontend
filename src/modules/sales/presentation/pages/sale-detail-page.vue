<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'motion-v'
import { Button, Icon, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import FormSection from '@/shared/components/form/form-section.vue'
import SaleStatusBadge from '@/modules/sales/presentation/components/sale-status-badge.vue'
import SaleFiscalStatusBadge from '@/modules/fiscal/presentation/components/sale-fiscal-status-badge.vue'
import FiscalDocumentStatusBadge from '@/modules/fiscal/presentation/components/fiscal-document-status-badge.vue'
import EmitNfeDialog from '@/modules/fiscal/presentation/components/emit-nfe-dialog.vue'
import SalePaymentDialog from '@/modules/sales/presentation/components/sale-payment-dialog.vue'
import { makeSaleDetailController } from '@/modules/sales/factories/sales.factory'
import { makeSaleFiscalController } from '@/modules/fiscal/factories/fiscal.factory'
import type { CreateSalePaymentInput } from '@/modules/sales/domain/dto/create-sale-dto'
import { usePermissions } from '@/shared/composables/usePermissions'
import { PaymentStatus, paymentStatusLabels } from '@/core/enums/payment-status.enum'
import { paymentMethodLabels } from '@/core/enums/payment-method.enum'
import { PaymentCondition } from '@/core/enums/payment-condition.enum'
import { unitOfMeasureShortLabels } from '@/core/enums/unit-of-measure.enum'
import { fiscalDocumentModelLabels } from '@/core/enums/fiscal-document-model.enum'
import { formatMoney, formatQuantity } from '@/shared/ui/utils/masks'
import { formatDate } from '@/core/utils/date'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const route = useRoute()
const controller = makeSaleDetailController()
const fiscalController = makeSaleFiscalController()
const progress = useProgress()
const { can } = usePermissions()

const canConfirm = computed(() => can('sales.confirm'))
const canCancel = computed(() => can('sales.cancel'))
const canDelete = computed(() => can('sales.delete'))
const canReadFiscal = computed(() => can('fiscal.read'))
const canEmitFiscal = computed(() => can('fiscal.emit'))
const canEmitNfe = computed(() => can('fiscal.nfe.emit'))

/** Documento fiscal vinculado (após carregar). */
const fiscalDocument = computed(() => fiscalController.document.value)

/** Rejeição/erro do documento — destaca código + mensagem. */
const fiscalRejection = computed(() => {
  const doc = fiscalDocument.value
  if (!doc) return null
  if (doc.status !== 'REJEITADO' && doc.status !== 'ERRO') return null
  return {
    code: doc.rejeicaoCodigo,
    message: doc.rejeicaoMensagem ?? 'Falha na emissão do documento fiscal.',
  }
})

/** Oferece emissão manual (fallback) só quando cabe e há permissão. */
const showEmitButton = computed(
  () =>
    canEmitFiscal.value &&
    Boolean(controller.sale.value?.canEmitFiscal) &&
    !fiscalController.hasDocument.value,
)

/**
 * NF-e só faz sentido com cliente identificado — ela exige destinatário. Se o
 * cadastro estiver incompleto, quem diz é o backend, nomeando o campo: repetir
 * a regra aqui criaria uma segunda fonte para divergir da primeira.
 */
const showEmitNfeButton = computed(
  () =>
    canEmitNfe.value &&
    Boolean(controller.sale.value?.canEmitFiscal) &&
    Boolean(controller.sale.value?.customerId) &&
    !fiscalController.hasDocument.value,
)

const paymentChip = computed(() => {
  const status = controller.sale.value?.paymentStatus
  if (!status) return null
  const tones: Record<string, string> = {
    [PaymentStatus.PENDENTE]: 'bg-warning-500/10 text-warning-600',
    [PaymentStatus.APROVADO]: 'bg-success-500/10 text-success-600',
    [PaymentStatus.RECUSADO]: 'bg-error-500/10 text-error-600',
    [PaymentStatus.ESTORNADO]: 'bg-muted text-muted-foreground',
  }
  return {
    label: paymentStatusLabels[status] ?? status,
    tone: tones[status] ?? 'bg-muted text-muted-foreground',
  }
})

const paymentMethodLabel = computed(() => {
  const method = controller.sale.value?.paymentMethod
  return method ? (paymentMethodLabels[method] ?? method) : null
})

/** Orçamento à vista: finalizar abre o checkout (formas + troco). */
const isCash = computed(
  () => controller.sale.value?.paymentCondition === PaymentCondition.A_VISTA,
)

type PendingAction = 'confirm' | 'cancel' | 'delete'
const pendingAction = ref<PendingAction | null>(null)
const dialogOpen = ref(false)
const paymentDialogOpen = ref(false)
const emitDialogOpen = ref(false)
const emitNfeDialogOpen = ref(false)

const dialogConfig = computed(() => {
  switch (pendingAction.value) {
    case 'confirm':
      return {
        title: 'Finalizar venda',
        description:
          'Finalizar dará baixa no estoque e gerará os títulos a receber das parcelas. Deseja continuar?',
        label: 'Finalizar',
        variant: 'primary' as const,
        icon: 'CircleCheck',
      }
    case 'cancel':
      return {
        title: 'Cancelar venda',
        description: controller.isCompleted.value
          ? 'Cancelar esta venda estornará o estoque (entrada de devolução). Deseja continuar?'
          : 'Deseja cancelar esta venda?',
        label: 'Cancelar venda',
        variant: 'destructive' as const,
        icon: 'Ban',
      }
    default:
      return {
        title: 'Excluir venda',
        description:
          'Excluir permanentemente esta venda? Não pode ser desfeito.',
        label: 'Excluir',
        variant: 'destructive' as const,
        icon: 'Trash2',
      }
  }
})

onMounted(() => {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  if (!id) return
  progress.track(controller.load(id))
  // O status fiscal só é lido por quem tem permissão (evita 403 do getBySale).
  if (canReadFiscal.value) void fiscalController.load(id)
})

onUnmounted(() => fiscalController.dispose())

function goFiscalDocument(): void {
  const doc = fiscalDocument.value
  if (!doc) return
  controller.router.push({
    name: routeNames.FISCAL_DOCUMENT_DETAIL,
    params: { id: doc.id },
  })
}

async function onEmitConfirm(): Promise<void> {
  const sale = controller.sale.value
  if (!sale) return
  await fiscalController.emit(sale.id, sale.establishmentId)
  emitDialogOpen.value = false
}

async function onEmitNfeConfirm(dados: {
  consumidorFinal: boolean
  naturezaOperacao?: string
}): Promise<void> {
  const sale = controller.sale.value
  if (!sale) return
  await fiscalController.emitNfe(sale.id, dados, sale.establishmentId)
  emitNfeDialogOpen.value = false
}

function ask(action: PendingAction): void {
  // Finalizar à vista → checkout de pagamento; a prazo → confirmação simples.
  if (action === 'confirm' && isCash.value) {
    paymentDialogOpen.value = true
    return
  }
  pendingAction.value = action
  dialogOpen.value = true
}

async function onDialogConfirm(): Promise<void> {
  const action = pendingAction.value
  if (action === 'confirm') await progress.track(controller.confirm())
  else if (action === 'cancel') await progress.track(controller.cancel())
  else if (action === 'delete') await progress.track(controller.remove())
  dialogOpen.value = false
  pendingAction.value = null
}

async function onPaymentsConfirm(
  payments: CreateSalePaymentInput[],
): Promise<void> {
  await progress.track(controller.confirm(payments))
  paymentDialogOpen.value = false
}

function goBack(): void {
  controller.router.push({ name: routeNames.SALES })
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <h1
        class="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        Venda
        <span v-if="controller.sale.value">
          #{{ controller.sale.value.saleNumber }}
        </span>
      </h1>
      <SaleStatusBadge
        v-if="controller.sale.value"
        :status="controller.sale.value.status"
      />
      <span
        v-if="paymentChip"
        :class="[
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          paymentChip.tone,
        ]"
      >
        {{ paymentChip.label }}
      </span>
      <SaleFiscalStatusBadge
        v-if="controller.sale.value"
        :status="controller.sale.value.fiscalStatus"
      />
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
    <div
      class="rounded-xl border border-line-2 bg-background p-6 lg:col-span-2"
    >
      <Skeleton class="h-5 w-40 rounded" />
      <div class="mt-6 space-y-3">
        <Skeleton v-for="n in 3" :key="n" class="h-10 w-full rounded" />
      </div>
    </div>
    <div class="rounded-xl border border-line-2 bg-background p-6">
      <Skeleton class="h-5 w-32 rounded" />
      <div class="mt-6 space-y-3">
        <Skeleton v-for="n in 4" :key="n" class="h-8 w-full rounded" />
      </div>
    </div>
  </div>

  <!-- Conteúdo -->
  <motion.div
    v-else-if="controller.sale.value"
    class="grid grid-cols-1 gap-6 lg:grid-cols-3"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <!-- Coluna: itens -->
    <div class="min-w-0 lg:col-span-2">
      <FormSection
        icon="Package"
        title="Itens"
        description="Produtos incluídos nesta venda."
      >
        <div class="overflow-x-auto">
          <table class="w-full min-w-[480px] text-left text-sm">
            <thead
              class="border-b border-line-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              <tr>
                <th class="py-2 pr-4 font-medium">Produto</th>
                <th class="px-4 py-2 text-right font-medium">Qtd.</th>
                <th class="px-4 py-2 text-right font-medium">Preço un.</th>
                <th class="py-2 pl-4 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line-2">
              <tr v-for="line in controller.sale.value.items" :key="line.id">
                <td class="py-3 pr-4">
                  <p class="font-medium text-foreground">
                    {{ line.productName ?? 'Produto' }}
                  </p>
                  <p
                    v-if="line.productUnit"
                    class="text-xs text-muted-foreground"
                  >
                    {{
                      unitOfMeasureShortLabels[line.productUnit] ??
                      line.productUnit
                    }}
                  </p>
                </td>
                <td
                  class="px-4 py-3 text-right tabular-nums text-muted-foreground"
                >
                  {{ formatQuantity(line.quantity) }}
                </td>
                <td
                  class="px-4 py-3 text-right tabular-nums text-muted-foreground"
                >
                  R$ {{ formatMoney(line.unitPrice) }}
                </td>
                <td
                  class="py-3 pl-4 text-right tabular-nums font-medium text-foreground"
                >
                  R$ {{ formatMoney(line.total) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  colspan="3"
                  class="py-2 pr-4 text-right text-sm text-muted-foreground"
                >
                  Subtotal
                </td>
                <td class="py-2 pl-4 text-right tabular-nums text-foreground">
                  R$ {{ formatMoney(controller.sale.value.subtotal) }}
                </td>
              </tr>
              <tr v-if="controller.sale.value.discount > 0">
                <td
                  colspan="3"
                  class="py-2 pr-4 text-right text-sm text-muted-foreground"
                >
                  Desconto
                </td>
                <td class="py-2 pl-4 text-right tabular-nums text-error-600">
                  – R$ {{ formatMoney(controller.sale.value.discount) }}
                </td>
              </tr>
              <tr class="border-t border-line-2">
                <td
                  colspan="3"
                  class="py-3 pr-4 text-right text-sm text-muted-foreground"
                >
                  Total da venda
                </td>
                <td class="py-3 pl-4 text-right">
                  <span
                    class="font-display text-lg font-bold tabular-nums text-foreground"
                  >
                    R$ {{ formatMoney(controller.sale.value.totalAmount) }}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </FormSection>
    </div>

    <!-- Coluna: dados + ações -->
    <div class="min-w-0 space-y-6">
      <FormSection
        icon="ReceiptText"
        title="Dados"
        description="Informações da venda."
      >
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Cliente</dt>
            <dd class="text-right font-medium text-foreground">
              {{ controller.sale.value.customerName ?? 'Consumidor final' }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Estabelecimento</dt>
            <dd class="text-right font-medium text-foreground">
              {{ controller.sale.value.establishmentName ?? '—' }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Data</dt>
            <dd class="text-right font-medium text-foreground">
              {{ formatDate(controller.sale.value.saleDate) }}
            </dd>
          </div>
          <div v-if="paymentMethodLabel" class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Pagamento</dt>
            <dd class="text-right font-medium text-foreground">
              {{ paymentMethodLabel }}
            </dd>
          </div>
          <div
            v-if="controller.sale.value.notes"
            class="border-t border-line-2 pt-3"
          >
            <dt class="mb-1 text-muted-foreground">Observações</dt>
            <dd class="text-foreground">
              {{ controller.sale.value.notes }}
            </dd>
          </div>
        </dl>
      </FormSection>

      <!-- Formas de pagamento (venda à vista) -->
      <FormSection
        v-if="controller.sale.value.payments.length > 0"
        icon="Wallet"
        title="Pagamento"
        description="Formas usadas nesta venda."
      >
        <ul class="space-y-2 text-sm">
          <li
            v-for="pay in controller.sale.value.payments"
            :key="pay.id"
            class="flex items-center justify-between gap-4"
          >
            <span class="text-muted-foreground">
              {{ paymentMethodLabels[pay.method] ?? pay.method }}
            </span>
            <span class="text-right">
              <span class="font-medium tabular-nums text-foreground">
                R$ {{ formatMoney(pay.amount) }}
              </span>
              <span
                v-if="pay.changeGiven"
                class="ml-2 text-xs text-success-600"
              >
                troco R$ {{ formatMoney(pay.changeGiven) }}
              </span>
            </span>
          </li>
        </ul>
      </FormSection>

      <!-- Situação fiscal (NFC-e) -->
      <FormSection
        v-if="canReadFiscal"
        icon="FileText"
        title="Fiscal"
        description="Status da NFC-e desta venda."
      >
        <div class="space-y-4">
          <!-- Status resumido da venda -->
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm text-muted-foreground">Status fiscal</span>
            <SaleFiscalStatusBadge
              :status="controller.sale.value.fiscalStatus"
            />
          </div>

          <!-- Indicador de processamento -->
          <div
            v-if="fiscalController.isProcessing.value"
            class="flex items-center gap-2 rounded-lg bg-warning-500/10 px-3 py-2 text-sm text-warning-700"
          >
            <Icon name="LoaderCircle" size="sm" class="animate-spin" />
            <span>Processando na SEFAZ…</span>
          </div>

          <!-- Documento fiscal vinculado -->
          <div
            v-if="fiscalDocument"
            class="space-y-3 border-t border-line-2 pt-3"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-muted-foreground">Documento</span>
              <FiscalDocumentStatusBadge :status="fiscalDocument.status" />
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-muted-foreground">Modelo</span>
              <span class="text-sm font-medium text-foreground">
                {{ fiscalDocumentModelLabels[fiscalDocument.modelo] }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-muted-foreground">Série / Número</span>
              <span class="text-sm font-medium tabular-nums text-foreground">
                {{ fiscalDocument.serie }} / {{ fiscalDocument.numero }}
              </span>
            </div>

            <!-- Rejeição / erro em destaque -->
            <div
              v-if="fiscalRejection"
              class="rounded-lg border border-error-500/30 bg-error-500/10 p-3"
            >
              <div class="flex items-center gap-2 text-error-600">
                <Icon name="TriangleAlert" size="sm" />
                <p class="text-sm font-semibold">
                  {{
                    fiscalRejection.code
                      ? `Rejeição ${fiscalRejection.code}`
                      : 'Falha na emissão'
                  }}
                </p>
              </div>
              <p class="mt-1 text-sm text-foreground">
                {{ fiscalRejection.message }}
              </p>
            </div>

            <Button variant="secondary" full-width @click="goFiscalDocument">
              <template #icon><Icon name="FileText" size="sm" /></template>
              Ver documento fiscal
            </Button>
          </div>

          <!-- Emissão manual (fallback) -->
          <div v-if="showEmitButton" class="border-t border-line-2 pt-3">
            <p class="mb-2 text-xs text-muted-foreground">
              A NFC-e desta venda ainda não foi emitida. Emita manualmente se
              necessário.
            </p>
            <Button
              variant="primary"
              text-class="text-white"
              full-width
              :loading="fiscalController.emitting.value"
              loading-text="Emitindo…"
              @click="emitDialogOpen = true"
            >
              <template #icon><Icon name="FileUp" size="sm" /></template>
              Emitir NFC-e
            </Button>
          </div>

          <div v-if="showEmitNfeButton" class="border-t border-line-2 pt-3">
            <p class="mb-2 text-xs text-muted-foreground">
              Esta venda tem cliente identificado e pode sair como NF-e modelo
              55, com destinatário completo.
            </p>
            <Button
              variant="secondary"
              full-width
              :loading="fiscalController.emitting.value"
              loading-text="Emitindo…"
              @click="emitNfeDialogOpen = true"
            >
              <template #icon><Icon name="FileText" size="sm" /></template>
              Emitir NF-e
            </Button>
          </div>
        </div>
      </FormSection>

      <!-- Ações de ciclo de vida -->
      <div
        v-if="
          (controller.canFinalize.value && canConfirm) ||
          (controller.canCancel.value && canCancel) ||
          (controller.canDeleteSale.value && canDelete)
        "
        class="space-y-2.5 rounded-xl border border-line-2 bg-background p-4"
      >
        <Button
          v-if="controller.canFinalize.value && canConfirm"
          variant="primary"
          text-class="text-white"
          full-width
          :disabled="controller.acting.value"
          @click="ask('confirm')"
        >
          <template #icon><Icon name="CircleCheck" size="sm" /></template>
          Finalizar venda
        </Button>
        <Button
          v-if="controller.canCancel.value && canCancel"
          variant="secondary"
          full-width
          :disabled="controller.acting.value"
          @click="ask('cancel')"
        >
          <template #icon><Icon name="Ban" size="sm" /></template>
          Cancelar venda
        </Button>
        <Button
          v-if="controller.canDeleteSale.value && canDelete"
          variant="ghost"
          full-width
          class="text-destructive"
          :disabled="controller.acting.value"
          @click="ask('delete')"
        >
          <template #icon><Icon name="Trash2" size="sm" /></template>
          Excluir venda
        </Button>
      </div>
    </div>
  </motion.div>

  <!-- Diálogo de confirmação de ação -->
  <ConfirmDialog
    v-model="dialogOpen"
    :title="dialogConfig.title"
    :description="dialogConfig.description"
    :confirm-label="dialogConfig.label"
    cancel-label="Voltar"
    :variant="dialogConfig.variant"
    :icon="dialogConfig.icon"
    :loading="controller.acting.value"
    @confirm="onDialogConfirm"
  />

  <!-- Checkout (finalizar à vista): formas de pagamento + troco -->
  <SalePaymentDialog
    v-if="controller.sale.value"
    v-model="paymentDialogOpen"
    :total="controller.sale.value.totalAmount"
    :loading="controller.acting.value"
    @confirm="onPaymentsConfirm"
  />

  <!-- Confirmação de emissão manual da NFC-e -->
  <ConfirmDialog
    v-model="emitDialogOpen"
    title="Emitir NFC-e"
    description="A NFC-e será enviada para autorização na SEFAZ. Deseja continuar?"
    confirm-label="Emitir"
    cancel-label="Voltar"
    variant="primary"
    icon="FileUp"
    :loading="fiscalController.emitting.value"
    @confirm="onEmitConfirm"
  />

  <!-- Emissão de NF-e modelo 55 -->
  <EmitNfeDialog
    v-model="emitNfeDialogOpen"
    :loading="fiscalController.emitting.value"
    :customer-name="controller.sale.value?.customerName"
    @confirm="onEmitNfeConfirm"
  />
</template>
