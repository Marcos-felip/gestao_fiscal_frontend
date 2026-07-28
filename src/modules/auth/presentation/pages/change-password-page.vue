<script setup lang="ts">
import AuthLayout from '@/shared/components/layouts/auth-layout.vue'
import ChangePasswordForm from '@/modules/auth/presentation/components/change-password-form.vue'
import { makeAuthController } from '@/modules/auth/factories/auth.factory'
import { ChangePasswordDto } from '@/modules/auth/domain/dto/change-password-dto'
import type { ChangePasswordFormData } from '@/modules/auth/presentation/schemas/change-password-schema'
import { useProgress } from '@/shared/composables'

const controller = makeAuthController()
const progress = useProgress()

async function handleSubmit(data: ChangePasswordFormData): Promise<void> {
  const dto = new ChangePasswordDto({
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword,
  })
  await progress.track(controller.changePassword(dto))
}

async function handleLogout(): Promise<void> {
  await progress.track(controller.logout())
}
</script>

<template>
  <AuthLayout>
    <template #title>
      <h2 class="text-2xl font-bold tracking-tight text-foreground">
        Defina sua senha
      </h2>
    </template>

    <template #subtitle>
      <p class="mt-1.5 text-sm text-muted-foreground">
        Sua conta foi criada com uma senha provisória. Escolha uma nova senha
        para continuar.
      </p>
    </template>

    <div
      v-if="controller.hasError"
      class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ controller.errorMessage }}
    </div>

    <ChangePasswordForm
      :loading="controller.isLoading"
      @submit="handleSubmit"
    />

    <p class="mt-6 text-center text-sm text-foreground/70">
      Prefere sair?
      <button
        class="cursor-pointer font-medium text-primary transition-colors hover:underline"
        @click="handleLogout"
      >
        Encerrar sessão
      </button>
    </p>
  </AuthLayout>
</template>
