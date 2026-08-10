<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/shared/ui'
import type { CashSessionSummary } from '@/modules/cash/domain/value-objects/cash-session-summary'
import { paymentMethodLabels } from '@/core/enums/payment-method.enum'
import { formatMoney } from '@/shared/ui/utils/masks'

const props = defineProps<{ summary: CashSessionSummary }>()

/** Diferença colorida: falta (vermelho), sobra (amarelo), certo (verde). */
const differenceTone = computed(() => {
  const diff = props.summary.difference
  if (diff === null) return 'text-muted-foreground'
  if (diff < -0.01) return 'text-error-600'
  if (diff > 0.01) return 'text-warning-600'
  return 'text-success-600'
})

const hasBreakdown = computed(
  () => (props.summary.paymentBreakdown?.length ?? 0) > 0,
)

function money(value: number | null): string {
  return value === null ? '—' : `R$ ${formatMoney(value)}`
}
</script>

<template>
  <div class="space-y-4">
    <!-- Aviso do fechamento às cegas -->
    <div
      v-if="summary.blind"
      class="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground"
    >
      <Icon name="EyeOff" size="sm" />
      Fechamento às cegas: o valor esperado só aparece após fechar o caixa.
    </div>

    <!-- Composição do dinheiro em gaveta -->
    <dl class="space-y-2 text-sm tabular-nums">
      <div class="flex justify-between gap-4">
        <dt class="text-muted-foreground">Fundo de troco</dt>
        <dd class="font-medium text-foreground">
          R$ {{ formatMoney(summary.openingAmount) }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-muted-foreground">Vendas em dinheiro</dt>
        <dd class="font-medium text-foreground">
          {{ money(summary.cashSales) }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-muted-foreground">Suprimentos</dt>
        <dd class="font-medium text-success-600">
          + R$ {{ formatMoney(summary.supplies) }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-muted-foreground">Sangrias</dt>
        <dd class="font-medium text-error-600">
          – R$ {{ formatMoney(summary.withdrawals) }}
        </dd>
      </div>

      <div
        class="flex justify-between gap-4 border-t border-line-2 pt-2 text-base"
      >
        <dt class="font-semibold text-foreground">Esperado em gaveta</dt>
        <dd class="font-bold text-foreground">
          {{ money(summary.expectedCash) }}
        </dd>
      </div>

      <template v-if="summary.countedCash !== null">
        <div class="flex justify-between gap-4">
          <dt class="text-muted-foreground">Contado</dt>
          <dd class="font-medium text-foreground">
            R$ {{ formatMoney(summary.countedCash) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="font-semibold text-foreground">Diferença</dt>
          <dd :class="['font-bold', differenceTone]">
            {{ money(summary.difference) }}
          </dd>
        </div>
      </template>
    </dl>

    <!-- Informativos: total, formas de pagamento, a prazo -->
    <div class="space-y-2 border-t border-line-2 pt-3">
      <p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Movimento da sessão
      </p>
      <dl class="space-y-2 text-sm tabular-nums">
        <div class="flex justify-between gap-4">
          <dt class="text-muted-foreground">
            Vendas concluídas ({{ summary.salesCount }})
          </dt>
          <dd class="font-medium text-foreground">
            {{ money(summary.salesTotal) }}
          </dd>
        </div>
        <div
          v-for="item in summary.paymentBreakdown ?? []"
          :key="item.method"
          class="flex justify-between gap-4 pl-3"
        >
          <dt class="text-muted-foreground">
            {{ paymentMethodLabels[item.method] ?? item.method }}
          </dt>
          <dd class="text-foreground">R$ {{ formatMoney(item.amount) }}</dd>
        </div>
        <div
          v-if="!hasBreakdown && !summary.blind"
          class="pl-3 text-xs text-muted-foreground"
        >
          Nenhuma venda registrada.
        </div>
        <div
          v-if="summary.creditTotal !== null && summary.creditTotal > 0"
          class="flex justify-between gap-4 border-t border-line-2 pt-2"
        >
          <dt class="text-muted-foreground">A prazo (contas a receber)</dt>
          <dd class="font-medium text-foreground">
            R$ {{ formatMoney(summary.creditTotal) }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
