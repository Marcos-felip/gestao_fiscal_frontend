import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListPartnersUseCase } from '@/modules/partners/application/use-cases/list-partners.use-case'
import type { DeletePartnerUseCase } from '@/modules/partners/application/use-cases/delete-partner.use-case'
import { ListPartnersDto } from '@/modules/partners/domain/dto/list-partners-dto'
import type { Partner } from '@/modules/partners/domain/entities/partner.entity'
import type { PartnerType } from '@/enums/partner-type.enum'
import { useToast } from '@/shared/composables'

const PAGE_LIMIT = 20

export class PartnersListController extends BaseController {
  private readonly listUseCase: ListPartnersUseCase
  private readonly deleteUseCase: DeletePartnerUseCase
  private readonly toast = useToast()

  readonly partners = ref<Partner[]>([])
  readonly loaded = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly search = ref('')
  readonly typeFilter = ref<PartnerType | ''>('')
  readonly deletingId = ref<string | null>(null)

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total.value / this.limit.value)),
  )

  constructor(
    listUseCase: ListPartnersUseCase,
    deleteUseCase: DeletePartnerUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.deleteUseCase = deleteUseCase
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new ListPartnersDto({
      page: this.page.value,
      limit: this.limit.value,
      search: this.search.value.trim() || undefined,
      type: this.typeFilter.value || undefined,
    })
    const result = await this.listUseCase.execute(dto)
    this.handleResult(result, (list) => {
      this.partners.value = list.items
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

  async setType(value: PartnerType | ''): Promise<void> {
    this.typeFilter.value = value
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

  async remove(partner: Partner): Promise<void> {
    this.deletingId.value = partner.id
    this.setLoading(true)
    const result = await this.deleteUseCase.execute(partner.id)
    this.handleResult(result, () => {
      this.toast.success('Parceiro excluído.')
    })
    this.setLoading(false)
    this.deletingId.value = null
    // Recarrega respeitando filtros/paginação atuais; recua de página se
    // a atual ficou vazia após a exclusão.
    if (
      !this.hasError &&
      this.partners.value.length === 1 &&
      this.page.value > 1
    ) {
      this.page.value -= 1
    }
    await this.loadList()
  }
}
