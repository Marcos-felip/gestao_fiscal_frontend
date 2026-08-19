import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListPurchasesUseCase } from '@/modules/purchases/application/use-cases/list-purchases.use-case'
import type { DeletePurchaseUseCase } from '@/modules/purchases/application/use-cases/delete-purchase.use-case'
import { ListPurchasesDto } from '@/modules/purchases/domain/dto/list-purchases-dto'
import type { Purchase } from '@/modules/purchases/domain/entities/purchase.entity'
import type { PurchaseStatus } from '@/core/enums/purchase-status.enum'
import { dateInputToIso } from '@/core/utils/date'
import { useToast } from '@/shared/composables'

const PAGE_LIMIT = 20

export class PurchasesListController extends BaseController {
  private readonly listUseCase: ListPurchasesUseCase
  private readonly deleteUseCase: DeletePurchaseUseCase
  private readonly toast = useToast()

  readonly purchases = ref<Purchase[]>([])
  readonly loaded = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly statusFilter = ref<PurchaseStatus | ''>('')
  readonly startDate = ref('')
  readonly endDate = ref('')
  readonly deletingId = ref<string | null>(null)

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total.value / this.limit.value)),
  )

  constructor(
    listUseCase: ListPurchasesUseCase,
    deleteUseCase: DeletePurchaseUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.deleteUseCase = deleteUseCase
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new ListPurchasesDto({
      page: this.page.value,
      limit: this.limit.value,
      status: this.statusFilter.value || undefined,
      startDate: dateInputToIso(this.startDate.value),
      endDate: dateInputToIso(this.endDate.value),
    })
    const result = await this.listUseCase.execute(dto)
    this.handleResult(result, (list) => {
      this.purchases.value = list.items
      this.total.value = list.total
      this.page.value = list.page
      this.limit.value = list.limit
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async setStatus(value: PurchaseStatus | ''): Promise<void> {
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

  async remove(purchase: Purchase): Promise<void> {
    this.deletingId.value = purchase.id
    this.setLoading(true)
    const result = await this.deleteUseCase.execute(purchase.id)
    this.handleResult(result, () => {
      this.toast.success('Compra excluída.')
    })
    this.setLoading(false)
    this.deletingId.value = null
    if (
      !this.hasError &&
      this.purchases.value.length === 1 &&
      this.page.value > 1
    ) {
      this.page.value -= 1
    }
    await this.loadList()
  }
}
