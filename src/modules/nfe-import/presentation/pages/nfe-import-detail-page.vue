<script setup lang="ts">
/**
 * Conferência da nota importada.
 *
 * A regra que separa esta tela de um CRUD: **ela não pode fingir que acertou.**
 * Item casado pelo código de barras e item casado pela memória de uma
 * importação anterior valem coisas diferentes — o segundo carrega o erro de
 * quem escolheu daquela vez. Exibir os dois iguais faria alguém autorizar uma
 * entrada de estoque sem saber no que estava confiando.
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'motion-v'
import { Button, Combobox, Icon, Skeleton } from '@/shared/ui'
import CreateProductFromNfePanel from '@/modules/nfe-import/presentation/components/create-product-from-nfe-panel.vue'
import { makeNfeImportDetailController } from '@/modules/nfe-import/factories/nfe-import.factory'
import type { ProductFormValues } from '@/modules/products/presentation/schemas/product-schema'
import type { NfeImportItem } from '@/modules/nfe-import/domain/entities/nfe-import.entity'
import {
  NfeImportMatch,
  nfeImportMatchHints,
  nfeImportMatchLabels,
} from '@/core/enums/nfe-import-match.enum'
import { nfeImportStatusLabels } from '@/core/enums/nfe-import-status.enum'
import { usePermissions } from '@/shared/composables/usePermissions'
import { formatMoney, formatQuantity } from '@/shared/ui/utils/masks'
import { formatDate } from '@/core/utils/date'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeNfeImportDetailController()
const route = useRoute()
const progress = useProgress()
const { can } = usePermissions()

const canImport = computed(() => can('purchases.import'))

const nfeImport = computed(() => controller.nfeImport.value)

/** Escolha em aberto por item, antes de ser enviada. */
const picked = ref<Record<string, string>>({})

const productOptions = computed(() =>
  controller.products.value.map((product) => ({
    value: product.id,
    label: product.sku ? `${product.name} · ${product.sku}` : product.name,
  })),
)

onMounted(() => {
  void progress.track(controller.load(String(route.params.id)))
})

function productName(productId: string | null): string {
  if (!productId) return ''
  const found = controller.products.value.find(
    (product) => product.id === productId,
  )
  return found?.name ?? 'Produto do catálogo'
}

/** Unidade da nota diferente da do produto — apontada, nunca convertida. */
function unitMismatch(item: NfeImportItem): boolean {
  if (!item.productId) return false
  const product = controller.products.value.find(
    (candidate) => candidate.id === item.productId,
  )
  if (!product) return false
  return item.unit.trim().toUpperCase() !== product.unit.trim().toUpperCase()
}

function matchClass(item: NfeImportItem): string {
  if (!item.isMatched) return 'bg-error-500/10 text-error-600'
  if (item.isRemembered) return 'bg-warning-500/10 text-warning-700'
  return 'bg-success-500/10 text-success-600'
}

async function apply(item: NfeImportItem): Promise<void> {
  const productId = picked.value[item.id]
  if (!productId) return

  const ok = await controller.setItemProduct(item.id, productId)
  if (ok) delete picked.value[item.id]
}

/** Item que está sendo cadastrado como produto novo. */
const creatingFor = ref<NfeImportItem | null>(null)
const createOpen = ref(false)

function openCreate(item: NfeImportItem): void {
  creatingFor.value = item
  createOpen.value = true
}

async function onCreateProduct(values: ProductFormValues): Promise<void> {
  const item = creatingFor.value
  if (!item) return

  const ok = await controller.createProductForItem(item.id, values)
  if (ok) {
    createOpen.value = false
    creatingFor.value = null
  }
}

async function onConfirm(): Promise<void> {
  const purchaseId = await controller.confirm()
  if (purchaseId) {
    void controller.router.push({
      name: routeNames.PURCHASE_DETAIL,
      params: { id: purchaseId },
    })
  }
}

function goBack(): void {
  controller.router.push({ name: routeNames.NFE_IMPORTS })
}

function goPurchase(): void {
  const id = nfeImport.value?.purchaseId
  if (id) {
    controller.router.push({
      name: routeNames.PURCHASE_DETAIL,
      params: { id },
    })
  }
}
</script>

