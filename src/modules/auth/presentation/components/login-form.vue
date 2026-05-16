<script setup lang="ts">
import { ref } from 'vue'
import { LogIn, Eye, EyeOff } from 'lucide-vue-next'
import { ButtonUi, InputUi } from '@/shared/ui'
import {
  loginSchema,
  type LoginFormData,
} from '@/modules/auth/presentation/schemas/login-schema'

const emit = defineEmits<{
  submit: [data: LoginFormData]
  error: [message: string]
}>()

const props = defineProps<{
  loading: boolean
}>()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref<Partial<Record<keyof LoginFormData, string>>>({})

function handleSubmit(): void {
  const result = loginSchema.safeParse({
    email: email.value,
    password: password.value,
  })

  if (!result.success) {
    errors.value = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof LoginFormData
      errors.value[field] = issue.message
    }
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
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <!-- Email Input usando InputUi -->
    <InputUi
      v-model="email"
      type="email"
      placeholder="seu@email.com"
      autocomplete="email"
      :error="errors.email"
    >
      <template #label>E-mail</template>
    </InputUi>

    <!-- Password Input com toggle visibility -->
    <div class="ui-input-wrapper">
      <label class="block text-sm font-medium text-foreground mb-2">
        Senha
      </label>
      <div class="ui-input-container relative">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Mínimo 6 caracteres"
          autocomplete="current-password"
          :class="[
            'w-full px-4 py-2.5 rounded-lg',
            'bg-background text-foreground',
            'border-2 border-line-2 transition-all duration-300',
            'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
            errors.password && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            'placeholder:text-muted-foreground',
          ]"
        />
        <!-- Toggle password visibility button -->
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground-2 hover:text-foreground transition-colors"
          @click="togglePasswordVisibility"
        >
          <Eye v-if="!showPassword" class="h-4 w-4" />
          <EyeOff v-else class="h-4 w-4" />
        </button>
      </div>
      <p v-if="errors.password" class="text-sm text-destructive font-medium mt-2">
        {{ errors.password }}
      </p>
    </div>

    <!-- Submit Button usando ButtonUi -->
    <ButtonUi
      type="submit"
      variant="primary"
      :loading="props.loading"
      :disabled="props.loading"
      class="w-full"
    >
      <template #icon>
        <LogIn class="h-4 w-4" />
      </template>
      Continue
    </ButtonUi>

    <!-- Divider com "Ou" -->
    <div class="flex items-center gap-4 my-6">
      <div class="flex-1 border-t border-line-2"></div>
      <span class="text-xs font-medium text-muted-foreground-1">Ou</span>
      <div class="flex-1 border-t border-line-2"></div>
    </div>

    <!-- Google Button usando ButtonUi -->
    <ButtonUi
      type="button"
      variant="ghost"
      class="w-full"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Google
    </ButtonUi>
  </form>
</template>
