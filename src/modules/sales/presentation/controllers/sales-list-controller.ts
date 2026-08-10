import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListSalesUseCase } from '@/modules/sales/application/use-cases/list-sales.use-case'
import { ListSalesDto } from '@/modules/sales/domain/dto/list-sales-dto'
import type { Sale } from '@/modules/sales/domain/entities/sale.entity'
import type { SaleStatus } from '@/core/enums/sale-status.enum'
import { dateInputToIso } from '@/core/utils/date'

const PAGE_LIMIT = 20

export class SalesListController extends BaseController {
  private readonly listUseCase: ListSalesUseCase

  readonly sales = ref<Sale[]>([])
  readonly loaded = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly statusFilter = ref<SaleStatus | ''>('')
  readonly startDate = ref('')
  readonly endDate = ref('')

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total.value / this.limit.value)),
  )

  constructor(listUseCase: ListSalesUseCase) {
    super()
    this.listUseCase = listUseCase
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new ListSalesDto({
      page: this.page.value,
      limit: this.limit.value,
      status: this.statusFilter.value || undefined,
      startDate: dateInputToIso(this.startDate.value),
      endDate: dateInputToIso(this.endDate.value),
    })
    const result = await this.listUseCase.execute(dto)
    this.handleResult(result, (list) => {
      this.sales.value = list.items
      this.total.value = list.total
      this.page.value = list.page
      this.limit.value = list.limit
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async setStatus(value: SaleStatus | ''): Promise<void> {
    this.statusFilter.value = value
    this.page.value = 1
    await this.loadList()
  }

  async setDateRange(start: string, end: string): Promise<void> {
    this.startDate.value = start
    this.endDate.value = end
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
