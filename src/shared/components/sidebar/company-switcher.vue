<template>
  <div v-if="active" class="company-switcher px-3 pb-2">
    <!-- Uma empresa: linha estática, sem dropdown -->
    <div
      v-if="!store.hasMultiple"
      class="flex items-center gap-3 rounded-lg border border-line-2 px-3 py-2"
    >
      <Avatar :initials="initialsOf(active.name)" size="sm" shape="circle" />
      <div class="min-w-0">
        <Span size="sm" weight="semibold" class="truncate">
          {{ active.name }}
        </Span>
        <Span size="xs" variant="muted" class="truncate">Empresa ativa</Span>
      </div>
    </div>

    <!-- Múltiplas empresas: dropdown para trocar -->
    <Dropdown
      v-else
      align="left"
      trigger-label="Trocar empresa"
      trigger-class="flex w-full items-center gap-3 rounded-lg border border-line-2 px-3 py-2 text-left transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
      menu-class="w-[--sidebar-switcher-w] max-h-72 overflow-y-auto"
    >
      <template #trigger="{ open }">
        <Avatar :initials="initialsOf(active.name)" size="sm" shape="circle" />
        <div class="min-w-0 flex-1">
          <Span size="sm" weight="semibold" class="truncate">
            {{ active.name }}
          </Span>
          <Span size="xs" variant="muted" class="truncate">
            Trocar empresa
          </Span>
        </div>
        <Icon
          name="ChevronsUpDown"
          size="sm"
          :class="['shrink-0 text-muted-foreground transition-transform', open && 'rotate-180']"
        />
      </template>

      <template #default="{ close }">
        <button
          v-for="company in store.companies"
          :key="company.id"
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="controller.switchingId.value !== null"
          @click="onSelect(company.id, close)"
        >
          <Avatar :initials="initialsOf(company.name)" size="sm" shape="circle" />
          <span class="min-w-0 flex-1 truncate text-foreground">
            {{ company.name }}
          </span>
          <Spinner
            v-if="controller.switchingId.value === company.id"
            size="sm"
            class="text-primary"
          />
          <Icon
            v-else-if="company.id === active.id"
            name="Check"
            size="sm"
            class="shrink-0 text-primary"
          />
        </button>
      </template>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Avatar, Dropdown, Icon, Span, Spinner } from '@/shared/ui'
import { useCompaniesStore } from '@/modules/companies/presentation/stores/companies-store'
import { makeCompanySwitcherController } from '@/modules/companies/factories/companies.factory'

const store = useCompaniesStore()
const controller = makeCompanySwitcherController()

const active = computed(() => store.activeCompany)

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

async function onSelect(companyId: string, close: () => void): Promise<void> {
  close()
  await controller.switchTo(companyId)
}
</script>

<style scoped>
.company-switcher {
  /* Largura do menu do dropdown alinhada à sidebar. */
  --sidebar-switcher-w: 14rem;
}
</style>
