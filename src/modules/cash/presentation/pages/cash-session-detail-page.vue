<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Icon, Skeleton } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import CashSessionStatusBadge from '@/modules/cash/presentation/components/cash-session-status-badge.vue'
import CashSessionSummaryCard from '@/modules/cash/presentation/components/cash-session-summary-card.vue'
import { makeCashSessionDetailController } from '@/modules/cash/factories/cash.factory'
import { CashMovementType, cashMovementTypeLabels } from '@/enums/cash-movement-type.enum'
import { formatDateTime } from '@/core/utils/date'
import { formatMoney } from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'

const controller = makeCashSessionDetailController()
const route = useRoute()

const session = computed(() => controller.session.value)

onMounted(() => controller.load(String(route.params.id)))

function goBack(): void {
  controller.router.push({ name: routeNames.CASH_SESSIONS })
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
        Sessão de caixa
      </h1>
      <CashSessionStatusBadge v-if="session" :status="session.status" />
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

  <!-- Não encontrada -->
  <div
    v-else-if="!session"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center text-sm text-muted-foreground"
  >
    Sessão não encontrada.
  </div>

  <!-- Conteúdo -->
  <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <!-- Principal: conferência + movimentos -->
    <div class="space-y-6 lg:col-span-2">
      <FormSection
        icon="Scale"
        title="Conferência"
        description="Composição do dinheiro em gaveta."
      >
        <CashSessionSummaryCard
          v-if="session.summary"
          :summary="session.summary"
        />
        <p v-else class="text-sm text-muted-foreground">Resumo indisponível.</p>
      </FormSection>

      <FormSection
        v-if="session.movements.length"
        icon="ArrowLeftRight"
        title="Sangrias e suprimentos"
        :description="`${session.movements.length} movimento(s) na sessão.`"
      >
        <div class="divide-y divide-line-2">
          <div
            v-for="movement in session.movements"
            :key="movement.id"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span
              :class="[
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                movement.type === CashMovementType.SUPRIMENTO
                  ? 'bg-success-500/10 text-success-600'
                  : 'bg-error-500/10 text-error-600',
              ]"
            >
              <Icon
                :name="
                  movement.type === CashMovementType.SUPRIMENTO
                    ? 'ArrowDownToLine'
                    : 'ArrowUpFromLine'
                "
                size="sm"
              />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                {{ cashMovementTypeLabels[movement.type] }}
              </p>
              <p class="truncate text-xs text-muted-foreground">
                {{ movement.reason || 'Sem motivo' }} ·
                {{ formatDateTime(movement.createdAt) }}
              </p>
            </div>
            <span
              :class="[
                'text-sm font-semibold tabular-nums',
                movement.type === CashMovementType.SUPRIMENTO
                  ? 'text-success-600'
                  : 'text-error-600',
              ]"
            >
              {{ movement.type === CashMovementType.SUPRIMENTO ? '+' : '–' }} R$
              {{ formatMoney(movement.amount) }}
            </span>
          </div>
        </div>
      </FormSection>
    </div>

    <!-- Lateral: dados da sessão + observação -->
    <aside class="space-y-6">
      <div class="rounded-xl border border-line-2 bg-background p-5">
        <div class="flex items-center gap-3">
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <Icon name="Monitor" size="md" />
          </span>
          <div class="min-w-0">
            <p class="truncate font-semibold text-foreground">
              {{ session.cashRegisterName ?? 'Caixa' }}
            </p>
            <p class="truncate text-sm text-muted-foreground">
              {{ session.operatorName ?? '—' }}
            </p>
          </div>
        </div>

        <dl class="mt-4 space-y-3 border-t border-line-2 pt-4 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Aberto em</dt>
            <dd class="font-medium text-foreground">
              {{ formatDateTime(session.openedAt) }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Fechado em</dt>
            <dd class="font-medium text-foreground">
              {{ session.closedAt ? formatDateTime(session.closedAt) : '—' }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Observação do fechamento -->
      <div
        v-if="session.closingNotes"
        class="rounded-xl border border-line-2 bg-muted/30 p-4"
      >
        <p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Observação do fechamento
        </p>
        <p class="mt-1 text-sm text-foreground">{{ session.closingNotes }}</p>
      </div>
    </aside>
  </div>
</template>
