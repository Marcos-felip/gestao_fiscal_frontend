<script setup lang="ts">
import AuthLayout from '@/shared/components/layouts/auth-layout.vue'
import RegisterForm from '@/modules/auth/presentation/components/register-form.vue'
import { makeAuthController } from '@/modules/auth/factories/auth.factory'
import type { RegisterFormData } from '@/modules/auth/presentation/schemas/register-schema'
import { routeNames } from '@/router/route-names'
import { useProgress } from '@/shared/composables'

const controller = makeAuthController()
const progress = useProgress()

async function handleRegister(data: RegisterFormData): Promise<void> {
  controller.name.value = data.name
  controller.email.value = data.email
  controller.password.value = data.password
  await progress.track(controller.register())
}

function goToLogin(): void {
  controller.router.push({ name: routeNames.LOGIN })
}
</script>

<template>
  <AuthLayout>
    <template #title>
      <h2 class="text-2xl font-bold tracking-tight text-foreground">
        Criar sua conta
      </h2>
    </template>

    <template #subtitle>
      <p class="mt-1.5 text-sm text-muted-foreground">
        Preencha os dados para se registrar
      </p>
    </template>

    <div
      v-if="controller.hasError"
      class="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4"
    >
      {{ controller.errorMessage }}
    </div>

    <RegisterForm :loading="controller.isLoading" @submit="handleRegister" />

    <p class="text-center text-sm text-foreground/70 mt-6">
      Já tem uma conta?
      <button
        class="text-primary font-medium hover:underline transition-colors cursor-pointer"
        @click="goToLogin"
      >
        Entrar
      </button>
    </p>
  </AuthLayout>
</template>
