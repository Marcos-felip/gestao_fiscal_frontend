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
import FiscalSettingsNav from '@/modules/fiscal/presentation/components/fiscal-settings-nav.vue'
import InutilizeNumberingDialog from '@/modules/fiscal/presentation/components/inutilize-numbering-dialog.vue'
import ReadOnlyNotice from '@/shared/components/permission/read-only-notice.vue'
import type { InutilizacaoPedido } from '@/modules/fiscal/presentation/controllers/inutilization-controller'
import {
  makeFiscalSettingsController,
  makeInutilizationController,
} from '@/modules/fiscal/factories/fiscal.factory'
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
import {
  FiscalDocumentModel,
  fiscalDocumentModelLabels,
  fiscalDocumentModelOptions,
} from '@/core/enums/fiscal-document-model.enum'
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
/** Inutilizar tem permissão própria: quem edita a série não queima numeração. */
const canInutilizar = computed(() => can('fiscal.inutilizar'))

const establishmentId = String(route.params.establishmentId)

const inutilizationController = makeInutilizationController()
const inutilizarOpen = ref(false)

async function onInutilizarConfirm(pedido: InutilizacaoPedido): Promise<void> {
  const ok = await inutilizationController.inutilize(pedido)
  if (ok) inutilizarOpen.value = false
}

/** Estado da própria página (independente do carregamento do controller). */
const ready = ref(false)
const notFound = ref(false)

// ──────────────────────────────────────────────
// Navegação por seção
// ──────────────────────────────────────────────

/**
 * Seção ativa, lida da URL.
 *
 * Cada assunto é um destino próprio: dá para mandar o link do certificado a
 * alguém sem mandar "role até o meio da página".
 */
const SECAO_PADRAO = 'visao-geral'
const secao = computed(() => String(route.params.secao || SECAO_PADRAO))

function goToSection(id: string): void {
  controller.router.push({
    name: routeNames.FISCAL_SETTINGS_DETAIL,
    params: { establishmentId: establishmentId, secao: id },
  })
}

/** Troca de estabelecimento sem sair da seção em que a pessoa está. */
function changeEstablishment(id: string): void {
  if (id === establishmentId) return
  controller.router.push({
    name: routeNames.FISCAL_SETTINGS_DETAIL,
    params: { establishmentId: id, secao: secao.value },
  })
}

const establishmentOptions = computed(() =>
  controller.establishments.value.map((e) => ({ value: e.id, label: e.name })),
)

/** Frase curta do estado de cada seção, para a visão geral. */
function sectionStatus(id: string): string {
  const s = settings.value

  if (!s && id !== 'sefaz') return 'Ainda não configurado'

  switch (id) {
    case 'numeracao':
      return `${fiscalEnvironmentLabels[s!.ambiente]} · NFC-e série ${s!.serieNfce}, próximo ${s!.proximoNumeroNfce} · NF-e série ${s!.serieNfe}, próximo ${s!.proximoNumeroNfe}`

    case 'certificado':
      if (!s!.hasCertificate) return 'Nenhum certificado enviado'
      if (s!.isCertificateExpired) return 'Vencido — a emissão vai falhar'
      return `Vence em ${s!.certificateExpiresInDays} dias`

    case 'csc':
      return semCsc.value
        ? 'Não informado — a NFC-e será rejeitada'
        : `ID ${s!.idCsc} configurado`

    case 'sefaz':
      return controller.engineHealth.value?.disponivel
        ? 'Motor fiscal online'
        : 'Motor fiscal indisponível'

    case 'producao':
      return controller.checklist.value?.liberada
        ? 'Liberada'
        : 'Bloqueada até o checklist ser concluído'

    default:
      return ''
  }
}

const semCsc = computed(
  () => !settings.value?.codigoCsc || !settings.value?.idCsc,
)

/**
 * Itens da coluna, com a pendência de cada um.
 *
 * A pendência sai daqui e não de dentro de cada seção porque a pergunta que
 * importa — "o que falta para emitir?" — se responde olhando a lista, sem
 * abrir uma por uma.
 */
