<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button, DatePicker, Icon, Select } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import { ExportFiscalXmlsDto } from '@/modules/fiscal/domain/dto/export-fiscal-xmls-dto'
import {
  exportFiscalXmlsSchema,
  mesFechado,
} from '@/modules/fiscal/presentation/schemas/export-fiscal-xmls-schema'
import { toFormErrors } from '@/core/utils/zod-errors'
import {
  FiscalEnvironment,
  fiscalEnvironmentOptions,
} from '@/core/enums/fiscal-environment.enum'
import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'
import { fiscalDocumentModelOptions } from '@/core/enums/fiscal-document-model.enum'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loading?: boolean
    /** Erro devolvido pela API, exibido sem fechar o modal. */
    apiError?: string | null
    establishmentOptions?: SelectOption[]
  }>(),
  { loading: false, apiError: null, establishmentOptions: () => [] },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [dto: ExportFiscalXmlsDto]
}>()

const dataInicio = ref('')
const dataFim = ref('')
const establishmentId = ref('')
const modelo = ref<FiscalDocumentModel | ''>('')
const ambiente = ref<FiscalEnvironment>(FiscalEnvironment.PRODUCAO)
const errors = ref<Partial<Record<'dataInicio' | 'dataFim', string>>>({})

const establishmentSelectOptions = computed<SelectOption[]>(() => [
  { value: '', label: 'Todos os estabelecimentos' },
  ...props.establishmentOptions,
])

const modeloSelectOptions = computed<SelectOption[]>(() => [
  { value: '', label: 'Todos os modelos' },
  ...fiscalDocumentModelOptions,
])

const isHomologacao = computed(
  () => ambiente.value === FiscalEnvironment.HOMOLOGACAO,
)

/** Abrir o modal já com o mês passado: é o período do fechamento. */
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return

    const periodo = mesFechado(-1)
    dataInicio.value = periodo.dataInicio
    dataFim.value = periodo.dataFim
    establishmentId.value = ''
    modelo.value = ''
    ambiente.value = FiscalEnvironment.PRODUCAO
    errors.value = {}
  },
)

function aplicarAtalho(deslocamento: number): void {
  const periodo = mesFechado(deslocamento)
  dataInicio.value = periodo.dataInicio
  dataFim.value = periodo.dataFim
  errors.value = {}
}

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  const result = exportFiscalXmlsSchema.safeParse({
    dataInicio: dataInicio.value,
    dataFim: dataFim.value,
  })

  if (!result.success) {
    errors.value = toFormErrors(result.error)
    return
  }

  errors.value = {}
  emit(
    'confirm',
    new ExportFiscalXmlsDto({
      dataInicio: result.data.dataInicio,
      dataFim: result.data.dataFim,
      establishmentId: establishmentId.value || undefined,
      modelo: modelo.value || undefined,
      ambiente: ambiente.value,
    }),
  )
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="Exportar XMLs do período"
    description="Gera um ZIP com os XMLs autorizados e cancelados, mais uma relação para conferência."
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <span class="mb-1.5 block text-sm font-medium text-foreground">
          Período
        </span>
        <div class="mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg border border-line-2 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            :disabled="props.loading"
            @click="aplicarAtalho(-1)"
          >
            Mês passado
          </button>
          <button
            type="button"
            class="rounded-lg border border-line-2 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            :disabled="props.loading"
            @click="aplicarAtalho(0)"
          >
            Mês atual
          </button>
        </div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <DatePicker
            v-model="dataInicio"
            align="start"
            placeholder="De"
            :disabled="props.loading"
          />
          <DatePicker
            v-model="dataFim"
            align="end"
            placeholder="Até"
            :disabled="props.loading"
          />
        </div>
        <p
          v-if="errors.dataInicio || errors.dataFim"
          class="mt-1 text-xs text-error-600"
        >
          {{ errors.dataInicio ?? errors.dataFim }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            for="export-estabelecimento"
            class="mb-1.5 block text-sm font-medium text-foreground"
          >
            Estabelecimento
          </label>
          <Select
            id="export-estabelecimento"
            v-model="establishmentId"
            :options="establishmentSelectOptions"
            :disabled="props.loading"
          />
        </div>
        <div>
          <label
            for="export-modelo"
            class="mb-1.5 block text-sm font-medium text-foreground"
          >
            Modelo
          </label>
          <Select
            id="export-modelo"
            :model-value="modelo"
            :options="modeloSelectOptions"
            :disabled="props.loading"
            @update:model-value="modelo = $event as FiscalDocumentModel | ''"
          />
        </div>
      </div>

      <div>
        <label
          for="export-ambiente"
          class="mb-1.5 block text-sm font-medium text-foreground"
        >
          Ambiente
        </label>
        <Select
          id="export-ambiente"
          :model-value="ambiente"
          :options="fiscalEnvironmentOptions"
          :disabled="props.loading"
          @update:model-value="ambiente = $event as FiscalEnvironment"
        />
      </div>

      <!-- Aviso de homologação: o ZIP circula por e-mail longe desta tela. -->
      <div
        v-if="isHomologacao"
        class="flex items-start gap-2 rounded-lg border border-warning-500/30 bg-warning-500/10 px-3 py-2 text-xs text-warning-700"
      >
        <Icon name="TriangleAlert" size="sm" class="mt-0.5 shrink-0" />
        <span>
          Estes arquivos são de teste e <strong>não valem para
          escrituração</strong>. O nome do ZIP sai marcado, mas confira antes de
          enviar ao contador.
        </span>
      </div>

      <div
        v-if="props.apiError"
        class="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive"
      >
        <Icon name="CircleAlert" size="sm" class="mt-0.5 shrink-0" />
        <span>{{ props.apiError }}</span>
      </div>

      <p v-if="props.loading" class="text-xs text-muted-foreground">
        Preparando o arquivo… períodos longos podem levar alguns segundos.
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
        @click="submit"
      >
        <template #icon><Icon name="Download" size="sm" /></template>
        Exportar
      </Button>
    </template>
  </Modal>
</template>
