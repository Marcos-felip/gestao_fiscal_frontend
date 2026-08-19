<script setup lang="ts">
/**
 * Emissão fiscal do mês.
 *
 * O selo do topo mostra o que tira o sono, nesta ordem: certificado vencendo
 * (sem ele nada emite), depois documento com problema, depois "em dia".
 */
import { computed } from 'vue'
import { Icon } from '@/shared/ui'
import DashboardPanelCard from './dashboard-panel-card.vue'
import DashboardPanelLink from './dashboard-panel-link.vue'
import type { PanelBadge, PanelTone } from './dashboard-panel-card.vue'
import type { DashboardFiscal } from '@/modules/dashboard/domain/responses/dashboard-fiscal'
import type { BlockStatus } from '@/modules/dashboard/presentation/controllers/dashboard-controller'
import { formatMoney } from '@/shared/ui/utils/masks'
import { formatDate } from '@/core/utils/date'

const props = defineProps<{
  fiscal: DashboardFiscal | null
  status: BlockStatus
}>()
defineEmits<{ retry: []; open: [] }>()

const alert = computed(() => props.fiscal?.certificateAlerts[0] ?? null)

const badge = computed<PanelBadge | null>(() => {
  const fiscal = props.fiscal
  if (!fiscal) return null

  if (alert.value) {
    return {
      label: alert.value.expired
        ? 'Certificado vencido'
        : `Certificado: ${alert.value.daysToExpire} d`,
      tone: alert.value.expired ? 'danger' : 'warning',
    }
  }

  if (fiscal.month.rejected > 0 || fiscal.month.failed > 0) {
    const total = fiscal.month.rejected + fiscal.month.failed
    return { label: `${total} com problema`, tone: 'danger' }
  }

  if (fiscal.month.total === 0) return { label: 'Sem emissão', tone: 'default' }

  return { label: 'Em dia', tone: 'success' }
})

const headline = computed(() => {
  const fiscal = props.fiscal
  if (!fiscal) return { value: '', support: '' }

  if (fiscal.month.total === 0) {
    return { value: '—', support: 'nenhum documento emitido neste mês' }
  }

  return {
    value: `R$ ${formatMoney(fiscal.authorizedTotal)}`,
    support: `autorizado em ${fiscal.month.authorized} de ${fiscal.month.total} ${
      fiscal.month.total === 1 ? 'documento' : 'documentos'
    }`,
  }
})

/**
 * Só a situação que aconteceu vira linha.
 *
 * Contagem, e não percentual: com dez notas no mês, "20% rejeitadas" esconde que
 * são duas — e são as duas que alguém precisa reemitir hoje.
 */
const situations = computed(() => {
  const month = props.fiscal?.month
  if (!month) return []

  return (
    [
      {
        key: 'rejected',
        label: 'Rejeitadas',
        count: month.rejected,
        tone: 'danger',
      },
      { key: 'failed', label: 'Com erro', count: month.failed, tone: 'danger' },
      {
        key: 'pending',
        label: 'Em processamento',
        count: month.pending,
        tone: 'warning',
      },
      {
        key: 'contingency',
        label: 'Em contingência',
        count: month.contingency,
        tone: 'warning',
      },
      {
        key: 'cancelled',
        label: 'Canceladas',
        count: month.cancelled,
        tone: 'muted',
      },
      {
        key: 'authorized',
        label: 'Autorizadas',
        count: month.authorized,
        tone: 'success',
      },
    ] as {
      key: string
      label: string
      count: number
      tone: PanelTone | 'muted'
    }[]
  ).filter((situation) => situation.count > 0)
})

const dotClasses: Record<string, string> = {
  success: 'bg-success',
  danger: 'bg-error',
  warning: 'bg-warning',
  muted: 'bg-muted-foreground',
}
</script>

<template>
  <DashboardPanelCard
    label="Fiscal no mês"
    icon="FileText"
    error-label="a situação fiscal"
    :state="status"
    :badge="badge"
    :value="headline.value"
    :support="headline.support"
    @retry="$emit('retry')"
  >
    <template v-if="situations.length > 0 || alert" #detail>
      <!-- Certificado vem antes de qualquer contagem: sem ele, nada emite -->
      <div
        v-if="alert"
        class="mt-3 flex items-start gap-2 rounded-xl border px-3 py-2"
        :class="
          alert.expired
            ? 'border-error-200 bg-error-50 text-error'
            : 'border-warning-200 bg-warning-50 text-warning-700'
        "
      >
        <Icon name="ShieldAlert" size="sm" class="mt-0.5 shrink-0" />
        <p class="text-xs leading-snug">
          <span class="font-semibold">{{ alert.establishmentName }}</span>
          <template v-if="alert.expired">
            — certificado vencido em {{ formatDate(alert.expiresAt) }}
          </template>
          <template v-else>
            — certificado vence em {{ alert.daysToExpire }}
            {{ alert.daysToExpire === 1 ? 'dia' : 'dias' }}, em
            {{ formatDate(alert.expiresAt) }}
          </template>
        </p>
      </div>

      <ul v-if="situations.length > 0" class="divide-y divide-line-2">
        <li
          v-for="situation in situations"
          :key="situation.key"
          class="flex items-center justify-between gap-3 py-2.5"
        >
          <span class="flex min-w-0 items-center gap-2">
            <span
              class="h-1.5 w-1.5 shrink-0 rounded-full"
              :class="dotClasses[situation.tone]"
            />
            <span class="truncate text-sm text-foreground">
              {{ situation.label }}
            </span>
          </span>
          <span
            class="shrink-0 text-sm font-semibold tabular-nums text-foreground"
          >
            {{ situation.count }}
          </span>
        </li>
      </ul>
    </template>

    <template #footer>
      <DashboardPanelLink @click="$emit('open')">
        Documentos fiscais
      </DashboardPanelLink>
    </template>
  </DashboardPanelCard>
</template>