const navItems = computed(() => {
  const s = settings.value

  const certificado: 'erro' | 'atencao' | null = !s?.hasCertificate
    ? 'erro'
    : s.isCertificateExpired
      ? 'erro'
      : s.isCertificateExpiring
        ? 'atencao'
        : null

  return [
    { id: 'visao-geral', label: 'Visão geral', icon: 'LayoutDashboard' },
    {
      id: 'numeracao',
      label: 'Ambiente e numeração',
      icon: 'ListOrdered',
      resumo: s ? fiscalEnvironmentLabels[s.ambiente] : null,
    },
    {
      id: 'certificado',
      label: 'Certificado digital',
      icon: 'ShieldCheck',
      pendencia: certificado,
      resumo:
        certificado === null && s?.certificateExpiresInDays !== null
          ? `${s?.certificateExpiresInDays}d`
          : null,
    },
    {
      id: 'csc',
      label: 'CSC (NFC-e)',
      icon: 'KeyRound',
      pendencia: semCsc.value ? ('erro' as const) : null,
    },
    { id: 'sefaz', label: 'Comunicação SEFAZ', icon: 'Server' },
    {
      id: 'producao',
      label: 'Produção',
      icon: 'Rocket',
      // A liberação vem do checklist, não da configuração: enquanto ele não
      // carregou, o item não finge saber e fica sem marca.
      pendencia: controller.checklist.value
        ? controller.checklist.value.liberada
          ? null
          : ('atencao' as const)
        : null,
    },
  ]
})

const editing = computed(() => controller.editing.value)
const settings = computed<FiscalSettings | null>(
  () => editing.value?.settings ?? null,
)
const isEdit = computed(() => Boolean(settings.value))

// --- Formulário de configuração ---
const form = reactive<FiscalSettingsFormValues>({
  ambiente: FiscalEnvironment.HOMOLOGACAO,
  modelosEmitidos: [FiscalDocumentModel.NFCE, FiscalDocumentModel.NFE],
  serieNfce: '1',
  proximoNumeroNfce: '1',
  serieNfe: '1',
  proximoNumeroNfe: '1',
  codigoCsc: '',
  idCsc: '',
  ativo: true,
})
const errors = ref<FiscalSettingsErrors>({})
const baseline = ref<FiscalSettingsFormValues>({ ...form })

