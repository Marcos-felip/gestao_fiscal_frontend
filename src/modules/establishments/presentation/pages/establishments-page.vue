<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import EstablishmentCard from '@/modules/establishments/presentation/components/establishment-card.vue'
import { makeEstablishmentsListController } from '@/modules/establishments/factories/establishments.factory'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeEstablishmentsListController()
const progress = useProgress()

const confirmOpen = ref(false)
const target = ref<Establishment | null>(null)

onMounted(() => progress.track(controller.loadList()))

function goNew(): void {
  controller.router.push({ name: routeNames.ESTABLISHMENT_NEW })
}

function goEdit(establishment: Establishment): void {
  controller.router.push({
    name: routeNames.ESTABLISHMENT_EDIT,
    params: { id: establishment.id },
  })
}

function askDelete(establishment: Establishment): void {
  target.value = establishment
  confirmOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (!target.value) return
  await progress.track(controller.remove(target.value))
  confirmOpen.value = false
  target.value = null
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

const cardItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
        Estabelecimentos
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Matriz e filiais da sua empresa.
      </p>
    </div>

    <Button variant="primary" text-class="text-white" @click="goNew">
      <template #icon><Icon name="Plus" size="sm" /></template>
      Novo estabelecimento
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
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
  >
    <div
      v-for="n in 6"
      :key="`sk-${n}`"
      class="rounded-xl border border-line-2 bg-background p-5"
    >
      <div class="flex items-center gap-3">
        <Skeleton class="size-11 rounded-xl" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-32 rounded" />
          <Skeleton class="h-3 w-16 rounded" />
        </div>
      </div>
      <Skeleton class="mt-4 h-3 w-40 rounded" />
      <Skeleton class="mt-2 h-3 w-28 rounded" />
    </div>
  </div>

  <!-- Estado vazio -->
  <div
    v-else-if="controller.establishments.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="Store" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhum estabelecimento
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Cadastre a matriz e as filiais da sua empresa para começar.
    </p>
    <div class="mt-5">
      <Button variant="primary" text-class="text-white" @click="goNew">
        <template #icon><Icon name="Plus" size="sm" /></template>
        Novo estabelecimento
      </Button>
    </div>
  </div>

  <!-- Grade de cards -->
  <motion.div
    v-else
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    :variants="container"
    initial="hidden"
    animate="visible"
  >
    <motion.div
      v-for="establishment in controller.establishments.value"
      :key="establishment.id"
      :variants="cardItem"
    >
      <EstablishmentCard
        :establishment="establishment"
        :deleting="controller.deletingId.value === establishment.id"
        @edit="goEdit(establishment)"
        @delete="askDelete(establishment)"
      />
    </motion.div>
  </motion.div>

  <!-- Confirmação de exclusão -->
  <ConfirmDialog
    v-model="confirmOpen"
    title="Excluir estabelecimento"
    :description="`Tem certeza que deseja excluir “${target?.name}”? Esta ação não pode ser desfeita.`"
    confirm-label="Excluir"
    cancel-label="Cancelar"
    variant="destructive"
    icon="Trash2"
    :loading="controller.isLoading"
    @confirm="confirmDelete"
  />
</template>
