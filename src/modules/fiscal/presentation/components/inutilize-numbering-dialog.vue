<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button, Icon, Input, Select } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import {
  inutilizeNumberingSchema,
  INUTILIZACAO_JUSTIFICATIVA_MIN,
  INUTILIZACAO_JUSTIFICATIVA_MAX,
} from '@/modules/fiscal/presentation/schemas/inutilize-numbering-schema'
import type { InutilizacaoPedido } from '@/modules/fiscal/presentation/controllers/inutilization-controller'
import type { FiscalPendingRange } from '@/modules/fiscal/domain/responses/fiscal-pending-range'
import {
  FiscalDocumentModel,
  fiscalDocumentModelLabels,
  fiscalDocumentModelOptions,
} from '@/core/enums/fiscal-document-model.enum'
import { toFormErrors } from '@/core/utils/zod-errors'

/**
 * Inutilização de faixa de numeração.
 *
 * Duas etapas de propósito: o ato é irreversível e recai sobre números que o
 * operador digitou. A segunda etapa repete, por extenso, exatamente quais
 * números serão queimados — é a última chance de perceber o dedo trocado.
 */

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loading?: boolean
    /** Faixas calculadas pelo servidor, oferecidas como sugestão. */
    pendingRanges: FiscalPendingRange[]
    serieNfce: number
    serieNfe: number
    /** Recusa do backend — nomeia o número já usado. */
    conflito?: string | null
  }>(),
  { loading: false, conflito: null },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [pedido: InutilizacaoPedido]
  'limpar-conflito': []
}>()

const etapa = ref<'form' | 'confirmar'>('form')

const modelo = ref<string>(FiscalDocumentModel.NFE)
const serie = ref('1')
const numeroInicial = ref('')
const numeroFinal = ref('')
const justificativa = ref('')
const errors = ref<Record<string, string>>({})

const justificativaLength = computed(() => justificativa.value.trim().length)

/** Série padrão do modelo escolhido — vem da configuração do estabelecimento. */
watch(modelo, (valor) => {
  serie.value = String(
    valor === FiscalDocumentModel.NFE ? props.serieNfe : props.serieNfce,
  )
})

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    etapa.value = 'form'
    modelo.value = FiscalDocumentModel.NFE
    serie.value = String(props.serieNfe)
    numeroInicial.value = ''
    numeroFinal.value = ''
    justificativa.value = ''
    errors.value = {}
    emit('limpar-conflito')
  },
)

/** Sugestões achatadas: uma linha por faixa contígua. */
const sugestoes = computed(() =>
  props.pendingRanges.flatMap((grupo) =>
    grupo.faixas.map((faixa) => ({
      modelo: grupo.modelo,
      serie: grupo.serie,
      inicio: faixa.inicio,
      fim: faixa.fim,
      label:
        faixa.inicio === faixa.fim
          ? `${fiscalDocumentModelLabels[grupo.modelo]} série ${grupo.serie} · nº ${faixa.inicio}`
          : `${fiscalDocumentModelLabels[grupo.modelo]} série ${grupo.serie} · nº ${faixa.inicio} a ${faixa.fim}`,
    })),
  ),
)

function aplicarSugestao(s: (typeof sugestoes.value)[number]): void {
  modelo.value = s.modelo
  serie.value = String(s.serie)
  numeroInicial.value = String(s.inicio)
  numeroFinal.value = String(s.fim)
  errors.value = {}
}

/** O Select só oferece dois valores; resolver sem `as` mantém o tipo honesto. */
const modeloSelecionado = computed<FiscalDocumentModel>(() =>
  modelo.value === FiscalDocumentModel.NFCE
    ? FiscalDocumentModel.NFCE
    : FiscalDocumentModel.NFE,
)

const pedido = computed(() => ({
  modelo: modeloSelecionado.value,
  serie: Number(serie.value),
  numeroInicial: Number(numeroInicial.value),
  numeroFinal: Number(numeroFinal.value),
  justificativa: justificativa.value,
}))

const faixaLabel = computed(() =>
  pedido.value.numeroInicial === pedido.value.numeroFinal
    ? `nº ${pedido.value.numeroInicial}`
    : `nº ${pedido.value.numeroInicial} a ${pedido.value.numeroFinal}`,
)

function close(): void {
  emit('update:modelValue', false)
}

/** Valida e avança para a confirmação — não envia nada ainda. */
function revisar(): void {
  const result = inutilizeNumberingSchema.safeParse(pedido.value)
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }
  errors.value = {}
  emit('limpar-conflito')
  etapa.value = 'confirmar'
}

