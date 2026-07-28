<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, SearchInput, Select, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import PartnerTypeBadge from '@/modules/partners/presentation/components/partner-type-badge.vue'
import { makePartnersListController } from '@/modules/partners/factories/partners.factory'
import type { Partner } from '@/modules/partners/domain/entities/partner.entity'
import { usePermissions } from '@/modules/permissions/presentation/composables/usePermissions'
import { partnerTypeOptions } from '@/enums/partner-type.enum'
import type { PartnerType } from '@/enums/partner-type.enum'
import { PersonType } from '@/enums/person-type.enum'
import { formatCpf, formatCnpj } from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makePartnersListController()
const progress = useProgress()
const { can } = usePermissions()

const canCreate = computed(() => can('partners.create'))
const canEdit = computed(() => can('partners.edit'))
const canDelete = computed(() => can('partners.delete'))
const canView = computed(() => can('partners.read'))

const searchTerm = ref('')
const typeValue = ref('')

const typeFilterOptions = [{ value: '', label: 'Todos' }, ...partnerTypeOptions]

const confirmOpen = ref(false)
const target = ref<Partner | null>(null)

onMounted(() => progress.track(controller.loadList()))

// Busca com debounce: reseta para página 1 no controller.
let debounceTimer: ReturnType<typeof setTimeout> | null = null
function onSearch(value: string): void {
  searchTerm.value = value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void progress.track(controller.setSearch(value))
  }, 400)
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

function onType(value: string): void {
  typeValue.value = value
  void progress.track(controller.setType(value as PartnerType | ''))
}

function goNew(): void {
  controller.router.push({ name: routeNames.PARTNER_NEW })
}

function goEdit(partner: Partner): void {
  controller.router.push({
    name: routeNames.PARTNER_EDIT,
    params: { id: partner.id },
  })
}

function askDelete(partner: Partner): void {
  target.value = partner
  confirmOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (!target.value) return
  await progress.track(controller.remove(target.value))
  confirmOpen.value = false
  target.value = null
}

function formatDocument(partner: Partner): string {
  if (!partner.cpfCnpj) return '—'
  return partner.personType === PersonType.PF
    ? formatCpf(partner.cpfCnpj)
    : formatCnpj(partner.cpfCnpj)
}

function prevPage(): void {
  void progress.track(controller.goToPage(controller.page.value - 1))
}

function nextPage(): void {
  void progress.track(controller.goToPage(controller.page.value + 1))
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1
        class="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        Parceiros
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Clientes e fornecedores da sua empresa.
      </p>
    </div>

    <Button
      v-if="canCreate"
      variant="primary"
      text-class="text-white"
      @click="goNew"
    >
      <template #icon><Icon name="Plus" size="sm" /></template>
      Novo parceiro
    </Button>
  </header>

  <!-- Toolbar: busca + filtro por tipo -->
  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
    <div class="sm:max-w-xs sm:flex-1">
      <SearchInput
        :model-value="searchTerm"
        placeholder="Buscar por nome…"
        @update:model-value="onSearch"
      />
    </div>
    <div class="sm:w-48">
      <Select
        :model-value="typeValue"
        :options="typeFilterOptions"
        placeholder="Tipo"
        @update:model-value="onType"
      />
    </div>
  </div>

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
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
  >
    <div
      v-for="n in 6"
      :key="`sk-${n}`"
      class="flex items-center gap-4 border-b border-line-2 px-4 py-3 last:border-b-0"
    >
      <div class="flex-1 space-y-2">
        <Skeleton class="h-3.5 w-40 rounded" />
        <Skeleton class="h-3 w-24 rounded" />
      </div>
      <Skeleton class="h-5 w-16 rounded-full" />
      <Skeleton class="h-3 w-32 rounded" />
    </div>
  </div>

  <!-- Empty -->
  <div
    v-else-if="controller.partners.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="Users" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhum parceiro encontrado
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Cadastre clientes e fornecedores para usá-los nos seus documentos.
    </p>
    <div v-if="canCreate" class="mt-5">
      <Button variant="primary" text-class="text-white" @click="goNew">
        <template #icon><Icon name="Plus" size="sm" /></template>
        Novo parceiro
      </Button>
    </div>
  </div>

  <!-- Tabela -->
  <motion.div
    v-else
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead
          class="border-b border-line-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          <tr>
            <th class="px-4 py-3 font-medium">Nome</th>
            <th class="px-4 py-3 font-medium">Tipo</th>
            <th class="px-4 py-3 font-medium">CPF/CNPJ</th>
            <th class="px-4 py-3 font-medium">Contato</th>
            <th class="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line-2">
          <tr
            v-for="partner in controller.partners.value"
            :key="partner.id"
            class="transition-colors hover:bg-muted/40"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-foreground">{{ partner.name }}</p>
              <p v-if="partner.tradeName" class="text-xs text-muted-foreground">
                {{ partner.tradeName }}
              </p>
            </td>
            <td class="px-4 py-3">
              <PartnerTypeBadge :type="partner.type" />
            </td>
            <td class="px-4 py-3 tabular-nums text-muted-foreground">
              {{ formatDocument(partner) }}
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              <p v-if="partner.email" class="truncate">{{ partner.email }}</p>
              <p v-if="partner.phone" class="text-xs">{{ partner.phone }}</p>
              <span v-if="!partner.email && !partner.phone">—</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  v-if="canEdit"
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Editar"
                  @click="goEdit(partner)"
                >
                  <Icon name="Pencil" size="sm" />
                </button>
                <button
                  v-else-if="canView"
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Ver"
                  @click="goEdit(partner)"
                >
                  <Icon name="Eye" size="sm" />
                </button>
                <button
                  v-if="canDelete"
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Excluir"
                  :disabled="controller.deletingId.value === partner.id"
                  @click="askDelete(partner)"
                >
                  <Icon name="Trash2" size="sm" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div
      class="flex items-center justify-between gap-4 border-t border-line-2 px-4 py-3"
    >
      <p class="text-sm text-muted-foreground">
        {{ controller.total.value }}
        {{ controller.total.value === 1 ? 'parceiro' : 'parceiros' }}
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="controller.page.value <= 1"
          title="Página anterior"
          @click="prevPage"
        >
          <Icon name="ChevronLeft" size="sm" />
        </button>
        <span class="text-sm tabular-nums text-muted-foreground">
          Página {{ controller.page.value }} de
          {{ controller.totalPages.value }}
        </span>
        <button
          type="button"
          class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="controller.page.value >= controller.totalPages.value"
          title="Próxima página"
          @click="nextPage"
        >
          <Icon name="ChevronRight" size="sm" />
        </button>
      </div>
    </div>
  </motion.div>

  <!-- Confirmação de exclusão -->
  <ConfirmDialog
    v-model="confirmOpen"
    title="Excluir parceiro"
    :description="`Tem certeza que deseja excluir “${target?.name}”? Esta ação não pode ser desfeita.`"
    confirm-label="Excluir"
    cancel-label="Cancelar"
    variant="destructive"
    icon="Trash2"
    :loading="controller.isLoading"
    @confirm="confirmDelete"
  />
</template>
