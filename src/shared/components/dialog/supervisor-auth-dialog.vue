<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Button, Icon, Input, PasswordInput } from '@/shared/ui'

/** Alvo de foco: o Input pode expor `focus`; tratamos de forma tolerante. */
type Focusable = { focus?: () => void }
import Modal from '@/shared/components/dialog/modal.vue'
import { makeAuthorizeActionUseCase } from '@/modules/auth/factories/auth.factory'
import { AuthorizeDto } from '@/modules/auth/domain/dto/authorize-dto'

/**
 * Autorização de supervisor (step-up). Quando o operador logado não tem
 * permissão para uma ação, um administrador/proprietário informa suas
 * credenciais aqui para liberá-la. Não altera a sessão do operador.
 *
 * O componente é autocontido: valida contra `POST /auth/authorize` e emite
 * `authorized` com o nome de quem autorizou. Erros aparecem inline.
 */
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    /** Permissão exigida (ex.: 'sales.cancel'). */
    requiredPermission?: string
    title?: string
    description?: string
    actionLabel?: string
  }>(),
  {
    requiredPermission: undefined,
    title: 'Autorização de supervisor',
    description:
      'Você não tem permissão para esta ação. Um administrador ou proprietário precisa liberá-la.',
    actionLabel: 'Autorizar',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  authorized: [supervisorName: string]
}>()

const authorizeUseCase = makeAuthorizeActionUseCase()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)
const emailRef = ref<Focusable | null>(null)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      email.value = ''
      password.value = ''
      error.value = ''
      submitting.value = false
      nextTick(() => emailRef.value?.focus?.())
    }
  },
)

function close(): void {
  emit('update:modelValue', false)
}

async function submit(): Promise<void> {
  if (submitting.value) return
  error.value = ''

  if (!email.value.trim() || !password.value) {
    error.value = 'Informe o e-mail e a senha do supervisor.'
    return
  }

  submitting.value = true
  const result = await authorizeUseCase.execute(
    new AuthorizeDto({
      email: email.value.trim(),
      password: password.value,
      permission: props.requiredPermission,
    }),
  )
  submitting.value = false

  result.fold(
    (err) => {
      error.value = err.isUserFacing
        ? err.message
        : 'Não foi possível validar a autorização. Tente novamente.'
    },
    (auth) => {
      if (!auth.authorized) {
        error.value = 'Credenciais inválidas ou sem permissão para liberar.'
        return
      }
      emit('authorized', auth.name)
      close()
    },
  )
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    :title="props.title"
    :description="props.description"
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-start gap-3">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning-500/10 text-warning-600"
        >
          <Icon name="ShieldAlert" size="md" />
        </span>
        <div class="min-w-0">
          <h2 class="font-semibold tracking-tight text-foreground">
            {{ props.title }}
          </h2>
          <p class="mt-0.5 text-sm text-muted-foreground">
            {{ props.description }}
          </p>
        </div>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="submit">
      <Input
        ref="emailRef"
        v-model="email"
        type="email"
        autocomplete="off"
        placeholder="supervisor@empresa.com"
      >
        <template #label>E-mail do supervisor</template>
        <template #prefix><Icon name="Mail" size="sm" /></template>
      </Input>

      <PasswordInput
        v-model="password"
        autocomplete="current-password"
        placeholder="Senha"
      >
        <template #label>Senha</template>
      </PasswordInput>

      <p
        v-if="error"
        class="flex items-center gap-1.5 text-sm font-medium text-error-500"
      >
        <Icon name="CircleAlert" size="xs" />
        {{ error }}
      </p>

      <!-- botão real de submit para aceitar Enter -->
      <button type="submit" class="hidden" aria-hidden="true"></button>
    </form>

    <template #footer>
      <Button variant="ghost" :disabled="submitting" @click="close">
        Voltar
      </Button>
      <Button
        variant="primary"
        text-class="text-white"
        :loading="submitting"
        @click="submit"
      >
        <template #icon><Icon name="ShieldCheck" size="sm" /></template>
        {{ props.actionLabel }}
      </Button>
    </template>
  </Modal>
</template>
