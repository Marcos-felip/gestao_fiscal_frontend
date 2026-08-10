<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Modal from '@/shared/components/dialog/modal.vue'
import { Button, Icon, Input, Select, Switch } from '@/shared/ui'
import { useToast } from '@/shared/composables'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  MembershipRole,
  membershipRoleLabels,
} from '@/core/enums/membership-role.enum'
import type { CreatedUser } from '@/modules/memberships/domain/responses/created-user'
import type { PermissionProfile } from '@/modules/permissions/domain/entities/permission-profile.entity'
import {
  createUserSchema,
  type CreateUserFormData,
} from '@/modules/memberships/presentation/schemas/create-user-schema'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  created: CreatedUser | null
  assignable: MembershipRole[]
  profiles: PermissionProfile[]
  canAssignProfiles: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [
    input: {
      name?: string
      email: string
      role: MembershipRole
      profileIds: string[]
    },
  ]
}>()

const toast = useToast()

const name = ref('')
const email = ref('')
const role = ref<string>('')
const selectedProfiles = ref<Set<string>>(new Set())
const errors = ref<Partial<Record<keyof CreateUserFormData, string>>>({})

const roleOptions = computed(() =>
  props.assignable.map((r) => ({ value: r, label: membershipRoleLabels[r] })),
)

// Perfis só fazem sentido para MEMBER e só se quem cadastra pode gerenciá-los.
const isMember = computed(() => role.value === MembershipRole.MEMBER)
const showProfiles = computed(() => props.canAssignProfiles && isMember.value)

function toggleProfile(id: string): void {
  const next = new Set(selectedProfiles.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedProfiles.value = next
}

// Estado de sucesso: usuário criado, exibindo a senha provisória.
const success = computed(() => props.created !== null)

function resetForm(): void {
  name.value = ''
  email.value = ''
  role.value = props.assignable.includes(MembershipRole.MEMBER)
    ? MembershipRole.MEMBER
    : (props.assignable[0] ?? '')
  selectedProfiles.value = new Set()
  errors.value = {}
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetForm()
  },
  { immediate: true },
)

function close(): void {
  emit('update:modelValue', false)
}

function handleSubmit(): void {
  const result = createUserSchema.safeParse({
    name: name.value,
    email: email.value,
    role: role.value,
  })
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }
  errors.value = {}
  const chosenRole = result.data.role as MembershipRole
  emit('submit', {
    name: result.data.name || undefined,
    email: result.data.email,
    role: chosenRole,
    profileIds:
      chosenRole === MembershipRole.MEMBER ? [...selectedProfiles.value] : [],
  })
}

async function copyPassword(): Promise<void> {
  if (!props.created?.temporaryPassword) return
  try {
    await navigator.clipboard.writeText(props.created.temporaryPassword)
    toast.success('Senha copiada.')
  } catch {
    toast.error('Não foi possível copiar.')
  }
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    :title="success ? 'Usuário criado' : 'Novo usuário'"
    size="lg"
    :description="
      success
        ? 'Compartilhe a senha provisória ela não será exibida de novo.'
        : 'O usuário é criado e vinculado a esta empresa com uma senha provisória.'
    "
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Estado: formulário -->
    <form v-if="!success" class="space-y-4" @submit.prevent="handleSubmit">
      <Input
        v-model="name"
        placeholder="Opcional"
        maxlength="120"
        :error="errors.name"
      >
        <template #label>Nome</template>
      </Input>
      <Input
        v-model="email"
        type="email"
        placeholder="usuario@empresa.com"
        autocomplete="off"
        :error="errors.email"
      >
        <template #label>E-mail</template>
      </Input>

      <Select
        v-model="role"
        :options="roleOptions"
        placeholder="Selecione o papel"
        :error="errors.role"
      >
        <template #label>Papel</template>
      </Select>

      <!-- Perfis (só para MEMBER; define o acesso, que nasce vazio) -->
      <div v-if="showProfiles">
        <span class="mb-1.5 block text-sm font-medium text-foreground"
          >Perfis</span
        >
        <div v-if="profiles.length" class="max-h-52 space-y-2 overflow-y-auto">
          <label
            v-for="profile in profiles"
            :key="profile.id"
            class="flex cursor-pointer items-center gap-3 rounded-lg border border-line-2 px-3 py-2 transition-colors hover:bg-muted/40"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-foreground">
                {{ profile.name }}
              </p>
              <p class="truncate text-xs text-muted-foreground">
                {{ profile.description || 'Sem descrição' }}
              </p>
            </div>
            <Switch
              size="sm"
              :model-value="selectedProfiles.has(profile.id)"
              :aria-label="`Vincular perfil ${profile.name}`"
              @update:model-value="toggleProfile(profile.id)"
            />
          </label>
        </div>
        <p
          v-else
          class="rounded-lg border border-dashed border-line-3 px-3 py-3 text-xs text-muted-foreground"
        >
          Nenhum perfil cadastrado ainda — o membro nascerá sem acesso. Crie
          perfis em Perfis de permissão.
        </p>
        <p
          v-if="profiles.length"
          class="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground"
        >
          <Icon name="Info" size="xs" class="mt-0.5 shrink-0" />
          Sem nenhum perfil, o membro não terá acesso a nada.
        </p>
      </div>
    </form>

    <!-- Estado: sucesso (senha provisória) -->
    <div v-else class="space-y-4">
      <div class="flex items-center gap-3">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success"
        >
          <Icon name="CircleCheck" size="md" />
        </span>
        <div class="min-w-0">
          <p class="truncate font-medium text-foreground">
            {{ created?.name }}
          </p>
          <p class="truncate text-sm text-muted-foreground">
            {{ created?.email }}
          </p>
        </div>
      </div>

      <div v-if="created?.temporaryPassword">
        <span class="mb-1.5 block text-sm font-medium text-foreground">
          Senha provisória
        </span>
        <div
          class="flex items-center gap-2 rounded-lg border border-line-2 bg-muted/40 px-3 py-2"
        >
          <code class="flex-1 truncate text-sm text-foreground">
            {{ created.temporaryPassword }}
          </code>
          <button
            type="button"
            class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Copiar senha"
            @click="copyPassword"
          >
            <Icon name="Copy" size="sm" />
          </button>
        </div>
        <p class="mt-2 flex items-start gap-1.5 text-xs text-warning">
          <Icon name="TriangleAlert" size="xs" class="mt-0.5 shrink-0" />
          Anote agora: a senha não poderá ser vista novamente.
        </p>
      </div>
      <p v-else class="text-sm text-muted-foreground">
        Usuário criado. Oriente-o a redefinir a senha no primeiro acesso.
      </p>
    </div>

    <template #footer>
      <template v-if="!success">
        <Button
          type="button"
          variant="ghost"
          :disabled="loading"
          @click="close"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="primary"
          text-class="text-white"
          :loading="loading"
          loading-text="Criando…"
          @click="handleSubmit"
        >
          <template #icon>
            <Icon name="UserPlus" size="sm" />
          </template>
          Cadastrar
        </Button>
      </template>
      <Button
        v-else
        type="button"
        variant="primary"
        text-class="text-white"
        @click="close"
      >
        Concluir
      </Button>
    </template>
  </Modal>
</template>
