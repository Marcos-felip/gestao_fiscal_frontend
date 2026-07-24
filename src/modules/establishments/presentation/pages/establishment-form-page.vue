<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon, Skeleton } from '@/shared/ui'
import EstablishmentForm from '@/modules/establishments/presentation/components/establishment-form.vue'
import { makeEstablishmentFormController } from '@/modules/establishments/factories/establishments.factory'
import type { EstablishmentFormValues } from '@/modules/establishments/presentation/schemas/establishment-schema'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const route = useRoute()
const controller = makeEstablishmentFormController()
const progress = useProgress()

const editId = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : null,
)

onMounted(() => {
  if (editId.value) {
    progress.track(controller.loadForEdit(editId.value))
  } else {
    controller.prepareCreate()
  }
})

async function handleSubmit(values: EstablishmentFormValues): Promise<void> {
  await progress.track(controller.save(values))
}

function handleCancel(): void {
  controller.router.push({ name: routeNames.ESTABLISHMENTS })
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6">
    <button
      type="button"
      class="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      @click="handleCancel"
    >
      <Icon name="ArrowLeft" size="sm" />
      Estabelecimentos
    </button>
    <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
      {{ controller.isEditing ? 'Editar estabelecimento' : 'Novo estabelecimento' }}
    </h1>
  </header>

  <!-- Erro -->
  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <!-- Skeleton (modo edição carregando) -->
  <div v-if="!controller.loaded.value" class="space-y-6">
    <div
      v-for="n in 3"
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
  <EstablishmentForm
    v-else
    :initial="controller.values.value"
    :loading="controller.isLoading"
    :submit-label="
      controller.isEditing ? 'Salvar alterações' : 'Criar estabelecimento'
    "
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
</template>
