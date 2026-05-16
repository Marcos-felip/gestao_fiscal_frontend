<script setup lang="ts">
import AuthLayout from '@/shared/components/layouts/auth-layout.vue'
import RegisterForm from '@/modules/auth/presentation/components/register-form.vue'
import { AuthController } from '@/modules/auth/presentation/controllers/auth-controller'
import type { RegisterFormData } from '@/modules/auth/presentation/schemas/register-schema'
import { routeNames } from '@/router/route-names'

const controller = new AuthController()

async function handleRegister(data: RegisterFormData): Promise<void> {
  controller.name.value = data.name
  controller.email.value = data.email
  controller.password.value = data.password
  await controller.register()
}

function goToLogin(): void {
  controller.router.push({ name: routeNames.LOGIN })
}
</script>

<template>
  <AuthLayout>
    <!-- Título da página usando slot do layout -->
    <template #title>
      <h2 class="text-2xl font-bold text-foreground">
        Criar sua conta
      </h2>
    </template>

    <!-- Subtítulo da página usando slot do layout -->
    <template #subtitle>
      <p class="text-sm text-muted-foreground-1">
        Preencha os dados para se registrar
      </p>
    </template>

    <!-- Mensagem de erro -->
    <div
      v-if="controller.hasError"
      class="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4"
    >
      {{ controller.errorMessage }}
    </div>

    <!-- Formulário de Registro -->
    <RegisterForm :loading="controller.isLoading" @submit="handleRegister" />

    <!-- Link para Login -->
    <p class="text-center text-sm text-muted-foreground-1 mt-6">
      Já tem uma conta?
      <button
        class="text-primary font-medium hover:underline transition-colors"
        @click="goToLogin"
      >
        Entrar
      </button>
    </p>
  </AuthLayout>
</template>
