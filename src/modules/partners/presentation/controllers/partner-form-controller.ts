import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetPartnerUseCase } from '@/modules/partners/application/use-cases/get-partner.use-case'
import type { CreatePartnerUseCase } from '@/modules/partners/application/use-cases/create-partner.use-case'
import type { UpdatePartnerUseCase } from '@/modules/partners/application/use-cases/update-partner.use-case'
import { CreatePartnerDto } from '@/modules/partners/domain/dto/create-partner-dto'
import { UpdatePartnerDto } from '@/modules/partners/domain/dto/update-partner-dto'
import type { Partner } from '@/modules/partners/domain/entities/partner.entity'
import type { PartnerFormValues } from '@/modules/partners/presentation/schemas/partner-schema'
import type { PartnerType } from '@/core/enums/partner-type.enum'
import { PersonType } from '@/core/enums/person-type.enum'
import { useToast } from '@/shared/composables'
import {
  formatCpf,
  formatCnpj,
  formatCep,
  formatPhone,
} from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'

function emptyValues(): PartnerFormValues {
  return {
    type: '',
    personType: '',
    name: '',
    tradeName: '',
    cpfCnpj: '',
    rgIe: '',
    email: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  }
}

export class PartnerFormController extends BaseController {
  private readonly getUseCase: GetPartnerUseCase
  private readonly createUseCase: CreatePartnerUseCase
  private readonly updateUseCase: UpdatePartnerUseCase
  private readonly toast = useToast()

  private editingId: string | null = null

  readonly values = ref<PartnerFormValues>(emptyValues())
  readonly loaded = ref(false)

  constructor(
    getUseCase: GetPartnerUseCase,
    createUseCase: CreatePartnerUseCase,
    updateUseCase: UpdatePartnerUseCase,
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
    this.handleResult(result, (partner) => {
      this.values.value = this.toValues(partner)
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async save(input: PartnerFormValues): Promise<void> {
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
          ? 'Parceiro atualizado com sucesso.'
          : 'Parceiro criado com sucesso.',
      )
      this.router.push({ name: routeNames.PARTNERS })
    })
    this.setLoading(false)
  }

  private optionalFields(input: PartnerFormValues) {
    return {
      tradeName: input.tradeName || undefined,
      cpfCnpj: input.cpfCnpj || undefined,
      rgIe: input.rgIe || undefined,
      email: input.email || undefined,
      phone: input.phone || undefined,
      cep: input.cep || undefined,
      street: input.street || undefined,
      number: input.number || undefined,
      complement: input.complement || undefined,
      neighborhood: input.neighborhood || undefined,
      city: input.city || undefined,
      state: input.state || undefined,
    }
  }

  private toCreateDto(input: PartnerFormValues): CreatePartnerDto {
    return new CreatePartnerDto({
      type: input.type as PartnerType,
      personType: input.personType as PersonType,
      name: input.name,
      ...this.optionalFields(input),
    })
  }

  private toUpdateDto(input: PartnerFormValues): UpdatePartnerDto {
    return new UpdatePartnerDto({
      type: (input.type || undefined) as PartnerType | undefined,
      personType: (input.personType || undefined) as PersonType | undefined,
      name: input.name || undefined,
      ...this.optionalFields(input),
    })
  }

  private toValues(p: Partner): PartnerFormValues {
    const cpfCnpj = p.cpfCnpj
      ? p.personType === PersonType.PF
        ? formatCpf(p.cpfCnpj)
        : formatCnpj(p.cpfCnpj)
      : ''
    return {
      type: p.type ?? '',
      personType: p.personType ?? '',
      name: p.name ?? '',
      tradeName: p.tradeName ?? '',
      cpfCnpj,
      rgIe: p.rgIe ?? '',
      email: p.email ?? '',
      phone: p.phone ? formatPhone(p.phone) : '',
      cep: p.cep ? formatCep(p.cep) : '',
      street: p.street ?? '',
      number: p.number ?? '',
      complement: p.complement ?? '',
      neighborhood: p.neighborhood ?? '',
      city: p.city ?? '',
      state: p.state ?? '',
    }
  }
}
