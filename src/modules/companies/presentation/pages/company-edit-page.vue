<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Skeleton } from '@/shared/ui'
import CompanyForm from '@/modules/companies/presentation/components/company-form.vue'
import { makeCompanyController } from '@/modules/companies/factories/companies.factory'
import type {
  CompanyFormValues,
  SedeFormValues,
} from '@/modules/companies/presentation/schemas/company-schema'
import { usePermissions } from '@/modules/permissions/presentation/composables/usePermissions'
import { useProgress } from '@/shared/composables'

const controller = makeCompanyController()
const progress = useProgress()
const { can } = usePermissions()

// Sem permissão de edição, a empresa abre em somente leitura.
const readonly = computed(() => !can('company.edit'))

onMounted(() => {
  progress.track(controller.loadCompany())
})

async function handleSubmit(values: {
  company: CompanyFormValues
  sede: SedeFormValues
}): Promise<void> {
  await progress.track(controller.save(values))
}
</script>

<template>

  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <!-- Skeleton de carregamento -->
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
  <CompanyForm
    v-else
    :company="controller.values.value"
    :sede="controller.sede.value"
    :has-sede="controller.hasMatriz.value"
    :loading="controller.isLoading"
    :readonly="readonly"
    @submit="handleSubmit"
  />
</template>
