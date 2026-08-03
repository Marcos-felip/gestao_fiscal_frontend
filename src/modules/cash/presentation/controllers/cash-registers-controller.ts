import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ListCashRegistersUseCase } from '@/modules/cash/application/use-cases/list-cash-registers.use-case'
import type { CreateCashRegisterUseCase } from '@/modules/cash/application/use-cases/create-cash-register.use-case'
import type { UpdateCashRegisterUseCase } from '@/modules/cash/application/use-cases/update-cash-register.use-case'
import type { DeleteCashRegisterUseCase } from '@/modules/cash/application/use-cases/delete-cash-register.use-case'
import type { CashRegister } from '@/modules/cash/domain/entities/cash-register.entity'
import type { CreateCashRegisterDto } from '@/modules/cash/domain/dto/create-cash-register-dto'
import type { UpdateCashRegisterDto } from '@/modules/cash/domain/dto/update-cash-register-dto'
import type { SelectOption } from '@/shared/ui'
import { useToast } from '@/shared/composables'

/** Fornece as opções de estabelecimento (injetado pela factory). */
export type EstablishmentOptionsLoader = () => Promise<
  Either<DomainError, { id: string; name: string }[]>
>

export class CashRegistersController extends BaseController {
  private readonly listUseCase: ListCashRegistersUseCase
  private readonly createUseCase: CreateCashRegisterUseCase
  private readonly updateUseCase: UpdateCashRegisterUseCase
  private readonly deleteUseCase: DeleteCashRegisterUseCase
  private readonly loadEstablishments: EstablishmentOptionsLoader
  private readonly toast = useToast()

  readonly registers = ref<CashRegister[]>([])
  readonly loaded = ref(false)
  readonly saving = ref(false)
  readonly deletingId = ref<string | null>(null)
  readonly establishmentOptions = ref<SelectOption[]>([])

  readonly hasSingleEstablishment = computed(
    () => this.establishmentOptions.value.length === 1,
  )

  constructor(
    listUseCase: ListCashRegistersUseCase,
    createUseCase: CreateCashRegisterUseCase,
    updateUseCase: UpdateCashRegisterUseCase,
    deleteUseCase: DeleteCashRegisterUseCase,
    loadEstablishments: EstablishmentOptionsLoader,
  ) {
    super()
    this.listUseCase = listUseCase
    this.createUseCase = createUseCase
    this.updateUseCase = updateUseCase
    this.deleteUseCase = deleteUseCase
    this.loadEstablishments = loadEstablishments
  }

  async load(): Promise<void> {
    this.setLoading(true)
    const [listResult, estResult] = await Promise.all([
      this.listUseCase.execute(),
      this.loadEstablishments(),
    ])
    this.handleResult(listResult, (items) => {
      this.registers.value = items
    })
    estResult.fold(
      () => {
        this.establishmentOptions.value = []
      },
      (items) => {
        this.establishmentOptions.value = items.map((e) => ({
          value: e.id,
          label: e.name,
        }))
      },
    )
    this.loaded.value = true
    this.setLoading(false)
  }

  async create(dto: CreateCashRegisterDto): Promise<boolean> {
    this.saving.value = true
    let ok = false
    const result = await this.createUseCase.execute(dto)
    this.handleResult(
      result,
      (register) => {
        ok = true
        this.registers.value = [...this.registers.value, register]
        this.toast.success('Caixa cadastrado.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível cadastrar o caixa. Tente novamente.',
        )
      },
    )
    this.saving.value = false
    return ok
  }

  async update(id: string, dto: UpdateCashRegisterDto): Promise<boolean> {
    this.saving.value = true
    let ok = false
    const result = await this.updateUseCase.execute(id, dto)
    this.handleResult(
      result,
      (register) => {
        ok = true
        this.registers.value = this.registers.value.map((r) =>
          r.id === register.id ? register : r,
        )
        this.toast.success('Caixa atualizado.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível atualizar o caixa.',
        )
      },
    )
    this.saving.value = false
    return ok
  }

  async remove(register: CashRegister): Promise<void> {
    this.deletingId.value = register.id
    const result = await this.deleteUseCase.execute(register.id)
    this.handleResult(
      result,
      () => {
        this.registers.value = this.registers.value.filter(
          (r) => r.id !== register.id,
        )
        this.toast.success('Caixa excluído.')
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível excluir o caixa.',
        )
      },
    )
    this.deletingId.value = null
  }
}
