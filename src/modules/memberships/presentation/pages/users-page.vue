<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Avatar, Button, Dropdown, Icon, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import RoleBadge from '@/modules/memberships/presentation/components/role-badge.vue'
import CreateUserDialog from '@/modules/memberships/presentation/components/create-user-dialog.vue'
import EditUserDialog from '@/modules/memberships/presentation/components/edit-user-dialog.vue'
import AssignProfilesDialog from '@/modules/permissions/presentation/components/assign-profiles-dialog.vue'
import { makeMembershipsController } from '@/modules/memberships/factories/memberships.factory'
import { makeMemberProfilesController } from '@/modules/permissions/factories/permissions.factory'
import type { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import { usePermissions } from '@/shared/composables/usePermissions'
import {
  MembershipRole,
  assignableRoles,
  membershipRoleLabels,
  roleRank,
} from '@/core/enums/membership-role.enum'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeMembershipsController()
const memberProfiles = makeMemberProfilesController()
const progress = useProgress()
const { role, isOwner, can } = usePermissions()

const canCreate = computed(() => can('users.create'))
const canManageProfiles = computed(() => can('permissions.manage'))
const assignable = computed(() => assignableRoles(role.value))

const createOpen = ref(false)
const editOpen = ref(false)
const editTarget = ref<Membership | null>(null)
const confirmOpen = ref(false)
const target = ref<Membership | null>(null)
const assignOpen = ref(false)
const assignTarget = ref<Membership | null>(null)

onMounted(() => {
  progress.track(controller.loadList())
  if (canManageProfiles.value) void memberProfiles.loadProfiles()
})

function rolesFor(member: Membership): MembershipRole[] {
  return assignable.value.filter((r) => r !== member.role)
}

// Não é possível gerenciar quem tem papel superior ao seu (regra do backend).
function canActOn(member: Membership): boolean {
  const current = role.value
  if (!current) return false
  return roleRank[current] >= roleRank[member.role]
}

function canEditMember(member: Membership): boolean {
  return !member.isOwner && can('users.edit') && canActOn(member)
}

function canDeleteMember(member: Membership): boolean {
  return !member.isOwner && can('users.delete') && canActOn(member)
}

// Alterar papel continua exclusivo do OWNER (backend).
function canChangeRole(member: Membership): boolean {
  return isOwner.value && !member.isOwner
}

// Perfis só se aplicam a MEMBER e exigem permissions.manage + hierarquia.
function canManageMemberProfiles(member: Membership): boolean {
  return (
    member.role === MembershipRole.MEMBER &&
    canManageProfiles.value &&
    canActOn(member)
  )
}

function hasActions(member: Membership): boolean {
  return (
    canChangeRole(member) ||
    canEditMember(member) ||
    canManageMemberProfiles(member) ||
    canDeleteMember(member)
  )
}

function openEdit(member: Membership): void {
  editTarget.value = member
  editOpen.value = true
}

async function onEditSubmit(input: {
  name: string
  email: string
}): Promise<void> {
  if (!editTarget.value) return
  const ok = await progress.track(controller.editUser(editTarget.value, input))
  if (ok) {
    editOpen.value = false
    editTarget.value = null
  }
}

function openAssign(member: Membership): void {
  assignTarget.value = member
  assignOpen.value = true
}

async function onAssignSubmit(profileIds: string[]): Promise<void> {
  if (!assignTarget.value) return
  const refs = await progress.track(
    memberProfiles.assign(assignTarget.value.id, profileIds),
  )
  if (refs) {
    controller.applyProfiles(assignTarget.value, refs)
    assignOpen.value = false
    assignTarget.value = null
  }
}

function openCreate(): void {
  controller.created.value = null
  createOpen.value = true
}

function setCreateOpen(value: boolean): void {
  createOpen.value = value
  if (!value) controller.created.value = null
}

async function onCreateSubmit(input: {
  name?: string
  email: string
  role: MembershipRole
  profileIds: string[]
}): Promise<void> {
  const ok = await progress.track(controller.create(input))
  if (!ok) return

  // MEMBER nasce sem acesso: vincula os perfis escolhidos logo após criar.
  const createdId = controller.created.value?.id
  if (
    input.role === MembershipRole.MEMBER &&
    input.profileIds.length &&
    createdId
  ) {
    const member = controller.findByUserId(createdId)
    if (member) {
      const refs = await progress.track(
        memberProfiles.assign(member.id, input.profileIds),
      )
      if (refs) controller.applyProfiles(member, refs)
    }
  }
}

async function onChangeRole(
  member: Membership,
  newRole: MembershipRole,
): Promise<void> {
  await progress.track(controller.changeRole(member, newRole))
}

function askRemove(member: Membership): void {
  target.value = member
  confirmOpen.value = true
}

async function confirmRemove(): Promise<void> {
  if (!target.value) return
  await progress.track(controller.remove(target.value))
  confirmOpen.value = false
  target.value = null
}

function goProfiles(): void {
  controller.router.push({ name: routeNames.PERMISSION_PROFILES })
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
        Usuários
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Membros com acesso a esta empresa e seus papéis.
      </p>
    </div>

    <div class="flex items-center gap-2">
      <Button
        v-if="canManageProfiles"
        variant="ghost"
        @click="goProfiles"
      >
        <template #icon><Icon name="ShieldPlus" size="sm" /></template>
        Perfis
      </Button>
      <Button
        v-if="canCreate"
        variant="primary"
        text-class="text-white"
        @click="openCreate"
      >
        <template #icon><Icon name="UserPlus" size="sm" /></template>
        Novo usuário
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
  <div
    v-if="!controller.loaded.value"
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
  >
    <div
      v-for="n in 4"
      :key="`sk-${n}`"
      class="flex items-center gap-4 border-b border-line-2 px-4 py-3 last:border-b-0"
    >
      <Skeleton class="size-9 rounded-full" />
      <div class="flex-1 space-y-2">
        <Skeleton class="h-3.5 w-40 rounded" />
        <Skeleton class="h-3 w-56 rounded" />
      </div>
      <Skeleton class="h-5 w-16 rounded-full" />
    </div>
  </div>

  <!-- Empty -->
  <div
    v-else-if="controller.members.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="Users" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhum usuário
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Cadastre usuários para colaborar nesta empresa.
    </p>
  </div>

  <!-- Lista -->
  <motion.div
    v-else
    class="rounded-xl border border-line-2 bg-background"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25 }"
  >
    <div
      v-for="member in controller.members.value"
      :key="member.id"
      class="flex items-center gap-4 border-b border-line-2 px-4 py-3 last:border-b-0"
    >
      <Avatar :initials="member.initials" size="sm" />

      <div class="min-w-0 flex-1">
        <p class="truncate font-medium text-foreground">
          {{ member.userName }}
        </p>
        <p class="truncate text-sm text-muted-foreground">
          {{ member.userEmail }}
        </p>
        <div
          v-if="member.profiles.length"
          class="mt-1.5 flex flex-wrap items-center gap-1"
        >
          <span
            v-for="profile in member.profiles"
            :key="profile.id"
            class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            <Icon name="ShieldCheck" size="xs" />
            {{ profile.name }}
          </span>
        </div>
      </div>

      <RoleBadge :role="member.role" />

      <div class="flex w-9 justify-end">
        <Dropdown
          v-if="hasActions(member)"
          align="right"
          trigger-label="Ações"
          trigger-class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <template #trigger>
            <Icon name="EllipsisVertical" size="sm" />
          </template>

          <template #default="{ close }">
            <!-- Alterar papel (OWNER) -->
            <template v-if="canChangeRole(member)">
              <button
                v-for="r in rolesFor(member)"
                :key="r"
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                @click="onChangeRole(member, r), close()"
              >
                <Icon name="Shield" size="sm" class="text-muted-foreground" />
                Definir como {{ membershipRoleLabels[r] }}
              </button>
            </template>

            <!-- Editar -->
            <button
              v-if="canEditMember(member)"
              type="button"
              class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              @click="openEdit(member), close()"
            >
              <Icon name="Pencil" size="sm" class="text-muted-foreground" />
              Editar
            </button>

            <!-- Perfis (só MEMBER) -->
            <button
              v-if="canManageMemberProfiles(member)"
              type="button"
              class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              @click="openAssign(member), close()"
            >
              <Icon name="ShieldPlus" size="sm" class="text-muted-foreground" />
              Perfis
            </button>

            <!-- Remover -->
            <template v-if="canDeleteMember(member)">
              <div
                v-if="
                  canChangeRole(member) ||
                  canEditMember(member) ||
                  canManageMemberProfiles(member)
                "
                class="my-1 border-t border-line-2"
              />
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                @click="askRemove(member), close()"
              >
                <Icon name="Trash2" size="sm" />
                Remover
              </button>
            </template>
          </template>
        </Dropdown>
      </div>
    </div>
  </motion.div>

  <!-- Cadastro -->
  <CreateUserDialog
    :model-value="createOpen"
    :loading="controller.isLoading"
    :created="controller.created.value"
    :assignable="assignable"
    :profiles="memberProfiles.profiles.value"
    :can-assign-profiles="canManageProfiles"
    @update:model-value="setCreateOpen"
    @submit="onCreateSubmit"
  />

  <!-- Edição -->
  <EditUserDialog
    :model-value="editOpen"
    :loading="controller.isLoading"
    :member="editTarget"
    @update:model-value="editOpen = $event"
    @submit="onEditSubmit"
  />

  <!-- Perfis do membro -->
  <AssignProfilesDialog
    v-model="assignOpen"
    :loading="memberProfiles.isLoading"
    :member-name="assignTarget?.userName ?? ''"
    :profiles="memberProfiles.profiles.value"
    :current-profile-ids="assignTarget?.profiles.map((p) => p.id) ?? []"
    @submit="onAssignSubmit"
  />

  <!-- Remover -->
  <ConfirmDialog
    v-model="confirmOpen"
    title="Remover usuário"
    :description="`Remover “${target?.userName}” desta empresa? Ele perderá o acesso.`"
    confirm-label="Remover"
    cancel-label="Cancelar"
    variant="destructive"
    icon="Trash2"
    :loading="controller.isLoading"
    @confirm="confirmRemove"
  />
</template>
