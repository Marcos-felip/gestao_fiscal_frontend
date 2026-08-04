<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Button, Icon, Input, PasswordInput, Select, Switch } from '@/shared/ui'
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
import type { CertificateStatus } from '@/modules/fiscal/domain/entities/certificate-status.entity'
import type { FiscalCertificateEvent } from '@/modules/fiscal/domain/entities/fiscal-certificate-event.entity'
import type { StatusServicoResult } from '@/modules/fiscal/domain/responses/status-servico-result'
import { formatDate, formatDateTime } from '@/core/utils/date'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loading?: boolean
    readonly?: boolean
    establishmentName: string
    settings?: FiscalSettings | null
    // Certificado A1
    certificate?: CertificateStatus | null
    certificateLoading?: boolean
    uploading?: boolean
    certificateHistory?: FiscalCertificateEvent[]
    historyLoading?: boolean
    // Teste SEFAZ
    sefazResult?: StatusServicoResult | null
    sefazTesting?: boolean
  }>(),
  {
    loading: false,
    readonly: false,
    settings: null,
    certificate: null,
    certificateLoading: false,
    uploading: false,
    certificateHistory: () => [],
    historyLoading: false,
    sefazResult: null,
    sefazTesting: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: FiscalSettingsFormValues]
  'upload-certificate': [payload: { file: File; senha: string }]
  'test-sefaz': []
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

// --- Certificado A1 (upload) ---
const MAX_CERT_BYTES = 512 * 1024
const ALLOWED_EXT = ['.pfx', '.p12']

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const certSenha = ref('')
const fileError = ref('')
const senhaError = ref('')
const historyOpen = ref(false)

const hasCertificate = computed(() => Boolean(props.certificate?.configurado))

const uploadLabel = computed(() =>
  hasCertificate.value ? 'Substituir certificado' : 'Enviar certificado',
)

