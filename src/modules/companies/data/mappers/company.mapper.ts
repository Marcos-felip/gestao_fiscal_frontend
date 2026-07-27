import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { Company } from '@/modules/companies/domain/entities/company.entity'
import type { CompanyType } from '@/enums/company-type.enum'
import type { TaxRegime } from '@/enums/tax-regime.enum'
import { toIssueList } from '@/core/utils/zod-errors'

const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().nullable().default(null),
  cnpj: z.string().nullable().default(null),
  stateRegistration: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  taxRegime: z.string().nullable().default(null),
  businessSegment: z.string().nullable().default(null),
  isOnboarded: z.boolean().default(false),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
})

export function toCompany(data: unknown): Either<DomainError, Company> {
  const parsed = companySchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('companies', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right(
    new Company(
      value.id,
      value.name,
      value.type as CompanyType | null,
      value.cnpj,
      value.stateRegistration,
      value.phone,
      value.taxRegime as TaxRegime | null,
      value.businessSegment,
      value.isOnboarded,
      value.createdAt,
      value.updatedAt,
    ),
  )
}
