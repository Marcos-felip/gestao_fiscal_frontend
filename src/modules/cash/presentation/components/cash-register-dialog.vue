<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Button, Icon, Input, Select, Switch } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import {
  validateCashRegister,
  type CashRegisterErrors,
  type CashRegisterFormValues,
} from '@/modules/cash/presentation/schemas/cash-register-schema'
import type { CashRegister } from '@/modules/cash/domain/entities/cash-register.entity'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loading?: boolean
    register?: CashRegister | null
    establishmentOptions: SelectOption[]
  }>(),
  { loading: false, register: null },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: CashRegisterFormValues]
}>()

const form = reactive<CashRegisterFormValues>({
  establishmentId: '',
  name: '',
  isActive: true,
})
const errors = ref<CashRegisterErrors>({})

const isEdit = computed(() => Boolean(props.register))
const requireEstablishment = computed(
  () => !isEdit.value && props.establishmentOptions.length > 1,
)
const showEstablishment = computed(
  () => !isEdit.value && props.establishmentOptions.length > 1,
)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    errors.value = {}
    if (props.register) {
      form.establishmentId = props.register.establishmentId ?? ''
      form.name = props.register.name
      form.isActive = props.register.isActive
    } else {
      form.establishmentId =
        props.establishmentOptions.length === 1
          ? String(props.establishmentOptions[0].value)
          : ''
      form.name = ''
      form.isActive = true
    }
  },
)

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  const result = validateCashRegister({ ...form }, requireEstablishment.value)
  errors.value = result.errors
  if (!result.ok) return
  emit('submit', { ...form })
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    :title="isEdit ? 'Editar caixa' : 'Novo caixa'"
    description="Terminal onde as sessões de caixa são abertas e fechadas."
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <Select
        v-if="showEstablishment"
        v-model="form.establishmentId"
        :options="props.establishmentOptions"
        placeholder="Selecione o estabelecimento"
        :error="errors.establishmentId"
      >
        <template #label>Estabelecimento</template>
      </Select>

      <Input
        v-model="form.name"
        maxlength="60"
        placeholder="Ex.: Caixa 01"
        :error="errors.name"
      >
        <template #label>Nome do caixa</template>
        <template #prefix><Icon name="Monitor" size="sm" /></template>
      </Input>

      <label
        class="flex items-center justify-between gap-4 rounded-xl border border-line-2 px-4 py-3"
      >
        <span class="min-w-0">
          <span class="block text-sm font-medium text-foreground">Ativo</span>
          <span class="block text-xs text-muted-foreground">
            Caixas inativos não podem abrir novas sessões.
          </span>
        </span>
        <Switch v-model="form.isActive" aria-label="Caixa ativo" />
      </label>

      <button type="submit" class="hidden" aria-hidden="true"></button>
    </form>

    <template #footer>
      <Button variant="ghost" :disabled="props.loading" @click="close">
        Cancelar
      </Button>
      <Button
        variant="primary"
        text-class="text-white"
        :loading="props.loading"
        @click="submit"
      >
        <template #icon><Icon :name="isEdit ? 'Check' : 'Plus'" size="sm" /></template>
        {{ isEdit ? 'Salvar' : 'Cadastrar' }}
      </Button>
    </template>
  </Modal>
</template>