function resetCertForm(): void {
  selectedFile.value = null
  certSenha.value = ''
  fileError.value = ''
  senhaError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    errors.value = {}
    resetCertForm()
    historyOpen.value = false
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

// Ao concluir um upload (uploading: true -> false), limpa o formulário.
watch(
  () => props.uploading,
  (now, prev) => {
    if (prev && !now) resetCertForm()
  },
)

function validateFile(file: File): string {
  const name = file.name.toLowerCase()
  const okExt = ALLOWED_EXT.some((ext) => name.endsWith(ext))
  if (!okExt) return 'Selecione um arquivo .pfx ou .p12.'
  if (file.size > MAX_CERT_BYTES) return 'O arquivo deve ter no máximo 512 KB.'
  return ''
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (!file) {
    selectedFile.value = null
    fileError.value = ''
    return
  }
  const error = validateFile(file)
  fileError.value = error
  selectedFile.value = error ? null : file
}

function submitCertificate(): void {
  if (props.readonly) return
  const file = selectedFile.value
  fileError.value = file ? '' : 'Selecione o arquivo do certificado.'
  senhaError.value = certSenha.value.trim()
    ? ''
    : 'Informe a senha do certificado.'
  if (!file || !certSenha.value.trim()) return
  emit('upload-certificate', { file, senha: certSenha.value })
}

// --- Certificado (exibição) ---
const certificateView = computed(() => {
  const cert = props.certificate
  if (!cert || !cert.configurado) return null
  return {
    titular: cert.titular,
    subject: cert.subject,
    validade: cert.validoAte ? formatDate(cert.validoAte.toISOString()) : '—',
    diasParaVencer: cert.diasParaVencer,
    isExpiring: cert.isExpiring,
    vencido: cert.vencido,
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

      <!-- Certificado digital A1 -->
      <div class="rounded-xl border border-line-2 bg-muted/40 p-4">
        <div class="flex items-center gap-2">
          <Icon name="ShieldCheck" size="sm" class="text-muted-foreground" />
          <h4 class="text-sm font-semibold text-foreground">
            Certificado digital A1
          </h4>
        </div>

        <!-- Carregando status -->
        <p
          v-if="props.certificateLoading"
          class="mt-3 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Icon name="LoaderCircle" size="sm" class="animate-spin" />
          Carregando situação do certificado…
        </p>

        <template v-else>
          <!-- Status atual -->
          <template v-if="certificateView">
            <dl class="mt-3 space-y-1.5 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-muted-foreground">Titular</dt>
                <dd class="min-w-0 truncate text-right text-foreground">
                  {{ certificateView.titular || '—' }}
                </dd>
              </div>
              <div
                v-if="certificateView.subject"
                class="flex justify-between gap-4"
              >
                <dt class="shrink-0 text-muted-foreground">Subject</dt>
                <dd class="min-w-0 truncate text-right text-foreground">
                  {{ certificateView.subject }}
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-muted-foreground">Válido até</dt>
                <dd class="text-right tabular-nums text-foreground">
                  {{ certificateView.validade }}
                </dd>
              </div>
            </dl>

            <!-- Alerta de vencimento -->
            <div
              v-if="certificateView.vencido"
              class="mt-3 flex items-start gap-2 rounded-lg bg-error-500/10 px-3 py-2 text-sm text-error-600"
            >
              <Icon name="TriangleAlert" size="sm" class="mt-0.5 shrink-0" />
              <span>
                Certificado vencido. A emissão de NFC-e falhará até a
                substituição.
              </span>
            </div>
            <div
              v-else-if="certificateView.isExpiring"
              class="mt-3 flex items-start gap-2 rounded-lg bg-warning-500/10 px-3 py-2 text-sm text-warning-700"
            >
              <Icon name="TriangleAlert" size="sm" class="mt-0.5 shrink-0" />
              <span>
                Certificado vence em
                {{ certificateView.diasParaVencer }}
                {{ certificateView.diasParaVencer === 1 ? 'dia' : 'dias' }}.
                Programe a substituição.
              </span>
            </div>
          </template>

          <!-- Sem certificado -->
          <p v-else class="mt-2 text-sm text-muted-foreground">
            Nenhum certificado configurado para este estabelecimento.
          </p>

          <!-- Upload (gated fiscal.settings.edit) -->
          <div
            v-if="!props.readonly"
            class="mt-4 space-y-3 border-t border-line-2 pt-4"
          >
            <p class="text-xs font-medium text-muted-foreground">
              {{
                hasCertificate
                  ? 'Substituir o certificado'
                  : 'Enviar certificado'
              }}
            </p>

            <!-- Seletor de arquivo (nativo estilizado) -->
            <div>
              <input
                ref="fileInput"
                type="file"
                accept=".pfx,.p12"
                class="hidden"
                @change="onFileChange"
              />
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-line-2 bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  @click="fileInput?.click()"
                >
                  <Icon name="Upload" size="sm" />
                  Escolher arquivo
                </button>
                <span
                  class="min-w-0 flex-1 truncate text-sm text-muted-foreground"
                >
                  {{
                    selectedFile
                      ? selectedFile.name
                      : 'Nenhum arquivo (.pfx ou .p12, até 512 KB)'
                  }}
                </span>
              </div>
              <p
                v-if="fileError"
                class="mt-1.5 text-sm font-medium text-error-500"
              >
                {{ fileError }}
              </p>
            </div>

            <!-- Senha -->
            <PasswordInput
              v-model="certSenha"
              autocomplete="new-password"
              placeholder="Senha do certificado"
              :error="senhaError"
            >
              <template #label>Senha do certificado</template>
            </PasswordInput>

            <Button
              variant="primary"
              text-class="text-white"
              :loading="props.uploading"
              loading-text="Enviando…"
              @click="submitCertificate"
            >
              <template #icon>
                <Icon name="ShieldCheck" size="sm" />
              </template>
              {{ uploadLabel }}
            </Button>
          </div>
        </template>

        <!-- Teste SEFAZ (gated fiscal.settings.read) -->
        <div class="mt-4 space-y-3 border-t border-line-2 pt-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-foreground">
                Comunicação com a SEFAZ
              </p>
              <p class="text-xs text-muted-foreground">
                Usa o certificado e a UF deste estabelecimento.
              </p>
            </div>
            <Button
              variant="ghost"
              :loading="props.sefazTesting"
              loading-text="Testando…"
              @click="emit('test-sefaz')"
            >
              <template #icon>
                <Icon name="RadioTower" size="sm" />
              </template>
              Testar comunicação
            </Button>
          </div>

          <!-- Resultado do teste -->
          <div
            v-if="props.sefazResult"
            :class="[
              'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
              props.sefazResult.disponivel
                ? 'bg-success-500/10 text-success-600'
                : 'bg-error-500/10 text-error-600',
            ]"
          >
            <Icon
              :name="props.sefazResult.disponivel ? 'CircleCheck' : 'CircleX'"
              size="sm"
              class="mt-0.5 shrink-0"
            />
            <span class="min-w-0">
              <span class="block font-medium">
                {{
                  props.sefazResult.disponivel
                    ? 'SEFAZ disponível'
                    : 'SEFAZ indisponível'
                }}
              </span>
              <span v-if="props.sefazResult.mensagem" class="block">
                {{ props.sefazResult.mensagem }}
              </span>
              <span
                v-if="props.sefazResult.tempoMedioResposta !== null"
                class="block text-xs opacity-80"
              >
                Tempo médio de resposta:
                <span class="tabular-nums">{{
                  props.sefazResult.tempoMedioResposta
                }}</span>
                ms
              </span>
            </span>
          </div>
        </div>

        <!-- Histórico do certificado (gated fiscal.settings.read) -->
        <div class="mt-4 border-t border-line-2 pt-4">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground"
            @click="historyOpen = !historyOpen"
          >
            <span class="inline-flex items-center gap-1.5">
              <Icon name="History" size="sm" class="text-muted-foreground" />
              Histórico do certificado
              <span
                v-if="props.certificateHistory.length"
                class="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground"
              >
                {{ props.certificateHistory.length }}
              </span>
            </span>
            <Icon
              :name="historyOpen ? 'ChevronUp' : 'ChevronDown'"
              size="sm"
              class="text-muted-foreground"
            />
          </button>

          <div v-if="historyOpen" class="mt-3">
            <p
              v-if="props.historyLoading"
              class="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Icon name="LoaderCircle" size="sm" class="animate-spin" />
              Carregando histórico…
            </p>
            <p
              v-else-if="props.certificateHistory.length === 0"
              class="text-sm text-muted-foreground"
            >
              Nenhum evento de certificado registrado.
            </p>
            <ul v-else class="space-y-2">
              <li
                v-for="(event, index) in props.certificateHistory"
                :key="`${event.createdAt.getTime()}-${index}`"
                class="rounded-lg border border-line-2 bg-background px-3 py-2 text-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="font-medium text-foreground">{{
                    event.tipo
                  }}</span>
                  <span
                    class="shrink-0 text-xs tabular-nums text-muted-foreground"
                  >
                    {{ formatDateTime(event.createdAt.toISOString()) }}
                  </span>
                </div>
                <p
                  v-if="event.titular"
                  class="mt-0.5 truncate text-muted-foreground"
                >
                  {{ event.titular }}
                </p>
                <p class="mt-0.5 text-xs text-muted-foreground">
                  Válido até
                  <span class="tabular-nums">{{
                    event.validoAte
                      ? formatDate(event.validoAte.toISOString())
                      : '—'
                  }}</span>
                </p>
              </li>
            </ul>
          </div>
        </div>
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
