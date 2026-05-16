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
    <div class="space-y-6">
      <div class="text-center">
        <h2 class="text-xl font-semibold text-foreground">Criar sua conta</h2>
        <p class="mt-1 text-sm text-muted-foreground-1">
          Preencha os dados para se registrar
        </p>
      </div>

      <div
        v-if="controller.hasError"
        class="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
      >
        {{ controller.errorMessage }}
      </div>

      <RegisterForm :loading="controller.isLoading" @submit="handleRegister" />

      <p class="text-center text-sm text-muted-foreground-1">
        Já tem uma conta?
        <button
          class="text-primary font-medium hover:underline"
          @click="goToLogin"
        >
          Entrar
        </button>
      </p>
    </div>
  </AuthLayout>
</template>
