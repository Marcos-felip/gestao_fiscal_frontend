<script setup lang="ts">
import AuthLayout from '@/shared/components/layouts/auth-layout.vue'
import LoginForm from '@/modules/auth/presentation/components/login-form.vue'
import { makeAuthController } from '@/modules/auth/factories/auth.factory'
import type { LoginFormData } from '@/modules/auth/presentation/schemas/login-schema'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeAuthController()
const progress = useProgress()

async function handleLogin(data: LoginFormData): Promise<void> {
  controller.email.value = data.email
  controller.password.value = data.password
  await progress.track(controller.login())
}

function goToRegister(): void {
  controller.router.push({ name: routeNames.REGISTER })
}
</script>

<template>
  <AuthLayout>
    <template #title>
      <h2 class="text-2xl font-bold tracking-tight text-foreground">
        Bem-vindo de volta
      </h2>
    </template>

    <template #subtitle>
      <p class="mt-1.5 text-sm text-muted-foreground">
        Insira suas credenciais para acessar o sistema
      </p>
    </template>

    <div
      v-if="controller.hasError"
      class="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4"
    >
      {{ controller.errorMessage }}
    </div>

    <LoginForm :loading="controller.isLoading" @submit="handleLogin" />

    <p class="text-center text-sm text-foreground/70 mt-6">
      Não tem uma conta?
      <button
        class="text-primary font-medium hover:underline transition-colors cursor-pointer"
        @click="goToRegister"
      >
        Criar conta
      </button>
    </p>
  </AuthLayout>
</template>
