<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button, Icon } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import {
  correctionLetterSchema,
  CORRECAO_MIN,
  CORRECAO_MAX,
} from '@/modules/fiscal/presentation/schemas/correction-letter-schema'
import { LIMITE_CARTAS_CORRECAO } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'
import { toFormErrors } from '@/core/utils/zod-errors'

/**
 * Carta de correção.
 *
 * A orientação legal vem **antes** do campo de texto, e não como mensagem de
 * erro: quem chega aqui quase sempre quer corrigir justamente o que a CC-e não
 * corrige, e uma tela que só oferece um campo e recusa depois ensina errado.
 */

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loading?: boolean
    /** Quantas correções ainda cabem antes do limite legal. */
    restantes: number
    /** Texto legal vigente, quando já houver correção anterior na nota. */
    condicaoDeUso?: string | null
  }>(),
  { loading: false, condicaoDeUso: null },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [correcao: string]
}>()

const correcao = ref('')
const error = ref<string | null>(null)

const length = computed(() => correcao.value.trim().length)
const canSubmit = computed(
  () =>
    props.restantes > 0 &&
    length.value >= CORRECAO_MIN &&
    length.value <= CORRECAO_MAX,
)

/** O que a CC-e não conserta — e o que fazer nesses casos. */
const naoCorrige = [
  'Valores: produto, ICMS, base de cálculo ou total da nota',
  'Data de emissão ou de saída da mercadoria',
  'Dados que mudem o emitente ou o destinatário da operação',
]

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      correcao.value = ''
      error.value = null
    }
  },
)

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  const result = correctionLetterSchema.safeParse({ correcao: correcao.value })
  if (!result.success) {
    error.value = toFormErrors(result.error).correcao ?? null
    return
  }
  error.value = null
  emit('confirm', result.data.correcao)
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="Carta de correção"
    description="Corrige um detalhe da nota autorizada, sem desfazê-la."
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <!-- O que a CC-e NÃO corrige, antes de qualquer campo -->
      <div
        class="rounded-xl border border-warning-500/30 bg-warning-500/10 px-3 py-2.5"
      >
        <p
          class="flex items-center gap-2 text-xs font-medium text-warning-700"
        >
          <Icon name="TriangleAlert" size="sm" class="shrink-0" />
          A carta de correção não pode alterar
        </p>
        <ul class="mt-1.5 space-y-1 pl-6 text-xs text-warning-700">
          <li v-for="item in naoCorrige" :key="item" class="list-disc">
            {{ item }}
          </li>
        </ul>
        <p class="mt-2 pl-6 text-xs text-warning-700">
          Nesses casos o caminho é <strong>cancelar e emitir uma nova nota</strong>,
          dentro do prazo de cancelamento.
        </p>
      </div>

      <!-- Contador do limite legal -->
      <p
        class="flex items-center gap-2 text-xs"
        :class="props.restantes > 0 ? 'text-muted-foreground' : 'text-error-600'"
      >
        <Icon name="Info" size="xs" class="shrink-0" />
        <span v-if="props.restantes > 0">
          Restam
          <strong class="tabular-nums">{{ props.restantes }}</strong>
          de {{ LIMITE_CARTAS_CORRECAO }} correções para esta nota.
        </span>
        <span v-else>
          Esta nota já tem as {{ LIMITE_CARTAS_CORRECAO }} correções permitidas
          por lei. Não há como corrigi-la de novo.
        </span>
      </p>

      <div>
        <label
          for="cce-correcao"
          class="mb-1.5 block text-sm font-medium text-foreground"
        >
          O que precisa ser corrigido
        </label>
        <textarea
          id="cce-correcao"
          v-model="correcao"
          rows="4"
          :maxlength="CORRECAO_MAX"
          :disabled="props.loading || props.restantes === 0"
          placeholder="Descreva a correção como ela deve constar na nota (mínimo 15 caracteres)"
          class="w-full resize-none rounded-xl border border-line-2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
          :class="error ? 'border-error-500' : ''"
        />
        <div class="mt-1 flex items-center justify-between text-xs">
          <span v-if="error" class="text-error-600">{{ error }}</span>
          <span v-else class="text-muted-foreground">
            Mínimo de {{ CORRECAO_MIN }} caracteres.
          </span>
          <span
            class="tabular-nums"
            :class="
              length < CORRECAO_MIN ? 'text-muted-foreground' : 'text-success-600'
            "
          >
            {{ length }}/{{ CORRECAO_MAX }}
          </span>
        </div>
      </div>

      <!-- Condição de uso vigente: vem do servidor, gravada com a correção -->
      <p
        v-if="props.condicaoDeUso"
        class="rounded-lg bg-muted px-3 py-2 text-[11px] leading-relaxed text-muted-foreground"
      >
        {{ props.condicaoDeUso }}
      </p>

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
        <template #icon><Icon name="PenLine" size="sm" /></template>
        Emitir correção
      </Button>
    </template>
  </Modal>
</template>
