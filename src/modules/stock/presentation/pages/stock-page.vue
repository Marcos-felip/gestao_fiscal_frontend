<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, Select, Skeleton } from '@/shared/ui'
import MovementTypeBadge from '@/modules/stock/presentation/components/movement-type-badge.vue'
import StockMovementDialog from '@/modules/stock/presentation/components/stock-movement-dialog.vue'
import { makeStockController } from '@/modules/stock/factories/stock.factory'
import type { StockMovement } from '@/modules/stock/domain/entities/stock-movement.entity'
import type { StockMovementFormValues } from '@/modules/stock/presentation/schemas/stock-movement-schema'
import { usePermissions } from '@/modules/permissions/presentation/composables/usePermissions'
import {
  StockMovementType,
  stockMovementTypeOptions,
} from '@/enums/stock-movement-type.enum'
import { unitOfMeasureShortLabels } from '@/enums/unit-of-measure.enum'
import { formatQuantity, parseDecimal } from '@/shared/ui/utils/masks'
import { formatDateTime } from '@/core/utils/date'
import { useProgress } from '@/shared/composables'

const controller = makeStockController()
const progress = useProgress()
const { can } = usePermissions()

const canCreate = computed(() => can('stock.create'))

const typeValue = ref('')
const productValue = ref('')
const dialogOpen = ref(false)

const typeFilterOptions = [
  { value: '', label: 'Todos os tipos' },
  ...stockMovementTypeOptions,
]
const productFilterOptions = computed(() => [
  { value: '', label: 'Todos os produtos' },
  ...controller.productOptions.value,
])

onMounted(() => {
  progress.track(controller.loadList())
  controller.loadProducts()
})

function onType(value: string): void {
  typeValue.value = value
  void progress.track(controller.setType(value as StockMovementType | ''))
}

function onProduct(value: string): void {
  productValue.value = value
  void progress.track(controller.setProduct(value))
}

async function onSubmit(values: StockMovementFormValues): Promise<void> {
  const dto = controller.buildDto({
    productId: values.productId,
    type: values.type as StockMovementType,
    quantity: parseDecimal(values.quantity) ?? 0,
    reason: values.reason || undefined,
  })
  const ok = await progress.track(controller.createMovement(dto))
  if (ok) dialogOpen.value = false
}

// Quantidade com sinal e cor conforme o efeito no estoque.
function signedQuantity(movement: StockMovement): {
  text: string
  class: string
} {
  const value = formatQuantity(movement.quantity)
  if (movement.type === StockMovementType.ENTRADA) {
    return { text: `+${value}`, class: 'text-success-600' }
  }
  if (movement.type === StockMovementType.SAIDA) {
    return { text: `−${value}`, class: 'text-error-600' }
  }
  return { text: `=${value}`, class: 'text-warning-600' }
}

function prevPage(): void {
  void progress.track(controller.goToPage(controller.page.value - 1))
}

function nextPage(): void {
  void progress.track(controller.goToPage(controller.page.value + 1))
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1
        class="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        Estoque
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Razão de entradas, saídas e ajustes do seu estoque.
      </p>
    </div>

    <Button
      v-if="canCreate"
      variant="primary"
      text-class="text-white"
      @click="dialogOpen = true"
    >
      <template #icon><Icon name="Plus" size="sm" /></template>
      Nova movimentação
    </Button>
  </header>

  <!-- Toolbar: filtros por tipo e produto -->
  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
    <div class="sm:w-48">
      <Select
        :model-value="typeValue"
        :options="typeFilterOptions"
        placeholder="Tipo"
        @update:model-value="onType"
      />
    </div>
    <div class="sm:w-64">
      <Select
        :model-value="productValue"
        :options="productFilterOptions"
        placeholder="Produto"
        @update:model-value="onProduct"
      />
    </div>
  </div>

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
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
  >
    <div
      v-for="n in 6"
      :key="`sk-${n}`"
      class="flex items-center gap-4 border-b border-line-2 px-4 py-3 last:border-b-0"
    >
      <div class="flex-1 space-y-2">
        <Skeleton class="h-3.5 w-40 rounded" />
        <Skeleton class="h-3 w-24 rounded" />
      </div>
      <Skeleton class="h-5 w-16 rounded-full" />
      <Skeleton class="h-3 w-16 rounded" />
      <Skeleton class="h-3 w-24 rounded" />
    </div>
  </div>

  <!-- Empty -->
  <div
    v-else-if="controller.movements.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="Warehouse" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhuma movimentação encontrada
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Registre entradas, saídas e ajustes — ou confirme uma compra para dar
      entrada automática.
    </p>
    <div v-if="canCreate" class="mt-5">
      <Button
        variant="primary"
        text-class="text-white"
        @click="dialogOpen = true"
      >
        <template #icon><Icon name="Plus" size="sm" /></template>
        Nova movimentação
      </Button>
    </div>
  </div>

  <!-- Tabela / razão -->
  <motion.div
    v-else
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead
          class="border-b border-line-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          <tr>
            <th class="px-4 py-3 font-medium">Produto</th>
            <th class="px-4 py-3 font-medium">Tipo</th>
            <th class="px-4 py-3 text-right font-medium">Quantidade</th>
            <th class="px-4 py-3 font-medium">Motivo</th>
            <th class="px-4 py-3 font-medium">Data</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line-2">
          <tr
            v-for="movement in controller.movements.value"
            :key="movement.id"
            class="transition-colors hover:bg-muted/40"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-foreground">
                {{ movement.productName ?? 'Produto removido' }}
              </p>
              <p v-if="movement.productUnit" class="text-xs text-muted-foreground">
                {{
                  unitOfMeasureShortLabels[movement.productUnit] ??
                  movement.productUnit
                }}
              </p>
            </td>
            <td class="px-4 py-3">
              <MovementTypeBadge :type="movement.type" />
            </td>
            <td
              class="px-4 py-3 text-right font-medium tabular-nums"
              :class="signedQuantity(movement).class"
            >
              {{ signedQuantity(movement).text }}
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              <span class="inline-flex items-center gap-1.5">
                <Icon
                  v-if="movement.isAutomatic"
                  name="Link"
                  size="sm"
                  class="text-muted-foreground/60"
                />
                {{ movement.reason ?? '—' }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-muted-foreground">
              {{ formatDateTime(movement.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div
      class="flex items-center justify-between gap-4 border-t border-line-2 px-4 py-3"
    >
      <p class="text-sm text-muted-foreground">
        {{ controller.total.value }}
        {{ controller.total.value === 1 ? 'movimentação' : 'movimentações' }}
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="controller.page.value <= 1"
          title="Página anterior"
          @click="prevPage"
        >
          <Icon name="ChevronLeft" size="sm" />
        </button>
        <span class="text-sm tabular-nums text-muted-foreground">
          Página {{ controller.page.value }} de
          {{ controller.totalPages.value }}
        </span>
        <button
          type="button"
          class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="controller.page.value >= controller.totalPages.value"
          title="Próxima página"
          @click="nextPage"
        >
          <Icon name="ChevronRight" size="sm" />
        </button>
      </div>
    </div>
  </motion.div>

  <!-- Modal de nova movimentação -->
  <StockMovementDialog
    v-model="dialogOpen"
    :product-options="controller.productOptions.value"
    :saving="controller.saving.value"
    @submit="onSubmit"
  />
</template>
