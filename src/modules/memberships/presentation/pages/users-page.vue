<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Avatar, Button, Dropdown, Icon, Skeleton } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import RoleBadge from '@/modules/memberships/presentation/components/role-badge.vue'
import CreateUserDialog from '@/modules/memberships/presentation/components/create-user-dialog.vue'
import EditUserDialog from '@/modules/memberships/presentation/components/edit-user-dialog.vue'
import { makeMembershipsController } from '@/modules/memberships/factories/memberships.factory'
import type { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import { usePermissions } from '@/modules/permissions/presentation/composables/usePermissions'
import {
  MembershipRole,
  assignableRoles,
  membershipRoleLabels,
  roleRank,
} from '@/enums/membership-role.enum'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeMembershipsController()
const progress = useProgress()
const { role, isOwner, can, isAtLeast } = usePermissions()

const canCreate = computed(() => can('users.create'))
const canViewPermissions = computed(() => isAtLeast(MembershipRole.ADMIN))
const assignable = computed(() => assignableRoles(role.value))

const createOpen = ref(false)
const editOpen = ref(false)
const editTarget = ref<Membership | null>(null)
const confirmOpen = ref(false)
const target = ref<Membership | null>(null)

onMounted(() => progress.track(controller.loadList()))

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

function hasActions(member: Membership): boolean {
  return (
    canChangeRole(member) || canEditMember(member) || canDeleteMember(member)
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
}): Promise<void> {
  await progress.track(controller.create(input))
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

function goPermissions(): void {
  controller.router.push({ name: routeNames.PERMISSIONS })
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
}
const rowItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 30 },
  },
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
        v-if="canViewPermissions"
        variant="ghost"
        @click="goPermissions"
      >
        <template #icon><Icon name="ShieldCheck" size="sm" /></template>
        Permissões
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
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
    :variants="container"
    initial="hidden"
    animate="visible"
  >
    <motion.div
      v-for="member in controller.members.value"
      :key="member.id"
      :variants="rowItem"
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
      </div>

      <RoleBadge :role="member.role" />

      <div class="flex w-9 justify-end">
        <Dropdown v-if="hasActions(member)" align="right">
          <template #trigger>
            <Icon name="EllipsisVertical" size="sm" />
          </template>
          <template #default="{ close }">
            <div class="py-1">
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

              <!-- Remover -->
              <template v-if="canDeleteMember(member)">
                <div
                  v-if="canChangeRole(member) || canEditMember(member)"
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
            </div>
          </template>
        </Dropdown>
      </div>
    </motion.div>
  </motion.div>

  <!-- Cadastro -->
  <CreateUserDialog
    :model-value="createOpen"
    :loading="controller.isLoading"
    :created="controller.created.value"
    :assignable="assignable"
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
