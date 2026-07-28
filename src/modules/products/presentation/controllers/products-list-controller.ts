import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListProductsUseCase } from '@/modules/products/application/use-cases/list-products.use-case'
import type { DeleteProductUseCase } from '@/modules/products/application/use-cases/delete-product.use-case'
import { ListProductsDto } from '@/modules/products/domain/dto/list-products-dto'
import type { Product } from '@/modules/products/domain/entities/product.entity'
import { useToast } from '@/shared/composables'

const PAGE_LIMIT = 20

export class ProductsListController extends BaseController {
  private readonly listUseCase: ListProductsUseCase
  private readonly deleteUseCase: DeleteProductUseCase
  private readonly toast = useToast()

  readonly products = ref<Product[]>([])
  readonly loaded = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly search = ref('')
  readonly deletingId = ref<string | null>(null)

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total.value / this.limit.value)),
  )

  constructor(
    listUseCase: ListProductsUseCase,
    deleteUseCase: DeleteProductUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.deleteUseCase = deleteUseCase
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new ListProductsDto({
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

  async remove(product: Product): Promise<void> {
    this.deletingId.value = product.id
    this.setLoading(true)
    const result = await this.deleteUseCase.execute(product.id)
    this.handleResult(result, () => {
      this.toast.success('Produto excluído.')
    })
    this.setLoading(false)
    this.deletingId.value = null
    // Recarrega respeitando busca/paginação atuais; recua de página se
    // a atual ficou vazia após a exclusão.
    if (
      !this.hasError &&
      this.products.value.length === 1 &&
      this.page.value > 1
    ) {
      this.page.value -= 1
    }
    await this.loadList()
  }
}
