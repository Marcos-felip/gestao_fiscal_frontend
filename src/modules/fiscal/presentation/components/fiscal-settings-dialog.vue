<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Button, Icon, Input, Select, Switch } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'
import {
  validateFiscalSettings,
  type FiscalSettingsErrors,
  type FiscalSettingsFormValues,
} from '@/modules/fiscal/presentation/schemas/fiscal-settings-schema'
import {
  FiscalEnvironment,
  fiscalEnvironmentOptions,
} from '@/enums/fiscal-environment.enum'
import type { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
import { formatDate } from '@/core/utils/date'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loading?: boolean
    readonly?: boolean
    establishmentName: string
    settings?: FiscalSettings | null
  }>(),
  { loading: false, readonly: false, settings: null },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: FiscalSettingsFormValues]
}>()

const form = reactive<FiscalSettingsFormValues>({
  ambiente: FiscalEnvironment.HOMOLOGACAO,
  serieNfce: '1',
  proximoNumeroNfce: '1',
  codigoCsc: '',
  idCsc: '',
  ativo: true,
})
const errors = ref<FiscalSettingsErrors>({})

const isEdit = computed(() => Boolean(props.settings))

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    errors.value = {}
    const settings = props.settings
    if (settings) {
      form.ambiente = settings.ambiente
      form.serieNfce = String(settings.serieNfce)
      form.proximoNumeroNfce = String(settings.proximoNumeroNfce)
      form.codigoCsc = settings.codigoCsc ?? ''
      form.idCsc = settings.idCsc ?? ''
      form.ativo = settings.ativo
    } else {
      form.ambiente = FiscalEnvironment.HOMOLOGACAO
      form.serieNfce = '1'
      form.proximoNumeroNfce = '1'
      form.codigoCsc = ''
      form.idCsc = ''
      form.ativo = true
    }
  },
)

// --- Certificado (somente leitura nesta fase) ---
const certificate = computed(() => {
  const settings = props.settings
  if (!settings || !settings.hasCertificate) return null
  return {
    subject: settings.certificadoSubject,
    validade: settings.certificadoValidade
      ? formatDate(settings.certificadoValidade.toISOString())
      : '—',
    expiresInDays: settings.certificateExpiresInDays,
    isExpiring: settings.isCertificateExpiring,
    isExpired: settings.isCertificateExpired,
  }
})

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  if (props.readonly) return
  const result = validateFiscalSettings({ ...form }, isEdit.value)
  errors.value = result.errors
  if (!result.ok) return
  emit('submit', { ...form })
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    :title="
      isEdit ? 'Editar configuração fiscal' : 'Configurar estabelecimento'
    "
    :description="props.establishmentName"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-5" @submit.prevent="submit">
      <fieldset :disabled="props.readonly" class="space-y-5">
        <!-- Ambiente + Série -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            v-model="form.ambiente"
            :options="fiscalEnvironmentOptions"
            :error="errors.ambiente"
            hint="Homologação para testes; Produção emite NFC-e válida."
          >
            <template #label>Ambiente</template>
          </Select>

          <Input
            v-model="form.serieNfce"
            inputmode="numeric"
            maxlength="3"
            placeholder="1"
            :error="errors.serieNfce"
            hint="Número inteiro de 1 a 999."
          >
            <template #label>Série da NFC-e</template>
            <template #prefix><Icon name="Hash" size="sm" /></template>
          </Input>
        </div>

        <!-- Próximo número (só na edição) -->
        <Input
          v-if="isEdit"
          v-model="form.proximoNumeroNfce"
          inputmode="numeric"
          maxlength="9"
          placeholder="1"
          :error="errors.proximoNumeroNfce"
          hint="Próximo número que será usado ao emitir. Ajuste com cuidado."
        >
          <template #label>Próximo número da NFC-e</template>
          <template #prefix><Icon name="ListOrdered" size="sm" /></template>
        </Input>

        <!-- CSC -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            v-model="form.idCsc"
            maxlength="20"
            placeholder="Ex.: 000001"
            :error="errors.idCsc"
          >
            <template #label>ID do CSC</template>
            <template #prefix><Icon name="Key" size="sm" /></template>
          </Input>

          <Input
            v-model="form.codigoCsc"
            maxlength="64"
            placeholder="Código de segurança do contribuinte"
            :error="errors.codigoCsc"
          >
            <template #label>Código CSC</template>
            <template #prefix><Icon name="KeyRound" size="sm" /></template>
          </Input>
        </div>

        <!-- Ativo -->
        <label
          class="flex items-center justify-between gap-4 rounded-xl border border-line-2 px-4 py-3"
        >
          <span class="min-w-0">
            <span class="block text-sm font-medium text-foreground">
              Emissão fiscal ativa
            </span>
            <span class="block text-xs text-muted-foreground">
              Desative para impedir a emissão de NFC-e neste estabelecimento.
            </span>
          </span>
          <Switch v-model="form.ativo" aria-label="Emissão fiscal ativa" />
        </label>
      </fieldset>

      <!-- Certificado digital (somente leitura nesta fase) -->
      <div class="rounded-xl border border-line-2 bg-muted/40 p-4">
        <div class="flex items-center gap-2">
          <Icon name="ShieldCheck" size="sm" class="text-muted-foreground" />
          <h4 class="text-sm font-semibold text-foreground">
            Certificado digital
          </h4>
        </div>

        <template v-if="certificate">
          <dl class="mt-3 space-y-1.5 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Titular</dt>
              <dd class="min-w-0 truncate text-right text-foreground">
                {{ certificate.subject || '—' }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Validade</dt>
              <dd class="text-right tabular-nums text-foreground">
                {{ certificate.validade }}
              </dd>
            </div>
          </dl>

          <!-- Alerta de vencimento -->
          <div
            v-if="certificate.isExpired"
            class="mt-3 flex items-start gap-2 rounded-lg bg-error-500/10 px-3 py-2 text-sm text-error-600"
          >
            <Icon name="TriangleAlert" size="sm" class="mt-0.5 shrink-0" />
            <span
              >Certificado vencido. A emissão de NFC-e falhará até a
              renovação.</span
            >
          </div>
          <div
            v-else-if="certificate.isExpiring"
            class="mt-3 flex items-start gap-2 rounded-lg bg-warning-500/10 px-3 py-2 text-sm text-warning-700"
          >
            <Icon name="TriangleAlert" size="sm" class="mt-0.5 shrink-0" />
            <span>
              Certificado vence em
              {{ certificate.expiresInDays }}
              {{ certificate.expiresInDays === 1 ? 'dia' : 'dias' }}. Programe a
              renovação.
            </span>
          </div>
        </template>

        <p v-else class="mt-2 text-sm text-muted-foreground">
          Certificado não configurado. O upload do certificado será feito em uma
          etapa futura.
        </p>
      </div>

      <button type="submit" class="hidden" aria-hidden="true"></button>
    </form>

    <template #footer>
      <Button variant="ghost" :disabled="props.loading" @click="close">
        {{ props.readonly ? 'Fechar' : 'Cancelar' }}
      </Button>
      <Button
        v-if="!props.readonly"
        variant="primary"
        text-class="text-white"
        :loading="props.loading"
        @click="submit"
      >
        <template #icon>
          <Icon :name="isEdit ? 'Check' : 'Plus'" size="sm" />
        </template>
        {{ isEdit ? 'Salvar' : 'Configurar' }}
      </Button>
    </template>
  </Modal>
</template>
