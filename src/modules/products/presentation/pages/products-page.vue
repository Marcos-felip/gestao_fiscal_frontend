<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, SearchInput, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import { makeProductsListController } from '@/modules/products/factories/products.factory'
import type { Product } from '@/modules/products/domain/entities/product.entity'
import { usePermissions } from '@/shared/composables/usePermissions'
import { unitOfMeasureShortLabels } from '@/enums/unit-of-measure.enum'
import { formatMoney, formatQuantity } from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeProductsListController()
const progress = useProgress()
const { can } = usePermissions()

const canCreate = computed(() => can('products.create'))
const canEdit = computed(() => can('products.edit'))
const canDelete = computed(() => can('products.delete'))
const canView = computed(() => can('products.read'))

const searchTerm = ref('')

const confirmOpen = ref(false)
const target = ref<Product | null>(null)

onMounted(() => progress.track(controller.loadList()))

// Busca com debounce: reseta para página 1 no controller.
let debounceTimer: ReturnType<typeof setTimeout> | null = null
function onSearch(value: string): void {
  searchTerm.value = value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void progress.track(controller.setSearch(value))
  }, 400)
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

function goNew(): void {
  controller.router.push({ name: routeNames.PRODUCT_NEW })
}

function goEdit(product: Product): void {
  controller.router.push({
    name: routeNames.PRODUCT_EDIT,
    params: { id: product.id },
  })
}

function askDelete(product: Product): void {
  target.value = product
  confirmOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (!target.value) return
  await progress.track(controller.remove(target.value))
  confirmOpen.value = false
  target.value = null
}

function formatPrice(value: number | null): string {
  return value !== null ? `R$ ${formatMoney(value)}` : '—'
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
        Produtos
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Itens do seu catálogo e controle de estoque.
      </p>
    </div>

    <Button
      v-if="canCreate"
      variant="primary"
      text-class="text-white"
      @click="goNew"
    >
      <template #icon><Icon name="Plus" size="sm" /></template>
      Novo produto
    </Button>
  </header>

  <!-- Toolbar: busca por nome -->
  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
    <div class="sm:max-w-xs sm:flex-1">
      <SearchInput
        :model-value="searchTerm"
        placeholder="Buscar por nome…"
        @update:model-value="onSearch"
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
      <Skeleton class="h-5 w-12 rounded-full" />
      <Skeleton class="h-3 w-20 rounded" />
      <Skeleton class="h-3 w-16 rounded" />
    </div>
  </div>

  <!-- Empty -->
  <div
    v-else-if="controller.products.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="Package" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhum produto encontrado
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Cadastre produtos para controlar preços, estoque e dados fiscais.
    </p>
    <div v-if="canCreate" class="mt-5">
      <Button variant="primary" text-class="text-white" @click="goNew">
        <template #icon><Icon name="Plus" size="sm" /></template>
        Novo produto
      </Button>
    </div>
  </div>

  <!-- Tabela -->
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
            <th class="px-4 py-3 font-medium">Unid.</th>
            <th class="px-4 py-3 text-right font-medium">Preço venda</th>
            <th class="px-4 py-3 text-right font-medium">Estoque</th>
            <th class="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line-2">
          <tr
            v-for="product in controller.products.value"
            :key="product.id"
            class="transition-colors hover:bg-muted/40"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-foreground">{{ product.name }}</p>
              <p v-if="product.sku" class="text-xs text-muted-foreground">
                SKU {{ product.sku }}
              </p>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {{ unitOfMeasureShortLabels[product.unit] ?? product.unit }}
              </span>
            </td>
            <td class="px-4 py-3 text-right tabular-nums text-foreground">
              {{ formatPrice(product.salePrice) }}
            </td>
            <td class="px-4 py-3 text-right">
              <span
                :class="[
                  'inline-flex items-center gap-1 tabular-nums',
                  product.isLowStock
                    ? 'font-medium text-warning'
                    : 'text-muted-foreground',
                ]"
              >
                <Icon
                  v-if="product.isLowStock"
                  name="TriangleAlert"
                  size="sm"
                />
                {{ formatQuantity(product.currentStock) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  v-if="canEdit"
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Editar"
                  @click="goEdit(product)"
                >
                  <Icon name="Pencil" size="sm" />
                </button>
                <button
                  v-else-if="canView"
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Ver"
                  @click="goEdit(product)"
                >
                  <Icon name="Eye" size="sm" />
                </button>
                <button
                  v-if="canDelete"
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Excluir"
                  :disabled="controller.deletingId.value === product.id"
                  @click="askDelete(product)"
                >
                  <Icon name="Trash2" size="sm" />
                </button>
              </div>
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
        {{ controller.total.value === 1 ? 'produto' : 'produtos' }}
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

  <!-- Confirmação de exclusão -->
  <ConfirmDialog
    v-model="confirmOpen"
    title="Excluir produto"
    :description="`Tem certeza que deseja excluir “${target?.name}”? Esta ação não pode ser desfeita.`"
    confirm-label="Excluir"
    cancel-label="Cancelar"
    variant="destructive"
    icon="Trash2"
    :loading="controller.isLoading"
    @confirm="confirmDelete"
  />
</template>
