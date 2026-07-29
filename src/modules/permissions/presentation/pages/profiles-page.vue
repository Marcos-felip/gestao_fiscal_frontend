<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import ProfileFormDialog from '@/modules/permissions/presentation/components/profile-form-dialog.vue'
import { makeProfilesController } from '@/modules/permissions/factories/permissions.factory'
import type { PermissionProfile } from '@/modules/permissions/domain/entities/permission-profile.entity'
import { usePermissions } from '@/shared/composables/usePermissions'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeProfilesController()
const progress = useProgress()
const { can } = usePermissions()

const canManage = computed(() => can('permissions.manage'))

const formOpen = ref(false)
const editTarget = ref<PermissionProfile | null>(null)
const confirmOpen = ref(false)
const target = ref<PermissionProfile | null>(null)

onMounted(() => progress.track(controller.load()))

function openCreate(): void {
  editTarget.value = null
  formOpen.value = true
}

function openEdit(profile: PermissionProfile): void {
  editTarget.value = profile
  formOpen.value = true
}

async function onSubmit(input: {
  name: string
  description?: string
  permissionCodes: string[]
}): Promise<void> {
  const ok = editTarget.value
    ? await progress.track(controller.update(editTarget.value, input))
    : await progress.track(controller.create(input))
  if (ok) {
    formOpen.value = false
    editTarget.value = null
  }
}

function askRemove(profile: PermissionProfile): void {
  target.value = profile
  confirmOpen.value = true
}

async function confirmRemove(): Promise<void> {
  if (!target.value) return
  await progress.track(controller.remove(target.value))
  confirmOpen.value = false
  target.value = null
}

function goUsers(): void {
  controller.router.push({ name: routeNames.USERS })
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
        Perfis de permissão
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Grupos de permissões para vincular a usuários do tipo Membro.
      </p>
    </div>

    <div class="flex items-center gap-2">
      <Button variant="ghost" @click="goUsers">
        <template #icon><Icon name="ArrowLeft" size="sm" /></template>
        Usuários
      </Button>
      <Button
        v-if="canManage"
        variant="primary"
        text-class="text-white"
        @click="openCreate"
      >
        <template #icon><Icon name="Plus" size="sm" /></template>
        Novo perfil
      </Button>
    </div>
  </header>

  <!-- Erro -->
  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <!-- Skeleton -->
  <div v-if="!controller.loaded.value" class="grid gap-4 sm:grid-cols-2">
    <div
      v-for="n in 4"
      :key="`sk-${n}`"
      class="rounded-xl border border-line-2 bg-background p-5"
    >
      <Skeleton class="h-4 w-32 rounded" />
      <Skeleton class="mt-3 h-3 w-52 rounded" />
      <Skeleton class="mt-4 h-5 w-24 rounded-full" />
    </div>
  </div>

  <!-- Empty -->
  <div
    v-else-if="controller.profiles.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="ShieldPlus" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhum perfil
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Crie perfis para conceder conjuntos de permissões a membros de uma vez.
    </p>
    <Button
      v-if="canManage"
      variant="primary"
      text-class="text-white"
      class="mt-5"
      @click="openCreate"
    >
      <template #icon><Icon name="Plus" size="sm" /></template>
      Novo perfil
    </Button>
  </div>

  <!-- Lista -->
  <motion.div
    v-else
    class="grid gap-4 sm:grid-cols-2"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <div
      v-for="profile in controller.profiles.value"
      :key="profile.id"
      class="flex flex-col rounded-xl border border-line-2 bg-background p-5"
    >
      <div class="flex items-start gap-3">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <Icon name="ShieldCheck" size="md" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-foreground">
            {{ profile.name }}
          </p>
          <p class="truncate text-sm text-muted-foreground">
            {{ profile.description || 'Sem descrição' }}
          </p>
        </div>

        <div v-if="canManage" class="flex items-center gap-1">
          <button
            type="button"
            class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Editar perfil"
            @click="openEdit(profile)"
          >
            <Icon name="Pencil" size="sm" />
          </button>
          <button
            type="button"
            class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Excluir perfil"
            @click="askRemove(profile)"
          >
            <Icon name="Trash2" size="sm" />
          </button>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
        >
          <Icon name="KeyRound" size="xs" />
          {{ profile.permissionsCount }}
          permissã{{ profile.permissionsCount === 1 ? 'o' : 'es' }}
        </span>
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
        >
          <Icon name="Users" size="xs" />
          {{ profile.membersCount }}
          membro{{ profile.membersCount === 1 ? '' : 's' }}
        </span>
      </div>
    </div>
  </motion.div>

  <!-- Criar / editar -->
  <ProfileFormDialog
    v-model="formOpen"
    :loading="controller.isLoading"
    :profile="editTarget"
    :catalog="controller.catalog.value"
    @submit="onSubmit"
  />

  <!-- Excluir -->
  <ConfirmDialog
    v-model="confirmOpen"
    title="Excluir perfil"
    :description="`Excluir o perfil “${target?.name}”? Ele será desvinculado de todos os membros.`"
    confirm-label="Excluir"
    cancel-label="Cancelar"
    variant="destructive"
    icon="Trash2"
    :loading="controller.isLoading"
    @confirm="confirmRemove"
  />
</template>
