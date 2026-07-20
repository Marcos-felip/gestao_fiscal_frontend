<script setup lang="ts">
import { ref } from 'vue'
import { Button, Input, Icon } from '@/shared/ui'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  registerSchema,
  type RegisterFormData,
} from '@/modules/auth/presentation/schemas/register-schema'

const emit = defineEmits<{
  submit: [data: RegisterFormData]
  error: [message: string]
}>()

const props = defineProps<{
  loading: boolean
}>()

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref<Partial<Record<keyof RegisterFormData, string>>>({})

function handleSubmit(): void {
  const result = registerSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value,
  })

  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }

  errors.value = {}
  emit('submit', result.data)
}

function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <Input
        id="register-name"
        v-model="name"
        type="text"
        placeholder="Seu nome completo"
        autocomplete="name"
        :error="errors.name"
      >
        <template #label>Nome</template>
      </Input>

      <Input
        id="register-email"
        v-model="email"
        type="email"
        placeholder="seu@email.com"
        autocomplete="email"
        :error="errors.email"
      >
        <template #label>E-mail</template>
      </Input>

      <Input
        id="register-password"
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Mínimo 6 caracteres"
        autocomplete="new-password"
        :error="errors.password"
        input-class="pr-10"
      >
        <template #label>Senha</template>
        <template #suffix>
          <button
            type="button"
            class="text-foreground/50 hover:text-foreground/70 transition-colors"
            @click="togglePasswordVisibility"
          >
            <Icon :name="showPassword ? 'eye-off' : 'eye'" class="h-4 w-4" />
          </button>
        </template>
      </Input>

      <Button
        type="submit"
        variant="primary"
        :full-width="true"
        text-class="text-white"
        :loading="props.loading"
        :disabled="props.loading"
      >
        Criar conta
      </Button>
    </div>

    <div class="my-5 flex items-center gap-3">
      <div class="h-px flex-1 bg-line-2"></div>
      <span class="text-xs font-medium text-foreground/50 uppercase tracking-wider">Ou</span>
      <div class="h-px flex-1 bg-line-2"></div>
    </div>

    <Button
      type="button"
      variant="ghost"
      :full-width="true"
    >
      <svg class="shb27" width="16" height="16" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_4132_5805)">
          <path
            d="M32.2566 16.36C32.2566 15.04 32.1567 14.08 31.9171 13.08H16.9166V19.02H25.7251C25.5454 20.5 24.5866 22.72 22.4494 24.22L22.4294 24.42L27.1633 28.1L27.4828 28.14C30.5189 25.34 32.2566 21.22 32.2566 16.36Z"
            fill="#4285F4"></path>
          <path
            d="M16.9166 32C21.231 32 24.8463 30.58 27.5028 28.12L22.4694 24.2C21.1111 25.14 19.3135 25.8 16.9366 25.8C12.7021 25.8 9.12677 23 7.84844 19.16L7.66867 19.18L2.71513 23L2.65521 23.18C5.2718 28.4 10.6648 32 16.9166 32Z"
            fill="#34A853"></path>
          <path
            d="M7.82845 19.16C7.48889 18.16 7.28915 17.1 7.28915 16C7.28915 14.9 7.48889 13.84 7.80848 12.84V12.62L2.81499 8.73999L2.6552 8.81999C1.55663 10.98 0.937439 13.42 0.937439 16C0.937439 18.58 1.55663 21.02 2.63522 23.18L7.82845 19.16Z"
            fill="#FBBC05"></path>
          <path
            d="M16.9166 6.18C19.9127 6.18 21.9501 7.48 23.0886 8.56L27.6027 4.16C24.8263 1.58 21.231 0 16.9166 0C10.6648 0 5.27181 3.6 2.63525 8.82L7.80851 12.84C9.10681 8.98 12.6821 6.18 16.9166 6.18Z"
            fill="#EB4335"></path>
        </g>
        <defs>
          <clipPath id="clip0_4132_5805">
            <rect width="32" height="32" fill="white" transform="translate(0.937439)"></rect>
          </clipPath>
        </defs>
      </svg>
      Continuar com Google
    </Button>
  </form>
</template>
