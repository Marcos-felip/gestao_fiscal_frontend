import type { ICompanyRepository } from '@/modules/companies/domain/interfaces/i-company-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Company } from '@/modules/companies/domain/entities/company.entity'

export class ListCompaniesUseCase {
  private readonly repository: ICompanyRepository

  constructor(repository: ICompanyRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, Company[]>> {
    return this.repository.list()
  }
}
