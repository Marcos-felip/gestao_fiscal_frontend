<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Modal from '@/shared/components/dialog/modal.vue'
import { Button, Icon, Input, Select } from '@/shared/ui'
import { useToast } from '@/shared/composables'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  MembershipRole,
  membershipRoleLabels,
} from '@/enums/membership-role.enum'
import type { InvitedUser } from '@/modules/memberships/domain/responses/invited-user'
import {
  inviteSchema,
  type InviteFormData,
} from '@/modules/memberships/presentation/schemas/invite-schema'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  invited: InvitedUser | null
  assignable: MembershipRole[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [input: { name?: string; email: string; role: MembershipRole }]
}>()

const toast = useToast()

const name = ref('')
const email = ref('')
const role = ref<string>('')
const errors = ref<Partial<Record<keyof InviteFormData, string>>>({})

const roleOptions = computed(() =>
  props.assignable.map((r) => ({ value: r, label: membershipRoleLabels[r] })),
)

// Estado de sucesso: convite criado, exibindo a senha provisória.
const success = computed(() => props.invited !== null)

function resetForm(): void {
  name.value = ''
  email.value = ''
  role.value = props.assignable.includes(MembershipRole.MEMBER)
    ? MembershipRole.MEMBER
    : (props.assignable[0] ?? '')
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
  const result = inviteSchema.safeParse({
    name: name.value,
    email: email.value,
    role: role.value,
  })
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }
  errors.value = {}
  emit('submit', {
    name: result.data.name || undefined,
    email: result.data.email,
    role: result.data.role as MembershipRole,
  })
}

async function copyPassword(): Promise<void> {
  if (!props.invited?.temporaryPassword) return
  try {
    await navigator.clipboard.writeText(props.invited.temporaryPassword)
    toast.success('Senha copiada.')
  } catch {
    toast.error('Não foi possível copiar.')
  }
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    :title="success ? 'Usuário criado' : 'Convidar usuário'"
    :description="
      success
        ? 'Compartilhe a senha provisória — ela não será exibida de novo.'
        : 'O usuário receberá uma senha provisória para o primeiro acesso.'
    "
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Estado: formulário -->
    <form v-if="!success" class="space-y-4" @submit.prevent="handleSubmit">
      <Input
        v-model="email"
        type="email"
        placeholder="usuario@empresa.com"
        autocomplete="off"
        :error="errors.email"
      >
        <template #label>E-mail</template>
      </Input>

      <Input
        v-model="name"
        placeholder="Opcional"
        maxlength="120"
        :error="errors.name"
      >
        <template #label>Nome</template>
      </Input>

      <Select
        v-model="role"
        :options="roleOptions"
        placeholder="Selecione o papel"
        :error="errors.role"
      >
        <template #label>Papel</template>
      </Select>
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
            {{ invited?.name }}
          </p>
          <p class="truncate text-sm text-muted-foreground">
            {{ invited?.email }}
          </p>
        </div>
      </div>

      <div v-if="invited?.temporaryPassword">
        <span class="mb-1.5 block text-sm font-medium text-foreground">
          Senha provisória
        </span>
        <div
          class="flex items-center gap-2 rounded-lg border border-line-2 bg-muted/40 px-3 py-2"
        >
          <code class="flex-1 truncate text-sm text-foreground">
            {{ invited.temporaryPassword }}
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
          <template #icon><Icon name="UserPlus" size="sm" /></template>
          Convidar
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
