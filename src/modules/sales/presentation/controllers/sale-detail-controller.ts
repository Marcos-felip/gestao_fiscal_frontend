import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetSaleUseCase } from '@/modules/sales/application/use-cases/get-sale.use-case'
import type { ConfirmSaleUseCase } from '@/modules/sales/application/use-cases/confirm-sale.use-case'
import type { CancelSaleUseCase } from '@/modules/sales/application/use-cases/cancel-sale.use-case'
import type { DeleteSaleUseCase } from '@/modules/sales/application/use-cases/delete-sale.use-case'
import type { Sale } from '@/modules/sales/domain/entities/sale.entity'
import type { CreateSalePaymentInput } from '@/modules/sales/domain/dto/create-sale-dto'
import { SaleStatus } from '@/core/enums/sale-status.enum'
import { useToast } from '@/shared/composables'
import { routeNames } from '@/router/route-names'

export class SaleDetailController extends BaseController {
  private readonly getUseCase: GetSaleUseCase
  private readonly confirmUseCase: ConfirmSaleUseCase
  private readonly cancelUseCase: CancelSaleUseCase
  private readonly deleteUseCase: DeleteSaleUseCase
  private readonly toast = useToast()

  readonly sale = ref<Sale | null>(null)
  readonly loaded = ref(false)
  readonly acting = ref(false)

  readonly isBudget = computed(
    () => this.sale.value?.status === SaleStatus.ORCAMENTO,
  )
  readonly isOpen = computed(
    () => this.sale.value?.status === SaleStatus.EM_ABERTO,
  )
  readonly isCompleted = computed(
    () => this.sale.value?.status === SaleStatus.CONCLUIDA,
  )
  readonly isCancelled = computed(
    () => this.sale.value?.status === SaleStatus.CANCELADA,
  )

  /** Finaliza (baixa estoque) enquanto orçamento ou em aberto. */
  readonly canFinalize = computed(
    () => this.isBudget.value || this.isOpen.value,
  )
  /** Cancela enquanto orçamento, em aberto ou concluída. */
  readonly canCancel = computed(
    () => this.isBudget.value || this.isOpen.value || this.isCompleted.value,
  )
  /** Exclui apenas orçamento ou cancelada. */
  readonly canDeleteSale = computed(
    () => this.isBudget.value || this.isCancelled.value,
  )

  constructor(
    getUseCase: GetSaleUseCase,
    confirmUseCase: ConfirmSaleUseCase,
    cancelUseCase: CancelSaleUseCase,
    deleteUseCase: DeleteSaleUseCase,
  ) {
    super()
    this.getUseCase = getUseCase
    this.confirmUseCase = confirmUseCase
    this.cancelUseCase = cancelUseCase
    this.deleteUseCase = deleteUseCase
  }

  async load(id: string): Promise<void> {
    this.setLoading(true)
    const result = await this.getUseCase.execute(id)
    this.handleResult(result, (sale) => {
      this.sale.value = sale
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async confirm(payments?: CreateSalePaymentInput[]): Promise<void> {
    if (!this.sale.value) return
    this.acting.value = true
    const result = await this.confirmUseCase.execute(
      this.sale.value.id,
      payments,
    )
    this.handleResult(
      result,
      (sale) => {
        this.sale.value = sale
        this.toast.success('Venda finalizada — estoque baixado.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível finalizar a venda.',
        )
      },
    )
    this.acting.value = false
  }

  async cancel(): Promise<void> {
    if (!this.sale.value) return
    this.acting.value = true
    const wasCompleted = this.isCompleted.value
    const result = await this.cancelUseCase.execute(this.sale.value.id)
    this.handleResult(result, (sale) => {
      this.sale.value = sale
      this.toast.success(
        wasCompleted
          ? 'Venda cancelada — estoque estornado.'
          : 'Venda cancelada.',
      )
    })
    this.acting.value = false
  }

  async remove(): Promise<void> {
    if (!this.sale.value) return
    this.acting.value = true
    const result = await this.deleteUseCase.execute(this.sale.value.id)
    this.handleResult(result, () => {
      this.toast.success('Venda excluída.')
      this.router.push({ name: routeNames.SALES })
    })
    this.acting.value = false
  }
}
