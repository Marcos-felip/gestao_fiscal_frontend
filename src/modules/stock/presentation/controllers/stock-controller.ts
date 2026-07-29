import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListStockMovementsUseCase } from '@/modules/stock/application/use-cases/list-stock-movements.use-case'
import type { CreateStockMovementUseCase } from '@/modules/stock/application/use-cases/create-stock-movement.use-case'
import { ListStockMovementsDto } from '@/modules/stock/domain/dto/list-stock-movements-dto'
import { CreateStockMovementDto } from '@/modules/stock/domain/dto/create-stock-movement-dto'
import type { StockMovement } from '@/modules/stock/domain/entities/stock-movement.entity'
import type { StockMovementType } from '@/enums/stock-movement-type.enum'
import type { ListProductsUseCase } from '@/modules/products/application/use-cases/list-products.use-case'
import { ListProductsDto } from '@/modules/products/domain/dto/list-products-dto'
import type { Product } from '@/modules/products/domain/entities/product.entity'
import { useToast } from '@/shared/composables'

const PAGE_LIMIT = 20
const PICKER_LIMIT = 100

export class StockController extends BaseController {
  private readonly listUseCase: ListStockMovementsUseCase
  private readonly createUseCase: CreateStockMovementUseCase
  private readonly listProductsUseCase: ListProductsUseCase
  private readonly toast = useToast()

  readonly movements = ref<StockMovement[]>([])
  readonly loaded = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly typeFilter = ref<StockMovementType | ''>('')
  readonly productFilter = ref<string>('')
  readonly saving = ref(false)

  readonly products = ref<Product[]>([])

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total.value / this.limit.value)),
  )

  readonly productOptions = computed(() =>
    this.products.value.map((p) => ({ value: p.id, label: p.name })),
  )

  constructor(
    listUseCase: ListStockMovementsUseCase,
    createUseCase: CreateStockMovementUseCase,
    listProductsUseCase: ListProductsUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.createUseCase = createUseCase
    this.listProductsUseCase = listProductsUseCase
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new ListStockMovementsDto({
      page: this.page.value,
      limit: this.limit.value,
      type: this.typeFilter.value || undefined,
      productId: this.productFilter.value || undefined,
    })
    const result = await this.listUseCase.execute(dto)
    this.handleResult(result, (list) => {
      this.movements.value = list.items
      this.total.value = list.total
      this.page.value = list.page
      this.limit.value = list.limit
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  /** Carrega o catálogo (até 100) para o seletor de produtos. */
  async loadProducts(): Promise<void> {
    const dto = new ListProductsDto({ page: 1, limit: PICKER_LIMIT })
    const result = await this.listProductsUseCase.execute(dto)
    result.map((list) => {
      this.products.value = list.items
    })
  }

  async setType(value: StockMovementType | ''): Promise<void> {
    this.typeFilter.value = value
    this.page.value = 1
    await this.loadList()
  }

  async setProduct(value: string): Promise<void> {
    this.productFilter.value = value
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

  /** Registra a movimentação; em sucesso recarrega a lista. Retorna ok. */
  async createMovement(dto: CreateStockMovementDto): Promise<boolean> {
    this.saving.value = true
    this.clearError()
    const result = await this.createUseCase.execute(dto)
    let ok = false
    this.handleResult(result, () => {
      ok = true
      this.toast.success('Movimentação registrada.')
    })
    this.saving.value = false
    if (ok) {
      this.page.value = 1
      await this.loadList()
    }
    return ok
  }

  buildDto(fields: {
    productId: string
    type: StockMovementType
    quantity: number
    reason?: string
  }): CreateStockMovementDto {
    return new CreateStockMovementDto(fields)
  }
}
