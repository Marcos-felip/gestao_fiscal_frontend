import type { ICompanyRepository } from '@/modules/companies/domain/interfaces/i-company-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Company } from '@/modules/companies/domain/entities/company.entity'
import type { OnboardCompanyDto } from '@/modules/companies/domain/dto/onboard-company-dto'

export class OnboardCompanyUseCase {
  private readonly repository: ICompanyRepository

  constructor(repository: ICompanyRepository) {
    this.repository = repository
  }

  async execute(dto: OnboardCompanyDto): Promise<Either<DomainError, Company>> {
    return this.repository.onboard(dto)
  }
}
