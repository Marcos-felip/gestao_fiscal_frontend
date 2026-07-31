import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetPayableUseCase } from '@/modules/payables/application/use-cases/get-payable.use-case'
import type { PayPayableUseCase } from '@/modules/payables/application/use-cases/pay-payable.use-case'
import type { CancelPayableUseCase } from '@/modules/payables/application/use-cases/cancel-payable.use-case'
import type { PayPayableDto } from '@/modules/payables/domain/dto/pay-payable-dto'
import type { Payable } from '@/modules/payables/domain/entities/payable.entity'
import { useToast } from '@/shared/composables'

export class PayableDetailController extends BaseController {
  private readonly getUseCase: GetPayableUseCase
  private readonly payUseCase: PayPayableUseCase
  private readonly cancelUseCase: CancelPayableUseCase
  private readonly toast = useToast()

  readonly payable = ref<Payable | null>(null)
  readonly loaded = ref(false)
  readonly acting = ref(false)

  constructor(
    getUseCase: GetPayableUseCase,
    payUseCase: PayPayableUseCase,
    cancelUseCase: CancelPayableUseCase,
  ) {
    super()
    this.getUseCase = getUseCase
    this.payUseCase = payUseCase
    this.cancelUseCase = cancelUseCase
  }

  async load(id: string): Promise<void> {
    this.setLoading(true)
    const result = await this.getUseCase.execute(id)
    this.handleResult(result, (payable) => {
      this.payable.value = payable
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  /** Baixa (parcial ou total). Recarrega o título para refletir status/histórico. */
  async pay(dto: PayPayableDto): Promise<boolean> {
    const current = this.payable.value
    if (!current) return false

    this.acting.value = true
    let ok = false
    const result = await this.payUseCase.execute(current.id, dto)
    this.handleResult(
      result,
      () => {
        ok = true
        this.toast.success('Pagamento registrado.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível registrar o pagamento. Tente novamente.',
        )
      },
    )
    this.acting.value = false
    if (ok) await this.load(current.id)
    return ok
  }

  async cancel(): Promise<boolean> {
    const current = this.payable.value
    if (!current) return false

    this.acting.value = true
    let ok = false
    const result = await this.cancelUseCase.execute(current.id)
    this.handleResult(
      result,
      () => {
        ok = true
        this.toast.success('Título cancelado.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível cancelar o título. Tente novamente.',
        )
      },
    )
    this.acting.value = false
    if (ok) await this.load(current.id)
    return ok
  }
}
