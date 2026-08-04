<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button, Icon } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import {
  cancelFiscalDocumentSchema,
  JUSTIFICATIVA_MIN,
  JUSTIFICATIVA_MAX,
} from '@/modules/fiscal/presentation/schemas/cancel-fiscal-document-schema'
import { toFormErrors } from '@/core/utils/zod-errors'

const props = withDefaults(
  defineProps<{ modelValue: boolean; loading?: boolean }>(),
  { loading: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [justificativa: string]
}>()

const justificativa = ref('')
const error = ref<string | null>(null)

const length = computed(() => justificativa.value.trim().length)
const canSubmit = computed(
  () => length.value >= JUSTIFICATIVA_MIN && length.value <= JUSTIFICATIVA_MAX,
)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      justificativa.value = ''
      error.value = null
    }
  },
)

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  const result = cancelFiscalDocumentSchema.safeParse({
    justificativa: justificativa.value,
  })
  if (!result.success) {
    error.value = toFormErrors(result.error).justificativa ?? null
    return
  }
  error.value = null
  emit('confirm', result.data.justificativa)
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="Cancelar documento fiscal"
    description="O cancelamento é enviado à SEFAZ e não pode ser desfeito."
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-3" @submit.prevent="submit">
      <div
        class="flex items-start gap-2 rounded-lg border border-warning-500/30 bg-warning-500/10 px-3 py-2 text-xs text-warning-700"
      >
        <Icon name="TriangleAlert" size="sm" class="mt-0.5 shrink-0" />
        <span>
          Informe o motivo do cancelamento. A justificativa fica registrada na
          nota e na SEFAZ.
        </span>
      </div>

      <div>
        <label
          for="cancel-justificativa"
          class="mb-1.5 block text-sm font-medium text-foreground"
        >
          Justificativa
        </label>
        <textarea
          id="cancel-justificativa"
          v-model="justificativa"
          rows="4"
          :maxlength="JUSTIFICATIVA_MAX"
          :disabled="props.loading"
          placeholder="Descreva o motivo do cancelamento (mínimo 15 caracteres)"
          class="w-full resize-none rounded-xl border border-line-2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
          :class="error ? 'border-error-500' : ''"
        />
        <div class="mt-1 flex items-center justify-between text-xs">
          <span v-if="error" class="text-error-600">{{ error }}</span>
          <span v-else class="text-muted-foreground">
            Mínimo de {{ JUSTIFICATIVA_MIN }} caracteres.
          </span>
          <span
            class="tabular-nums"
            :class="
              length < JUSTIFICATIVA_MIN
                ? 'text-muted-foreground'
                : 'text-success-600'
            "
          >
            {{ length }}/{{ JUSTIFICATIVA_MAX }}
          </span>
        </div>
      </div>

      <button type="submit" class="hidden" aria-hidden="true"></button>
    </form>

    <template #footer>
      <Button variant="ghost" :disabled="props.loading" @click="close">
        Voltar
      </Button>
      <Button
        variant="primary"
        text-class="text-white"
        :loading="props.loading"
        :disabled="!canSubmit"
        @click="submit"
      >
        <template #icon><Icon name="Ban" size="sm" /></template>
        Confirmar cancelamento
      </Button>
    </template>
  </Modal>
</template>
