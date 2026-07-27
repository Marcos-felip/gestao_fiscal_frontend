<script setup lang="ts">
import { ref } from 'vue'
import { Button, PasswordInput } from '@/shared/ui'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/modules/auth/presentation/schemas/change-password-schema'

const props = defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  submit: [data: ChangePasswordFormData]
}>()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errors = ref<Partial<Record<keyof ChangePasswordFormData, string>>>({})

function handleSubmit(): void {
  const result = changePasswordSchema.safeParse({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
    confirmPassword: confirmPassword.value,
  })

  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }

  errors.value = {}
  emit('submit', result.data)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <PasswordInput
      id="current-password"
      v-model="currentPassword"
      placeholder="Senha atual (provisória)"
      autocomplete="current-password"
      :error="errors.currentPassword"
    >
      <template #label>Senha atual</template>
    </PasswordInput>

    <PasswordInput
      id="new-password"
      v-model="newPassword"
      placeholder="Mínimo 8 caracteres"
      autocomplete="new-password"
      hint="Ao menos uma maiúscula, uma minúscula e um dígito."
      :error="errors.newPassword"
    >
      <template #label>Nova senha</template>
    </PasswordInput>

    <PasswordInput
      id="confirm-password"
      v-model="confirmPassword"
      placeholder="Repita a nova senha"
      autocomplete="new-password"
      :error="errors.confirmPassword"
    >
      <template #label>Confirmar nova senha</template>
    </PasswordInput>

    <Button
      type="submit"
      variant="primary"
      :full-width="true"
      text-class="text-white"
      :loading="props.loading"
      :disabled="props.loading"
      loading-text="Salvando…"
    >
      Trocar senha
    </Button>
  </form>
</template>
