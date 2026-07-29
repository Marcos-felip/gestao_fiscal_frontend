import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { SetActiveCompanyUseCase } from '@/modules/account/application/use-cases/set-active-company.use-case'
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { usePermissionsStore } from '@/modules/permissions/presentation/stores/permissions-store'
import { useCompaniesStore } from '@/modules/companies/presentation/stores/companies-store'
import { useToast } from '@/shared/composables'
import { routeNames } from '@/router/route-names'

export class CompanySwitcherController extends BaseController {
  private readonly setActiveUseCase: SetActiveCompanyUseCase
  private readonly authStore = useAuthStore()
  private readonly permissionsStore = usePermissionsStore()
  private readonly companiesStore = useCompaniesStore()
  private readonly toast = useToast()

  readonly switchingId = ref<string | null>(null)

  constructor(setActiveUseCase: SetActiveCompanyUseCase) {
    super()
    this.setActiveUseCase = setActiveUseCase
  }

  async switchTo(companyId: string): Promise<void> {
    const current = this.authStore.user
    if (!current || current.companyActiveId === companyId) return

    this.switchingId.value = companyId
    const result = await this.setActiveUseCase.execute(companyId)
    this.handleResult(result, async (profile) => {
      this.authStore.setUser(
        new AuthUser(
          current.id,
          current.name,
          current.email,
          profile.companyActiveId,
          current.role,
          current.forcePasswordChange,
        ),
      )
      await Promise.all([
        this.permissionsStore.load(),
        this.companiesStore.load(),
      ])
      const name = this.companiesStore.companies.find(
        (c) => c.id === companyId,
      )?.name
      this.toast.success(
        name ? `Empresa ativa: ${name}.` : 'Empresa alterada.',
      )
      this.router.push({ name: routeNames.DASHBOARD })
    })
    this.switchingId.value = null
  }
}