function confirmar(): void {
  const result = inutilizeNumberingSchema.safeParse(pedido.value)
  if (!result.success) {
    errors.value = toFormErrors(result.error)
    etapa.value = 'form'
    return
  }
  emit('confirm', result.data as InutilizacaoPedido)
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="Inutilizar numeração"
    description="Regulariza números reservados que nunca viraram nota."
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Etapa 1: a faixa -->
    <form v-if="etapa === 'form'" class="space-y-4" @submit.prevent="revisar">
      <div
        v-if="sugestoes.length > 0"
        class="rounded-xl border border-line-2 px-3 py-2.5"
      >
        <p class="flex items-center gap-2 text-xs font-medium text-foreground">
          <Icon name="Lightbulb" size="xs" class="shrink-0 text-primary" />
          Numeração perdida encontrada
        </p>
        <p class="mt-1 text-xs text-muted-foreground">
          Números reservados que nunca viraram documento. Clique para preencher.
        </p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <button
            v-for="s in sugestoes"
            :key="s.label"
            type="button"
            class="cursor-pointer rounded-lg bg-primary/10 px-2.5 py-1 text-xs text-primary transition-colors hover:bg-primary/20"
            @click="aplicarSugestao(s)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <Select
          v-model="modelo"
          :options="fiscalDocumentModelOptions"
          :error="errors.modelo"
        >
          <template #label>Modelo</template>
        </Select>
        <Input v-model="serie" type="number" :error="errors.serie">
          <template #label>Série</template>
        </Input>
        <Input
          v-model="numeroInicial"
          type="number"
          placeholder="1"
          :error="errors.numeroInicial"
        >
          <template #label>Número inicial</template>
        </Input>
        <Input
          v-model="numeroFinal"
          type="number"
          placeholder="1"
          :error="errors.numeroFinal"
          hint="Igual ao inicial para um número só"
        >
          <template #label>Número final</template>
        </Input>
      </div>

      <div>
        <label
          for="inutilizacao-justificativa"
          class="mb-1.5 block text-sm font-medium text-foreground"
        >
          Justificativa
        </label>
        <textarea
          id="inutilizacao-justificativa"
          v-model="justificativa"
          rows="3"
          :maxlength="INUTILIZACAO_JUSTIFICATIVA_MAX"
          placeholder="Por que esta numeração não foi utilizada (mínimo 15 caracteres)"
          class="w-full resize-none rounded-xl border border-line-2 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          :class="errors.justificativa ? 'border-error-500' : ''"
        />
        <div class="mt-1 flex items-center justify-between text-xs">
          <span v-if="errors.justificativa" class="text-error-600">
            {{ errors.justificativa }}
          </span>
          <span v-else class="text-muted-foreground">
            Mínimo de {{ INUTILIZACAO_JUSTIFICATIVA_MIN }} caracteres.
          </span>
          <span class="tabular-nums text-muted-foreground">
            {{ justificativaLength }}/{{ INUTILIZACAO_JUSTIFICATIVA_MAX }}
          </span>
        </div>
      </div>

      <button type="submit" class="hidden" aria-hidden="true"></button>
    </form>

    <!-- Etapa 2: a confirmação, com os números por extenso -->
    <div v-else class="space-y-4">
      <div
        class="rounded-xl border border-error-500/30 bg-error-500/10 px-4 py-3"
      >
        <p class="flex items-center gap-2 text-sm font-medium text-error-700">
          <Icon name="OctagonAlert" size="sm" class="shrink-0" />
          Isto não pode ser desfeito
        </p>
        <p class="mt-2 text-sm text-error-700">
          Vai inutilizar
          <strong>{{ fiscalDocumentModelLabels[pedido.modelo] }}</strong
          >, série <strong class="tabular-nums">{{ pedido.serie }}</strong
          >, <strong class="tabular-nums">{{ faixaLabel }}</strong
          >.
        </p>
        <p class="mt-2 text-xs text-error-700">
          Depois disso esses números não podem mais ser usados em nenhuma nota.
          Confira se nenhum deles pertence a um documento emitido.
        </p>
      </div>

      <div class="rounded-xl bg-muted px-4 py-3">
        <p class="text-xs font-medium text-muted-foreground">Justificativa</p>
        <p class="mt-1 text-sm text-foreground">{{ pedido.justificativa }}</p>
      </div>
    </div>

    <!-- Recusa do backend: nomeia o número ocupado, e é o que permite corrigir -->
    <p
      v-if="props.conflito"
      class="mt-3 flex items-start gap-2 rounded-lg border border-error-500/30 bg-error-500/10 px-3 py-2 text-xs text-error-700"
    >
      <Icon name="CircleAlert" size="xs" class="mt-0.5 shrink-0" />
      <span>{{ props.conflito }}</span>
    </p>

    <template #footer>
      <template v-if="etapa === 'form'">
        <Button variant="ghost" :disabled="props.loading" @click="close">
          Cancelar
        </Button>
        <Button variant="primary" text-class="text-white" @click="revisar">
          <template #icon><Icon name="ArrowRight" size="sm" /></template>
          Revisar
        </Button>
      </template>
      <template v-else>
        <Button
          variant="ghost"
          :disabled="props.loading"
          @click="etapa = 'form'"
        >
          Voltar
        </Button>
        <Button
          variant="destructive"
          :loading="props.loading"
          @click="confirmar"
        >
          <template #icon><Icon name="Ban" size="sm" /></template>
          Sim, inutilizar {{ faixaLabel }}
        </Button>
      </template>
    </template>
  </Modal>
</template>
