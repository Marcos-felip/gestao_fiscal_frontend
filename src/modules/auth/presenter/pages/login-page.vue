<script setup lang="ts">
import AuthLayout from '@/shared/layouts/auth-layout.vue'
import LoginForm from '@/modules/auth/presenter/components/login-form.vue'
import { AuthController } from '@/modules/auth/presenter/controllers/auth-controller'
import type { LoginFormData } from '@/modules/auth/presenter/schemas/login-schema'
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
    <div class="space-y-6">
      <div class="text-center">
        <h2 class="text-xl font-semibold text-foreground">Entrar na sua conta</h2>
        <p class="mt-1 text-sm text-muted-foreground-1">Insira suas credenciais para acessar o sistema</p>
      </div>

      <div
        v-if="controller.hasError"
        class="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
      >
        {{ controller.errorMessage }}
      </div>

      <LoginForm
        :loading="controller.isLoading"
        @submit="handleLogin"
      />

      <p class="text-center text-sm text-muted-foreground-1">
        Não tem uma conta?
        <button
          class="text-primary font-medium hover:underline"
          @click="goToRegister"
        >
          Criar conta
        </button>
      </p>
    </div>
  </AuthLayout>
</template>