<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'motion-v'
import { Button, Icon, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import FormSection from '@/shared/components/form/form-section.vue'
import SaleStatusBadge from '@/modules/sales/presentation/components/sale-status-badge.vue'
import { makeSaleDetailController } from '@/modules/sales/factories/sales.factory'
import { usePermissions } from '@/shared/composables/usePermissions'
import { PaymentStatus, paymentStatusLabels } from '@/enums/payment-status.enum'
import { paymentMethodLabels } from '@/enums/payment-method.enum'
import { unitOfMeasureShortLabels } from '@/enums/unit-of-measure.enum'
import { formatMoney, formatQuantity } from '@/shared/ui/utils/masks'
import { formatDate } from '@/core/utils/date'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const route = useRoute()
const controller = makeSaleDetailController()
const progress = useProgress()
const { can } = usePermissions()

const canConfirm = computed(() => can('sales.confirm'))
const canCancel = computed(() => can('sales.cancel'))
const canDelete = computed(() => can('sales.delete'))

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

type PendingAction = 'confirm' | 'cancel' | 'delete'
const pendingAction = ref<PendingAction | null>(null)
const dialogOpen = ref(false)

const dialogConfig = computed(() => {
  switch (pendingAction.value) {
    case 'confirm':
      return {
        title: 'Finalizar venda',
        description:
          'Finalizar dará baixa no estoque de cada item desta venda. Deseja continuar?',
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
        description: 'Excluir permanentemente esta venda? Não pode ser desfeito.',
        label: 'Excluir',
        variant: 'destructive' as const,
        icon: 'Trash2',
      }
  }
})

onMounted(() => {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  if (id) progress.track(controller.load(id))
})

function ask(action: PendingAction): void {
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
    <div class="rounded-xl border border-line-2 bg-background p-6 lg:col-span-2">
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
</template>
