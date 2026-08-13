<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button, Icon, Input } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'

/**
 * Emissão de NF-e modelo 55.
 *
 * O diálogo pergunta **uma** coisa que o sistema não tem como saber: o destino
 * da mercadoria. O resto — destinatário, endereço, indicador de IE — vem do
 * cadastro do cliente, e o backend recusa nomeando o campo que faltar. Duplicar
 * essa conferência aqui criaria uma segunda regra para divergir da primeira.
 */

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loading?: boolean
    customerName?: string | null
  }>(),
  { loading: false, customerName: null },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [dados: { consumidorFinal: boolean; naturezaOperacao?: string }]
}>()

const NATUREZA_PADRAO = 'VENDA DE MERCADORIA'

/** `null` até o operador escolher: não há resposta padrão segura. */
const consumidorFinal = ref<boolean | null>(null)
const naturezaOperacao = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      consumidorFinal.value = null
      naturezaOperacao.value = ''
    }
  },
)

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  if (consumidorFinal.value === null) return

  emit('confirm', {
    consumidorFinal: consumidorFinal.value,
    naturezaOperacao: naturezaOperacao.value.trim() || undefined,
  })
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="Emitir NF-e"
    description="A NF-e será enviada para autorização na SEFAZ."
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <div
        class="flex items-start gap-2 rounded-lg border border-line-2 bg-surface-2 px-3 py-2 text-xs text-muted-foreground"
      >
        <Icon name="Building2" size="sm" class="mt-0.5 shrink-0" />
        <span>
          Destinatário:
          <strong class="text-foreground">
            {{ props.customerName ?? 'cliente da venda' }}
          </strong>
          — endereço, código IBGE e situação perante o ICMS vêm do cadastro dele.
        </span>
      </div>

      <fieldset class="space-y-2">
        <legend class="mb-1.5 text-sm font-medium text-foreground">
          O que o cliente vai fazer com a mercadoria?
        </legend>

        <button
          type="button"
          class="flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition"
          :class="
            consumidorFinal === false
              ? 'border-primary bg-primary/5'
              : 'border-line-2 hover:border-line-3'
          "
          :disabled="props.loading"
          @click="consumidorFinal = false"
        >
          <Icon name="Store" size="sm" class="mt-0.5 shrink-0" />
          <span>
            <span class="block text-sm font-medium text-foreground">
              Revender
            </span>
            <span class="block text-xs text-muted-foreground">
              A mercadoria vai para o estoque dele e será vendida adiante.
            </span>
          </span>
        </button>

        <button
          type="button"
          class="flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition"
          :class="
            consumidorFinal === true
              ? 'border-primary bg-primary/5'
              : 'border-line-2 hover:border-line-3'
          "
          :disabled="props.loading"
          @click="consumidorFinal = true"
        >
          <Icon name="Package" size="sm" class="mt-0.5 shrink-0" />
          <span>
            <span class="block text-sm font-medium text-foreground">
              Consumir ou usar
            </span>
            <span class="block text-xs text-muted-foreground">
              A mercadoria é para uso próprio do cliente, não para revenda.
            </span>
          </span>
        </button>
      </fieldset>

      <Input
        v-model="naturezaOperacao"
        :placeholder="NATUREZA_PADRAO"
        maxlength="60"
        :disabled="props.loading"
      >
        <template #label>Natureza da operação</template>
        <template #hint>
          Deixe em branco para usar “{{ NATUREZA_PADRAO }}”.
        </template>
      </Input>
    </div>

    <template #footer>
      <Button variant="ghost" :disabled="props.loading" @click="close">
        Voltar
      </Button>
      <Button
        variant="primary"
        text-class="text-white"
        :loading="props.loading"
        loading-text="Emitindo…"
        :disabled="consumidorFinal === null"
        @click="submit"
      >
        <template #icon><Icon name="FileUp" size="sm" /></template>
        Emitir NF-e
      </Button>
    </template>
  </Modal>
</template>
