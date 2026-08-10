<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'motion-v'
import { Button, Icon, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import FormSection from '@/shared/components/form/form-section.vue'
import PayableStatusBadge from '@/modules/payables/presentation/components/payable-status-badge.vue'
import PayPayableDialog from '@/modules/payables/presentation/components/pay-payable-dialog.vue'
import { makePayableDetailController } from '@/modules/payables/factories/payables.factory'
import type { PayPayableDto } from '@/modules/payables/domain/dto/pay-payable-dto'
import { usePermissions } from '@/shared/composables/usePermissions'
import { paymentMethodLabels } from '@/core/enums/payment-method.enum'
import { formatMoney } from '@/shared/ui/utils/masks'
import { formatDate, formatDateTime } from '@/core/utils/date'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const route = useRoute()
const controller = makePayableDetailController()
const progress = useProgress()
const { can } = usePermissions()

const canPay = computed(() => can('payables.pay'))
const canCancel = computed(() => can('payables.cancel'))

const payOpen = ref(false)
const cancelOpen = ref(false)

const payable = computed(() => controller.payable.value)
const paymentMethodLabel = computed(() => {
  const method = payable.value?.paymentMethod
  return method ? (paymentMethodLabels[method] ?? method) : null
})

onMounted(() => {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  if (id) progress.track(controller.load(id))
})

async function onPay(dto: PayPayableDto): Promise<void> {
  const ok = await progress.track(controller.pay(dto))
  if (ok) payOpen.value = false
}

async function onCancelConfirm(): Promise<void> {
  await progress.track(controller.cancel())
  cancelOpen.value = false
}

function goBack(): void {
  controller.router.push({ name: routeNames.PAYABLES })
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
        Título a pagar
      </h1>
      <PayableStatusBadge
        v-if="payable"
        :status="payable.status"
        :is-overdue="payable.isOverdue"
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
  <div v-if="!controller.loaded.value" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
    v-else-if="payable"
    class="grid grid-cols-1 gap-6 lg:grid-cols-3"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <!-- Coluna: valores + histórico -->
    <div class="min-w-0 space-y-6 lg:col-span-2">
      <FormSection
        icon="Wallet"
        title="Valores"
        description="Total, pago e saldo em aberto do título."
      >
        <dl class="grid grid-cols-3 gap-4 text-center">
          <div class="rounded-xl border border-line-2 p-4">
            <dt class="text-xs text-muted-foreground uppercase">Total</dt>
            <dd class="mt-1 font-display text-xl font-bold tabular-nums text-foreground">
              R$ {{ formatMoney(payable.amount) }}
            </dd>
          </div>
          <div class="rounded-xl border border-line-2 p-4">
            <dt class="text-xs text-muted-foreground uppercase">Pago</dt>
            <dd class="mt-1 font-display text-xl font-bold tabular-nums text-success-600">
              R$ {{ formatMoney(payable.paidAmount) }}
            </dd>
          </div>
          <div class="rounded-xl border border-line-2 p-4">
            <dt class="text-xs text-muted-foreground uppercase">Saldo</dt>
            <dd class="mt-1 font-display text-xl font-bold tabular-nums text-foreground">
              R$ {{ formatMoney(payable.balance) }}
            </dd>
          </div>
        </dl>
      </FormSection>

      <FormSection
        icon="ReceiptText"
        title="Pagamentos"
        description="Histórico de baixas registradas."
      >
        <div
          v-if="payable.payments.length === 0"
          class="rounded-lg border border-dashed border-line-3 px-4 py-8 text-center text-sm text-muted-foreground"
        >
          Nenhum pagamento registrado ainda.
        </div>
        <ul v-else class="divide-y divide-line-2">
          <li
            v-for="payment in payable.payments"
            :key="payment.id"
            class="flex items-center justify-between gap-4 py-3"
          >
            <div class="min-w-0">
              <p class="font-medium tabular-nums text-foreground">
                R$ {{ formatMoney(payment.amount) }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ formatDateTime(payment.paidAt) }}
                <span v-if="payment.method">
                  · {{ paymentMethodLabels[payment.method] ?? payment.method }}
                </span>
              </p>
            </div>
            <Icon name="CircleCheck" size="sm" class="shrink-0 text-success-600" />
          </li>
        </ul>
      </FormSection>
    </div>

    <!-- Coluna: dados + ações -->
    <div class="min-w-0 space-y-6">
      <FormSection icon="Info" title="Dados" description="Informações do título.">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Descrição</dt>
            <dd class="text-right font-medium text-foreground">
              {{ payable.description }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Fornecedor</dt>
            <dd class="text-right font-medium text-foreground">
              {{ payable.supplierName ?? '—' }}
            </dd>
          </div>
          <div v-if="payable.purchaseNumber" class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Compra</dt>
            <dd class="text-right font-medium text-foreground">
              #{{ payable.purchaseNumber }}
            </dd>
          </div>
          <div v-if="payable.installmentTotal > 1" class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Parcela</dt>
            <dd class="text-right font-medium text-foreground">
              {{ payable.installmentLabel }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Vencimento</dt>
            <dd
              :class="[
                'text-right font-medium',
                payable.isOverdue && !payable.isPaid
                  ? 'text-error-600'
                  : 'text-foreground',
              ]"
            >
              {{ formatDate(payable.dueDate) }}
            </dd>
          </div>
          <div v-if="payable.category" class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Categoria</dt>
            <dd class="text-right font-medium text-foreground">
              {{ payable.category }}
            </dd>
          </div>
          <div v-if="paymentMethodLabel" class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Forma prevista</dt>
            <dd class="text-right font-medium text-foreground">
              {{ paymentMethodLabel }}
            </dd>
          </div>
        </dl>
      </FormSection>

      <!-- Ações -->
      <div
        v-if="(payable.canPay && canPay) || (payable.canCancel && canCancel)"
        class="space-y-2.5 rounded-xl border border-line-2 bg-background p-4"
      >
        <Button
          v-if="payable.canPay && canPay"
          variant="primary"
          text-class="text-white"
          full-width
          :disabled="controller.acting.value"
          @click="payOpen = true"
        >
          <template #icon><Icon name="Wallet" size="sm" /></template>
          Registrar pagamento
        </Button>
        <Button
          v-if="payable.canCancel && canCancel"
          variant="ghost"
          full-width
          class="text-destructive"
          :disabled="controller.acting.value"
          @click="cancelOpen = true"
        >
          <template #icon><Icon name="Ban" size="sm" /></template>
          Cancelar título
        </Button>
      </div>
    </div>
  </motion.div>

  <!-- Pagamento -->
  <PayPayableDialog
    v-if="payable"
    v-model="payOpen"
    :balance="payable.balance"
    :loading="controller.acting.value"
    @confirm="onPay"
  />

  <!-- Cancelar -->
  <ConfirmDialog
    v-model="cancelOpen"
    title="Cancelar título"
    description="O título deixará de ser cobrado. Esta ação não pode ser desfeita."
    confirm-label="Cancelar título"
    cancel-label="Voltar"
    variant="destructive"
    icon="Ban"
    :loading="controller.acting.value"
    @confirm="onCancelConfirm"
  />
</template>
