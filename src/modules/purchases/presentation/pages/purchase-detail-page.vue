<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'motion-v'
import { Button, DatePicker, Icon, Input, Select, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import FormSection from '@/shared/components/form/form-section.vue'
import PurchaseStatusBadge from '@/modules/purchases/presentation/components/purchase-status-badge.vue'
import { makePurchaseDetailController } from '@/modules/purchases/factories/purchases.factory'
import { usePermissions } from '@/modules/permissions/presentation/composables/usePermissions'
import { PurchaseStatus } from '@/enums/purchase-status.enum'
import { unitOfMeasureShortLabels } from '@/enums/unit-of-measure.enum'
import { formatMoney, formatQuantity } from '@/shared/ui/utils/masks'
import { formatDate } from '@/core/utils/date'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const route = useRoute()
const controller = makePurchaseDetailController()
const progress = useProgress()
const { can } = usePermissions()

const canEdit = computed(() => can('purchases.edit'))
const canConfirm = computed(() => can('purchases.confirm'))
const canCancel = computed(() => can('purchases.cancel'))
const canDelete = computed(() => can('purchases.delete'))

const isCancelled = computed(
  () => controller.purchase.value?.status === PurchaseStatus.CANCELLED,
)
const canEditMeta = computed(() => controller.isDraft.value && canEdit.value)

type PendingAction = 'confirm' | 'cancel' | 'delete'
const pendingAction = ref<PendingAction | null>(null)
const dialogOpen = ref(false)

const dialogConfig = computed(() => {
  switch (pendingAction.value) {
    case 'confirm':
      return {
        title: 'Confirmar compra',
        description:
          'Confirmar dará entrada no estoque de cada item desta compra. Deseja continuar?',
        label: 'Confirmar',
        variant: 'primary' as const,
        icon: 'CircleCheck',
      }
    case 'cancel':
      return {
        title: 'Cancelar compra',
        description: controller.isConfirmed.value
          ? 'Cancelar esta compra estornará o estoque (movimentação de saída). Deseja continuar?'
          : 'Deseja cancelar esta compra?',
        label: 'Cancelar compra',
        variant: 'destructive' as const,
        icon: 'Ban',
      }
    default:
      return {
        title: 'Excluir compra',
        description: 'Excluir permanentemente esta compra? Não pode ser desfeito.',
        label: 'Excluir',
        variant: 'destructive' as const,
        icon: 'Trash2',
      }
  }
})

onMounted(() => {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  if (id) progress.track(controller.load(id))
})

function ask(action: PendingAction): void {
  pendingAction.value = action
  dialogOpen.value = true
}

async function onDialogConfirm(): Promise<void> {
  const action = pendingAction.value
  if (action === 'confirm') await progress.track(controller.confirm())
  else if (action === 'cancel') await progress.track(controller.cancel())
  else if (action === 'delete') await progress.track(controller.remove())
  dialogOpen.value = false
  pendingAction.value = null
}

function goBack(): void {
  controller.router.push({ name: routeNames.PURCHASES })
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div class="flex items-center gap-3">
      <h1
        class="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        Compra
        <span v-if="controller.purchase.value">
          #{{ controller.purchase.value.purchaseNumber }}
        </span>
      </h1>
      <PurchaseStatusBadge
        v-if="controller.purchase.value"
        :status="controller.purchase.value.status"
      />
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
  <div v-if="!controller.loaded.value" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div class="rounded-xl border border-line-2 bg-background p-6 lg:col-span-2">
      <Skeleton class="h-5 w-40 rounded" />
      <div class="mt-6 space-y-3">
        <Skeleton v-for="n in 3" :key="n" class="h-10 w-full rounded" />
      </div>
    </div>
    <div class="rounded-xl border border-line-2 bg-background p-6">
      <Skeleton class="h-5 w-32 rounded" />
      <div class="mt-6 space-y-3">
        <Skeleton v-for="n in 4" :key="n" class="h-8 w-full rounded" />
      </div>
    </div>
  </div>

  <!-- Conteúdo -->
  <motion.div
    v-else-if="controller.purchase.value"
    class="grid grid-cols-1 gap-6 lg:grid-cols-3"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <!-- Coluna: itens -->
    <div class="min-w-0 lg:col-span-2">
      <FormSection
        icon="Package"
        title="Itens"
        description="Produtos incluídos nesta compra."
      >
        <div class="overflow-x-auto">
          <table class="w-full min-w-[480px] text-left text-sm">
            <thead
              class="border-b border-line-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              <tr>
                <th class="py-2 pr-4 font-medium">Produto</th>
                <th class="px-4 py-2 text-right font-medium">Qtd.</th>
                <th class="px-4 py-2 text-right font-medium">Preço un.</th>
                <th class="py-2 pl-4 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line-2">
              <tr v-for="line in controller.purchase.value.items" :key="line.id">
                <td class="py-3 pr-4">
                  <p class="font-medium text-foreground">
                    {{ line.productName ?? 'Produto' }}
                  </p>
                  <p v-if="line.productUnit" class="text-xs text-muted-foreground">
                    {{
                      unitOfMeasureShortLabels[line.productUnit] ??
                      line.productUnit
                    }}
                  </p>
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {{ formatQuantity(line.quantity) }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  R$ {{ formatMoney(line.unitPrice) }}
                </td>
                <td class="py-3 pl-4 text-right tabular-nums font-medium text-foreground">
                  R$ {{ formatMoney(line.total) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-line-2">
                <td colspan="3" class="py-3 pr-4 text-right text-sm text-muted-foreground">
                  Total da compra
                </td>
                <td class="py-3 pl-4 text-right">
                  <span
                    class="font-display text-lg font-bold tabular-nums text-foreground"
                  >
                    R$ {{ formatMoney(controller.purchase.value.totalAmount) }}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </FormSection>
    </div>

    <!-- Coluna: dados + ações -->
    <div class="min-w-0 space-y-6">
      <FormSection
        icon="ReceiptText"
        title="Dados"
        :description="
          canEditMeta ? 'Editável enquanto rascunho.' : 'Somente leitura.'
        "
      >
        <!-- Editável (rascunho + permissão) -->
        <div v-if="canEditMeta" class="space-y-4">
          <Select
            v-model="controller.meta.value.supplierId"
            :options="controller.supplierOptions.value"
            placeholder="Selecione o fornecedor"
          >
            <template #label>Fornecedor</template>
          </Select>
          <DatePicker v-model="controller.meta.value.purchaseDate">
            <template #label>Data da compra</template>
          </DatePicker>
          <Input
            v-model="controller.meta.value.notes"
            maxlength="1000"
            placeholder="Observações"
          >
            <template #label>Observações</template>
          </Input>
          <Button
            variant="primary"
            text-class="text-white"
            full-width
            :loading="controller.acting.value"
            @click="controller.saveMeta()"
          >
            <template #icon><Icon name="Check" size="sm" /></template>
            Salvar alterações
          </Button>
        </div>

        <!-- Leitura -->
        <dl v-else class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Fornecedor</dt>
            <dd class="text-right font-medium text-foreground">
              {{ controller.purchase.value.supplierName ?? '—' }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Estabelecimento</dt>
            <dd class="text-right font-medium text-foreground">
              {{ controller.purchase.value.establishmentName ?? '—' }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Data</dt>
            <dd class="text-right font-medium text-foreground">
              {{ formatDate(controller.purchase.value.purchaseDate) }}
            </dd>
          </div>
          <div
            v-if="controller.purchase.value.notes"
            class="border-t border-line-2 pt-3"
          >
            <dt class="mb-1 text-muted-foreground">Observações</dt>
            <dd class="text-foreground">
              {{ controller.purchase.value.notes }}
            </dd>
          </div>
        </dl>
      </FormSection>

      <!-- Ações de ciclo de vida -->
      <div
        v-if="
          (controller.isDraft.value && (canConfirm || canCancel)) ||
          (isCancelled && canDelete) ||
          (controller.isConfirmed.value && canCancel)
        "
        class="rounded-xl border border-line-2 bg-background p-4 space-y-2.5"
      >
        <Button
          v-if="controller.isDraft.value && canConfirm"
          variant="primary"
          text-class="text-white"
          full-width
          :disabled="controller.acting.value"
          @click="ask('confirm')"
        >
          <template #icon><Icon name="CircleCheck" size="sm" /></template>
          Confirmar compra
        </Button>
        <Button
          v-if="
            (controller.isDraft.value || controller.isConfirmed.value) &&
            canCancel
          "
          variant="secondary"
          full-width
          :disabled="controller.acting.value"
          @click="ask('cancel')"
        >
          <template #icon><Icon name="Ban" size="sm" /></template>
          Cancelar compra
        </Button>
        <Button
          v-if="(controller.isDraft.value || isCancelled) && canDelete"
          variant="ghost"
          full-width
          class="text-destructive"
          :disabled="controller.acting.value"
          @click="ask('delete')"
        >
          <template #icon><Icon name="Trash2" size="sm" /></template>
          Excluir compra
        </Button>
      </div>
    </div>
  </motion.div>

  <!-- Diálogo de confirmação de ação -->
  <ConfirmDialog
    v-model="dialogOpen"
    :title="dialogConfig.title"
    :description="dialogConfig.description"
    :confirm-label="dialogConfig.label"
    cancel-label="Voltar"
    :variant="dialogConfig.variant"
    :icon="dialogConfig.icon"
    :loading="controller.acting.value"
    @confirm="onDialogConfirm"
  />
</template>
