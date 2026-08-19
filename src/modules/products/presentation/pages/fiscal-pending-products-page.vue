<script setup lang="ts">
/**
 * Produtos que ainda não podem sair numa nota.
 *
 * Existe porque o checklist de produção só dizia **quantos** faltam. Saber que
 * são 4 não diz quais são nem o que falta em cada um, e o filtro da tela de
 * produtos peneira apenas a página já carregada — com 3 páginas de catálogo, um
 * produto pendente na página 3 simplesmente não aparecia.
 *
 * A lista vem filtrada do servidor (`GET /products/fiscal-pending`), com o
 * motivo de cada pendência escrito pelo backend, que é quem decide o que
 * torna um produto emitível.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, SearchInput, Skeleton } from '@/shared/ui'
import { makeFiscalPendingProductsController } from '@/modules/products/factories/products.factory'
import type { ProductFiscalPending } from '@/modules/products/domain/responses/product-fiscal-pending'
import { usePermissions } from '@/shared/composables/usePermissions'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeFiscalPendingProductsController()
const progress = useProgress()
const { can } = usePermissions()

const canEdit = computed(() => can('products.edit'))
const canView = computed(() => can('products.read'))

const searchTerm = ref('')

onMounted(() => progress.track(controller.loadList()))

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

function goEdit(product: ProductFiscalPending): void {
  controller.router.push({
    name: routeNames.PRODUCT_EDIT,
    params: { id: product.id },
  })
}

function prevPage(): void {
  void progress.track(controller.goToPage(controller.page.value - 1))
}

function nextPage(): void {
  void progress.track(controller.goToPage(controller.page.value + 1))
}

function goProducts(): void {
  controller.router.push({ name: routeNames.PRODUCTS })
}
</script>

<template>
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1
        class="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        Pendências fiscais
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Produtos que não podem ser emitidos até o cadastro fiscal ser
        completado.
      </p>
    </div>

    <Button variant="ghost" @click="goProducts">
      <template #icon><Icon name="Package" size="sm" /></template>
      Todos os produtos
    </Button>
  </header>

  <div class="mb-4 sm:max-w-xs">
    <SearchInput
      :model-value="searchTerm"
      placeholder="Buscar por nome…"
      @update:model-value="onSearch"
    />
  </div>

  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <!-- Skeleton -->
  <div v-if="!controller.loaded.value" class="space-y-3">
    <div
      v-for="n in 4"
      :key="`sk-${n}`"
      class="ui-shadow-soft space-y-3 rounded-xl border border-line-2 bg-background p-4"
    >
      <Skeleton class="h-3.5 w-48 rounded" />
      <Skeleton class="h-3 w-64 rounded" />
    </div>
  </div>

  <!--
    Vazio aqui é boa notícia, e a tela precisa dizer isso — a mesma moldura de
    "nada encontrado" deixaria a dúvida de se a busca falhou.
  -->
  <div
    v-else-if="controller.products.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success-500/10 text-success-600"
    >
      <Icon name="CircleCheck" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      {{
        controller.search.value
          ? 'Nenhuma pendência com esse termo'
          : 'Nenhum produto pendente'
      }}
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      {{
        controller.search.value
          ? 'Nenhum produto com pendência fiscal corresponde à busca.'
          : 'Todos os produtos ativos têm o quadro tributário completo.'
      }}
    </p>
  </div>

  <motion.div
    v-else
    class="space-y-3"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <article
      v-for="product in controller.products.value"
      :key="product.id"
      class="ui-shadow-soft rounded-xl border border-line-2 bg-background p-4"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-medium text-foreground">{{ product.name }}</p>
          <p class="mt-0.5 text-xs text-muted-foreground">
            <span v-if="product.sku">SKU {{ product.sku }} · </span>
            NCM {{ product.ncm ?? '—' }} · CFOP {{ product.cfop ?? '—' }} ·
            CSOSN {{ product.csosn ?? product.cstIcms ?? '—' }}
          </p>
        </div>

        <Button v-if="canEdit" variant="ghost" size="sm" @click="goEdit(product)">
          <template #icon><Icon name="Pencil" size="sm" /></template>
          Completar cadastro
        </Button>
        <Button
          v-else-if="canView"
          variant="ghost"
          size="sm"
          @click="goEdit(product)"
        >
          <template #icon><Icon name="Eye" size="sm" /></template>
          Ver produto
        </Button>
      </div>

      <ul class="mt-3 space-y-1.5">
        <li
          v-for="(pendencia, index) in product.pendencias"
          :key="`${product.id}-${index}`"
          class="flex items-start gap-2 text-sm text-warning-700"
        >
          <Icon name="CircleAlert" size="sm" class="mt-0.5 shrink-0" />
          <span>{{ pendencia }}</span>
        </li>
      </ul>
    </article>

    <div
      class="flex items-center justify-between gap-4 rounded-xl border border-line-2 bg-background px-4 py-3"
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
</template>
