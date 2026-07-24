import { CompanyRepository } from '@/modules/companies/data/repositories/company-repository'
import { GetCompanyUseCase } from '@/modules/companies/application/use-cases/get-company.use-case'
import { UpdateCompanyUseCase } from '@/modules/companies/application/use-cases/update-company.use-case'
import { CompanyController } from '@/modules/companies/presentation/controllers/company-controller'

export function makeCompanyController(): CompanyController {
  const companyRepository = new CompanyRepository()

  return new CompanyController(
    new GetCompanyUseCase(companyRepository),
    new UpdateCompanyUseCase(companyRepository),
  )
}
