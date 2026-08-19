<script setup lang="ts">
/**
 * Situação dos caixas agora.
 *
 * O total da sessão aberta vem **nulo** quando a empresa usa conferência às
 * cegas — é o número que o operador não pode ver antes de contar a gaveta. Por
 * isso a manchete troca de assunto nesse caso: vira a contagem de caixas, nunca
 * `R$ 0,00`, que diria que o turno não vendeu nada.
 */
import { computed } from 'vue'
import DashboardPanelCard from './dashboard-panel-card.vue'
import DashboardPanelLink from './dashboard-panel-link.vue'
import type { PanelBadge } from './dashboard-panel-card.vue'
import type { DashboardCash } from '@/modules/dashboard/domain/responses/dashboard-cash'
import type { BlockStatus } from '@/modules/dashboard/presentation/controllers/dashboard-controller'
import { formatMoney } from '@/shared/ui/utils/masks'

const props = defineProps<{ cash: DashboardCash | null; status: BlockStatus }>()
defineEmits<{ retry: []; open: [] }>()

const sessions = computed(() => props.cash?.openSessions ?? [])

const badge = computed<PanelBadge | null>(() => {
  if (!props.cash) return null
  if (sessions.value.length === 0) return { label: 'Fechado', tone: 'default' }

  return {
    label:
      sessions.value.length === 1
        ? 'Aberto'
        : `${sessions.value.length} abertos`,
    tone: 'success',
  }
})

const headline = computed(() => {
  const cash = props.cash
  if (!cash) return { value: '', support: '' }

  const fechadas =
    cash.closedToday > 0
      ? ` · ${cash.closedToday} ${cash.closedToday === 1 ? 'fechada' : 'fechadas'} hoje`
      : ''

  if (sessions.value.length === 0) {
    return { value: '—', support: `nenhum caixa aberto${fechadas}` }
  }

  const quantos = `${sessions.value.length} ${
    sessions.value.length === 1 ? 'caixa aberto' : 'caixas abertos'
  }`

  if (cash.blindClose) {
    return {
      value: String(sessions.value.length),
      support: `${quantos} · valor oculto até o fechamento`,
    }
  }

  const total = sessions.value.reduce(
    (sum, session) => sum + (session.salesTotal ?? 0),
    0,
  )

  return {
    value: `R$ ${formatMoney(total)}`,
    support: `vendido em ${quantos}${fechadas}`,
  }
})

function since(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso))
}
</script>

<template>
  <DashboardPanelCard
    label="Caixa"
    icon="Wallet"
    error-label="a situação dos caixas"
    :state="status"
    :badge="badge"
    :value="headline.value"
    :support="headline.support"
    @retry="$emit('retry')"
  >
    <template v-if="sessions.length > 0" #detail>
      <ul class="divide-y divide-line-2">
        <li
          v-for="session in sessions"
          :key="session.id"
          class="flex items-start justify-between gap-3 py-3"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-foreground">
              {{ session.cashRegisterName }}
            </p>
            <p class="truncate text-xs text-muted-foreground">
              {{ session.operatorName }} · desde {{ since(session.openedAt) }}
            </p>
          </div>

          <span
            v-if="session.salesTotal !== null"
            class="shrink-0 text-sm font-semibold tabular-nums text-foreground"
          >
            R$ {{ formatMoney(session.salesTotal) }}
          </span>
          <span v-else class="shrink-0 text-xs italic text-muted-foreground">
            oculto
          </span>
        </li>
      </ul>
    </template>

    <template #footer>
      <DashboardPanelLink @click="$emit('open')">
        Sessões de caixa
      </DashboardPanelLink>
    </template>
  </DashboardPanelCard>
</template>
