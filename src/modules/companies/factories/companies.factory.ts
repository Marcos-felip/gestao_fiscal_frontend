import { CompanyRepository } from '@/modules/companies/data/repositories/company-repository'
import { GetCompanyUseCase } from '@/modules/companies/application/use-cases/get-company.use-case'
import { UpdateCompanyUseCase } from '@/modules/companies/application/use-cases/update-company.use-case'
import { ListCompaniesUseCase } from '@/modules/companies/application/use-cases/list-companies.use-case'
import { CreateCompanyUseCase } from '@/modules/companies/application/use-cases/create-company.use-case'
import { OnboardCompanyUseCase } from '@/modules/companies/application/use-cases/onboard-company.use-case'
import { CompanyController } from '@/modules/companies/presentation/controllers/company-controller'
import { CompanySwitcherController } from '@/modules/companies/presentation/controllers/company-switcher-controller'
import { OnboardingController } from '@/modules/companies/presentation/controllers/onboarding-controller'
import { EstablishmentRepository } from '@/modules/establishments/data/repositories/establishment-repository'
import { ListEstablishmentsUseCase } from '@/modules/establishments/application/use-cases/list-establishments.use-case'
import { UpdateEstablishmentUseCase } from '@/modules/establishments/application/use-cases/update-establishment.use-case'
import { makeSetActiveCompanyUseCase } from '@/modules/account/factories/account.factory'

/**
 * A página de Empresa também governa a sede (estabelecimento MATRIZ): por isso
 * a factory costura, além das use-cases de empresa, as de estabelecimento
 * necessárias para carregar e atualizar a matriz num único fluxo.
 */
export function makeCompanyController(): CompanyController {
  const companyRepository = new CompanyRepository()
  const establishmentRepository = new EstablishmentRepository()

  return new CompanyController(
    new GetCompanyUseCase(companyRepository),
    new UpdateCompanyUseCase(companyRepository),
    new ListEstablishmentsUseCase(establishmentRepository),
    new UpdateEstablishmentUseCase(establishmentRepository),
  )
}

/** Usado pelo `companiesStore` para listar as empresas do usuário. */
export function makeListCompaniesUseCase(): ListCompaniesUseCase {
  return new ListCompaniesUseCase(new CompanyRepository())
}

export function makeCompanySwitcherController(): CompanySwitcherController {
  return new CompanySwitcherController(makeSetActiveCompanyUseCase())
}

export function makeOnboardingController(): OnboardingController {
  const repository = new CompanyRepository()

  return new OnboardingController(
    new CreateCompanyUseCase(repository),
    new OnboardCompanyUseCase(repository),
  )
}
