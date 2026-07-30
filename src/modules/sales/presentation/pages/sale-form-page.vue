<script setup lang="ts">
import { onMounted } from 'vue'
import { Skeleton } from '@/shared/ui'
import SaleForm from '@/modules/sales/presentation/components/sale-form.vue'
import { makeSaleFormController } from '@/modules/sales/factories/sales.factory'
import type { SaleFormValues } from '@/modules/sales/presentation/schemas/sale-schema'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeSaleFormController()
const progress = useProgress()

onMounted(() => progress.track(controller.prepareCreate()))

async function handleSubmit(
  values: SaleFormValues,
  confirm: boolean,
): Promise<void> {
  await progress.track(controller.save(values, confirm))
}

function handleExit(): void {
  controller.router.push({ name: routeNames.SALES })
}

function resolvePrice(productId: string): number | null {
  return controller.salePriceOf(productId)
}
</script>

<template>
  <div class="h-dvh bg-muted/30">
    <!-- Tela imersiva do PDV (fora do AppLayout) -->
    <!-- Carregando o caixa -->
    <div v-if="!controller.loaded.value" class="flex h-dvh flex-col">
      <div class="flex items-center justify-between bg-foreground px-6 py-2.5">
        <Skeleton class="h-8 w-28 rounded-lg" />
        <Skeleton class="h-8 w-40 rounded-full" />
      </div>
      <div class="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
        <div class="flex-1 space-y-3">
          <Skeleton class="h-14 w-full rounded-xl" />
          <Skeleton v-for="n in 4" :key="n" class="h-16 w-full rounded-xl" />
        </div>
        <div class="space-y-3 lg:w-96">
          <Skeleton v-for="n in 5" :key="`s-${n}`" class="h-11 w-full rounded-lg" />
          <Skeleton class="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>

    <!-- PDV -->
    <SaleForm
      v-else
      :products="controller.productItems.value"
      :customer-options="controller.customerOptions.value"
      :establishment-options="controller.establishmentOptions.value"
      :loading="controller.isLoading"
      :finalizing="controller.finalizing.value"
      :resolve-price="resolvePrice"
      @submit="handleSubmit"
      @exit="handleExit"
    />
  </div>
</template>
