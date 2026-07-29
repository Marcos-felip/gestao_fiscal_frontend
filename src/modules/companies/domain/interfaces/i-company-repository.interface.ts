import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Company } from '@/modules/companies/domain/entities/company.entity'
import type { UpdateCompanyDto } from '@/modules/companies/domain/dto/update-company-dto'
import type { CreateCompanyDto } from '@/modules/companies/domain/dto/create-company-dto'
import type { OnboardCompanyDto } from '@/modules/companies/domain/dto/onboard-company-dto'

export interface ICompanyRepository {
  list(): Promise<Either<DomainError, Company[]>>
  getById(id: string): Promise<Either<DomainError, Company>>
  create(dto: CreateCompanyDto): Promise<Either<DomainError, Company>>
  onboard(dto: OnboardCompanyDto): Promise<Either<DomainError, Company>>
  update(
    id: string,
    dto: UpdateCompanyDto,
  ): Promise<Either<DomainError, Company>>
}