<template>
  <header class="mb-6 flex items-start justify-between gap-4">
    <div class="min-w-0">
      <Button variant="ghost" size="sm" class="mb-2" @click="goBack">
        <template #icon><Icon name="ArrowLeft" size="sm" /></template>
        Importações
      </Button>

      <h1
        class="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        {{ nfeImport?.issuerName ?? 'Conferência da nota' }}
      </h1>
      <p v-if="nfeImport" class="mt-1 text-sm text-muted-foreground">
        NF-e {{ nfeImport.number }}/{{ nfeImport.series }} ·
        {{ formatDate(nfeImport.issuedAt.toISOString()) }} ·
        {{ nfeImport.establishmentName ?? 'estabelecimento' }}
      </p>
    </div>

    <div v-if="nfeImport" class="flex shrink-0 items-center gap-2">
      <Button
        v-if="nfeImport.isImported"
        variant="ghost"
        @click="goPurchase"
      >
        <template #icon><Icon name="ShoppingCart" size="sm" /></template>
        Compra #{{ nfeImport.purchaseNumber }}
      </Button>

      <Button
        v-else-if="canImport"
        variant="primary"
        text-class="text-white"
        :loading="controller.confirming.value"
        loading-text="Gerando…"
        :disabled="!nfeImport.canConfirm"
        @click="onConfirm"
      >
        <template #icon><Icon name="Check" size="sm" /></template>
        Gerar compra em rascunho
      </Button>
    </div>
  </header>

  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <div v-if="!controller.loaded.value" class="space-y-3">
    <Skeleton v-for="n in 4" :key="`sk-${n}`" class="h-20 w-full rounded-xl" />
  </div>

  <template v-else-if="nfeImport">
    <!--
      O aviso do que falta vem antes da lista: é o que decide se dá para gerar
      a compra, e escondê-lo no rodapé faria alguém rolar 300 itens para
      descobrir.
    -->
    <div
      v-if="nfeImport.unmatchedCount > 0"
      class="mb-4 flex items-start gap-2 rounded-xl bg-warning-500/10 px-4 py-3 text-sm text-warning-700"
    >
      <Icon name="CircleAlert" size="sm" class="mt-0.5 shrink-0" />
      <span>
        {{ nfeImport.unmatchedCount }}
        {{ nfeImport.unmatchedCount === 1 ? 'item ainda não foi' : 'itens ainda não foram' }}
        reconhecidos. Aponte a que produto do catálogo
        {{ nfeImport.unmatchedCount === 1 ? 'ele corresponde' : 'eles correspondem' }}
        para gerar a compra.
      </span>
    </div>

    <div
      v-else-if="nfeImport.isImported"
      class="mb-4 flex items-start gap-2 rounded-xl bg-success-500/10 px-4 py-3 text-sm text-success-600"
    >
      <Icon name="CircleCheck" size="sm" class="mt-0.5 shrink-0" />
      <span>
        {{ nfeImportStatusLabels[nfeImport.status] }} — compra
        #{{ nfeImport.purchaseNumber }} em rascunho. O estoque só entra quando
        você confirmar a compra.
      </span>
    </div>

    <div
      v-else
      class="mb-4 flex items-start gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary"
    >
      <Icon name="Info" size="sm" class="mt-0.5 shrink-0" />
      <span>
        Todos os itens reconhecidos. Gerar a compra cria um
        <strong>rascunho</strong> — nada entra no estoque até você confirmá-la.
      </span>
    </div>

    <!-- Resumo da nota -->
    <div
      class="ui-shadow-soft mb-4 grid grid-cols-2 gap-4 rounded-xl border border-line-2 bg-background p-4 sm:grid-cols-4"
    >
      <div>
        <p class="text-xs text-muted-foreground">Total da nota</p>
        <p class="text-sm font-medium tabular-nums text-foreground">
          R$ {{ formatMoney(nfeImport.totalAmount) }}
        </p>
      </div>
      <div>
        <p class="text-xs text-muted-foreground">Soma dos itens</p>
        <p class="text-sm font-medium tabular-nums text-foreground">
          R$ {{ formatMoney(nfeImport.itemsTotal) }}
        </p>
      </div>
      <div>
        <p class="text-xs text-muted-foreground">Itens</p>
        <p class="text-sm font-medium tabular-nums text-foreground">
          {{ nfeImport.items.length }}
        </p>
      </div>
      <div>
        <p class="text-xs text-muted-foreground">Parcelas</p>
        <p class="text-sm font-medium tabular-nums text-foreground">
          {{ nfeImport.duplicatas.length || 'à vista' }}
        </p>
      </div>
    </div>

    <!--
      Diferença entre total e soma dos itens é normal (frete, seguro, desconto),
      mas quem confere precisa ver antes de gerar a compra.
    -->
    <p
      v-if="nfeImport.totalDifference !== 0"
      class="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground"
    >
      <Icon name="Info" size="xs" />
      O total da nota difere da soma dos itens em R$
      {{ formatMoney(Math.abs(nfeImport.totalDifference)) }} — normalmente frete,
      seguro ou desconto.
    </p>

    <motion.div
      class="space-y-3"
      :initial="{ opacity: 0, y: 8 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.25 }"
    >
      <article
        v-for="item in controller.sortedItems.value"
        :key="item.id"
        :class="[
          'ui-shadow-soft rounded-xl border bg-background p-4',
          item.isMatched ? 'border-line-2' : 'border-error-500/30',
        ]"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-medium text-foreground">
              {{ item.itemNumber }}. {{ item.description }}
            </p>
            <p class="mt-0.5 text-xs text-muted-foreground">
              Código do fornecedor {{ item.supplierCode }}
              <template v-if="item.gtin"> · GTIN {{ item.gtin }}</template>
              · NCM {{ item.ncm ?? '—' }} · CFOP {{ item.cfop ?? '—' }}
            </p>
            <p class="mt-1 text-xs tabular-nums text-muted-foreground">
              {{ formatQuantity(item.quantity) }} {{ item.unit }} × R$
              {{ formatMoney(item.unitPrice) }} = R$
              {{ formatMoney(item.totalAmount) }}
            </p>
          </div>

          <span
            :class="[
              'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
              matchClass(item),
            ]"
            :title="nfeImportMatchHints[item.match]"
          >
            <Icon
              :name="
                item.isMatched
                  ? item.isRemembered
                    ? 'History'
                    : 'CircleCheck'
                  : 'CircleX'
              "
              size="xs"
            />
            {{ nfeImportMatchLabels[item.match] }}
          </span>
        </div>

        <!-- Casado: mostra a que produto, e por que se confia nisso -->
        <div
          v-if="item.isMatched"
          class="mt-3 flex flex-wrap items-center gap-2 border-t border-line-2 pt-3"
        >
          <Icon name="Package" size="sm" class="text-muted-foreground" />
          <span class="text-sm text-foreground">
            {{ productName(item.productId) }}
          </span>
          <span
            v-if="item.match === NfeImportMatch.SUPPLIER_CODE"
            class="text-xs text-warning-700"
          >
            — {{ nfeImportMatchHints.SUPPLIER_CODE }}
          </span>
        </div>

        <!--
          Não reconhecido: **duas saídas, as duas visíveis**.

          Antes havia só o seletor, e quem recebia mercadoria nova ficava
          travado: procurava numa lista que não continha o produto, e a nota
          inteira parava por causa de um item.
        -->
        <div
          v-else-if="canImport"
          class="mt-3 space-y-3 border-t border-line-2 pt-3"
        >
          <p class="text-xs text-muted-foreground">
            Este item não foi reconhecido no seu catálogo. Escolha o que fazer:
          </p>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div class="sm:flex-1">
              <Combobox
                v-model="picked[item.id]"
                :options="productOptions"
                placeholder="Buscar produto do catálogo…"
                empty-text="Nenhum produto encontrado"
              >
                <template #label>Vincular a um produto existente</template>
              </Combobox>
            </div>
            <Button
              variant="primary"
              text-class="text-white"
              :disabled="!picked[item.id]"
              :loading="controller.savingItemId.value === item.id"
              loading-text="Vinculando…"
              @click="apply(item)"
            >
              Vincular
            </Button>
          </div>

          <!-- A saída para quem não tem o produto: separador honesto, não decorativo -->
          <div class="flex items-center gap-3">
            <span class="h-px flex-1 bg-line-2"></span>
            <span class="text-xs text-muted-foreground">ou</span>
            <span class="h-px flex-1 bg-line-2"></span>
          </div>

          <button
            type="button"
            class="flex w-full items-start gap-3 rounded-xl border border-dashed border-line-3 px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
            @click="openCreate(item)"
          >
            <span
              class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <Icon name="Plus" size="sm" />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-medium text-foreground">
                Cadastrar “{{ item.description }}” como produto novo
              </span>
              <span class="mt-0.5 block text-xs text-muted-foreground">
                Já vem preenchido com nome, código de barras, NCM, unidade e
                custo da nota. Você confere o quadro tributário e ele é
                vinculado a este item.
              </span>
            </span>
          </button>
        </div>

        <p
          v-if="unitMismatch(item)"
          class="mt-2 flex items-center gap-1.5 text-xs text-warning-700"
        >
          <Icon name="TriangleAlert" size="xs" />
          A nota veio em {{ item.unit }} e o produto está em outra unidade — a
          quantidade não é convertida, confira antes de confirmar a compra.
        </p>
      </article>
    </motion.div>
  </template>

  <CreateProductFromNfePanel
    v-model="createOpen"
    :item="creatingFor"
    :loading="controller.creatingProduct.value"
    @submit="onCreateProduct"
  />
</template>
