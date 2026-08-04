<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { Icon, Skeleton } from '@/shared/ui'
import FiscalSettingsDialog from '@/modules/fiscal/presentation/components/fiscal-settings-dialog.vue'
import { makeFiscalSettingsController } from '@/modules/fiscal/factories/fiscal.factory'
import type { FiscalSettingsRow } from '@/modules/fiscal/presentation/controllers/fiscal-settings-controller'
import type { FiscalSettingsFormValues } from '@/modules/fiscal/presentation/schemas/fiscal-settings-schema'
import { CreateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/create-fiscal-settings-dto'
import { UpdateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/update-fiscal-settings-dto'
import { fiscalEnvironmentLabels } from '@/enums/fiscal-environment.enum'
import { usePermissions } from '@/shared/composables/usePermissions'
import { useProgress } from '@/shared/composables'

const controller = makeFiscalSettingsController()
const progress = useProgress()
const { can } = usePermissions()

const canEdit = computed(() => can('fiscal.settings.edit'))

const dialogOpen = ref(false)

onMounted(() => {
  progress.track(controller.load())
  controller.loadEngineHealth()
})

/** Trim que devolve `undefined` quando vazio (para não enviar campos em branco). */
function optional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

async function openRow(row: FiscalSettingsRow): Promise<void> {
  const ok = await progress.track(controller.prepare(row.establishment))
  if (!ok) return
  dialogOpen.value = true
  // Carrega certificado + histórico do estabelecimento em paralelo.
  controller.loadCertificate(row.establishment.id)
  controller.loadCertificateHistory(row.establishment.id)
}

async function onUploadCertificate(payload: {
  file: File
  senha: string
}): Promise<void> {
  const establishment = controller.editing.value?.establishment
  if (!establishment) return
  await controller.uploadCertificate(
    establishment.id,
    payload.file,
    payload.senha,
  )
}

async function onTestSefaz(): Promise<void> {
  const establishment = controller.editing.value?.establishment
  if (!establishment) return
  await controller.testSefaz(establishment.id)
}

async function onSubmit(values: FiscalSettingsFormValues): Promise<void> {
  const editing = controller.editing.value
  if (!editing) return

  const ok = editing.settings
    ? await controller.update(
        editing.establishment.id,
        new UpdateFiscalSettingsDto({
          ambiente: values.ambiente,
          serieNfce: Number(values.serieNfce),
          proximoNumeroNfce: Number(values.proximoNumeroNfce),
          codigoCsc: optional(values.codigoCsc),
          idCsc: optional(values.idCsc),
          ativo: values.ativo,
        }),
      )
    : await controller.create(
        new CreateFiscalSettingsDto({
          establishmentId: editing.establishment.id,
          ambiente: values.ambiente,
          serieNfce: Number(values.serieNfce),
          codigoCsc: optional(values.codigoCsc),
          idCsc: optional(values.idCsc),
          ativo: values.ativo,
        }),
      )

  if (ok) dialogOpen.value = false
}

/** Um estabelecimento está "completo" quando tem certificado + CSC + ID. */
function isComplete(row: FiscalSettingsRow): boolean {
  const s = row.settings
  return Boolean(s && s.hasCertificate && s.codigoCsc && s.idCsc)
}

interface Badge {
  label: string
  icon: string
  classes: string
}

/** Badge de status fiscal + validade do certificado por linha. */
function statusBadge(row: FiscalSettingsRow): Badge {
  const s = row.settings
  if (!s) {
    return {
      label: 'Sem configuração',
      icon: 'CircleDashed',
      classes: 'bg-muted text-muted-foreground',
    }
  }
  if (s.isCertificateExpired) {
    return {
      label: 'Certificado vencido',
      icon: 'TriangleAlert',
      classes: 'bg-error-500/10 text-error-600',
    }
  }
  if (s.isCertificateExpiring) {
    const days = s.certificateExpiresInDays ?? 0
    return {
      label: `Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`,
      icon: 'TriangleAlert',
      classes: 'bg-warning-500/10 text-warning-700',
    }
  }
  if (!s.hasCertificate) {
    return {
      label: 'Sem certificado',
      icon: 'ShieldOff',
      classes: 'bg-warning-500/10 text-warning-700',
    }
  }
  return {
    label: 'Configurado',
    icon: 'ShieldCheck',
    classes: 'bg-success-500/10 text-success-600',
  }
}

const dialogEstablishmentName = computed(
  () => controller.editing.value?.establishment.name ?? '',
)
const dialogSettings = computed(
  () => controller.editing.value?.settings ?? null,
)

/** Badge de saúde do motor fiscal exibido no topo da página. */
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

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
}
const rowItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
}
</script>

