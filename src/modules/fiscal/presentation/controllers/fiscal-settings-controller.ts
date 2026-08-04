import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ListFiscalSettingsUseCase } from '@/modules/fiscal/application/use-cases/list-fiscal-settings.use-case'
import type { GetFiscalSettingsByEstablishmentUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-settings-by-establishment.use-case'
import type { CreateFiscalSettingsUseCase } from '@/modules/fiscal/application/use-cases/create-fiscal-settings.use-case'
import type { UpdateFiscalSettingsUseCase } from '@/modules/fiscal/application/use-cases/update-fiscal-settings.use-case'
import type { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
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
  private readonly loadEstablishments: FiscalEstablishmentsLoader
  private readonly toast = useToast()

  readonly settings = ref<FiscalSettings[]>([])
  readonly establishments = ref<FiscalEstablishmentOption[]>([])
  readonly loaded = ref(false)
  readonly preparing = ref(false)
  readonly saving = ref(false)
  readonly editing = ref<FiscalSettingsEditing | null>(null)

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
    loadEstablishments: FiscalEstablishmentsLoader,
  ) {
    super()
    this.listUseCase = listUseCase
    this.getByEstablishmentUseCase = getByEstablishmentUseCase
    this.createUseCase = createUseCase
    this.updateUseCase = updateUseCase
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
}
