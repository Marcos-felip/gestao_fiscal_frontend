import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetEstablishmentUseCase } from '@/modules/establishments/application/use-cases/get-establishment.use-case'
import type { CreateEstablishmentUseCase } from '@/modules/establishments/application/use-cases/create-establishment.use-case'
import type { UpdateEstablishmentUseCase } from '@/modules/establishments/application/use-cases/update-establishment.use-case'
import { CreateEstablishmentDto } from '@/modules/establishments/domain/dto/create-establishment-dto'
import { UpdateEstablishmentDto } from '@/modules/establishments/domain/dto/update-establishment-dto'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import type { EstablishmentFormValues } from '@/modules/establishments/presentation/schemas/establishment-schema'
import type { EstablishmentType } from '@/enums/establishment-type.enum'
import { useToast } from '@/shared/composables'
import { formatCnpj, formatCep } from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'

function emptyValues(): EstablishmentFormValues {
  return {
    name: '',
    // A matriz é gerida na página de Empresa; este formulário cria/edita
    // apenas filiais, então o tipo é sempre FILIAL.
    type: 'FILIAL',
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  }
}

export class EstablishmentFormController extends BaseController {
  private readonly getUseCase: GetEstablishmentUseCase
  private readonly createUseCase: CreateEstablishmentUseCase
  private readonly updateUseCase: UpdateEstablishmentUseCase
  private readonly toast = useToast()

  private editingId: string | null = null

  readonly values = ref<EstablishmentFormValues>(emptyValues())
  readonly loaded = ref(false)

  constructor(
    getUseCase: GetEstablishmentUseCase,
    createUseCase: CreateEstablishmentUseCase,
    updateUseCase: UpdateEstablishmentUseCase,
  ) {
    super()
    this.getUseCase = getUseCase
    this.createUseCase = createUseCase
    this.updateUseCase = updateUseCase
  }

  get isEditing(): boolean {
    return this.editingId !== null
  }

  prepareCreate(): void {
    this.editingId = null
    this.values.value = emptyValues()
    this.loaded.value = true
  }

  async loadForEdit(id: string): Promise<void> {
    this.editingId = id
    this.setLoading(true)
    const result = await this.getUseCase.execute(id)
    this.handleResult(result, (establishment) => {
      // A matriz é editada na página de Empresa. Se alguém acessar a URL de
      // edição da matriz diretamente, redireciona para o lugar correto.
      if (establishment.isMatriz) {
        this.toast.info('A sede (matriz) é gerenciada na página de Empresa.')
        this.router.push({ name: routeNames.COMPANY })
        return
      }
      this.values.value = this.toValues(establishment)
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async save(input: EstablishmentFormValues): Promise<void> {
    this.setLoading(true)
    const result = this.editingId
      ? await this.updateUseCase.execute(
          this.editingId,
          this.toUpdateDto(input),
        )
      : await this.createUseCase.execute(this.toCreateDto(input))

    this.handleResult(result, () => {
      this.toast.success(
        this.editingId
          ? 'Filial atualizada com sucesso.'
          : 'Filial criada com sucesso.',
      )
      this.router.push({ name: routeNames.ESTABLISHMENTS })
    })
    this.setLoading(false)
  }

  private optionalFields(input: EstablishmentFormValues) {
    return {
      cnpj: input.cnpj || undefined,
      inscricaoEstadual: input.inscricaoEstadual || undefined,
      inscricaoMunicipal: input.inscricaoMunicipal || undefined,
      cep: input.cep || undefined,
      street: input.street || undefined,
      number: input.number || undefined,
      complement: input.complement || undefined,
      neighborhood: input.neighborhood || undefined,
      city: input.city || undefined,
      state: input.state || undefined,
    }
  }

  private toCreateDto(input: EstablishmentFormValues): CreateEstablishmentDto {
    return new CreateEstablishmentDto({
      name: input.name,
      type: input.type as EstablishmentType,
      ...this.optionalFields(input),
    })
  }

  private toUpdateDto(input: EstablishmentFormValues): UpdateEstablishmentDto {
    return new UpdateEstablishmentDto({
      name: input.name || undefined,
      type: (input.type || undefined) as EstablishmentType | undefined,
      ...this.optionalFields(input),
    })
  }

  private toValues(e: Establishment): EstablishmentFormValues {
    return {
      name: e.name ?? '',
      type: e.type ?? '',
      cnpj: e.cnpj ? formatCnpj(e.cnpj) : '',
      inscricaoEstadual: e.inscricaoEstadual ?? '',
      inscricaoMunicipal: e.inscricaoMunicipal ?? '',
      cep: e.cep ? formatCep(e.cep) : '',
      street: e.street ?? '',
      number: e.number ?? '',
      complement: e.complement ?? '',
      neighborhood: e.neighborhood ?? '',
      city: e.city ?? '',
      state: e.state ?? '',
    }
  }
}
