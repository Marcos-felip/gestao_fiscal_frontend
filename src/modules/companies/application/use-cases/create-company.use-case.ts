import type { ICompanyRepository } from '@/modules/companies/domain/interfaces/i-company-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Company } from '@/modules/companies/domain/entities/company.entity'
import type { CreateCompanyDto } from '@/modules/companies/domain/dto/create-company-dto'

export class CreateCompanyUseCase {
  private readonly repository: ICompanyRepository

  constructor(repository: ICompanyRepository) {
    this.repository = repository
  }

  async execute(dto: CreateCompanyDto): Promise<Either<DomainError, Company>> {
    return this.repository.create(dto)
  }
}
