<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { Avatar, Icon, Input, Skeleton } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FormActionBar from '@/shared/components/form/form-action-bar.vue'
import { makeAccountController } from '@/modules/account/factories/account.factory'
import {
  profileSchema,
  type ProfileFormData,
  type ProfileFormValues,
} from '@/modules/account/presentation/schemas/profile-schema'
import { toFormErrors } from '@/core/utils/zod-errors'
import { formatDate } from '@/core/utils/date'
import { useProgress } from '@/shared/composables'

const controller = makeAccountController()
const progress = useProgress()

const form = reactive<ProfileFormValues>({ name: '', email: '' })
const errors = ref<Partial<Record<keyof ProfileFormData, string>>>({})

onMounted(() => progress.track(controller.load()))

// Mantém o formulário em sincronia quando o perfil termina de carregar/salvar.
watch(
  () => controller.values.value,
  (value) => Object.assign(form, value),
  { deep: true, immediate: true },
)

const initials = computed(() => {
  const name = form.name.trim()
  if (!name) return ''
  const parts = name.split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
})

// Há alterações não salvas? (habilita a save bar)
const dirty = computed(() => {
  const saved = controller.values.value
  return form.name !== saved.name || form.email !== saved.email
})

function handleSubmit(): void {
  const result = profileSchema.safeParse({ ...form })
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }
  errors.value = {}
  void progress.track(controller.save({ ...form }))
}

function handleReset(): void {
  Object.assign(form, controller.values.value)
  errors.value = {}
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6">
    <h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
      Minha conta
    </h1>
    <p class="mt-1 text-sm text-muted-foreground">
      Gerencie seus dados pessoais.
    </p>
  </header>

  <!-- Erro -->
  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <!-- Skeleton -->
  <div v-if="!controller.loaded.value" class="space-y-6">
    <div class="flex items-center gap-4 rounded-xl border border-line-2 bg-background p-6">
      <Skeleton class="size-16 rounded-full" />
      <div class="space-y-2">
        <Skeleton class="h-4 w-40 rounded" />
        <Skeleton class="h-3 w-56 rounded" />
      </div>
    </div>
    <div class="rounded-xl border border-line-2 bg-background p-6">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Skeleton class="h-11 w-full rounded-lg" />
        <Skeleton class="h-11 w-full rounded-lg" />
      </div>
    </div>
  </div>

  <!-- Conteúdo -->
  <form v-else @submit.prevent="handleSubmit">
    <motion.div
      class="space-y-6"
      :initial="{ opacity: 0, y: 8 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.25 }"
    >
      <!-- Cartão de identidade -->
      <div
        class="flex items-center gap-4 rounded-xl border border-line-2 bg-background p-6"
      >
        <Avatar :initials="initials" size="lg" variant="primary" />
        <div class="min-w-0">
          <p class="truncate font-display text-lg font-semibold text-foreground">
            {{ form.name || 'Sem nome' }}
          </p>
          <p class="truncate text-sm text-muted-foreground">{{ form.email }}</p>
          <p
            v-if="controller.profile.value?.createdAt"
            class="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Icon name="CalendarClock" size="sm" />
            Membro desde {{ formatDate(controller.profile.value.createdAt) }}
          </p>
        </div>
      </div>

      <!-- Dados pessoais -->
      <FormSection
        icon="User"
        title="Dados pessoais"
        description="Nome e e-mail usados no sistema."
      >
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            v-model="form.name"
            maxlength="120"
            placeholder="Seu nome completo"
            :error="errors.name"
          >
            <template #prefix><Icon name="User" size="sm" /></template>
            <template #label>Nome</template>
          </Input>

          <Input
            v-model="form.email"
            type="email"
            maxlength="120"
            inputmode="email"
            placeholder="voce@exemplo.com"
            :error="errors.email"
          >
            <template #prefix><Icon name="Mail" size="sm" /></template>
            <template #label>E-mail</template>
          </Input>
        </div>
      </FormSection>
    </motion.div>

    <FormActionBar
      submit-label="Salvar alterações"
      secondary-label="Descartar"
      :loading="controller.isLoading"
      show-status
      :dirty="dirty"
      @secondary="handleReset"
    />
  </form>
</template>
