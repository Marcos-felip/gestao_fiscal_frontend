import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetReceivableUseCase } from '@/modules/receivables/application/use-cases/get-receivable.use-case'
import type { PayReceivableUseCase } from '@/modules/receivables/application/use-cases/pay-receivable.use-case'
import type { CancelReceivableUseCase } from '@/modules/receivables/application/use-cases/cancel-receivable.use-case'
import type { PayReceivableDto } from '@/modules/receivables/domain/dto/pay-receivable-dto'
import type { Receivable } from '@/modules/receivables/domain/entities/receivable.entity'
import { useToast } from '@/shared/composables'

export class ReceivableDetailController extends BaseController {
  private readonly getUseCase: GetReceivableUseCase
  private readonly payUseCase: PayReceivableUseCase
  private readonly cancelUseCase: CancelReceivableUseCase
  private readonly toast = useToast()

  readonly receivable = ref<Receivable | null>(null)
  readonly loaded = ref(false)
  readonly acting = ref(false)

  constructor(
    getUseCase: GetReceivableUseCase,
    payUseCase: PayReceivableUseCase,
    cancelUseCase: CancelReceivableUseCase,
  ) {
    super()
    this.getUseCase = getUseCase
    this.payUseCase = payUseCase
    this.cancelUseCase = cancelUseCase
  }

  async load(id: string): Promise<void> {
    this.setLoading(true)
    const result = await this.getUseCase.execute(id)
    this.handleResult(result, (receivable) => {
      this.receivable.value = receivable
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  /** Baixa (parcial ou total). Recarrega o título para refletir status/histórico. */
  async pay(dto: PayReceivableDto): Promise<boolean> {
    const current = this.receivable.value
    if (!current) return false

    this.acting.value = true
    let ok = false
    const result = await this.payUseCase.execute(current.id, dto)
    this.handleResult(
      result,
      () => {
        ok = true
        this.toast.success('Baixa registrada.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível registrar a baixa. Tente novamente.',
        )
      },
    )
    this.acting.value = false
    if (ok) await this.load(current.id)
    return ok
  }

  async cancel(): Promise<boolean> {
    const current = this.receivable.value
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
