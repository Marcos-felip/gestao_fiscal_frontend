<script setup lang="ts">
import { onMounted } from 'vue'
import { Button, Icon, Skeleton } from '@/shared/ui'
import PurchaseForm from '@/modules/purchases/presentation/components/purchase-form.vue'
import { makePurchaseFormController } from '@/modules/purchases/factories/purchases.factory'
import type { PurchaseFormValues } from '@/modules/purchases/presentation/schemas/purchase-schema'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makePurchaseFormController()
const progress = useProgress()

onMounted(() => progress.track(controller.prepareCreate()))

async function handleSubmit(values: PurchaseFormValues): Promise<void> {
  await progress.track(controller.save(values))
}

function handleCancel(): void {
  controller.router.push({ name: routeNames.PURCHASES })
}

function resolvePrice(productId: string): number | null {
  return controller.costPriceOf(productId)
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
      Nova compra
    </h1>

    <Button variant="ghost" @click="handleCancel">
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
  <div v-if="!controller.loaded.value" class="space-y-6">
    <div
      v-for="n in 2"
      :key="`sk-section-${n}`"
      class="rounded-xl border border-line-2 bg-background p-6"
    >
      <div class="flex items-center gap-3">
        <Skeleton class="size-11 rounded-xl" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-40 rounded" />
          <Skeleton class="h-3 w-56 rounded" />
        </div>
      </div>
      <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Skeleton class="h-11 w-full rounded-lg" />
        <Skeleton class="h-11 w-full rounded-lg" />
      </div>
    </div>
  </div>

  <!-- Formulário -->
  <PurchaseForm
    v-else
    :establishment-options="controller.establishmentOptions.value"
    :product-options="controller.productOptions.value"
    :supplier-options="controller.supplierOptions.value"
    :loading="controller.isLoading"
    :resolve-price="resolvePrice"
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
</template>
