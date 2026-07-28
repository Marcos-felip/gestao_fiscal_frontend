<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '@/shared/components/dialog/modal.vue'
import { Button, Icon, Switch } from '@/shared/ui'
import type { PermissionProfile } from '@/modules/permissions/domain/entities/permission-profile.entity'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  memberName: string
  profiles: PermissionProfile[]
  currentProfileIds: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [profileIds: string[]]
}>()

const selected = ref<Set<string>>(new Set())

watch(
  () => props.modelValue,
  (open) => {
    if (open) selected.value = new Set(props.currentProfileIds)
  },
  { immediate: true },
)

function toggle(id: string): void {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

function close(): void {
  emit('update:modelValue', false)
}

function handleSubmit(): void {
  emit('submit', [...selected.value])
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="Perfis do usuário"
    size="lg"
    :description="`Defina os perfis de permissão de ${memberName}.`"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Sem perfis cadastrados -->
    <div
      v-if="profiles.length === 0"
      class="rounded-xl border border-dashed border-line-3 px-4 py-8 text-center"
    >
      <span
        class="mx-auto flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
      >
        <Icon name="ShieldPlus" size="md" />
      </span>
      <p class="mt-3 text-sm text-muted-foreground">
        Nenhum perfil cadastrado. Crie perfis em
        <span class="font-medium text-foreground">Perfis de permissão</span>.
      </p>
    </div>

    <!-- Lista de perfis -->
    <div v-else class="max-h-[46vh] space-y-2 overflow-y-auto">
      <label
        v-for="profile in profiles"
        :key="profile.id"
        class="flex cursor-pointer items-center gap-3 rounded-xl border border-line-2 px-3 py-2.5 transition-colors hover:bg-muted/40"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-foreground">
            {{ profile.name }}
          </p>
          <p class="truncate text-xs text-muted-foreground">
            {{ profile.description || 'Sem descrição' }} ·
            {{ profile.permissionsCount }}
            permissã{{ profile.permissionsCount === 1 ? 'o' : 'es' }}
          </p>
        </div>
        <Switch
          size="sm"
          :model-value="selected.has(profile.id)"
          :aria-label="`Vincular perfil ${profile.name}`"
          @update:model-value="toggle(profile.id)"
        />
      </label>
    </div>

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
        Salvar
      </Button>
    </template>
  </Modal>
</template>
