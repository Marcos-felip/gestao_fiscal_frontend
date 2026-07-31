<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'motion-v'
import { Button, Icon, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import FormSection from '@/shared/components/form/form-section.vue'
import ReceivableStatusBadge from '@/modules/receivables/presentation/components/receivable-status-badge.vue'
import PayReceivableDialog from '@/modules/receivables/presentation/components/pay-receivable-dialog.vue'
import { makeReceivableDetailController } from '@/modules/receivables/factories/receivables.factory'
import type { PayReceivableDto } from '@/modules/receivables/domain/dto/pay-receivable-dto'
import { usePermissions } from '@/shared/composables/usePermissions'
import { paymentMethodLabels } from '@/enums/payment-method.enum'
import { formatMoney } from '@/shared/ui/utils/masks'
import { formatDate, formatDateTime } from '@/core/utils/date'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const route = useRoute()
const controller = makeReceivableDetailController()
const progress = useProgress()
const { can } = usePermissions()

const canPay = computed(() => can('receivables.pay'))
const canCancel = computed(() => can('receivables.cancel'))

const payOpen = ref(false)
const cancelOpen = ref(false)

const receivable = computed(() => controller.receivable.value)
const paymentMethodLabel = computed(() => {
  const method = receivable.value?.paymentMethod
  return method ? (paymentMethodLabels[method] ?? method) : null
})

onMounted(() => {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  if (id) progress.track(controller.load(id))
})

async function onPay(dto: PayReceivableDto): Promise<void> {
  const ok = await progress.track(controller.pay(dto))
  if (ok) payOpen.value = false
}

async function onCancelConfirm(): Promise<void> {
  await progress.track(controller.cancel())
  cancelOpen.value = false
}

function goBack(): void {
  controller.router.push({ name: routeNames.RECEIVABLES })
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
        Título a receber
      </h1>
      <ReceivableStatusBadge
        v-if="receivable"
        :status="receivable.status"
        :is-overdue="receivable.isOverdue"
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
    v-else-if="receivable"
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
        description="Total, recebido e saldo em aberto do título."
      >
        <dl class="grid grid-cols-3 gap-4 text-center">
          <div class="rounded-xl border border-line-2 p-4">
            <dt class="text-xs text-muted-foreground uppercase">Total</dt>
            <dd class="mt-1 font-display text-xl font-bold tabular-nums text-foreground">
              R$ {{ formatMoney(receivable.amount) }}
            </dd>
          </div>
          <div class="rounded-xl border border-line-2 p-4">
            <dt class="text-xs text-muted-foreground uppercase">Recebido</dt>
            <dd class="mt-1 font-display text-xl font-bold tabular-nums text-success-600">
              R$ {{ formatMoney(receivable.paidAmount) }}
            </dd>
          </div>
          <div class="rounded-xl border border-line-2 p-4">
            <dt class="text-xs text-muted-foreground uppercase">Saldo</dt>
            <dd class="mt-1 font-display text-xl font-bold tabular-nums text-foreground">
              R$ {{ formatMoney(receivable.balance) }}
            </dd>
          </div>
        </dl>
      </FormSection>

      <FormSection
        icon="ReceiptText"
        title="Baixas"
        description="Histórico de pagamentos recebidos."
      >
        <div
          v-if="receivable.payments.length === 0"
          class="rounded-lg border border-dashed border-line-3 px-4 py-8 text-center text-sm text-muted-foreground"
        >
          Nenhuma baixa registrada ainda.
        </div>
        <ul v-else class="divide-y divide-line-2">
          <li
            v-for="payment in receivable.payments"
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
              {{ receivable.description }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Cliente</dt>
            <dd class="text-right font-medium text-foreground">
              {{ receivable.customerName ?? '—' }}
            </dd>
          </div>
          <div v-if="receivable.saleNumber" class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Venda</dt>
            <dd class="text-right font-medium text-foreground">
              #{{ receivable.saleNumber }}
            </dd>
          </div>
          <div v-if="receivable.installmentTotal > 1" class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Parcela</dt>
            <dd class="text-right font-medium text-foreground">
              {{ receivable.installmentLabel }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Vencimento</dt>
            <dd
              :class="[
                'text-right font-medium',
                receivable.isOverdue && !receivable.isPaid
                  ? 'text-error-600'
                  : 'text-foreground',
              ]"
            >
              {{ formatDate(receivable.dueDate) }}
            </dd>
          </div>
          <div v-if="receivable.category" class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Categoria</dt>
            <dd class="text-right font-medium text-foreground">
              {{ receivable.category }}
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
        v-if="
          (receivable.canPay && canPay) || (receivable.canCancel && canCancel)
        "
        class="space-y-2.5 rounded-xl border border-line-2 bg-background p-4"
      >
        <Button
          v-if="receivable.canPay && canPay"
          variant="primary"
          text-class="text-white"
          full-width
          :disabled="controller.acting.value"
          @click="payOpen = true"
        >
          <template #icon><Icon name="HandCoins" size="sm" /></template>
          Registrar baixa
        </Button>
        <Button
          v-if="receivable.canCancel && canCancel"
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

  <!-- Baixa -->
  <PayReceivableDialog
    v-if="receivable"
    v-model="payOpen"
    :balance="receivable.balance"
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
