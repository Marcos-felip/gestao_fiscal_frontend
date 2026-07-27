<script setup lang="ts">
import { onMounted } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, Skeleton, Switch, Tooltip } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FormActionBar from '@/shared/components/form/form-action-bar.vue'
import { makePermissionsMatrixController } from '@/modules/permissions/factories/permissions.factory'
import { usePermissions } from '@/modules/permissions/presentation/composables/usePermissions'
import { membershipRoleLabels } from '@/enums/membership-role.enum'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makePermissionsMatrixController()
const progress = useProgress()
const { isOwner } = usePermissions()

const canEdit = isOwner

onMounted(() => progress.track(controller.load()))

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

async function handleSave(): Promise<void> {
  await progress.track(controller.save())
}

function goBack(): void {
  controller.router.push({ name: routeNames.USERS })
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 30 },
  },
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
        Permissões
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Controle o que o papel Membro pode fazer nesta empresa.
      </p>
    </div>

    <Button variant="ghost" @click="goBack">
      <template #icon><Icon name="ArrowLeft" size="sm" /></template>
      Voltar
    </Button>
  </header>

  <!-- Aviso do modelo -->
  <div
    class="mb-6 flex items-start gap-2.5 rounded-lg border border-line-2 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
  >
    <Icon name="Info" size="sm" class="mt-0.5 shrink-0 text-primary" />
    <span>
      As permissões valem <strong class="text-foreground">para esta empresa</strong>.
      Proprietário e Administrador têm conjuntos fixos — apenas o papel
      <strong class="text-foreground">Membro</strong> é configurável.
      <template v-if="!canEdit">
        Somente o proprietário pode editar.
      </template>
    </span>
  </div>

  <!-- Erro -->
  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <!-- Skeleton -->
  <div v-if="!controller.loaded.value" class="space-y-6">
    <div
      v-for="n in 3"
      :key="`sk-${n}`"
      class="rounded-xl border border-line-2 bg-background p-6"
    >
      <div class="flex items-center gap-3">
        <Skeleton class="size-11 rounded-xl" />
        <Skeleton class="h-4 w-40 rounded" />
      </div>
      <div class="mt-5 space-y-3">
        <Skeleton v-for="r in 3" :key="r" class="h-5 w-full rounded" />
      </div>
    </div>
  </div>

  <!-- Matriz -->
  <form v-else @submit.prevent="handleSave">
    <motion.div
      class="space-y-6"
      :variants="container"
      initial="hidden"
      animate="visible"
    >
      <motion.div
        v-for="group in controller.catalog.value"
        :key="group.domain"
        :variants="item"
      >
        <FormSection :icon="iconFor(group.domain)" :title="group.label">
          <!-- Cabeçalho de colunas -->
          <div
            class="grid grid-cols-[minmax(0,1fr)_4rem_4rem_4rem] items-center gap-2 border-b border-line-2 pb-2 text-xs font-medium text-muted-foreground"
          >
            <span>Permissão</span>
            <Tooltip
              v-for="col in ['OWNER', 'ADMIN', 'MEMBER']"
              :key="col"
              :text="membershipRoleLabels[col as keyof typeof membershipRoleLabels]"
            >
              <span class="block text-center">
                {{
                  col === 'OWNER' ? 'Dono' : col === 'ADMIN' ? 'Admin' : 'Membro'
                }}
              </span>
            </Tooltip>
          </div>

          <!-- Linhas -->
          <div
            v-for="perm in group.permissions"
            :key="perm.code"
            class="grid grid-cols-[minmax(0,1fr)_4rem_4rem_4rem] items-center gap-2 py-1"
          >
            <div class="min-w-0">
              <p class="truncate text-sm text-foreground">
                {{ perm.description || perm.code }}
              </p>
              <p class="truncate font-mono text-xs text-muted-foreground">
                {{ perm.code }}
              </p>
            </div>

            <span class="flex justify-center">
              <Icon
                v-if="controller.ownerSet.value.has(perm.code)"
                name="Check"
                size="sm"
                class="text-success"
              />
              <Icon v-else name="Minus" size="sm" class="text-muted-foreground/40" />
            </span>

            <span class="flex justify-center">
              <Icon
                v-if="controller.adminSet.value.has(perm.code)"
                name="Check"
                size="sm"
                class="text-success"
              />
              <Icon v-else name="Minus" size="sm" class="text-muted-foreground/40" />
            </span>

            <span class="flex justify-center">
              <Switch
                size="sm"
                :model-value="controller.memberSet.value.has(perm.code)"
                :disabled="!canEdit"
                :aria-label="`Permitir ${perm.code} para Membro`"
                @update:model-value="controller.toggleMember(perm.code)"
              />
            </span>
          </div>
        </FormSection>
      </motion.div>
    </motion.div>

    <FormActionBar
      v-if="canEdit"
      submit-label="Salvar permissões"
      secondary-label="Descartar"
      show-status
      :dirty="controller.dirty"
      :loading="controller.isLoading"
      @secondary="controller.discard()"
    />
  </form>
</template>
