import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListCashSessionsUseCase } from '@/modules/cash/application/use-cases/list-cash-sessions.use-case'
import type { ListCashRegistersUseCase } from '@/modules/cash/application/use-cases/list-cash-registers.use-case'
import { ListCashSessionsDto } from '@/modules/cash/domain/dto/list-cash-sessions-dto'
import { ListCashRegistersDto } from '@/modules/cash/domain/dto/list-cash-registers-dto'
import type { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'
import type { CashSessionStatus } from '@/core/enums/cash-session-status.enum'
import type { SelectOption } from '@/shared/ui'
import { dateInputToIso } from '@/core/utils/date'

const PAGE_LIMIT = 20

export class CashSessionsListController extends BaseController {
  private readonly listUseCase: ListCashSessionsUseCase
  private readonly listRegistersUseCase: ListCashRegistersUseCase

  readonly sessions = ref<CashSession[]>([])
  readonly loaded = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly statusFilter = ref<CashSessionStatus | ''>('')
  readonly registerFilter = ref('')
  readonly startDate = ref('')
  readonly endDate = ref('')
  readonly registerOptions = ref<SelectOption[]>([])

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total.value / this.limit.value)),
  )

  constructor(
    listUseCase: ListCashSessionsUseCase,
    listRegistersUseCase: ListCashRegistersUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.listRegistersUseCase = listRegistersUseCase
  }

  async loadRegisterOptions(): Promise<void> {
    const result = await this.listRegistersUseCase.execute(
      new ListCashRegistersDto(),
    )
    result.fold(
      () => {
        this.registerOptions.value = []
      },
      (items) => {
        this.registerOptions.value = items.map((r) => ({
          value: r.id,
          label: r.establishmentName
            ? `${r.name} · ${r.establishmentName}`
            : r.name,
        }))
      },
    )
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new ListCashSessionsDto({
      page: this.page.value,
      limit: this.limit.value,
      status: this.statusFilter.value || undefined,
      cashRegisterId: this.registerFilter.value || undefined,
      startDate: dateInputToIso(this.startDate.value),
      endDate: dateInputToIso(this.endDate.value),
    })
    const result = await this.listUseCase.execute(dto)
    this.handleResult(result, (list) => {
      this.sessions.value = list.items
      this.total.value = list.total
      this.page.value = list.page
      this.limit.value = list.limit
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async setStatus(value: CashSessionStatus | ''): Promise<void> {
    this.statusFilter.value = value
    this.page.value = 1
    await this.loadList()
  }

  async setRegister(value: string): Promise<void> {
    this.registerFilter.value = value
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
