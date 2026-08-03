<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Skeleton } from '@/shared/ui'
import SaleForm from '@/modules/sales/presentation/components/sale-form.vue'
import { makeSaleFormController } from '@/modules/sales/factories/sales.factory'
import OpenCashSessionPanel from '@/modules/cash/presentation/components/open-cash-session-panel.vue'
import CashMovementDialog from '@/modules/cash/presentation/components/cash-movement-dialog.vue'
import CloseCashSessionDialog from '@/modules/cash/presentation/components/close-cash-session-dialog.vue'
import { makeCashSessionController } from '@/modules/cash/factories/cash.factory'
import type { OpenCashSessionDto } from '@/modules/cash/domain/dto/open-cash-session-dto'
import type { CreateCashMovementDto } from '@/modules/cash/domain/dto/create-cash-movement-dto'
import type { CloseCashSessionDto } from '@/modules/cash/domain/dto/close-cash-session-dto'
import { CashMovementType } from '@/enums/cash-movement-type.enum'
import type { SaleFormValues } from '@/modules/sales/presentation/schemas/sale-schema'
import type { CreateSalePaymentInput } from '@/modules/sales/domain/dto/create-sale-dto'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'
import { usePermissions } from '@/shared/composables/usePermissions'

const controller = makeSaleFormController()
const cash = makeCashSessionController()
const progress = useProgress()
const { can } = usePermissions()

const movementType = ref<CashMovementType>(CashMovementType.SUPRIMENTO)
const movementOpen = ref(false)
const closeOpen = ref(false)

const ready = computed(() => controller.loaded.value && cash.loaded.value)
const canManageRegisters = computed(() => can('cash-registers.list'))

onMounted(async () => {
  await progress.track(
    Promise.all([controller.prepareCreate(), cash.loadCurrent()]),
  )
  if (!cash.current.value) await cash.loadRegisters()
})

async function handleSubmit(
  values: SaleFormValues,
  confirm: boolean,
  payments?: CreateSalePaymentInput[],
): Promise<void> {
  await progress.track(controller.save(values, confirm, payments))
}

function handleExit(): void {
  controller.router.push({ name: routeNames.SALES })
}

function resolvePrice(productId: string): number | null {
  return controller.salePriceOf(productId)
}

// ---- Caixa ----
async function onOpenCash(dto: OpenCashSessionDto): Promise<void> {
  await cash.open(dto)
}

function goManageRegisters(): void {
  controller.router.push({ name: routeNames.CASH_REGISTERS })
}

function openMovement(type: CashMovementType): void {
  movementType.value = type
  movementOpen.value = true
}

async function onMovementConfirm(dto: CreateCashMovementDto): Promise<void> {
  const ok = await cash.addMovement(dto)
  if (ok) movementOpen.value = false
}

async function onCloseConfirm(dto: CloseCashSessionDto): Promise<void> {
  const closed = await cash.close(dto)
  if (closed) {
    closeOpen.value = false
    controller.router.push({
      name: routeNames.CASH_SESSION_DETAIL,
      params: { id: closed.id },
    })
  }
}
</script>

<template>
  <div class="h-dvh bg-muted/30">
    <!-- Tela imersiva do PDV (fora do AppLayout) -->
    <!-- Carregando o caixa -->
    <div v-if="!ready" class="flex h-dvh flex-col">
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

    <!-- Sem caixa aberto: gate de abertura -->
    <OpenCashSessionPanel
      v-else-if="!cash.current.value"
      :registers="cash.registers.value"
      :registers-loaded="cash.registersLoaded.value"
      :opening="cash.opening.value"
      :can-manage-registers="canManageRegisters"
      @open="onOpenCash"
      @exit="handleExit"
      @manage-registers="goManageRegisters"
    />

    <!-- PDV -->
    <SaleForm
      v-else
      :products="controller.productItems.value"
      :customer-options="controller.customerOptions.value"
      :establishment-options="controller.establishmentOptions.value"
      :loading="controller.isLoading"
      :finalizing="controller.finalizing.value"
      :resolve-price="resolvePrice"
      :cash-register-name="cash.current.value.cashRegisterName"
      @submit="handleSubmit"
      @exit="handleExit"
      @suprimento="openMovement(CashMovementType.SUPRIMENTO)"
      @sangria="openMovement(CashMovementType.SANGRIA)"
      @fechar-caixa="closeOpen = true"
    />

    <!-- Sangria / Suprimento -->
    <CashMovementDialog
      v-model="movementOpen"
      :type="movementType"
      :loading="cash.acting.value"
      @confirm="onMovementConfirm"
    />

    <!-- Fechar caixa -->
    <CloseCashSessionDialog
      v-if="cash.current.value"
      v-model="closeOpen"
      :session="cash.current.value"
      :loading="cash.acting.value"
      @confirm="onCloseConfirm"
    />
  </div>
</template>
