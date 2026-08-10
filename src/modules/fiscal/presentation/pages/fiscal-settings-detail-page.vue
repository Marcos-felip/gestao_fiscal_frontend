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
} from '@/core/enums/fiscal-environment.enum'
import { establishmentTypeOptions } from '@/core/enums/establishment-type.enum'
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

const checklistOkCount = computed(() => {
  const items = controller.checklist.value?.itens ?? []
  return items.filter((i) => i.ok).length
})

const checklistTotalCount = computed(
  () => controller.checklist.value?.itens.length ?? 0,
)

async function onReleaseProduction(): Promise<void> {
  const current = editing.value
  if (!current) return
  const ok = await controller.releaseProduction(current.establishment.id)
  if (ok) {
    await controller.prepareById(establishmentId)
    void controller.loadChecklist(establishmentId)
  }
}

async function onRevokeProduction(): Promise<void> {
  const current = editing.value
  if (!current) return
  const ok = await controller.revokeProduction(current.establishment.id)
  if (ok) {
    await controller.prepareById(establishmentId)
    void controller.loadChecklist(establishmentId)
  }
}

async function onActivateEnvironment(ambiente: FiscalEnvironment): Promise<void> {
  const current = editing.value
  if (!current) return
  const ok = await controller.activateEnvironment(
    current.establishment.id,
    ambiente,
  )
  if (ok) {
    await controller.prepareById(establishmentId)
  }
}

async function onValidateConsulta(): Promise<void> {
  const current = editing.value
  if (!current) return
  await controller.validateConsulta(current.establishment.id)
}

const settingsHistoryOpen = ref(false)

