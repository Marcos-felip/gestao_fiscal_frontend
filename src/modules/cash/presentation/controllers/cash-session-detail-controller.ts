import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetCashSessionUseCase } from '@/modules/cash/application/use-cases/get-cash-session.use-case'
import type { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'

export class CashSessionDetailController extends BaseController {
  private readonly getUseCase: GetCashSessionUseCase

  readonly session = ref<CashSession | null>(null)
  readonly loaded = ref(false)

  constructor(getUseCase: GetCashSessionUseCase) {
    super()
    this.getUseCase = getUseCase
  }

  async load(id: string): Promise<void> {
    this.setLoading(true)
    const result = await this.getUseCase.execute(id)
    this.handleResult(result, (session) => {
      this.session.value = session
    })
    this.loaded.value = true
    this.setLoading(false)
  }
}
