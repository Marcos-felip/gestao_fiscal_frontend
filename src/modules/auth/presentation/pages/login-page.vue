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
    <!-- Título da página usando slot do layout -->
    <template #title>
      <h2 class="text-2xl font-bold text-foreground">
        Bem-vindo de volta
      </h2>
    </template>

    <!-- Subtítulo da página usando slot do layout -->
    <template #subtitle>
      <p class="text-sm text-muted-foreground-1">
        Insira suas credenciais para acessar o sistema
      </p>
    </template>

    <!-- Mensagem de erro -->
    <div
      v-if="controller.hasError"
      class="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4"
    >
      {{ controller.errorMessage }}
    </div>

    <!-- Formulário de Login -->
    <LoginForm :loading="controller.isLoading" @submit="handleLogin" />

    <!-- Link para Registro -->
    <p class="text-center text-sm text-muted-foreground-1 mt-6">
      Não tem uma conta?
      <button
        class="text-primary font-medium hover:underline transition-colors"
        @click="goToRegister"
      >
        Criar conta
      </button>
    </p>
  </AuthLayout>
</template>
