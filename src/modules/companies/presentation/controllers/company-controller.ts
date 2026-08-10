import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetCompanyUseCase } from '@/modules/companies/application/use-cases/get-company.use-case'
import type { UpdateCompanyUseCase } from '@/modules/companies/application/use-cases/update-company.use-case'
import { UpdateCompanyDto } from '@/modules/companies/domain/dto/update-company-dto'
import type { Company } from '@/modules/companies/domain/entities/company.entity'
import type {
  CompanyFormValues,
  SedeFormValues,
} from '@/modules/companies/presentation/schemas/company-schema'
import type { CompanyType } from '@/core/enums/company-type.enum'
import type { TaxRegime } from '@/core/enums/tax-regime.enum'
import type { TaxRegimeCode } from '@/core/enums/tax-regime-code.enum'
import type { ListEstablishmentsUseCase } from '@/modules/establishments/application/use-cases/list-establishments.use-case'
import type { UpdateEstablishmentUseCase } from '@/modules/establishments/application/use-cases/update-establishment.use-case'
import { UpdateEstablishmentDto } from '@/modules/establishments/domain/dto/update-establishment-dto'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { StorageService } from '@/core/utils/storage'
import { useToast } from '@/shared/composables'
import { formatCnpj, formatPhone, formatCep } from '@/shared/ui/utils/masks'

