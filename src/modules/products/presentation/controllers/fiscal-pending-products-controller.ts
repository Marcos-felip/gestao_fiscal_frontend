import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListFiscalPendingProductsUseCase } from '@/modules/products/application/use-cases/list-fiscal-pending-products.use-case'
import { ListFiscalPendingDto } from '@/modules/products/domain/dto/list-fiscal-pending-dto'
import type { ProductFiscalPending } from '@/modules/products/domain/responses/product-fiscal-pending'

const PAGE_LIMIT = 20

export class FiscalPendingProductsController extends BaseController {
  private readonly listUseCase: ListFiscalPendingProductsUseCase

  readonly products = ref<ProductFiscalPending[]>([])
  readonly loaded = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly search = ref('')

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total.value / this.limit.value)),
  )

  constructor(listUseCase: ListFiscalPendingProductsUseCase) {
    super()
    this.listUseCase = listUseCase
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new ListFiscalPendingDto({
      page: this.page.value,
      limit: this.limit.value,
      search: this.search.value.trim() || undefined,
    })
    const result = await this.listUseCase.execute(dto)
    this.handleResult(result, (list) => {
      this.products.value = list.items
      this.total.value = list.total
      this.page.value = list.page
      this.limit.value = list.limit
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async setSearch(value: string): Promise<void> {
    this.search.value = value
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
