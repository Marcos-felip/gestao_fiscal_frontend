import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListEstablishmentsUseCase } from '@/modules/establishments/application/use-cases/list-establishments.use-case'
import type { DeleteEstablishmentUseCase } from '@/modules/establishments/application/use-cases/delete-establishment.use-case'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import { useToast } from '@/shared/composables'

export class EstablishmentsListController extends BaseController {
  private readonly listUseCase: ListEstablishmentsUseCase
  private readonly deleteUseCase: DeleteEstablishmentUseCase
  private readonly toast = useToast()

  readonly establishments = ref<Establishment[]>([])
  readonly loaded = ref(false)
  readonly deletingId = ref<string | null>(null)

  constructor(
    listUseCase: ListEstablishmentsUseCase,
    deleteUseCase: DeleteEstablishmentUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.deleteUseCase = deleteUseCase
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const result = await this.listUseCase.execute()
    this.handleResult(result, (items) => {
      this.establishments.value = items
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async remove(establishment: Establishment): Promise<void> {
    this.deletingId.value = establishment.id
    this.setLoading(true)
    const result = await this.deleteUseCase.execute(establishment.id)
    this.handleResult(result, () => {
      this.establishments.value = this.establishments.value.filter(
        (e) => e.id !== establishment.id,
      )
      this.toast.success('Estabelecimento excluído.')
    })
    this.setLoading(false)
    this.deletingId.value = null
  }
}
