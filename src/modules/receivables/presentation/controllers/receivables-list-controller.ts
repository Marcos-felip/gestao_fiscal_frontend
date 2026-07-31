import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListReceivablesUseCase } from '@/modules/receivables/application/use-cases/list-receivables.use-case'
import type { CreateReceivableUseCase } from '@/modules/receivables/application/use-cases/create-receivable.use-case'
import { ListReceivablesDto } from '@/modules/receivables/domain/dto/list-receivables-dto'
import type { CreateReceivableDto } from '@/modules/receivables/domain/dto/create-receivable-dto'
import type { Receivable } from '@/modules/receivables/domain/entities/receivable.entity'
import type { FinancialStatus } from '@/enums/financial-status.enum'
import { dateInputToIso } from '@/core/utils/date'
import { useToast } from '@/shared/composables'

const PAGE_LIMIT = 20

export class ReceivablesListController extends BaseController {
  private readonly listUseCase: ListReceivablesUseCase
  private readonly createUseCase: CreateReceivableUseCase
  private readonly toast = useToast()

  readonly receivables = ref<Receivable[]>([])
  readonly loaded = ref(false)
  readonly saving = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly statusFilter = ref<FinancialStatus | ''>('')
  readonly overdueOnly = ref(false)
  readonly startDate = ref('')
  readonly endDate = ref('')

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total.value / this.limit.value)),
  )

  /** Soma dos saldos em aberto dos títulos exibidos nesta página. */
  readonly openBalanceOnPage = computed(() =>
    this.receivables.value
      .filter((r) => !r.isCancelled && !r.isPaid)
      .reduce((sum, r) => sum + r.balance, 0),
  )

  constructor(
    listUseCase: ListReceivablesUseCase,
    createUseCase: CreateReceivableUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.createUseCase = createUseCase
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new ListReceivablesDto({
      page: this.page.value,
      limit: this.limit.value,
      status: this.statusFilter.value || undefined,
      overdue: this.overdueOnly.value || undefined,
      startDate: dateInputToIso(this.startDate.value),
      endDate: dateInputToIso(this.endDate.value),
    })
    const result = await this.listUseCase.execute(dto)
    this.handleResult(result, (list) => {
      this.receivables.value = list.items
      this.total.value = list.total
      this.page.value = list.page
      this.limit.value = list.limit
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async setStatus(value: FinancialStatus | ''): Promise<void> {
    this.statusFilter.value = value
    this.page.value = 1
    await this.loadList()
  }

  async setOverdue(value: boolean): Promise<void> {
    this.overdueOnly.value = value
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

  /** Cria um título avulso (uma ou mais parcelas). Recarrega a lista no sucesso. */
  async create(dto: CreateReceivableDto): Promise<boolean> {
    this.saving.value = true
    let ok = false
    const result = await this.createUseCase.execute(dto)
    this.handleResult(
      result,
      (created) => {
        ok = true
        this.toast.success(
          created.length > 1
            ? `Título criado em ${created.length} parcelas.`
            : 'Título a receber criado.',
        )
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível criar o título. Tente novamente.',
        )
      },
    )
    this.saving.value = false
    if (ok) {
      this.page.value = 1
      await this.loadList()
    }
    return ok
  }
}
