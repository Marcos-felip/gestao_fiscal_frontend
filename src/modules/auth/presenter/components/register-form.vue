<script setup lang="ts">
import { ref } from 'vue'
import { User, Mail, Lock, UserPlus } from 'lucide-vue-next'
import { registerSchema, type RegisterFormData } from '@/modules/auth/presenter/schemas/register-schema'

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
const errors = ref<Partial<Record<keyof RegisterFormData, string>>>({})

function handleSubmit(): void {
  const result = registerSchema.safeParse({ name: name.value, email: email.value, password: password.value })

  if (!result.success) {
    errors.value = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof RegisterFormData
      errors.value[field] = issue.message
    }
    return
  }

  errors.value = {}
  emit('submit', result.data)
}


</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div class="space-y-1">
      <label for="register-name" class="block text-sm font-medium text-foreground">Nome</label>
      <div class="relative">
        <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground-2" />
        <input
          id="register-name"
          v-model="name"
          type="text"
          placeholder="Seu nome"
          autocomplete="name"
          :class="[
            'w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            errors.name ? 'border-destructive' : 'border-line-2'
          ]"
        />
      </div>
      <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
    </div>

    <div class="space-y-1">
      <label for="register-email" class="block text-sm font-medium text-foreground">E-mail</label>
      <div class="relative">
        <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground-2" />
        <input
          id="register-email"
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          autocomplete="email"
          :class="[
            'w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            errors.email ? 'border-destructive' : 'border-line-2'
          ]"
        />
      </div>
      <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
    </div>

    <div class="space-y-1">
      <label for="register-password" class="block text-sm font-medium text-foreground">Senha</label>
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground-2" />
        <input
          id="register-password"
          v-model="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          autocomplete="new-password"
          :class="[
            'w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            errors.password ? 'border-destructive' : 'border-line-2'
          ]"
        />
      </div>
      <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
    </div>

    <button
      type="submit"
      :disabled="props.loading"
      class="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <UserPlus class="h-4 w-4" />
      <span v-if="props.loading">Criando conta...</span>
      <span v-else>Criar conta</span>
    </button>
  </form>
</template>