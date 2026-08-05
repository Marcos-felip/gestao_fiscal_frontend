import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListFiscalRejectionsUseCase } from '@/modules/fiscal/application/use-cases/list-fiscal-rejections.use-case'
import type { RetryFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/retry-fiscal-document.use-case'
import { QueryFiscalDocumentsDto } from '@/modules/fiscal/domain/dto/query-fiscal-documents-dto'
import type { FiscalRejectionItem } from '@/modules/fiscal/domain/responses/fiscal-rejection-item'
import { dateInputToIso } from '@/core/utils/date'
import { useToast } from '@/shared/composables'

const PAGE_LIMIT = 20

export class FiscalRejectionsController extends BaseController {
  private readonly listUseCase: ListFiscalRejectionsUseCase
  private readonly retryUseCase: RetryFiscalDocumentUseCase
  private readonly toast = useToast()

  readonly rejections = ref<FiscalRejectionItem[]>([])
  readonly loaded = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly totalPages = ref(1)
  readonly hasNext = ref(false)
  readonly retryingId = ref<string | null>(null)

  readonly startDate = ref('')
  readonly endDate = ref('')
  readonly establishmentFilter = ref('')

  readonly hasFilters = computed(
    () =>
      this.startDate.value !== '' ||
      this.endDate.value !== '' ||
      this.establishmentFilter.value !== '',
  )

  constructor(
    listUseCase: ListFiscalRejectionsUseCase,
    retryUseCase: RetryFiscalDocumentUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.retryUseCase = retryUseCase
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new QueryFiscalDocumentsDto({
      page: this.page.value,
      limit: this.limit.value,
      establishmentId: this.establishmentFilter.value || undefined,
      startDate: dateInputToIso(this.startDate.value),
      endDate: dateInputToIso(this.endDate.value),
    })
    const result = await this.listUseCase.execute(dto)
    this.handleResult(result, (list) => {
      this.rejections.value = list.items
      this.total.value = list.total
      this.page.value = list.page
      this.limit.value = list.limit
      this.totalPages.value = list.totalPages
      this.hasNext.value = list.hasNext
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async retry(item: FiscalRejectionItem): Promise<void> {
    if (this.retryingId.value) return

    this.retryingId.value = item.document.id
    const result = await this.retryUseCase.execute(item.document.id)
    this.handleResult(
      result,
      () => {
        this.toast.info('Reprocessamento iniciado.')
        void this.loadList()
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível reprocessar o documento.',
        )
      },
    )
    this.retryingId.value = null
  }

  async setDateRange(start: string, end: string): Promise<void> {
    this.startDate.value = start
    this.endDate.value = end
    this.page.value = 1
    await this.loadList()
  }

  async setEstablishment(value: string): Promise<void> {
    this.establishmentFilter.value = value
    this.page.value = 1
    await this.loadList()
  }

  async clearFilters(): Promise<void> {
    this.startDate.value = ''
    this.endDate.value = ''
    this.establishmentFilter.value = ''
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
