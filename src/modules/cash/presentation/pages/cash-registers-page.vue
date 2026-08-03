<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import CashRegisterDialog from '@/modules/cash/presentation/components/cash-register-dialog.vue'
import { makeCashRegistersController } from '@/modules/cash/factories/cash.factory'
import type { CashRegister } from '@/modules/cash/domain/entities/cash-register.entity'
import { CreateCashRegisterDto } from '@/modules/cash/domain/dto/create-cash-register-dto'
import { UpdateCashRegisterDto } from '@/modules/cash/domain/dto/update-cash-register-dto'
import type { CashRegisterFormValues } from '@/modules/cash/presentation/schemas/cash-register-schema'
import { usePermissions } from '@/shared/composables/usePermissions'
import { useProgress } from '@/shared/composables'

const controller = makeCashRegistersController()
const progress = useProgress()
const { can } = usePermissions()

const canCreate = computed(() => can('cash-registers.create'))
const canEdit = computed(() => can('cash-registers.edit'))
const canDelete = computed(() => can('cash-registers.delete'))

const dialogOpen = ref(false)
const editing = ref<CashRegister | null>(null)
const confirmOpen = ref(false)
const target = ref<CashRegister | null>(null)

onMounted(() => progress.track(controller.load()))

function openCreate(): void {
  editing.value = null
  dialogOpen.value = true
}

function openEdit(register: CashRegister): void {
  editing.value = register
  dialogOpen.value = true
}

async function onSubmit(values: CashRegisterFormValues): Promise<void> {
  const ok = editing.value
    ? await controller.update(
        editing.value.id,
        new UpdateCashRegisterDto({ name: values.name.trim(), isActive: values.isActive }),
      )
    : await controller.create(
        new CreateCashRegisterDto({
          establishmentId: values.establishmentId,
          name: values.name.trim(),
          isActive: values.isActive,
        }),
      )
  if (ok) dialogOpen.value = false
}

function askDelete(register: CashRegister): void {
  target.value = register
  confirmOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (!target.value) return
  await controller.remove(target.value)
  confirmOpen.value = false
  target.value = null
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
}
const rowItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
}
</script>

<template>
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
        Caixas
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Terminais onde os operadores abrem e fecham o caixa no PDV.
      </p>
    </div>
    <Button
      v-if="canCreate"
      variant="primary"
      text-class="text-white"
      @click="openCreate"
    >
      <template #icon><Icon name="Plus" size="sm" /></template>
      Novo caixa
    </Button>
  </header>

  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <!-- Skeleton -->
  <div
    v-if="!controller.loaded.value"
    class="space-y-2"
  >
    <Skeleton v-for="n in 4" :key="`sk-${n}`" class="h-16 w-full rounded-xl" />
  </div>

  <!-- Vazio -->
  <div
    v-else-if="controller.registers.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="Monitor" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhum caixa cadastrado
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Cadastre os terminais de caixa para começar a operar o PDV.
    </p>
    <div v-if="canCreate" class="mt-5">
      <Button variant="primary" text-class="text-white" @click="openCreate">
        <template #icon><Icon name="Plus" size="sm" /></template>
        Novo caixa
      </Button>
    </div>
  </div>

  <!-- Lista -->
  <motion.div
    v-else
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
    :variants="container"
    initial="hidden"
    animate="visible"
  >
    <motion.div
      v-for="register in controller.registers.value"
      :key="register.id"
      class="flex items-center gap-4 border-b border-line-2 px-4 py-3 last:border-b-0"
      :variants="rowItem"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
      >
        <Icon name="Monitor" size="sm" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium text-foreground">{{ register.name }}</p>
        <p v-if="register.establishmentName" class="truncate text-sm text-muted-foreground">
          {{ register.establishmentName }}
        </p>
      </div>
      <span
        :class="[
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
          register.isActive
            ? 'bg-success-500/10 text-success-600'
            : 'bg-muted text-muted-foreground',
        ]"
      >
        <Icon :name="register.isActive ? 'CircleCheck' : 'CircleOff'" size="sm" />
        {{ register.isActive ? 'Ativo' : 'Inativo' }}
      </span>
      <div class="flex items-center gap-1">
        <button
          v-if="canEdit"
          type="button"
          class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Editar caixa"
          @click="openEdit(register)"
        >
          <Icon name="Pencil" size="sm" />
        </button>
        <button
          v-if="canDelete"
          type="button"
          class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
          title="Excluir caixa"
          :disabled="controller.deletingId.value === register.id"
          @click="askDelete(register)"
        >
          <Icon name="Trash2" size="sm" />
        </button>
      </div>
    </motion.div>
  </motion.div>

  <!-- Dialog de cadastro/edição -->
  <CashRegisterDialog
    v-model="dialogOpen"
    :register="editing"
    :establishment-options="controller.establishmentOptions.value"
    :loading="controller.saving.value"
    @submit="onSubmit"
  />

  <!-- Confirmação de exclusão -->
  <ConfirmDialog
    v-model="confirmOpen"
    title="Excluir caixa"
    :description="`Tem certeza que deseja excluir “${target?.name}”? Esta ação não pode ser desfeita.`"
    confirm-label="Excluir"
    cancel-label="Cancelar"
    variant="destructive"
    icon="Trash2"
    :loading="controller.isLoading"
    @confirm="confirmDelete"
  />
</template>
