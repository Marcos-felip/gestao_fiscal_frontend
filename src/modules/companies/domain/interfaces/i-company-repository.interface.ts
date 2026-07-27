import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Company } from '@/modules/companies/domain/entities/company.entity'
import type { UpdateCompanyDto } from '@/modules/companies/domain/dto/update-company-dto'

export interface ICompanyRepository {
  getById(id: string): Promise<Either<DomainError, Company>>
  update(
    id: string,
    dto: UpdateCompanyDto,
  ): Promise<Either<DomainError, Company>>
}
