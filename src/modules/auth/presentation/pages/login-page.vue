<script setup lang="ts">
import AuthLayout from '@/shared/components/layouts/auth-layout.vue'
import LoginForm from '@/modules/auth/presentation/components/login-form.vue'
import { AuthController } from '@/modules/auth/presentation/controllers/auth-controller'
import type { LoginFormData } from '@/modules/auth/presentation/schemas/login-schema'
import { routeNames } from '@/router/route-names'

const controller = new AuthController()

async function handleLogin(data: LoginFormData): Promise<void> {
  controller.email.value = data.email
  controller.password.value = data.password
  await controller.login()
}

function goToRegister(): void {
  controller.router.push({ name: routeNames.REGISTER })
}
</script>

<template>
  <AuthLayout>
    <template #title>
      <h2 class="text-xl font-bold text-foreground text-center">
        Bem-vindo de volta
      </h2>
    </template>

    <template #subtitle>
      <p class="text-sm text-foreground/70 text-center mt-1.5">
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