<template>
  <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1
        class="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        Configuração fiscal
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Ambiente, numeração da NFC-e, CSC e certificado digital de cada
        estabelecimento.
      </p>
    </div>

    <!-- Saúde do motor fiscal -->
    <span
      v-if="!controller.engineHealthLoading.value"
      :class="[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
        engineBadge.classes,
      ]"
      :title="controller.engineHealth.value?.mensagem ?? undefined"
    >
      <Icon :name="engineBadge.icon" size="sm" />
      {{ engineBadge.label }}
      <span v-if="engineBadge.latency !== null" class="tabular-nums opacity-80">
        · {{ engineBadge.latency }} ms
      </span>
    </span>
  </header>

  <!-- Aviso somente leitura -->
  <div
    v-if="controller.loaded.value && !canEdit"
    class="mb-4 flex items-start gap-2 rounded-lg border border-line-2 bg-muted/50 px-4 py-3 text-sm text-muted-foreground"
  >
    <Icon name="Lock" size="sm" class="mt-0.5 shrink-0" />
    <span>
      Você tem acesso apenas para visualizar. Peça a um administrador a
      permissão de edição para alterar a configuração fiscal.
    </span>
  </div>

  <!-- Erro -->
  <div
    v-if="controller.hasError"
    class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
  >
    {{ controller.errorMessage }}
  </div>

  <!-- Skeleton -->
  <div v-if="!controller.loaded.value" class="space-y-2">
    <Skeleton v-for="n in 4" :key="`sk-${n}`" class="h-20 w-full rounded-xl" />
  </div>

  <!-- Vazio -->
  <div
    v-else-if="controller.rows.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="Store" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhum estabelecimento
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Cadastre um estabelecimento para configurar a emissão fiscal.
    </p>
  </div>

  <!-- Lista de estabelecimentos -->
  <motion.div
    v-else
    class="overflow-hidden rounded-xl border border-line-2 bg-background"
    :variants="container"
    initial="hidden"
    animate="visible"
  >
    <motion.div
      v-for="row in controller.rows.value"
      :key="row.establishment.id"
      class="flex flex-wrap items-center gap-4 border-b border-line-2 px-4 py-3.5 last:border-b-0"
      :variants="rowItem"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
      >
        <Icon name="Store" size="sm" />
      </span>

      <!-- Estabelecimento -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="truncate font-medium text-foreground">
            {{ row.establishment.name }}
          </p>
          <span
            v-if="row.settings && !isComplete(row)"
            class="inline-flex items-center gap-1 rounded-full bg-warning-500/10 px-2 py-0.5 text-[11px] font-medium text-warning-700"
            title="Faltam dados para emitir (certificado e/ou CSC)"
          >
            <Icon name="CircleAlert" size="xs" />
            Incompleto
          </span>
          <span
            v-else-if="row.settings"
            class="inline-flex items-center gap-1 rounded-full bg-success-500/10 px-2 py-0.5 text-[11px] font-medium text-success-600"
            title="Certificado e CSC configurados"
          >
            <Icon name="CircleCheck" size="xs" />
            Completo
          </span>
        </div>
        <p class="mt-0.5 truncate text-sm text-muted-foreground">
          <template v-if="row.settings">
            {{ fiscalEnvironmentLabels[row.settings.ambiente] }} · Série
            <span class="tabular-nums">{{ row.settings.serieNfce }}</span>
            <span v-if="!row.settings.ativo"> · emissão inativa</span>
          </template>
          <template v-else> Emissão fiscal ainda não configurada </template>
        </p>
      </div>

      <!-- Badge de status -->
      <span
        :class="[
          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
          statusBadge(row).classes,
        ]"
      >
        <Icon :name="statusBadge(row).icon" size="sm" />
        {{ statusBadge(row).label }}
      </span>

      <!-- Ação -->
      <button
        v-if="canEdit"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-line-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        :disabled="controller.preparing.value"
        @click="openRow(row)"
      >
        <Icon :name="row.settings ? 'Pencil' : 'Settings'" size="sm" />
        {{ row.settings ? 'Editar' : 'Configurar' }}
      </button>
      <button
        v-else-if="row.settings"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-line-2 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        :disabled="controller.preparing.value"
        @click="openRow(row)"
      >
        <Icon name="Eye" size="sm" />
        Ver
      </button>
    </motion.div>
  </motion.div>

  <!-- Diálogo de configuração -->
  <FiscalSettingsDialog
    v-model="dialogOpen"
    :establishment-name="dialogEstablishmentName"
    :settings="dialogSettings"
    :readonly="!canEdit"
    :loading="controller.saving.value"
    :certificate="controller.certificate.value"
    :certificate-loading="controller.certificateLoading.value"
    :uploading="controller.uploading.value"
    :certificate-history="controller.certificateHistory.value"
    :history-loading="controller.historyLoading.value"
    :sefaz-result="controller.sefazResult.value"
    :sefaz-testing="controller.sefazTesting.value"
    @submit="onSubmit"
    @upload-certificate="onUploadCertificate"
    @test-sefaz="onTestSefaz"
  />
</template>
