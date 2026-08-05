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
import type { ListSettingsByEnvironmentUseCase } from '@/modules/fiscal/application/use-cases/list-settings-by-environment.use-case'
import type { ActivateEnvironmentUseCase } from '@/modules/fiscal/application/use-cases/activate-environment.use-case'
import type { GetProductionChecklistUseCase } from '@/modules/fiscal/application/use-cases/get-production-checklist.use-case'
import type { ReleaseProductionUseCase } from '@/modules/fiscal/application/use-cases/release-production.use-case'
import type { RevokeProductionUseCase } from '@/modules/fiscal/application/use-cases/revoke-production.use-case'
import type { ValidatePublicConsultationUseCase } from '@/modules/fiscal/application/use-cases/validate-public-consultation.use-case'
import type { GetSettingsHistoryUseCase } from '@/modules/fiscal/application/use-cases/get-settings-history.use-case'
import type { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
import type { CertificateStatus } from '@/modules/fiscal/domain/entities/certificate-status.entity'
import type { FiscalCertificateEvent } from '@/modules/fiscal/domain/entities/fiscal-certificate-event.entity'
import type { FiscalSettingsEvent } from '@/modules/fiscal/domain/entities/fiscal-settings-event.entity'
import type { StatusServicoResult } from '@/modules/fiscal/domain/responses/status-servico-result'
import type { FiscalEngineHealth } from '@/modules/fiscal/domain/responses/fiscal-engine-health'
import type {
  ProductionChecklist,
  ConsultaPublicaResult,
} from '@/modules/fiscal/domain/responses/production-checklist'
import type { FiscalEnvironment } from '@/enums/fiscal-environment.enum'
import type { CreateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/create-fiscal-settings-dto'
import type { UpdateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/update-fiscal-settings-dto'
import { useToast } from '@/shared/composables'

export interface FiscalEstablishmentOption {
  id: string
  name: string
  type: string
}

export type FiscalEstablishmentsLoader = () => Promise<
  Either<DomainError, FiscalEstablishmentOption[]>
>

export interface FiscalSettingsRow {
  establishment: FiscalEstablishmentOption
  settings: FiscalSettings | null
}

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
  private readonly listByEnvironmentUseCase: ListSettingsByEnvironmentUseCase
  private readonly activateEnvironmentUseCase: ActivateEnvironmentUseCase
  private readonly getProductionChecklistUseCase: GetProductionChecklistUseCase
  private readonly releaseProductionUseCase: ReleaseProductionUseCase
  private readonly revokeProductionUseCase: RevokeProductionUseCase
  private readonly validatePublicConsultationUseCase: ValidatePublicConsultationUseCase
  private readonly getSettingsHistoryUseCase: GetSettingsHistoryUseCase
  private readonly loadEstablishments: FiscalEstablishmentsLoader
  private readonly toast = useToast()

  readonly settings = ref<FiscalSettings[]>([])
  readonly establishments = ref<FiscalEstablishmentOption[]>([])
  readonly loaded = ref(false)
  readonly preparing = ref(false)
  readonly saving = ref(false)
  readonly editing = ref<FiscalSettingsEditing | null>(null)

  readonly certificate = ref<CertificateStatus | null>(null)
  readonly certificateLoading = ref(false)
  readonly uploading = ref(false)
  readonly certificateHistory = ref<FiscalCertificateEvent[]>([])
  readonly historyLoading = ref(false)

  readonly sefazResult = ref<StatusServicoResult | null>(null)
  readonly sefazTesting = ref(false)

  readonly engineHealth = ref<FiscalEngineHealth | null>(null)
  readonly engineHealthLoading = ref(false)

  // --- Produção ---
  readonly checklist = ref<ProductionChecklist | null>(null)
  readonly checklistLoading = ref(false)
  readonly releasingProduction = ref(false)
  readonly revokingProduction = ref(false)
  readonly consultaResult = ref<ConsultaPublicaResult | null>(null)
  readonly consultaValidating = ref(false)
  readonly activatingEnvironment = ref(false)

  // --- Histórico de configurações ---
  readonly settingsHistory = ref<FiscalSettingsEvent[]>([])
  readonly settingsHistoryLoading = ref(false)

  // --- Ambientes ---
  readonly ambientesSettings = ref<FiscalSettings[]>([])
  readonly ambientesLoading = ref(false)

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
    listByEnvironmentUseCase: ListSettingsByEnvironmentUseCase,
    activateEnvironmentUseCase: ActivateEnvironmentUseCase,
    getProductionChecklistUseCase: GetProductionChecklistUseCase,
    releaseProductionUseCase: ReleaseProductionUseCase,
    revokeProductionUseCase: RevokeProductionUseCase,
    validatePublicConsultationUseCase: ValidatePublicConsultationUseCase,
    getSettingsHistoryUseCase: GetSettingsHistoryUseCase,
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
    this.listByEnvironmentUseCase = listByEnvironmentUseCase
    this.activateEnvironmentUseCase = activateEnvironmentUseCase
    this.getProductionChecklistUseCase = getProductionChecklistUseCase
    this.releaseProductionUseCase = releaseProductionUseCase
    this.revokeProductionUseCase = revokeProductionUseCase
    this.validatePublicConsultationUseCase = validatePublicConsultationUseCase
    this.getSettingsHistoryUseCase = getSettingsHistoryUseCase
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

  async prepare(establishment: FiscalEstablishmentOption): Promise<boolean> {
    this.preparing.value = true
    this.certificate.value = null
    this.certificateHistory.value = []
    this.sefazResult.value = null
    this.checklist.value = null
    this.consultaResult.value = null
    this.settingsHistory.value = []
    this.ambientesSettings.value = []
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

  async prepareById(establishmentId: string): Promise<boolean> {
    const row = this.rows.value.find(
      (item) => item.establishment.id === establishmentId,
    )
    if (!row) return false
    const ok = await this.prepare(row.establishment)
    if (ok) {
      void this.loadCertificate(establishmentId)
      void this.loadCertificateHistory(establishmentId)
    }
    return true
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

  // --- Produção ---

  async loadChecklist(establishmentId: string): Promise<void> {
    this.checklistLoading.value = true
    const result =
      await this.getProductionChecklistUseCase.execute(establishmentId)
    result.fold(
      (error) => {
        this.checklist.value = null
        if (error.isUserFacing) this.toast.error(error.message)
      },
      (checklist) => {
        this.checklist.value = checklist
      },
    )
    this.checklistLoading.value = false
  }

  async releaseProduction(establishmentId: string): Promise<boolean> {
    this.releasingProduction.value = true
    let ok = false
    const result =
      await this.releaseProductionUseCase.execute(establishmentId)
    this.handleResult(
      result,
      (saved) => {
        ok = true
        this.upsertSettings(saved)
        this.toast.success('Produção liberada com sucesso.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível liberar a produção.',
        )
      },
    )
    this.releasingProduction.value = false
    return ok
  }

  async revokeProduction(establishmentId: string): Promise<boolean> {
    this.revokingProduction.value = true
    let ok = false
    const result = await this.revokeProductionUseCase.execute(establishmentId)
    this.handleResult(
      result,
      (saved) => {
        ok = true
        this.upsertSettings(saved)
        this.toast.success('Produção revogada.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível revogar a produção.',
        )
      },
    )
    this.revokingProduction.value = false
    return ok
  }

  async activateEnvironment(
    establishmentId: string,
    ambiente: FiscalEnvironment,
  ): Promise<boolean> {
    this.activatingEnvironment.value = true
    let ok = false
    const result = await this.activateEnvironmentUseCase.execute(
      establishmentId,
      ambiente,
    )
    this.handleResult(
      result,
      (saved) => {
        ok = true
        this.upsertSettings(saved)
        this.toast.success(`Ambiente ${ambiente} ativado.`)
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível ativar o ambiente.',
        )
      },
    )
    this.activatingEnvironment.value = false
    return ok
  }

  async validateConsulta(establishmentId: string): Promise<void> {
    this.consultaValidating.value = true
    this.consultaResult.value = null
    const result =
      await this.validatePublicConsultationUseCase.execute(establishmentId)
    this.handleResult(
      result,
      (result) => {
        this.consultaResult.value = result
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível validar a consulta pública.',
        )
      },
    )
    this.consultaValidating.value = false
  }

  async loadSettingsHistory(establishmentId: string): Promise<void> {
    this.settingsHistoryLoading.value = true
    const result =
      await this.getSettingsHistoryUseCase.execute(establishmentId)
    result.fold(
      () => {
        this.settingsHistory.value = []
      },
      (events) => {
        this.settingsHistory.value = events
      },
    )
    this.settingsHistoryLoading.value = false
  }

  async loadAmbientes(establishmentId: string): Promise<void> {
    this.ambientesLoading.value = true
    const result =
      await this.listByEnvironmentUseCase.execute(establishmentId)
    result.fold(
      () => {
        this.ambientesSettings.value = []
      },
      (items) => {
        this.ambientesSettings.value = items
      },
    )
    this.ambientesLoading.value = false
  }
}
