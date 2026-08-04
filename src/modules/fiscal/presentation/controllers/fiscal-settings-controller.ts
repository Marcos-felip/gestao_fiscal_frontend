import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ListFiscalSettingsUseCase } from '@/modules/fiscal/application/use-cases/list-fiscal-settings.use-case'
import type { GetFiscalSettingsByEstablishmentUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-settings-by-establishment.use-case'
import type { CreateFiscalSettingsUseCase } from '@/modules/fiscal/application/use-cases/create-fiscal-settings.use-case'
import type { UpdateFiscalSettingsUseCase } from '@/modules/fiscal/application/use-cases/update-fiscal-settings.use-case'
import type { UploadFiscalCertificate } from '@/modules/fiscal/application/use-cases/upload-fiscal-certificate.use-case'
import type { GetFiscalCertificate } from '@/modules/fiscal/application/use-cases/get-fiscal-certificate.use-case'
import type { GetFiscalCertificateHistory } from '@/modules/fiscal/application/use-cases/get-fiscal-certificate-history.use-case'
import type { TestSefazStatus } from '@/modules/fiscal/application/use-cases/test-sefaz-status.use-case'
import type { GetFiscalEngineHealth } from '@/modules/fiscal/application/use-cases/get-fiscal-engine-health.use-case'
import type { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
import type { CertificateStatus } from '@/modules/fiscal/domain/entities/certificate-status.entity'
import type { FiscalCertificateEvent } from '@/modules/fiscal/domain/entities/fiscal-certificate-event.entity'
import type { StatusServicoResult } from '@/modules/fiscal/domain/responses/status-servico-result'
import type { FiscalEngineHealth } from '@/modules/fiscal/domain/responses/fiscal-engine-health'
import type { CreateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/create-fiscal-settings-dto'
import type { UpdateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/update-fiscal-settings-dto'
import { useToast } from '@/shared/composables'

/** Estabelecimento simplificado usado nas linhas da tela de configuração. */
export interface FiscalEstablishmentOption {
  id: string
  name: string
  type: string
}

/** Fornece os estabelecimentos (injetado pela factory — cruzamento de módulo). */
export type FiscalEstablishmentsLoader = () => Promise<
  Either<DomainError, FiscalEstablishmentOption[]>
>

/** Linha da tela: um estabelecimento e sua configuração fiscal (ou `null`). */
export interface FiscalSettingsRow {
  establishment: FiscalEstablishmentOption
  settings: FiscalSettings | null
}

/** Estabelecimento em edição/visualização no diálogo. */
export interface FiscalSettingsEditing {
  establishment: FiscalEstablishmentOption
  settings: FiscalSettings | null
}

export class FiscalSettingsController extends BaseController {
  private readonly listUseCase: ListFiscalSettingsUseCase
  private readonly getByEstablishmentUseCase: GetFiscalSettingsByEstablishmentUseCase
  private readonly createUseCase: CreateFiscalSettingsUseCase
  private readonly updateUseCase: UpdateFiscalSettingsUseCase
  private readonly uploadCertificateUseCase: UploadFiscalCertificate
  private readonly getCertificateUseCase: GetFiscalCertificate
  private readonly getCertificateHistoryUseCase: GetFiscalCertificateHistory
  private readonly testSefazUseCase: TestSefazStatus
  private readonly getEngineHealthUseCase: GetFiscalEngineHealth
  private readonly loadEstablishments: FiscalEstablishmentsLoader
  private readonly toast = useToast()

  readonly settings = ref<FiscalSettings[]>([])
  readonly establishments = ref<FiscalEstablishmentOption[]>([])
  readonly loaded = ref(false)
  readonly preparing = ref(false)
  readonly saving = ref(false)
  readonly editing = ref<FiscalSettingsEditing | null>(null)

  // --- Certificado A1 (por estabelecimento, no diálogo) ---
  readonly certificate = ref<CertificateStatus | null>(null)
  readonly certificateLoading = ref(false)
  readonly uploading = ref(false)
  readonly certificateHistory = ref<FiscalCertificateEvent[]>([])
  readonly historyLoading = ref(false)

  // --- Teste SEFAZ (por estabelecimento, no diálogo) ---
  readonly sefazResult = ref<StatusServicoResult | null>(null)
  readonly sefazTesting = ref(false)

  // --- Saúde do motor fiscal (topo da página) ---
  readonly engineHealth = ref<FiscalEngineHealth | null>(null)
  readonly engineHealthLoading = ref(false)

  /** Estabelecimentos com sua configuração fiscal correspondente (ou `null`). */
  readonly rows = computed<FiscalSettingsRow[]>(() =>
    this.establishments.value.map((establishment) => ({
      establishment,
      settings:
        this.settings.value.find(
          (item) => item.establishmentId === establishment.id,
        ) ?? null,
    })),
  )

  constructor(
    listUseCase: ListFiscalSettingsUseCase,
    getByEstablishmentUseCase: GetFiscalSettingsByEstablishmentUseCase,
    createUseCase: CreateFiscalSettingsUseCase,
    updateUseCase: UpdateFiscalSettingsUseCase,
    uploadCertificateUseCase: UploadFiscalCertificate,
    getCertificateUseCase: GetFiscalCertificate,
    getCertificateHistoryUseCase: GetFiscalCertificateHistory,
    testSefazUseCase: TestSefazStatus,
    getEngineHealthUseCase: GetFiscalEngineHealth,
    loadEstablishments: FiscalEstablishmentsLoader,
  ) {
    super()
    this.listUseCase = listUseCase
    this.getByEstablishmentUseCase = getByEstablishmentUseCase
    this.createUseCase = createUseCase
    this.updateUseCase = updateUseCase
    this.uploadCertificateUseCase = uploadCertificateUseCase
    this.getCertificateUseCase = getCertificateUseCase
    this.getCertificateHistoryUseCase = getCertificateHistoryUseCase
    this.testSefazUseCase = testSefazUseCase
    this.getEngineHealthUseCase = getEngineHealthUseCase
    this.loadEstablishments = loadEstablishments
  }

  async load(): Promise<void> {
    this.setLoading(true)
    const [settingsResult, establishmentsResult] = await Promise.all([
      this.listUseCase.execute(),
      this.loadEstablishments(),
    ])
    this.handleResult(settingsResult, (items) => {
      this.settings.value = items
    })
    establishmentsResult.fold(
      () => {
        this.establishments.value = []
      },
      (items) => {
        this.establishments.value = items
      },
    )
    this.loaded.value = true
    this.setLoading(false)
  }

  /**
   * Carrega a configuração fresca do estabelecimento (`null` = ainda não
   * configurado) e prepara o diálogo. Retorna `true` quando pronto para abrir.
   */
  async prepare(establishment: FiscalEstablishmentOption): Promise<boolean> {
    this.preparing.value = true
    // Estado do certificado/SEFAZ é por estabelecimento — limpa ao trocar.
    this.certificate.value = null
    this.certificateHistory.value = []
    this.sefazResult.value = null
    let ok = false
    const result = await this.getByEstablishmentUseCase.execute(
      establishment.id,
    )
    this.handleResult(
      result,
      (settings) => {
        this.editing.value = { establishment, settings }
        ok = true
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível carregar a configuração fiscal.',
        )
      },
    )
    this.preparing.value = false
    return ok
  }

  async create(dto: CreateFiscalSettingsDto): Promise<boolean> {
    this.saving.value = true
    let ok = false
    const result = await this.createUseCase.execute(dto)
    this.handleResult(
      result,
      (saved) => {
        ok = true
        this.upsertSettings(saved)
        this.toast.success('Configuração fiscal criada.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível salvar a configuração fiscal.',
        )
      },
    )
    this.saving.value = false
    return ok
  }

  async update(
    establishmentId: string,
    dto: UpdateFiscalSettingsDto,
  ): Promise<boolean> {
    this.saving.value = true
    let ok = false
    const result = await this.updateUseCase.execute(establishmentId, dto)
    this.handleResult(
      result,
      (saved) => {
        ok = true
        this.upsertSettings(saved)
        this.toast.success('Configuração fiscal atualizada.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível salvar a configuração fiscal.',
        )
      },
    )
    this.saving.value = false
    return ok
  }

  private upsertSettings(saved: FiscalSettings): void {
    const exists = this.settings.value.some(
      (item) => item.establishmentId === saved.establishmentId,
    )
    this.settings.value = exists
      ? this.settings.value.map((item) =>
          item.establishmentId === saved.establishmentId ? saved : item,
        )
      : [...this.settings.value, saved]
  }

  // --- Saúde do motor fiscal ---

  /** Carrega o indicador de saúde do motor (badge no topo da página). */
  async loadEngineHealth(): Promise<void> {
    this.engineHealthLoading.value = true
    const result = await this.getEngineHealthUseCase.execute()
    result.fold(
      () => {
        this.engineHealth.value = null
      },
      (health) => {
        this.engineHealth.value = health
      },
    )
    this.engineHealthLoading.value = false
  }

  // --- Certificado A1 ---

  /** Busca a situação do certificado do estabelecimento em edição. */
  async loadCertificate(establishmentId: string): Promise<void> {
    this.certificateLoading.value = true
    const result = await this.getCertificateUseCase.execute(establishmentId)
    result.fold(
      (error) => {
        this.certificate.value = null
        if (error.isUserFacing) this.toast.error(error.message)
        else console.error(error)
      },
      (status) => {
        this.certificate.value = status
      },
    )
    this.certificateLoading.value = false
  }

  /** Carrega o histórico de trocas do certificado. */
  async loadCertificateHistory(establishmentId: string): Promise<void> {
    this.historyLoading.value = true
    const result =
      await this.getCertificateHistoryUseCase.execute(establishmentId)
    result.fold(
      () => {
        this.certificateHistory.value = []
      },
      (events) => {
        this.certificateHistory.value = events
      },
    )
    this.historyLoading.value = false
  }

  /**
   * Envia um novo certificado A1. Em sucesso, atualiza a situação exibida e
   * recarrega o histórico. Retorna `true` quando o upload deu certo.
   */
  async uploadCertificate(
    establishmentId: string,
    file: File,
    senha: string,
  ): Promise<boolean> {
    this.uploading.value = true
    let ok = false
    const result = await this.uploadCertificateUseCase.execute(
      establishmentId,
      file,
      senha,
    )
    this.handleResult(
      result,
      (status) => {
        ok = true
        this.certificate.value = status
        this.toast.success('Certificado enviado com sucesso.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível enviar o certificado.',
        )
      },
    )
    if (ok) await this.loadCertificateHistory(establishmentId)
    this.uploading.value = false
    return ok
  }

  // --- Teste SEFAZ ---

  /** Testa a comunicação com a SEFAZ para o estabelecimento em edição. */
  async testSefaz(establishmentId: string): Promise<void> {
    this.sefazTesting.value = true
    this.sefazResult.value = null
    const result = await this.testSefazUseCase.execute(establishmentId)
    this.handleResult(
      result,
      (status) => {
        this.sefazResult.value = status
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível testar a comunicação com a SEFAZ.',
        )
      },
    )
    this.sefazTesting.value = false
  }
}
