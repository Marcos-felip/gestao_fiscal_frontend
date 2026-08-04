<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { motion } from 'motion-v'
import {
  Button,
  Icon,
  Input,
  PasswordInput,
  Select,
  Skeleton,
  Switch,
} from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import FormActionBar from '@/shared/components/form/form-action-bar.vue'
import ReadOnlyNotice from '@/shared/components/permission/read-only-notice.vue'
import { makeFiscalSettingsController } from '@/modules/fiscal/factories/fiscal.factory'
import {
  validateFiscalSettings,
  type FiscalSettingsErrors,
  type FiscalSettingsFormValues,
} from '@/modules/fiscal/presentation/schemas/fiscal-settings-schema'
import { CreateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/create-fiscal-settings-dto'
import { UpdateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/update-fiscal-settings-dto'
import type { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
import {
  FiscalEnvironment,
  fiscalEnvironmentLabels,
  fiscalEnvironmentOptions,
} from '@/enums/fiscal-environment.enum'
import { establishmentTypeOptions } from '@/enums/establishment-type.enum'
import { usePermissions } from '@/shared/composables/usePermissions'
import { useProgress } from '@/shared/composables'
import { formatDate, formatDateTime } from '@/core/utils/date'
import { routeNames } from '@/router/route-names'

const controller = makeFiscalSettingsController()
const route = useRoute()
const progress = useProgress()
const { can } = usePermissions()

const canEdit = computed(() => can('fiscal.settings.edit'))

const establishmentId = String(route.params.establishmentId)

/** Estado da própria página (independente do carregamento do controller). */
const ready = ref(false)
const notFound = ref(false)

const editing = computed(() => controller.editing.value)
const settings = computed<FiscalSettings | null>(
  () => editing.value?.settings ?? null,
)
const isEdit = computed(() => Boolean(settings.value))

// --- Formulário de configuração ---
const form = reactive<FiscalSettingsFormValues>({
  ambiente: FiscalEnvironment.HOMOLOGACAO,
  serieNfce: '1',
  proximoNumeroNfce: '1',
  codigoCsc: '',
  idCsc: '',
  ativo: true,
})
const errors = ref<FiscalSettingsErrors>({})
const baseline = ref<FiscalSettingsFormValues>({ ...form })

function seedForm(value: FiscalSettings | null): void {
  if (value) {
    form.ambiente = value.ambiente
    form.serieNfce = String(value.serieNfce)
    form.proximoNumeroNfce = String(value.proximoNumeroNfce)
    form.codigoCsc = value.codigoCsc ?? ''
    form.idCsc = value.idCsc ?? ''
    form.ativo = value.ativo
  } else {
    form.ambiente = FiscalEnvironment.HOMOLOGACAO
    form.serieNfce = '1'
    form.proximoNumeroNfce = '1'
    form.codigoCsc = ''
    form.idCsc = ''
    form.ativo = true
  }
  baseline.value = { ...form }
  errors.value = {}
}

// Sempre que a configuração carregada mudar (carga inicial ou após salvar),
// re-semeia o formulário e o estado base para comparação de alterações.
watch(settings, (value) => seedForm(value))

const isDirty = computed(() =>
  (Object.keys(form) as (keyof FiscalSettingsFormValues)[]).some(
    (key) => form[key] !== baseline.value[key],
  ),
)

/** Trim que devolve `undefined` quando vazio (não envia campos em branco). */
function optional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

async function onSubmit(): Promise<void> {
  if (!canEdit.value) return
  const current = editing.value
  if (!current) return

  const result = validateFiscalSettings({ ...form }, isEdit.value)
  errors.value = result.errors
  if (!result.ok) return

  const saved = isEdit.value
    ? await controller.update(
        current.establishment.id,
        new UpdateFiscalSettingsDto({
          ambiente: form.ambiente,
          serieNfce: Number(form.serieNfce),
          proximoNumeroNfce: Number(form.proximoNumeroNfce),
          codigoCsc: optional(form.codigoCsc),
          idCsc: optional(form.idCsc),
          ativo: form.ativo,
        }),
      )
    : await controller.create(
        new CreateFiscalSettingsDto({
          establishmentId: current.establishment.id,
          ambiente: form.ambiente,
          serieNfce: Number(form.serieNfce),
          codigoCsc: optional(form.codigoCsc),
          idCsc: optional(form.idCsc),
          ativo: form.ativo,
        }),
      )

  // Recarrega a configuração fresca do backend (numeração, modo edição, etc.).
  if (saved) await controller.prepareById(establishmentId)
}

function discard(): void {
  seedForm(settings.value)
}

// --- Certificado digital A1 (upload) ---
const MAX_CERT_BYTES = 512 * 1024
const ALLOWED_EXT = ['.pfx', '.p12']

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const certSenha = ref('')
const fileError = ref('')
const senhaError = ref('')
const historyOpen = ref(false)

const hasCertificate = computed(() =>
  Boolean(controller.certificate.value?.configurado),
)
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

// Ao concluir um upload (uploading: true -> false), limpa o formulário.
watch(
  () => controller.uploading.value,
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

async function submitCertificate(): Promise<void> {
  if (!canEdit.value) return
  const current = editing.value
  if (!current) return
  const file = selectedFile.value
  fileError.value = file ? '' : 'Selecione o arquivo do certificado.'
  senhaError.value = certSenha.value.trim()
    ? ''
    : 'Informe a senha do certificado.'
  if (!file || !certSenha.value.trim()) return
  await controller.uploadCertificate(
    current.establishment.id,
    file,
    certSenha.value,
  )
}

async function onTestSefaz(): Promise<void> {
  const current = editing.value
  if (!current) return
  await controller.testSefaz(current.establishment.id)
}

const certificateView = computed(() => {
  const cert = controller.certificate.value
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

// --- Cabeçalho (nome, tipo, badges) ---
const establishmentName = computed(
  () => editing.value?.establishment.name ?? '',
)

const establishmentTypeLabel = computed(() => {
  const type = editing.value?.establishment.type
  if (!type) return ''
  return establishmentTypeOptions.find((o) => o.value === type)?.label ?? type
})

/** Ambiente configurado (badge). `null` enquanto não há configuração salva. */
const ambienteBadge = computed(() => {
  const value = settings.value
  if (!value) return null
  return {
    label: fiscalEnvironmentLabels[value.ambiente],
    isProducao: value.ambiente === FiscalEnvironment.PRODUCAO,
  }
})

/** Configuração completa = certificado + CSC + idCSC (ambiente é obrigatório). */
const isComplete = computed(() => {
  const value = settings.value
  return Boolean(
    value && value.hasCertificate && value.codigoCsc && value.idCsc,
  )
})

/** Badge de saúde do motor fiscal (mesma regra da listagem). */
const engineBadge = computed(() => {
  const health = controller.engineHealth.value
  if (!health) {
    return {
      label: 'Motor fiscal: indisponível',
      icon: 'ServerOff',
      classes: 'bg-error-500/10 text-error-600',
      latency: null as number | null,
    }
  }
  return health.disponivel
    ? {
        label: 'Motor fiscal: online',
        icon: 'Server',
        classes: 'bg-success-500/10 text-success-600',
        latency: health.latenciaMs,
      }
    : {
        label: 'Motor fiscal: offline',
        icon: 'ServerOff',
        classes: 'bg-error-500/10 text-error-600',
        latency: health.latenciaMs,
      }
})

function goBack(): void {
  controller.router.push({ name: routeNames.FISCAL_SETTINGS })
}

onMounted(async () => {
  await progress.track(controller.load())
  controller.loadEngineHealth()
  const found = await controller.prepareById(establishmentId)
  notFound.value = !found
  ready.value = true
})

// Entrada em cascata das seções.
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 30 },
  },
}
</script>

<template>
  <!-- Cabeçalho -->
  <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-0">
      <div class="flex items-center gap-3">
        <span
          class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <Icon name="Store" size="md" />
        </span>
        <div class="min-w-0">
          <h1
            class="font-display truncate text-2xl font-bold tracking-tight text-foreground"
          >
            {{ ready && !notFound ? establishmentName : 'Configuração fiscal' }}
          </h1>
          <p
            v-if="ready && !notFound && establishmentTypeLabel"
            class="mt-0.5 text-sm text-muted-foreground"
          >
            {{ establishmentTypeLabel }}
          </p>
        </div>
      </div>

      <!-- Badges de status -->
      <div
        v-if="ready && !notFound"
        class="mt-3 flex flex-wrap items-center gap-2"
      >
        <span
          v-if="ambienteBadge"
          :class="[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            ambienteBadge.isProducao
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground',
          ]"
        >
          <Icon
            :name="ambienteBadge.isProducao ? 'BadgeCheck' : 'FlaskConical'"
            size="sm"
          />
          {{ ambienteBadge.label }}
        </span>

        <span
          v-if="settings"
          :class="[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            isComplete
              ? 'bg-success-500/10 text-success-600'
              : 'bg-warning-500/10 text-warning-700',
          ]"
        >
          <Icon :name="isComplete ? 'CircleCheck' : 'CircleAlert'" size="sm" />
          {{ isComplete ? 'Configuração completa' : 'Configuração incompleta' }}
        </span>

        <span
          v-if="!controller.engineHealthLoading.value"
          :class="[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            engineBadge.classes,
          ]"
          :title="controller.engineHealth.value?.mensagem ?? undefined"
        >
          <Icon :name="engineBadge.icon" size="sm" />
          {{ engineBadge.label }}
          <span
            v-if="engineBadge.latency !== null"
            class="tabular-nums opacity-80"
          >
            · {{ engineBadge.latency }} ms
          </span>
        </span>
      </div>
    </div>

    <Button variant="ghost" @click="goBack">
      <template #icon><Icon name="ArrowLeft" size="sm" /></template>
      Voltar
    </Button>
  </header>

  <!-- Skeleton -->
  <div v-if="!ready" class="space-y-6">
    <div
      v-for="n in 3"
      :key="`sk-section-${n}`"
      class="rounded-xl border border-line-2 bg-background p-6"
    >
      <div class="flex items-center gap-3">
        <Skeleton class="size-11 rounded-xl" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-48 rounded" />
          <Skeleton class="h-3 w-64 rounded" />
        </div>
      </div>
      <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Skeleton class="h-11 w-full rounded-lg" />
        <Skeleton class="h-11 w-full rounded-lg" />
      </div>
    </div>
  </div>

  <!-- Não encontrado -->
  <div
    v-else-if="notFound"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="SearchX" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Estabelecimento não encontrado
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Este estabelecimento não existe ou não está mais disponível.
    </p>
    <div class="mt-6">
      <Button variant="ghost" @click="goBack">
        <template #icon><Icon name="ArrowLeft" size="sm" /></template>
        Voltar para a lista
      </Button>
    </div>
  </div>

  <!-- Conteúdo -->
  <template v-else>
    <ReadOnlyNotice v-if="!canEdit" />

    <div
      v-if="controller.hasError"
      class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ controller.errorMessage }}
    </div>

    <form @submit.prevent="onSubmit">
      <motion.div
        class="space-y-6"
        :variants="container"
        initial="hidden"
        animate="visible"
      >
        <!-- Seção 1: Configuração da NFC-e -->
        <motion.div :variants="item">
          <FormSection
            icon="ScrollText"
            title="Configuração da NFC-e"
            description="Ambiente, numeração e código de segurança do contribuinte."
          >
            <fieldset :disabled="!canEdit" class="space-y-5">
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                <template #prefix
                  ><Icon name="ListOrdered" size="sm"
                /></template>
              </Input>

              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                  <template #prefix
                    ><Icon name="KeyRound" size="sm"
                  /></template>
                </Input>
              </div>

              <label
                class="flex items-center justify-between gap-4 rounded-xl border border-line-2 bg-muted/40 px-4 py-3"
              >
                <span class="min-w-0">
                  <span class="block text-sm font-medium text-foreground">
                    Emissão fiscal ativa
                  </span>
                  <span class="block text-xs text-muted-foreground">
                    Desative para impedir a emissão de NFC-e neste
                    estabelecimento.
                  </span>
                </span>
                <Switch
                  v-model="form.ativo"
                  aria-label="Emissão fiscal ativa"
                />
              </label>
            </fieldset>
          </FormSection>
        </motion.div>

        <!-- Seção 2: Certificado digital A1 -->
        <motion.div :variants="item">
          <FormSection
            icon="ShieldCheck"
            title="Certificado digital A1"
            description="Certificado usado para assinar e transmitir a NFC-e."
          >
            <!-- Carregando status -->
            <p
              v-if="controller.certificateLoading.value"
              class="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Icon name="LoaderCircle" size="sm" class="animate-spin" />
              Carregando situação do certificado…
            </p>

            <template v-else>
              <!-- Status atual -->
              <template v-if="certificateView">
                <dl
                  class="grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl border border-line-2 bg-muted/30 p-4 text-sm sm:grid-cols-2"
                >
                  <div class="flex justify-between gap-4">
                    <dt class="text-muted-foreground">Situação</dt>
                    <dd class="font-medium text-success-600">Configurado</dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-muted-foreground">Válido até</dt>
                    <dd class="text-right tabular-nums text-foreground">
                      {{ certificateView.validade }}
                    </dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="shrink-0 text-muted-foreground">Titular</dt>
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
                </dl>

                <!-- Alerta de vencimento -->
                <div
                  v-if="certificateView.vencido"
                  class="mt-3 flex items-start gap-2 rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-600"
                >
                  <Icon
                    name="TriangleAlert"
                    size="sm"
                    class="mt-0.5 shrink-0"
                  />
                  <span>
                    Certificado vencido. A emissão de NFC-e falhará até a
                    substituição.
                  </span>
                </div>
                <div
                  v-else-if="certificateView.isExpiring"
                  class="mt-3 flex items-start gap-2 rounded-lg bg-warning-500/10 px-4 py-3 text-sm text-warning-700"
                >
                  <Icon
                    name="TriangleAlert"
                    size="sm"
                    class="mt-0.5 shrink-0"
                  />
                  <span>
                    Certificado vence em
                    {{ certificateView.diasParaVencer }}
                    {{ certificateView.diasParaVencer === 1 ? 'dia' : 'dias' }}.
                    Programe a substituição.
                  </span>
                </div>
              </template>

              <!-- Sem certificado -->
              <div
                v-else
                class="flex items-start gap-2 rounded-lg border border-line-2 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
              >
                <Icon name="ShieldOff" size="sm" class="mt-0.5 shrink-0" />
                <span>
                  Nenhum certificado configurado para este estabelecimento.
                </span>
              </div>

              <!-- Upload (gated fiscal.settings.edit) -->
              <div
                v-if="canEdit"
                class="mt-5 space-y-3 border-t border-line-2 pt-5"
              >
                <p class="text-sm font-medium text-foreground">
                  {{ uploadLabel }}
                </p>

                <div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".pfx,.p12"
                    class="hidden"
                    @change="onFileChange"
                  />
                  <div class="flex flex-wrap items-center gap-3">
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

                <div class="grid grid-cols-1 gap-3 sm:max-w-md">
                  <PasswordInput
                    v-model="certSenha"
                    autocomplete="new-password"
                    placeholder="Senha do certificado"
                    :error="senhaError"
                  >
                    <template #label>Senha do certificado</template>
                  </PasswordInput>
                </div>

                <Button
                  variant="primary"
                  text-class="text-white"
                  :loading="controller.uploading.value"
                  loading-text="Enviando…"
                  @click="submitCertificate"
                >
                  <template #icon>
                    <Icon name="ShieldCheck" size="sm" />
                  </template>
                  {{ uploadLabel }}
                </Button>
              </div>

              <!-- Histórico (expansível) -->
              <div class="mt-5 border-t border-line-2 pt-5">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground"
                  @click="historyOpen = !historyOpen"
                >
                  <span class="inline-flex items-center gap-1.5">
                    <Icon
                      name="History"
                      size="sm"
                      class="text-muted-foreground"
                    />
                    Histórico do certificado
                    <span
                      v-if="controller.certificateHistory.value.length"
                      class="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground"
                    >
                      {{ controller.certificateHistory.value.length }}
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
                    v-if="controller.historyLoading.value"
                    class="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Icon name="LoaderCircle" size="sm" class="animate-spin" />
                    Carregando histórico…
                  </p>
                  <p
                    v-else-if="controller.certificateHistory.value.length === 0"
                    class="text-sm text-muted-foreground"
                  >
                    Nenhum evento de certificado registrado.
                  </p>
                  <ul v-else class="space-y-2">
                    <li
                      v-for="(event, index) in controller.certificateHistory
                        .value"
                      :key="`${event.createdAt.getTime()}-${index}`"
                      class="rounded-lg border border-line-2 bg-background px-3 py-2 text-sm"
                    >
                      <div class="flex items-center justify-between gap-3">
                        <span class="font-medium text-foreground">
                          {{ event.tipo }}
                        </span>
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
                        <span class="tabular-nums">
                          {{
                            event.validoAte
                              ? formatDate(event.validoAte.toISOString())
                              : '—'
                          }}
                        </span>
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </template>
          </FormSection>
        </motion.div>

        <!-- Seção 3: Comunicação com a SEFAZ -->
        <motion.div :variants="item">
          <FormSection
            icon="RadioTower"
            title="Comunicação com a SEFAZ"
            description="Testa a disponibilidade do serviço usando o certificado e a UF deste estabelecimento."
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm text-muted-foreground">
                Verifique se a SEFAZ está respondendo antes de emitir.
              </p>
              <Button
                variant="ghost"
                :loading="controller.sefazTesting.value"
                loading-text="Testando…"
                @click="onTestSefaz"
              >
                <template #icon>
                  <Icon name="RadioTower" size="sm" />
                </template>
                Testar comunicação
              </Button>
            </div>

            <div
              v-if="controller.sefazResult.value"
              :class="[
                'mt-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm',
                controller.sefazResult.value.disponivel
                  ? 'bg-success-500/10 text-success-600'
                  : 'bg-error-500/10 text-error-600',
              ]"
            >
              <Icon
                :name="
                  controller.sefazResult.value.disponivel
                    ? 'CircleCheck'
                    : 'CircleX'
                "
                size="sm"
                class="mt-0.5 shrink-0"
              />
              <span class="min-w-0">
                <span class="block font-medium">
                  {{
                    controller.sefazResult.value.disponivel
                      ? 'SEFAZ disponível'
                      : 'SEFAZ indisponível'
                  }}
                </span>
                <span
                  v-if="controller.sefazResult.value.mensagem"
                  class="block"
                >
                  {{ controller.sefazResult.value.mensagem }}
                </span>
                <span
                  v-if="
                    controller.sefazResult.value.tempoMedioResposta !== null
                  "
                  class="block text-xs opacity-80"
                >
                  Tempo médio de resposta:
                  <span class="tabular-nums">
                    {{ controller.sefazResult.value.tempoMedioResposta }}
                  </span>
                  ms
                </span>
              </span>
            </div>
          </FormSection>
        </motion.div>
      </motion.div>

      <!-- Barra de ações (salvar) — gated fiscal.settings.edit -->
      <FormActionBar
        v-if="canEdit"
        :submit-label="
          isEdit ? 'Salvar alterações' : 'Configurar estabelecimento'
        "
        secondary-label="Descartar"
        :show-status="isEdit"
        :dirty="isDirty"
        :loading="controller.saving.value"
        @secondary="discard"
      />
    </form>
  </template>
</template>