function seedForm(value: FiscalSettings | null): void {
  if (value) {
    form.ambiente = value.ambiente
    form.modelosEmitidos = [...value.modelosEmitidos]
    form.serieNfce = String(value.serieNfce)
    form.proximoNumeroNfce = String(value.proximoNumeroNfce)
    form.serieNfe = String(value.serieNfe)
    form.proximoNumeroNfe = String(value.proximoNumeroNfe)
    form.codigoCsc = value.codigoCsc ?? ''
    form.idCsc = value.idCsc ?? ''
    form.ativo = value.ativo
  } else {
    form.ambiente = FiscalEnvironment.HOMOLOGACAO
    // Estabelecimento novo ainda não sabe o que vai emitir; marcar os dois é o
    // que não trava a liberação depois.
    form.modelosEmitidos = [FiscalDocumentModel.NFCE, FiscalDocumentModel.NFE]
    form.serieNfce = '1'
    form.proximoNumeroNfce = '1'
    form.serieNfe = '1'
    form.proximoNumeroNfe = '1'
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
  (Object.keys(form) as (keyof FiscalSettingsFormValues)[]).some((key) =>
    // `modelosEmitidos` é array: comparar por referência acusaria alteração a
    // cada re-semeadura do formulário.
    key === 'modelosEmitidos'
      ? form.modelosEmitidos.join(',') !==
        baseline.value.modelosEmitidos.join(',')
      : form[key] !== baseline.value[key],
  ),
)

/** Liga e desliga um modelo sem deixar a lista virar referência compartilhada. */
function toggleModel(modelo: FiscalDocumentModel): void {
  form.modelosEmitidos = form.modelosEmitidos.includes(modelo)
    ? form.modelosEmitidos.filter((m) => m !== modelo)
    : [...form.modelosEmitidos, modelo]
}

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
          modelosEmitidos: [...form.modelosEmitidos],
          serieNfce: Number(form.serieNfce),
          proximoNumeroNfce: Number(form.proximoNumeroNfce),
          serieNfe: Number(form.serieNfe),
          proximoNumeroNfe: Number(form.proximoNumeroNfe),
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

/**
 * Pendências que **impedem** a liberação.
 *
 * O botão olhava o total: bastava um item não bloqueante pendente — consulta
 * pública, que só se valida depois de liberar, ou produtos com cadastro fiscal
 * incompleto — para a liberação ficar impossível pela tela, embora o backend a
 * aceitasse. Quem decide o que trava é o `bloqueante` de cada item.
 */
const checklistBlockingPending = computed(
  () =>
    (controller.checklist.value?.itens ?? []).filter(
      (i) => !i.ok && i.bloqueante !== false,
    ).length,
)

/**
 * Checklist agrupado: primeiro o que vale para todos, depois um bloco por
 * modelo. Uma lista plana não responde "falta o quê, para qual nota?".
 */
/**
 * O item de produtos pendentes leva à lista de quais são.
 *
 * Dizer "4 produtos não emitem" e parar aí obrigava a caçar os quatro no
 * catálogo inteiro. O item é reconhecido pelo `codigo`, nunca pelo texto — a
 * frase existe para ser reescrita.
 */
function goToFiscalPending(): void {
  void controller.router.push({ name: routeNames.PRODUCTS_FISCAL_PENDING })
}

const checklistGroups = computed(() => {
  const itens = controller.checklist.value?.itens ?? []

  return {
    comuns: itens.filter((i) => !i.modelo),
    porModelo: fiscalDocumentModelOptions
      .map((opcao) => ({
        modelo: opcao.value,
        label: fiscalDocumentModelLabels[opcao.value],
        itens: itens.filter((i) => i.modelo === opcao.value),
      }))
      .filter((grupo) => grupo.itens.length > 0),
  }
})

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
    // As faixas perdidas são calculadas pelo servidor; carregar aqui é o que
    // permite oferecê-las em vez de deixar digitar a faixa.
    if (canInutilizar.value) {
      void inutilizationController.loadPending(establishmentId)
    }
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
        Voltar para a configuração fiscal
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

    <!-- Duas colunas: assuntos à esquerda, o assunto ativo à direita. -->
    <div class="flex flex-col gap-6 lg:flex-row">
      <FiscalSettingsNav
        :items="navItems"
        :active="secao"
        @select="goToSection"
      />

      <div class="min-w-0 flex-1">
        <!-- Estabelecimento: seletor, não uma tela de lista antes desta. -->
        <div
          v-if="establishmentOptions.length > 1"
          class="mb-5 flex flex-wrap items-center gap-3"
        >
          <Select
            :model-value="establishmentId"
            :options="establishmentOptions"
            class="w-full sm:w-80"
            @update:model-value="changeEstablishment(String($event))"
          >
            <template #label>Estabelecimento</template>
          </Select>
        </div>

        <form @submit.prevent="onSubmit">
      <motion.div
        class="space-y-6"
        :variants="container"
        initial="hidden"
        animate="visible"
      >
        <!--
          Visão geral: o que falta para emitir, em uma tela.

          É a pergunta que se faz ao abrir a configuração, e antes ela exigia
          ler quatro blocos empilhados para responder.
        -->
        <motion.div v-if="secao === 'visao-geral'" :variants="item">
          <FormSection
            icon="LayoutDashboard"
            title="Situação"
            :description="`Emissão fiscal de ${editing?.establishment.name ?? 'este estabelecimento'}.`"
          >
            <ul class="divide-y divide-line-2">
              <li
                v-for="linha in navItems.filter((i) => i.id !== 'visao-geral')"
                :key="linha.id"
                class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Icon
                  :name="
                    linha.pendencia === 'erro'
                      ? 'CircleAlert'
                      : linha.pendencia === 'atencao'
                        ? 'TriangleAlert'
                        : 'CircleCheck'
                  "
                  size="sm"
                  :class="
                    linha.pendencia === 'erro'
                      ? 'text-error-600'
                      : linha.pendencia === 'atencao'
                        ? 'text-warning-600'
                        : 'text-success-600'
                  "
                />

                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-medium text-foreground">
                    {{ linha.label }}
                  </span>
                  <span class="block text-xs text-muted-foreground">
                    {{ sectionStatus(linha.id) }}
                  </span>
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  @click="goToSection(linha.id)"
                >
                  Abrir
                </Button>
              </li>
            </ul>
          </FormSection>
        </motion.div>

        <!-- Ambiente e numeração -->
        <motion.div v-if="secao === 'numeracao'" :variants="item">
          <FormSection
            icon="ListOrdered"
            title="Ambiente e numeração"
            description="Onde a nota é emitida e de que número cada modelo continua."
          >
            <fieldset :disabled="!canEdit" class="space-y-5">
              <!-- Ambiente e liga/desliga: as duas decisões que valem para o
                   estabelecimento inteiro, antes das que são por modelo. -->
              <div class="grid grid-cols-1 items-start gap-5 sm:grid-cols-2">
                <Select
                  v-model="form.ambiente"
                  :options="fiscalEnvironmentOptions"
                  :error="errors.ambiente"
                  hint="Homologação para testes; Produção emite nota válida."
                >
                  <template #label>Ambiente</template>
                </Select>

                <div>
                  <span
                    class="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Emissão fiscal
                  </span>

                  <label
                    class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line-2 bg-muted/40 px-4 py-2.5"
                  >
                    <span
                      class="text-sm"
                      :class="
                        form.ativo
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      "
                    >
                      {{ form.ativo ? 'Ativa' : 'Bloqueada' }}
                    </span>
                    <Switch
                      v-model="form.ativo"
                      aria-label="Emissão fiscal ativa"
                    />
                  </label>

                  <span class="mt-1.5 block text-xs text-muted-foreground">
                    Desative para impedir a emissão neste estabelecimento.
                  </span>
                </div>
              </div>

              <!--
                Quais modelos este estabelecimento emite. Não é enfeite: é o
                que a liberação de produção usa para saber o que cobrar — CSC e
                consulta pública só valem para quem emite NFC-e.
              -->
              <div>
                <span class="mb-1.5 block text-sm font-medium text-foreground">
                  Modelos emitidos
                </span>

                <div class="flex flex-wrap gap-2">
                  <label
                    v-for="opcao in fiscalDocumentModelOptions"
                    :key="opcao.value"
                    class="flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors"
                    :class="
                      form.modelosEmitidos.includes(opcao.value)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-line-2 text-muted-foreground hover:bg-muted'
                    "
                  >
                    <input
                      type="checkbox"
                      class="sr-only"
                      :checked="form.modelosEmitidos.includes(opcao.value)"
                      @change="toggleModel(opcao.value)"
                    />
                    <Icon
                      :name="
                        form.modelosEmitidos.includes(opcao.value)
                          ? 'CheckCircle2'
                          : 'Circle'
                      "
                      size="sm"
                    />
                    {{ opcao.label }}
                  </label>
                </div>

                <span
                  v-if="errors.modelosEmitidos"
                  class="mt-1.5 block text-xs text-error-600"
                >
                  {{ errors.modelosEmitidos }}
                </span>
                <span v-else class="mt-1.5 block text-xs text-muted-foreground">
                  Define o que a liberação de produção vai exigir.
                </span>
              </div>

              <!--
                Um bloco por modelo. Cada um tem a sua sequência fiscal, e
                deixá-las lado a lado numa lista solta convidava a confundir de
                qual série era cada número.
              -->
              <fieldset
                class="rounded-xl border border-line-2 px-4 pt-3 pb-4"
              >
                <legend
                  class="px-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  NFC-e · modelo 65
                </legend>

                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    v-model="form.serieNfce"
                    inputmode="numeric"
                    maxlength="3"
                    placeholder="1"
                    :error="errors.serieNfce"
                    hint="Número inteiro de 1 a 999."
                  >
                    <template #label>Série</template>
                    <template #prefix><Icon name="Hash" size="sm" /></template>
                  </Input>

                  <!-- Só na edição: na criação o backend começa em 1. -->
                  <Input
                    v-if="isEdit"
                    v-model="form.proximoNumeroNfce"
                    inputmode="numeric"
                    maxlength="9"
                    placeholder="1"
                    :error="errors.proximoNumeroNfce"
                    hint="Próximo número que será usado ao emitir. Ajuste com cuidado."
                  >
                    <template #label>Próximo número</template>
                    <template #prefix
                      ><Icon name="ListOrdered" size="sm"
                    /></template>
                  </Input>
                </div>
              </fieldset>

              <fieldset
                class="rounded-xl border border-line-2 px-4 pt-3 pb-4"
              >
                <legend
                  class="px-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  NF-e · modelo 55
                </legend>

                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    v-model="form.serieNfe"
                    inputmode="numeric"
                    maxlength="3"
                    placeholder="1"
                    :error="errors.serieNfe"
                    hint="Número inteiro de 1 a 999."
                  >
                    <template #label>Série</template>
                    <template #prefix><Icon name="Hash" size="sm" /></template>
                  </Input>

                  <Input
                    v-if="isEdit"
                    v-model="form.proximoNumeroNfe"
                    inputmode="numeric"
                    maxlength="9"
                    placeholder="1"
                    :error="errors.proximoNumeroNfe"
                    hint="Próximo número que será usado ao emitir NF-e."
                  >
                    <template #label>Próximo número</template>
                    <template #prefix
                      ><Icon name="ListOrdered" size="sm"
                    /></template>
                  </Input>
                </div>
              </fieldset>
            </fieldset>
          </FormSection>
        </motion.div>
        
        <motion.div
          v-if="secao === 'numeracao' && isEdit && canInutilizar"
          :variants="item"
        >
          <FormSection
            icon="FileMinus"
            title="Inutilizar numeração"
            description="Regulariza números reservados que nunca viraram nota."
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0 max-w-prose">
                <p
                  v-if="inutilizationController.hasPending.value"
                  class="flex items-start gap-2 text-sm text-warning-700"
                >
                  <Icon
                    name="TriangleAlert"
                    size="sm"
                    class="mt-0.5 shrink-0"
                  />
                  <span>
                    Há numeração perdida neste estabelecimento — números
                    reservados que nunca viraram documento. O fisco espera que
                    essa faixa seja inutilizada.
                  </span>
                </p>
                <p v-else class="text-sm text-muted-foreground">
                  Nenhuma numeração perdida encontrada. A sequência das notas
                  está contínua.
                </p>

                <p class="mt-2 text-xs text-muted-foreground">
                  Inutilizar é irreversível: os números não voltam a ser usados.
                </p>
              </div>

              <Button
                variant="ghost"
                class="shrink-0 text-error-600 hover:bg-error-500/10"
                @click="inutilizarOpen = true"
              >
                <template #icon><Icon name="Ban" size="sm" /></template>
                Inutilizar numeração
              </Button>
            </div>
          </FormSection>
        </motion.div>

        <!-- CSC: só a NFC-e usa, e é a causa nº 1 de rejeição 464 -->
        <motion.div v-if="secao === 'csc'" :variants="item">
          <FormSection
            icon="KeyRound"
            title="CSC — Código de Segurança do Contribuinte"
            description="Par emitido pela SEFAZ da UF, usado no QR Code da NFC-e."
          >
            <fieldset :disabled="!canEdit" class="space-y-5">
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  v-model="form.idCsc"
                  maxlength="6"
                  placeholder="Ex.: 000001"
                  hint="Token numérico de até 6 dígitos, emitido junto com o código."
                  :error="errors.idCsc"
                >
                  <template #label>ID do CSC</template>
                  <template #prefix><Icon name="Key" size="sm" /></template>
                </Input>

                <Input
                  v-model="form.codigoCsc"
                  maxlength="64"
                  placeholder="Código de segurança do contribuinte"
                  hint="16 a 64 caracteres, obtidos no portal da SEFAZ da sua UF (credenciamento de NFC-e)."
                  :error="errors.codigoCsc"
                >
                  <template #label>Código CSC</template>
                  <template #prefix
                    ><Icon name="KeyRound" size="sm"
                  /></template>
                </Input>
              </div>
            </fieldset>
          </FormSection>
        </motion.div>

        <!-- Certificado digital A1 -->
        <motion.div v-if="secao === 'certificado'" :variants="item">
          <FormSection
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
        </motion.div>

        <!-- Comunicação com a SEFAZ -->
        <motion.div v-if="secao === 'sefaz'" :variants="item">
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

        <!-- Produção -->
        <motion.div v-if="secao === 'producao'" :variants="item">
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

                <!-- Itens que valem para qualquer modelo -->
                <ul class="grid gap-2 sm:grid-cols-2">
                  <li
                    v-for="(checkItem, index) in checklistGroups.comuns"
                    :key="`comum-${index}`"
                    :class="[
                      'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
                      checkItem.ok
                        ? 'border-success-500/20 bg-success-500/5 text-success-600'
                        : checkItem.bloqueante === false
                          ? 'border-warning-500/20 bg-warning-500/5 text-warning-700'
                          : 'border-error-500/20 bg-error-500/5 text-error-600',
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

                      <!-- Saber quantos faltam não basta: é preciso ver quais -->
                      <button
                        v-if="
                          checkItem.codigo === 'produtos_fiscais' &&
                          !checkItem.ok
                        "
                        type="button"
                        class="mt-1 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2 hover:opacity-80"
                        @click="goToFiscalPending"
                      >
                        Ver quais produtos
                        <Icon name="ArrowRight" size="xs" />
                      </button>
                    </span>
                  </li>
                </ul>

                <!--
                  Um bloco por modelo: a pergunta de quem vai liberar é
                  "falta o quê, para qual nota?".
                -->
                <div
                  v-for="grupo in checklistGroups.porModelo"
                  :key="grupo.modelo"
                >
                  <p
                    class="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    {{ grupo.label }}
                  </p>

                  <ul class="grid gap-2 sm:grid-cols-2">
                    <li
                      v-for="(checkItem, index) in grupo.itens"
                      :key="`${grupo.modelo}-${index}`"
                      :class="[
                        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
                        checkItem.ok
                          ? 'border-success-500/20 bg-success-500/5 text-success-600'
                          : checkItem.bloqueante === false
                            ? 'border-warning-500/20 bg-warning-500/5 text-warning-700'
                            : 'border-error-500/20 bg-error-500/5 text-error-600',
                      ]"
                    >
                      <Icon
                        :name="checkItem.ok ? 'CircleCheck' : 'CircleX'"
                        size="sm"
                        class="mt-0.5 shrink-0"
                      />
                      <span class="min-w-0">
                        <span class="block font-medium">
                          {{ checkItem.item }}
                        </span>
                        <span
                          v-if="checkItem.detalhe"
                          class="block text-xs opacity-80"
                        >
                          {{ checkItem.detalhe }}
                        </span>
                      </span>
                    </li>
                  </ul>
                </div>

                <div class="flex flex-wrap gap-2 border-t border-line-2 pt-4">
                  <Button
                    v-if="!controller.checklist.value.liberada && canEdit"
                    variant="primary"
                    text-class="text-white"
                    :loading="controller.releasingProduction.value"
                    loading-text="Liberando…"
                    :disabled="checklistBlockingPending > 0"
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

        <!-- Histórico: mora na visão geral, que é a tela de conferência -->
        <motion.div v-if="secao === 'visao-geral'" :variants="item">
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

      <!--
        Barra de ações só nas seções que editam o formulário. Certificado,
        SEFAZ e produção têm ações próprias, e um "Salvar" ali sugeriria que
        elas dependem dele.
      -->
          <FormActionBar
            v-if="canEdit && (secao === 'numeracao' || secao === 'csc')"
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
      </div>
    </div>

    <!-- Diálogo de inutilização -->
    <InutilizeNumberingDialog
      v-if="settings"
      v-model="inutilizarOpen"
      :loading="inutilizationController.submitting.value"
      :pending-ranges="inutilizationController.pendingRanges.value"
      :serie-nfce="settings.serieNfce"
      :serie-nfe="settings.serieNfe"
      :conflito="inutilizationController.conflito.value"
      @confirm="onInutilizarConfirm"
      @limpar-conflito="inutilizationController.limparConflito()"
    />
  </template>
</template>