function onToggleSettingsHistory(): void {
  settingsHistoryOpen.value = !settingsHistoryOpen.value
  if (settingsHistoryOpen.value && controller.settingsHistory.value.length === 0) {
    void controller.loadSettingsHistory(establishmentId)
  }
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
  if (found) {
    void controller.loadChecklist(establishmentId)
  }
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

        <!-- Seções 2 e 3: Certificado (2/3) + Comunicação SEFAZ (1/3) -->
        <motion.div
          :variants="item"
          class="grid items-start gap-6 lg:grid-cols-3"
        >
          <!-- Certificado digital A1 -->
          <FormSection
            class="lg:col-span-2"
            icon="ShieldCheck"
            title="Certificado digital A1"
            description="Certificado usado para assinar e transmitir a NFC-e."
          >
            <p
              v-if="controller.certificateLoading.value"
              class="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Icon name="LoaderCircle" size="sm" class="animate-spin" />
              Carregando situação do certificado…
            </p>

            <template v-else>
              <div class="grid gap-5 lg:grid-cols-2">
                <!-- Coluna: situação atual -->
                <div class="flex flex-col gap-3">
                  <template v-if="certificateView">
                    <dl
                      class="grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl border border-line-2 bg-muted/30 p-4 text-sm"
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

                    <div
                      v-if="certificateView.vencido"
                      class="flex items-start gap-2 rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-600"
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
                      class="flex items-start gap-2 rounded-lg bg-warning-500/10 px-4 py-3 text-sm text-warning-700"
                    >
                      <Icon
                        name="TriangleAlert"
                        size="sm"
                        class="mt-0.5 shrink-0"
                      />
                      <span>
                        Certificado vence em
                        {{ certificateView.diasParaVencer }}
                        {{
                          certificateView.diasParaVencer === 1 ? 'dia' : 'dias'
                        }}. Programe a substituição.
                      </span>
                    </div>
                  </template>

                  <div
                    v-else
                    class="flex h-full min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-3 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    <Icon name="ShieldOff" size="md" class="opacity-60" />
                    <span>Nenhum certificado configurado.</span>
                  </div>
                </div>

                <!-- Coluna: envio / substituição -->
                <div v-if="canEdit" class="space-y-3">
                  <p class="text-sm font-medium text-foreground">
                    {{ uploadLabel }}
                  </p>

                  <input
                    ref="fileInput"
                    type="file"
                    accept=".pfx,.p12"
                    class="hidden"
                    @change="onFileChange"
                  />
                  <button
                    type="button"
                    class="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-3 bg-muted/20 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
                    @click="fileInput?.click()"
                  >
                    <Icon name="Upload" size="md" class="text-muted-foreground" />
                    <span class="max-w-full truncate text-sm font-medium text-foreground">
                      {{ selectedFile ? selectedFile.name : 'Escolher arquivo' }}
                    </span>
                    <span class="text-xs text-muted-foreground">
                      .pfx ou .p12, até 512 KB
                    </span>
                  </button>
                  <p
                    v-if="fileError"
                    class="text-sm font-medium text-error-500"
                  >
                    {{ fileError }}
                  </p>

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
                    class="w-full"
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

                <!-- Somente leitura -->
                <div
                  v-else
                  class="flex items-start gap-2 rounded-xl border border-line-2 bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
                >
                  <Icon name="Lock" size="sm" class="mt-0.5 shrink-0" />
                  <span>
                    Você não tem permissão para alterar o certificado.
                  </span>
                </div>
              </div>

              <!-- Histórico (expansível, largura total) -->
              <div class="border-t border-line-2 pt-5">
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
                  <ul v-else class="grid gap-2 sm:grid-cols-2">
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

          <!-- Comunicação com a SEFAZ -->
          <FormSection
            icon="RadioTower"
            title="Comunicação com a SEFAZ"
            description="Disponibilidade do serviço via certificado e UF do estabelecimento."
          >
            <div class="space-y-4">
              <div
                v-if="controller.sefazResult.value"
                :class="[
                  'flex items-start gap-2 rounded-xl px-4 py-3 text-sm',
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
                    Tempo médio:
                    <span class="tabular-nums">
                      {{ controller.sefazResult.value.tempoMedioResposta }}
                    </span>
                    ms
                  </span>
                </span>
              </div>

              <div
                v-else
                class="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-3 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground"
              >
                <Icon name="RadioTower" size="md" class="opacity-60" />
                <span>Nenhum teste realizado ainda.</span>
                <span class="text-xs">
                  Confirme a resposta da SEFAZ antes de emitir.
                </span>
              </div>

              <Button
                variant="ghost"
                class="w-full"
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
          </FormSection>
        </motion.div>

        <!-- Seção: Produção -->
        <motion.div :variants="item">
          <FormSection
            icon="Rocket"
            title="Produção"
            description="Checklist de pré-requisitos, liberação e validação para emissão em produção."
          >
            <div class="space-y-5">
              <p
                v-if="controller.checklistLoading.value"
                class="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Icon name="LoaderCircle" size="sm" class="animate-spin" />
                Carregando checklist…
              </p>

              <template v-else-if="controller.checklist.value">
                <div
                  v-if="controller.checklist.value.liberada"
                  class="flex items-start gap-2 rounded-xl bg-success-500/10 px-4 py-3 text-sm text-success-600"
                >
                  <Icon name="BadgeCheck" size="sm" class="mt-0.5 shrink-0" />
                  <span>
                    Produção liberada
                    <span
                      v-if="controller.checklist.value.liberadaEm"
                      class="opacity-80"
                    >
                      em
                      {{
                        formatDate(controller.checklist.value.liberadaEm)
                      }}
                    </span>
                  </span>
                </div>

                <div
                  v-else
                  class="flex items-start gap-2 rounded-xl bg-warning-500/10 px-4 py-3 text-sm text-warning-700"
                >
                  <Icon name="CircleAlert" size="sm" class="mt-0.5 shrink-0" />
                  <span>
                    Produção bloqueada —
                    {{ checklistOkCount }}/{{ checklistTotalCount }} itens
                    concluídos.
                  </span>
                </div>

                <ul class="grid gap-2 sm:grid-cols-2">
                  <li
                    v-for="(checkItem, index) in controller.checklist.value
                      .itens"
                    :key="index"
                    :class="[
                      'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
                      checkItem.ok
                        ? 'border-success-500/20 bg-success-500/5 text-success-600'
                        : checkItem.bloqueante
                          ? 'border-error-500/20 bg-error-500/5 text-error-600'
                          : 'border-warning-500/20 bg-warning-500/5 text-warning-700',
                    ]"
                  >
                    <Icon
                      :name="checkItem.ok ? 'CircleCheck' : 'CircleX'"
                      size="sm"
                      class="mt-0.5 shrink-0"
                    />
                    <span class="min-w-0">
                      <span class="block font-medium">{{ checkItem.item }}</span>
                      <span
                        v-if="checkItem.detalhe"
                        class="block text-xs opacity-80"
                      >
                        {{ checkItem.detalhe }}
                      </span>
                    </span>
                  </li>
                </ul>

                <div class="flex flex-wrap gap-2 border-t border-line-2 pt-4">
                  <Button
                    v-if="!controller.checklist.value.liberada && canEdit"
                    variant="primary"
                    text-class="text-white"
                    :loading="controller.releasingProduction.value"
                    loading-text="Liberando…"
                    :disabled="checklistOkCount < checklistTotalCount"
                    @click="onReleaseProduction"
                  >
                    <template #icon
                      ><Icon name="Rocket" size="sm"
                    /></template>
                    Liberar produção
                  </Button>

                  <Button
                    v-if="controller.checklist.value.liberada && canEdit"
                    variant="ghost"
                    :loading="controller.revokingProduction.value"
                    loading-text="Revogando…"
                    @click="onRevokeProduction"
                  >
                    <template #icon><Icon name="Ban" size="sm" /></template>
                    Revogar produção
                  </Button>

                  <Button
                    v-if="canEdit"
                    variant="ghost"
                    :loading="controller.consultaValidating.value"
                    loading-text="Validando…"
                    @click="onValidateConsulta"
                  >
                    <template #icon
                      ><Icon name="Globe" size="sm"
                    /></template>
                    Validar consulta pública
                  </Button>

                  <Button
                    v-if="canEdit"
                    variant="ghost"
                    :loading="controller.activatingEnvironment.value"
                    loading-text="Ativando…"
                    @click="onActivateEnvironment(FiscalEnvironment.PRODUCAO)"
                  >
                    <template #icon
                      ><Icon name="BadgeCheck" size="sm"
                    /></template>
                    Ativar produção
                  </Button>
                </div>

                <div
                  v-if="controller.consultaResult.value"
                  :class="[
                    'flex items-start gap-2 rounded-xl px-4 py-3 text-sm',
                    controller.consultaResult.value.validada
                      ? 'bg-success-500/10 text-success-600'
                      : 'bg-error-500/10 text-error-600',
                  ]"
                >
                  <Icon
                    :name="
                      controller.consultaResult.value.validada
                        ? 'CircleCheck'
                        : 'CircleX'
                    "
                    size="sm"
                    class="mt-0.5 shrink-0"
                  />
                  <span class="min-w-0">
                    <span class="block font-medium">
                      {{
                        controller.consultaResult.value.validada
                          ? 'Consulta pública validada'
                          : 'Consulta pública não validada'
                      }}
                    </span>
                    <span class="block text-xs opacity-80">
                      Chave:
                      <span class="font-mono tabular-nums">
                        {{ controller.consultaResult.value.chaveAcesso }}
                      </span>
                    </span>
                    <span class="block">
                      {{ controller.consultaResult.value.situacao }}
                    </span>
                  </span>
                </div>
              </template>

              <div
                v-else
                class="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-3 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground"
              >
                <Icon name="Rocket" size="md" class="opacity-60" />
                <span>Checklist indisponível.</span>
              </div>
            </div>
          </FormSection>
        </motion.div>

        <!-- Seção: Histórico de configurações -->
        <motion.div :variants="item">
          <FormSection
            icon="History"
            title="Histórico de configurações"
            description="Registro de alterações nas configurações fiscais deste estabelecimento."
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground"
              @click="onToggleSettingsHistory"
            >
              <span class="inline-flex items-center gap-1.5">
                <Icon
                  name="History"
                  size="sm"
                  class="text-muted-foreground"
                />
                {{ settingsHistoryOpen ? 'Ocultar histórico' : 'Exibir histórico' }}
                <span
                  v-if="controller.settingsHistory.value.length"
                  class="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground"
                >
                  {{ controller.settingsHistory.value.length }}
                </span>
              </span>
              <Icon
                :name="settingsHistoryOpen ? 'ChevronUp' : 'ChevronDown'"
                size="sm"
                class="text-muted-foreground"
              />
            </button>

            <div v-if="settingsHistoryOpen" class="mt-3">
              <p
                v-if="controller.settingsHistoryLoading.value"
                class="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Icon name="LoaderCircle" size="sm" class="animate-spin" />
                Carregando histórico…
              </p>
              <p
                v-else-if="controller.settingsHistory.value.length === 0"
                class="text-sm text-muted-foreground"
              >
                Nenhuma alteração registrada.
              </p>
              <ul v-else class="grid gap-2 sm:grid-cols-2">
                <li
                  v-for="event in controller.settingsHistory.value"
                  :key="event.id"
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
                    v-if="event.valorAnterior || event.valorNovo"
                    class="mt-0.5 text-xs text-muted-foreground"
                  >
                    <span v-if="event.valorAnterior">
                      De: {{ event.valorAnterior }}
                    </span>
                    <span v-if="event.valorAnterior && event.valorNovo">
                      →
                    </span>
                    <span v-if="event.valorNovo">
                      Para: {{ event.valorNovo }}
                    </span>
                  </p>
                </li>
              </ul>
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
