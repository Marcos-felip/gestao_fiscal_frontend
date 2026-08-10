import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetCurrentCashSessionUseCase } from '@/modules/cash/application/use-cases/get-current-cash-session.use-case'
import type { OpenCashSessionUseCase } from '@/modules/cash/application/use-cases/open-cash-session.use-case'
import type { AddCashMovementUseCase } from '@/modules/cash/application/use-cases/add-cash-movement.use-case'
import type { CloseCashSessionUseCase } from '@/modules/cash/application/use-cases/close-cash-session.use-case'
import type { ListCashRegistersUseCase } from '@/modules/cash/application/use-cases/list-cash-registers.use-case'
import type { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'
import type { CashRegister } from '@/modules/cash/domain/entities/cash-register.entity'
import type { OpenCashSessionDto } from '@/modules/cash/domain/dto/open-cash-session-dto'
import type { CreateCashMovementDto } from '@/modules/cash/domain/dto/create-cash-movement-dto'
import type { CloseCashSessionDto } from '@/modules/cash/domain/dto/close-cash-session-dto'
import { ListCashRegistersDto } from '@/modules/cash/domain/dto/list-cash-registers-dto'
import { cashMovementTypeLabels } from '@/core/enums/cash-movement-type.enum'
import { useToast } from '@/shared/composables'

/**
 * Controla a sessão de caixa do operador no PDV: consulta a sessão aberta,
 * abre (com fundo), registra sangria/suprimento e fecha (conferência).
 */
export class CashSessionController extends BaseController {
  private readonly getCurrentUseCase: GetCurrentCashSessionUseCase
  private readonly openUseCase: OpenCashSessionUseCase
  private readonly addMovementUseCase: AddCashMovementUseCase
  private readonly closeUseCase: CloseCashSessionUseCase
  private readonly listRegistersUseCase: ListCashRegistersUseCase
  private readonly toast = useToast()

  readonly current = ref<CashSession | null>(null)
  readonly loaded = ref(false)
  readonly opening = ref(false)
  readonly acting = ref(false)
  readonly registers = ref<CashRegister[]>([])
  readonly registersLoaded = ref(false)

  constructor(
    getCurrentUseCase: GetCurrentCashSessionUseCase,
    openUseCase: OpenCashSessionUseCase,
    addMovementUseCase: AddCashMovementUseCase,
    closeUseCase: CloseCashSessionUseCase,
    listRegistersUseCase: ListCashRegistersUseCase,
  ) {
    super()
    this.getCurrentUseCase = getCurrentUseCase
    this.openUseCase = openUseCase
    this.addMovementUseCase = addMovementUseCase
    this.closeUseCase = closeUseCase
    this.listRegistersUseCase = listRegistersUseCase
  }

  /** Consulta a sessão aberta do operador (gate do PDV). */
  async loadCurrent(): Promise<void> {
    this.setLoading(true)
    const result = await this.getCurrentUseCase.execute()
    this.handleResult(result, (session) => {
      this.current.value = session
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  /** Lista os caixas ativos para o painel de abertura. */
  async loadRegisters(): Promise<void> {
    const result = await this.listRegistersUseCase.execute(
      new ListCashRegistersDto({ isActive: true }),
    )
    this.handleResult(result, (items) => {
      this.registers.value = items
    })
    this.registersLoaded.value = true
  }

  async open(dto: OpenCashSessionDto): Promise<boolean> {
    this.opening.value = true
    let ok = false
    const result = await this.openUseCase.execute(dto)
    this.handleResult(
      result,
      (session) => {
        ok = true
        this.current.value = session
        this.toast.success(
          `Caixa aberto — ${session.cashRegisterName ?? 'terminal'}.`,
        )
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível abrir o caixa. Tente novamente.',
        )
      },
    )
    this.opening.value = false
    return ok
  }

  async addMovement(dto: CreateCashMovementDto): Promise<boolean> {
    if (!this.current.value) return false
    this.acting.value = true
    let ok = false
    const result = await this.addMovementUseCase.execute(
      this.current.value.id,
      dto,
    )
    this.handleResult(
      result,
      () => {
        ok = true
        this.toast.success(`${cashMovementTypeLabels[dto.type]} registrada.`)
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível registrar o movimento.',
        )
      },
    )
    // Recarrega a sessão para refletir o novo esperado em gaveta.
    if (ok) await this.loadCurrent()
    this.acting.value = false
    return ok
  }

  /** Fecha o caixa; devolve a sessão fechada (para o relatório) ou null. */
  async close(dto: CloseCashSessionDto): Promise<CashSession | null> {
    if (!this.current.value) return null
    this.acting.value = true
    let closed: CashSession | null = null
    const result = await this.closeUseCase.execute(this.current.value.id, dto)
    this.handleResult(
      result,
      (session) => {
        closed = session
        this.current.value = null
        this.toast.success('Caixa fechado.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível fechar o caixa.',
        )
      },
    )
    this.acting.value = false
    return closed
  }
}
