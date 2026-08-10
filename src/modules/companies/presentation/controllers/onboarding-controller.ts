import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { CreateCompanyUseCase } from '@/modules/companies/application/use-cases/create-company.use-case'
import type { OnboardCompanyUseCase } from '@/modules/companies/application/use-cases/onboard-company.use-case'
import { CreateCompanyDto } from '@/modules/companies/domain/dto/create-company-dto'
import { OnboardCompanyDto } from '@/modules/companies/domain/dto/onboard-company-dto'
import type { OnboardingFormValues } from '@/modules/companies/presentation/schemas/onboarding-schema'
import type { CompanyType } from '@/core/enums/company-type.enum'
import type { TaxRegime } from '@/core/enums/tax-regime.enum'
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { usePermissionsStore } from '@/modules/permissions/presentation/stores/permissions-store'
import { useCompaniesStore } from '@/modules/companies/presentation/stores/companies-store'
import { useToast } from '@/shared/composables'
import { routeNames } from '@/router/route-names'

export class OnboardingController extends BaseController {
  private readonly createUseCase: CreateCompanyUseCase
  private readonly onboardUseCase: OnboardCompanyUseCase
  private readonly authStore = useAuthStore()
  private readonly permissionsStore = usePermissionsStore()
  private readonly companiesStore = useCompaniesStore()
  private readonly toast = useToast()

  readonly loaded = ref(false)

  readonly needsCompanyCreation = computed(
    () => !this.authStore.user?.companyActiveId,
  )

  constructor(
    createUseCase: CreateCompanyUseCase,
    onboardUseCase: OnboardCompanyUseCase,
  ) {
    super()
    this.createUseCase = createUseCase
    this.onboardUseCase = onboardUseCase
  }

  async prepare(): Promise<void> {
    await this.companiesStore.ensureLoaded()
    this.loaded.value = true
  }

  get existingCompanyName(): string {
    return this.companiesStore.activeCompany?.name ?? ''
  }

  async save(values: OnboardingFormValues): Promise<void> {
    this.setLoading(true)
    this.clearError()

    if (this.needsCompanyCreation.value) {
      const created = await this.createUseCase.execute(
        new CreateCompanyDto({
          name: values.name,
          type: (values.type || undefined) as CompanyType | undefined,
        }),
      )
      if (created.isLeft) {
        this.handleResult(created, () => undefined)
        this.setLoading(false)
        return
      }
      const company = created.right
      const current = this.authStore.user
      if (current) {
        this.authStore.setUser(
          new AuthUser(
            current.id,
            current.name,
            current.email,
            company.id,
            'OWNER',
            current.forcePasswordChange,
          ),
        )
      }
      await Promise.all([
        this.permissionsStore.load(),
        this.companiesStore.load(),
      ])
    }

    const result = await this.onboardUseCase.execute(
      new OnboardCompanyDto({
        cnpj: values.cnpj,
        taxRegime: values.taxRegime as TaxRegime,
        establishmentName: values.establishmentName,
        phone: values.phone || undefined,
        inscricaoEstadual: values.inscricaoEstadual || undefined,
        inscricaoMunicipal: values.inscricaoMunicipal || undefined,
        cep: values.cep || undefined,
        street: values.street || undefined,
        number: values.number || undefined,
        complement: values.complement || undefined,
        neighborhood: values.neighborhood || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
      }),
    )

    this.handleResult(result, async () => {
      await Promise.all([
        this.companiesStore.load(),
        this.permissionsStore.load(),
      ])
      this.toast.success('Empresa configurada com sucesso.')
      this.router.push({ name: routeNames.DASHBOARD })
    })
    this.setLoading(false)
  }
}
