import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ListFiscalDocumentsUseCase } from '@/modules/fiscal/application/use-cases/list-fiscal-documents.use-case'
import { QueryFiscalDocumentsDto } from '@/modules/fiscal/domain/dto/query-fiscal-documents-dto'
import type { FiscalDocument } from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import type { FiscalDocumentStatus } from '@/enums/fiscal-document-status.enum'
import type { FiscalDocumentModel } from '@/enums/fiscal-document-model.enum'
import type { SelectOption } from '@/shared/ui'
import { dateInputToIso } from '@/core/utils/date'

const PAGE_LIMIT = 20

/** Estabelecimento simplificado usado no filtro da listagem. */
export interface FiscalDocumentEstablishmentOption {
  id: string
  name: string
}

/** Fornece os estabelecimentos (injetado pela factory — cruzamento de módulo). */
export type FiscalDocumentsEstablishmentsLoader = () => Promise<
  Either<DomainError, FiscalDocumentEstablishmentOption[]>
>

export class FiscalDocumentsListController extends BaseController {
  private readonly listUseCase: ListFiscalDocumentsUseCase
  private readonly loadEstablishments: FiscalDocumentsEstablishmentsLoader

  readonly documents = ref<FiscalDocument[]>([])
  readonly loaded = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly totalPages = ref(1)
  readonly hasNext = ref(false)

  readonly statusFilter = ref<FiscalDocumentStatus | ''>('')
  readonly modeloFilter = ref<FiscalDocumentModel | ''>('')
  readonly establishmentFilter = ref('')
  readonly startDate = ref('')
  readonly endDate = ref('')
  readonly establishmentOptions = ref<SelectOption[]>([])

  /** Há algum filtro aplicado (habilita o botão de limpar). */
  readonly hasFilters = computed(
    () =>
      this.statusFilter.value !== '' ||
      this.modeloFilter.value !== '' ||
      this.establishmentFilter.value !== '' ||
      this.startDate.value !== '' ||
      this.endDate.value !== '',
  )

  constructor(
    listUseCase: ListFiscalDocumentsUseCase,
    loadEstablishments: FiscalDocumentsEstablishmentsLoader,
  ) {
    super()
    this.listUseCase = listUseCase
    this.loadEstablishments = loadEstablishments
  }

  async loadEstablishmentOptions(): Promise<void> {
    const result = await this.loadEstablishments()
    result.fold(
      () => {
        this.establishmentOptions.value = []
      },
      (items) => {
        this.establishmentOptions.value = items.map((e) => ({
          value: e.id,
          label: e.name,
        }))
      },
    )
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new QueryFiscalDocumentsDto({
      page: this.page.value,
      limit: this.limit.value,
      status: this.statusFilter.value || undefined,
      modelo: this.modeloFilter.value || undefined,
      establishmentId: this.establishmentFilter.value || undefined,
      startDate: dateInputToIso(this.startDate.value),
      endDate: dateInputToIso(this.endDate.value),
    })
    const result = await this.listUseCase.execute(dto)
    this.handleResult(result, (list) => {
      this.documents.value = list.items
      this.total.value = list.total
      this.page.value = list.page
      this.limit.value = list.limit
      this.totalPages.value = list.totalPages
      this.hasNext.value = list.hasNext
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async setStatus(value: FiscalDocumentStatus | ''): Promise<void> {
    this.statusFilter.value = value
    this.page.value = 1
    await this.loadList()
  }

  async setModelo(value: FiscalDocumentModel | ''): Promise<void> {
    this.modeloFilter.value = value
    this.page.value = 1
    await this.loadList()
  }

  async setEstablishment(value: string): Promise<void> {
    this.establishmentFilter.value = value
    this.page.value = 1
    await this.loadList()
  }

  async setDateRange(start: string, end: string): Promise<void> {
    this.startDate.value = start
    this.endDate.value = end
    this.page.value = 1
    await this.loadList()
  }

  async clearFilters(): Promise<void> {
    this.statusFilter.value = ''
    this.modeloFilter.value = ''
    this.establishmentFilter.value = ''
    this.startDate.value = ''
    this.endDate.value = ''
    this.page.value = 1
    await this.loadList()
  }

  async goToPage(page: number): Promise<void> {
    if (page < 1 || page > this.totalPages.value || page === this.page.value) {
      return
    }
    this.page.value = page
    await this.loadList()
  }
}
