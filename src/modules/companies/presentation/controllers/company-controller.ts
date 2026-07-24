import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetCompanyUseCase } from '@/modules/companies/application/use-cases/get-company.use-case'
import type { UpdateCompanyUseCase } from '@/modules/companies/application/use-cases/update-company.use-case'
import { UpdateCompanyDto } from '@/modules/companies/domain/dto/update-company-dto'
import type { Company } from '@/modules/companies/domain/entities/company.entity'
import type { CompanyFormValues } from '@/modules/companies/presentation/schemas/company-schema'
import type { CompanyType } from '@/enums/company-type.enum'
import type { TaxRegime } from '@/enums/tax-regime.enum'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { StorageService } from '@/core/utils/storage'
import { useToast } from '@/shared/composables'
import { formatCnpj, formatPhone } from '@/shared/ui/utils/masks'

export class CompanyController extends BaseController {
  private readonly getCompanyUseCase: GetCompanyUseCase
  private readonly updateCompanyUseCase: UpdateCompanyUseCase

  private readonly authStore = useAuthStore()
  private readonly toast = useToast()
  private readonly companyId: string | null

  readonly values = ref<CompanyFormValues>({
    name: '',
    type: '',
    cnpj: '',
    stateRegistration: '',
    phone: '',
    taxRegime: '',
  })

  readonly loaded = ref(false)

  constructor(
    getCompanyUseCase: GetCompanyUseCase,
    updateCompanyUseCase: UpdateCompanyUseCase,
  ) {
    super()
    this.getCompanyUseCase = getCompanyUseCase
    this.updateCompanyUseCase = updateCompanyUseCase
    this.companyId =
      this.authStore.user?.companyActiveId ??
      StorageService.getActiveCompanyId()
  }

  async loadCompany(): Promise<void> {
    if (!this.companyId) {
      this.setError('Nenhuma empresa ativa selecionada.')
      this.loaded.value = true
      return
    }

    this.setLoading(true)
    const result = await this.getCompanyUseCase.execute(this.companyId)
    this.handleResult(result, (company) => this.applyCompany(company))
    this.loaded.value = true
    this.setLoading(false)
  }

  async save(input: CompanyFormValues): Promise<void> {
    if (!this.companyId) {
      this.setError('Nenhuma empresa ativa selecionada.')
      return
    }

    this.setLoading(true)
    const dto = new UpdateCompanyDto({
      name: input.name || undefined,
      type: (input.type || undefined) as CompanyType | undefined,
      cnpj: input.cnpj || undefined,
      stateRegistration: input.stateRegistration || undefined,
      phone: input.phone || undefined,
      taxRegime: (input.taxRegime || undefined) as TaxRegime | undefined,
    })

    const result = await this.updateCompanyUseCase.execute(this.companyId, dto)
    this.handleResult(result, (company) => {
      this.applyCompany(company)
      this.toast.success('Empresa atualizada com sucesso.')
    })
    this.setLoading(false)
  }

  /** Popula os campos a partir da entidade, aplicando máscara para exibição. */
  private applyCompany(company: Company): void {
    this.values.value = {
      name: company.name ?? '',
      type: company.type ?? '',
      cnpj: company.cnpj ? formatCnpj(company.cnpj) : '',
      stateRegistration: company.stateRegistration ?? '',
      phone: company.phone ? formatPhone(company.phone) : '',
      taxRegime: company.taxRegime ?? '',
    }
  }
}
