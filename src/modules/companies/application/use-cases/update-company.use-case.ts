import type { ICompanyRepository } from '@/modules/companies/domain/interfaces/i-company-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Company } from '@/modules/companies/domain/entities/company.entity'
import type { UpdateCompanyDto } from '@/modules/companies/domain/dto/update-company-dto'

export class UpdateCompanyUseCase {
  private readonly companyRepository: ICompanyRepository

  constructor(companyRepository: ICompanyRepository) {
    this.companyRepository = companyRepository
  }

  async execute(
    id: string,
    dto: UpdateCompanyDto,
  ): Promise<Either<DomainError, Company>> {
    return this.companyRepository.update(id, dto)
  }
}
