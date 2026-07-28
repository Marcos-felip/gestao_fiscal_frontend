<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Modal from '@/shared/components/dialog/modal.vue'
import { Button, Icon, Input, Switch } from '@/shared/ui'
import { toFormErrors } from '@/core/utils/zod-errors'
import type { PermissionProfile } from '@/modules/permissions/domain/entities/permission-profile.entity'
import type { PermissionGroup } from '@/modules/permissions/domain/entities/permission-group.entity'
import {
  profileSchema,
  type ProfileFormData,
} from '@/modules/permissions/presentation/schemas/profile-schema'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  profile: PermissionProfile | null
  catalog: PermissionGroup[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [
    input: { name: string; description?: string; permissionCodes: string[] },
  ]
}>()

const name = ref('')
const description = ref('')
const selected = ref<Set<string>>(new Set())
const errors = ref<Partial<Record<keyof ProfileFormData, string>>>({})

const isEdit = computed(() => props.profile !== null)
const selectedCount = computed(() => selected.value.size)

const domainIcons: Record<string, string> = {
  company: 'Building2',
  users: 'Users',
  establishments: 'Store',
  products: 'Package',
  purchases: 'ShoppingCart',
  sales: 'Receipt',
  stock: 'Layers',
  partners: 'Handshake',
}

function iconFor(domain: string): string {
  return domainIcons[domain] ?? 'KeyRound'
}

function seed(): void {
  name.value = props.profile?.name ?? ''
  description.value = props.profile?.description ?? ''
  selected.value = new Set(props.profile?.permissionCodes ?? [])
  errors.value = {}
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) seed()
  },
  { immediate: true },
)

function toggle(code: string): void {
  const next = new Set(selected.value)
  if (next.has(code)) next.delete(code)
  else next.add(code)
  selected.value = next
}

function selectedInGroup(group: PermissionGroup): number {
  return group.permissions.filter((p) => selected.value.has(p.code)).length
}

function allInGroup(group: PermissionGroup): boolean {
  return (
    group.permissions.length > 0 &&
    group.permissions.every((p) => selected.value.has(p.code))
  )
}

function toggleGroup(group: PermissionGroup): void {
  const next = new Set(selected.value)
  const all = allInGroup(group)
  for (const perm of group.permissions) {
    if (all) next.delete(perm.code)
    else next.add(perm.code)
  }
  selected.value = next
}

function close(): void {
  emit('update:modelValue', false)
}

function handleSubmit(): void {
  const result = profileSchema.safeParse({
    name: name.value,
    description: description.value,
  })
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }
  errors.value = {}
  emit('submit', {
    name: result.data.name,
    description: result.data.description || undefined,
    permissionCodes: [...selected.value],
  })
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    size="lg"
    :title="isEdit ? 'Editar perfil' : 'Novo perfil'"
    description="Um perfil agrupa permissões e é vinculado a usuários do tipo Membro."
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="grid gap-4 sm:grid-cols-2">
        <Input
          v-model="name"
          maxlength="60"
          placeholder="Ex.: Estoquista"
          :error="errors.name"
        >
          <template #label>Nome</template>
        </Input>
        <Input
          v-model="description"
          maxlength="255"
          placeholder="Opcional"
          :error="errors.description"
        >
          <template #label>Descrição</template>
        </Input>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-foreground">Permissões</span>
          <span class="text-xs text-muted-foreground">
            {{ selectedCount }} selecionada{{ selectedCount === 1 ? '' : 's' }}
          </span>
        </div>

        <div
          class="max-h-[46vh] space-y-4 overflow-y-auto rounded-xl border border-line-2 bg-muted/20 p-3"
        >
          <div
            v-for="group in catalog"
            :key="group.domain"
            class="rounded-lg border border-line-2 bg-background"
          >
            <!-- Cabeçalho do domínio -->
            <div class="flex items-center gap-2 border-b border-line-2 px-3 py-2">
              <span
                class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              >
                <Icon :name="iconFor(group.domain)" size="sm" />
              </span>
              <span class="flex-1 text-sm font-medium text-foreground">
                {{ group.label }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ selectedInGroup(group) }}/{{ group.permissions.length }}
              </span>
              <button
                type="button"
                class="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                @click="toggleGroup(group)"
              >
                {{ allInGroup(group) ? 'Limpar' : 'Todas' }}
              </button>
            </div>

            <!-- Permissões do domínio -->
            <div class="divide-y divide-line-2">
              <label
                v-for="perm in group.permissions"
                :key="perm.code"
                class="flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors hover:bg-muted/40"
              >
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm text-foreground">
                    {{ perm.description || perm.code }}
                  </p>
                  <p class="truncate font-mono text-xs text-muted-foreground">
                    {{ perm.code }}
                  </p>
                </div>
                <Switch
                  size="sm"
                  :model-value="selected.has(perm.code)"
                  :aria-label="`Incluir ${perm.code}`"
                  @update:model-value="toggle(perm.code)"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <Button type="button" variant="ghost" :disabled="loading" @click="close">
        Cancelar
      </Button>
      <Button
        type="button"
        variant="primary"
        text-class="text-white"
        :loading="loading"
        loading-text="Salvando…"
        @click="handleSubmit"
      >
        <template #icon><Icon name="Check" size="sm" /></template>
        {{ isEdit ? 'Salvar' : 'Cadastrar' }}
      </Button>
    </template>
  </Modal>
</template>
