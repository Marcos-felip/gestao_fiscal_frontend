<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Icon, Skeleton } from '@/shared/ui'
import ProductForm from '@/modules/products/presentation/components/product-form.vue'
import { makeProductFormController } from '@/modules/products/factories/products.factory'
import type { ProductFormValues } from '@/modules/products/presentation/schemas/product-schema'
import { usePermissions } from '@/shared/composables/usePermissions'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const route = useRoute()
const controller = makeProductFormController()
const progress = useProgress()
const { can } = usePermissions()

const editId = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : null,
)

// Ao editar sem permissão de edição, a tela abre em somente leitura.
const readonly = computed(() => Boolean(editId.value) && !can('products.edit'))

onMounted(() => {
  if (editId.value) {
    progress.track(controller.loadForEdit(editId.value))
  } else {
    controller.prepareCreate()
  }
})

async function handleSubmit(values: ProductFormValues): Promise<void> {
  await progress.track(controller.save(values))
}

function handleCancel(): void {
  controller.router.push({ name: routeNames.PRODUCTS })
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
      {{
        readonly
          ? 'Produto'
          : controller.isEditing
            ? 'Editar produto'
            : 'Novo produto'
      }}
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
  <ProductForm
    v-else
    :initial="controller.values.value"
    :loading="controller.isLoading"
    :readonly="readonly"
    :submit-label="
      controller.isEditing ? 'Salvar alterações' : 'Criar produto'
    "
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
</template>