function emptySede(): SedeFormValues {
  return {
    name: '',
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

/**
 * Controla a página de Empresa, que unifica a pessoa jurídica com a sua sede
 * (estabelecimento MATRIZ). Carrega e salva as duas entidades num só fluxo:
 * CNPJ e Inscrição Estadual vivem na empresa (fonte única) e são propagados
 * para a matriz ao salvar, evitando divergência entre os dois cadastros.
 */
export class CompanyController extends BaseController {
  private readonly getCompanyUseCase: GetCompanyUseCase
  private readonly updateCompanyUseCase: UpdateCompanyUseCase
  private readonly listEstablishmentsUseCase: ListEstablishmentsUseCase
  private readonly updateEstablishmentUseCase: UpdateEstablishmentUseCase

  private readonly authStore = useAuthStore()
  private readonly toast = useToast()
  private readonly companyId: string | null
  private matrizId: string | null = null

  readonly values = ref<CompanyFormValues>({
    name: '',
    type: '',
    cnpj: '',
    stateRegistration: '',
    phone: '',
    taxRegime: '',
    razaoSocial: '',
    nomeFantasia: '',
    crt: '',
    contribuinteIcms: false,
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    codigoIbgeMunicipio: '',
    telefoneFiscal: '',
    emailFiscal: '',
  })

  readonly sede = ref<SedeFormValues>(emptySede())
  readonly hasMatriz = ref(false)
  readonly loaded = ref(false)
  readonly fiscalConfigComplete = ref(false)

  constructor(
    getCompanyUseCase: GetCompanyUseCase,
    updateCompanyUseCase: UpdateCompanyUseCase,
    listEstablishmentsUseCase: ListEstablishmentsUseCase,
    updateEstablishmentUseCase: UpdateEstablishmentUseCase,
  ) {
    super()
    this.getCompanyUseCase = getCompanyUseCase
    this.updateCompanyUseCase = updateCompanyUseCase
    this.listEstablishmentsUseCase = listEstablishmentsUseCase
    this.updateEstablishmentUseCase = updateEstablishmentUseCase
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
    await this.loadMatriz()
    this.loaded.value = true
    this.setLoading(false)
  }

  async save(input: {
    company: CompanyFormValues
    sede: SedeFormValues
  }): Promise<void> {
    if (!this.companyId) {
      this.setError('Nenhuma empresa ativa selecionada.')
      return
    }

    this.setLoading(true)

    const companyDto = new UpdateCompanyDto({
      name: input.company.name || undefined,
      type: (input.company.type || undefined) as CompanyType | undefined,
      cnpj: input.company.cnpj || undefined,
      stateRegistration: input.company.stateRegistration || undefined,
      phone: input.company.phone || undefined,
      taxRegime: (input.company.taxRegime || undefined) as
        | TaxRegime
        | undefined,
      razaoSocial: input.company.razaoSocial || undefined,
      nomeFantasia: input.company.nomeFantasia || undefined,
      crt: (input.company.crt || undefined) as TaxRegimeCode | undefined,
      contribuinteIcms: input.company.contribuinteIcms,
      inscricaoEstadual: input.company.inscricaoEstadual || undefined,
      inscricaoMunicipal: input.company.inscricaoMunicipal || undefined,
      codigoIbgeMunicipio: input.company.codigoIbgeMunicipio || undefined,
      telefoneFiscal: input.company.telefoneFiscal || undefined,
      emailFiscal: input.company.emailFiscal || undefined,
    })

    const companyResult = await this.updateCompanyUseCase.execute(
      this.companyId,
      companyDto,
    )
    if (companyResult.isLeft) {
      this.handleResult(companyResult, () => undefined)
      this.setLoading(false)
      return
    }
    this.applyCompany(companyResult.right)

    // Propaga os dados da sede para a matriz. CNPJ e IE vêm da empresa para
    // manter os dois cadastros consistentes (fonte única).
    if (this.matrizId) {
      const sedeDto = new UpdateEstablishmentDto({
        name: input.sede.name || undefined,
        cnpj: input.company.cnpj || undefined,
        inscricaoEstadual: input.company.stateRegistration || undefined,
        inscricaoMunicipal: input.sede.inscricaoMunicipal || undefined,
        cep: input.sede.cep || undefined,
        street: input.sede.street || undefined,
        number: input.sede.number || undefined,
        complement: input.sede.complement || undefined,
        neighborhood: input.sede.neighborhood || undefined,
        city: input.sede.city || undefined,
        state: input.sede.state || undefined,
      })

      const sedeResult = await this.updateEstablishmentUseCase.execute(
        this.matrizId,
        sedeDto,
      )
      if (sedeResult.isLeft) {
        this.handleResult(sedeResult, () => undefined)
        this.setLoading(false)
        return
      }
      this.applySede(sedeResult.right)
    }

    this.clearError()
    this.toast.success('Dados da empresa e da sede atualizados com sucesso.')
    this.setLoading(false)
  }

  /** Busca a matriz para preencher a seção "Sede". Falha silenciosa: sem
   * matriz (ex.: empresa não configurada), a seção fica indisponível. */
  private async loadMatriz(): Promise<void> {
    const result = await this.listEstablishmentsUseCase.execute()
    if (result.isLeft) return

    const matriz = result.right.find((e) => e.isMatriz) ?? null
    if (!matriz) return

    this.matrizId = matriz.id
    this.hasMatriz.value = true
    this.applySede(matriz)
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
      razaoSocial: company.razaoSocial ?? '',
      nomeFantasia: company.nomeFantasia ?? '',
      crt: company.crt ?? '',
      contribuinteIcms: company.contribuinteIcms,
      inscricaoEstadual: company.inscricaoEstadual ?? '',
      inscricaoMunicipal: company.inscricaoMunicipal ?? '',
      codigoIbgeMunicipio: company.codigoIbgeMunicipio ?? '',
      telefoneFiscal: company.telefoneFiscal
        ? formatPhone(company.telefoneFiscal)
        : '',
      emailFiscal: company.emailFiscal ?? '',
    }
    this.fiscalConfigComplete.value = company.fiscalConfigComplete
  }

  private applySede(matriz: Establishment): void {
    this.sede.value = {
      name: matriz.name ?? '',
      inscricaoMunicipal: matriz.inscricaoMunicipal ?? '',
      cep: matriz.cep ? formatCep(matriz.cep) : '',
      street: matriz.street ?? '',
      number: matriz.number ?? '',
      complement: matriz.complement ?? '',
      neighborhood: matriz.neighborhood ?? '',
      city: matriz.city ?? '',
      state: matriz.state ?? '',
    }
  }
}
