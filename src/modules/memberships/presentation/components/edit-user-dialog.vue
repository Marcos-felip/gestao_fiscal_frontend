<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '@/shared/components/dialog/modal.vue'
import { Button, Icon, Input } from '@/shared/ui'
import { toFormErrors } from '@/core/utils/zod-errors'
import type { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import {
  editUserSchema,
  type EditUserFormData,
} from '@/modules/memberships/presentation/schemas/edit-user-schema'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  member: Membership | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [input: { name: string; email: string }]
}>()

const name = ref('')
const email = ref('')
const errors = ref<Partial<Record<keyof EditUserFormData, string>>>({})

// Semeia com os dados do membro ao abrir.
watch(
  () => props.modelValue,
  (open) => {
    if (open && props.member) {
      name.value = props.member.userName
      email.value = props.member.userEmail
      errors.value = {}
    }
  },
  { immediate: true },
)

function close(): void {
  emit('update:modelValue', false)
}

function handleSubmit(): void {
  const result = editUserSchema.safeParse({
    name: name.value,
    email: email.value,
  })
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }
  errors.value = {}
  emit('submit', { name: result.data.name, email: result.data.email })
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="Editar usuário"
    size="lg"
    description="Atualize os dados cadastrais. O papel é alterado à parte."
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <Input
        v-model="name"
        maxlength="120"
        placeholder="Nome do usuário"
        :error="errors.name"
      >
        <template #label>Nome</template>
      </Input>

      <Input
        v-model="email"
        type="email"
        placeholder="usuario@empresa.com"
        :error="errors.email"
      >
        <template #label>E-mail</template>
      </Input>
    </form>

    <template #footer>
      <Button type="button" variant="ghost" :disabled="loading" @click="close">
        Cancelar
      </Button>
      <Button
        type="button"
        variant="primary"
        text-class="text-white"
        :loading="loading"
        loading-text="Salvando…"
        @click="handleSubmit"
      >
        <template #icon><Icon name="Check" size="sm" /></template>
        Salvar
      </Button>
    </template>
  </Modal>
</template>
