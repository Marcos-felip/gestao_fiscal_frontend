<template>
  <div v-if="active" class="company-switcher">
    <!-- Uma empresa: pílula estática (apenas contexto) -->
    <div
      v-if="!store.hasMultiple"
      class="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/90"
    >
      <Icon name="Building2" size="sm" class="shrink-0" />
      <span class="hidden max-w-[10rem] truncate sm:inline">
        {{ active.name }}
      </span>
    </div>

    <!-- Múltiplas empresas: dropdown para trocar -->
    <Dropdown
      v-else
      align="left"
      trigger-label="Trocar empresa"
      trigger-class="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/90 transition-colors duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
      trigger-active-class="bg-white/10"
      menu-class="w-64 max-h-72 overflow-y-auto"
    >
      <template #trigger="{ open }">
        <Icon name="Building2" size="sm" class="shrink-0" />
        <span class="hidden max-w-[10rem] truncate sm:inline">
          {{ active.name }}
        </span>
        <Icon
          name="ChevronsUpDown"
          size="sm"
          :class="['shrink-0 transition-transform', open && 'rotate-180']"
        />
      </template>

      <template #default="{ close }">
        <p
          class="px-3 pb-1 pt-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          Trocar empresa
        </p>
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
import { Avatar, Dropdown, Icon, Spinner } from '@/shared/ui'
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
