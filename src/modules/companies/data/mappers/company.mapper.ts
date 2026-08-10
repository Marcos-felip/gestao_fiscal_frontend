import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { Company } from '@/modules/companies/domain/entities/company.entity'
import type { CompanyType } from '@/core/enums/company-type.enum'
import type { TaxRegime } from '@/core/enums/tax-regime.enum'
import type { TaxRegimeCode } from '@/core/enums/tax-regime-code.enum'
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
  razaoSocial: z.string().nullable().default(null),
  nomeFantasia: z.string().nullable().default(null),
  inscricaoEstadual: z.string().nullable().default(null),
  inscricaoMunicipal: z.string().nullable().default(null),
  crt: z.string().nullable().default(null),
  contribuinteIcms: z.boolean().default(false),
  codigoIbgeMunicipio: z.string().nullable().default(null),
  telefoneFiscal: z.string().nullable().default(null),
  emailFiscal: z.string().nullable().default(null),
  fiscalConfigComplete: z.boolean().default(false),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
})

type CompanyPayload = z.infer<typeof companySchema>

function build(value: CompanyPayload): Company {
  return new Company(
    value.id,
    value.name,
    value.type as CompanyType | null,
    value.cnpj,
    value.stateRegistration,
    value.phone,
    value.taxRegime as TaxRegime | null,
    value.businessSegment,
    value.isOnboarded,
    value.razaoSocial,
    value.nomeFantasia,
    value.inscricaoEstadual,
    value.inscricaoMunicipal,
    value.crt as TaxRegimeCode | null,
    value.contribuinteIcms,
    value.codigoIbgeMunicipio,
    value.telefoneFiscal,
    value.emailFiscal,
    value.fiscalConfigComplete,
    value.createdAt,
    value.updatedAt,
  )
}

export function toCompany(data: unknown): Either<DomainError, Company> {
  const parsed = companySchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('companies', toIssueList(parsed.error)),
    )
  }

  return Either.right(build(parsed.data))
}

/** `GET /companies` devolve um array simples (sem envelope de paginação). */
export function toCompanyList(data: unknown): Either<DomainError, Company[]> {
  const parsed = z.array(companySchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('companies', toIssueList(parsed.error)),
    )
  }

  return Either.right(parsed.data.map(build))
}

/** `POST /companies` devolve `{ company, membership }`; extrai a empresa. */
export function toCreatedCompany(data: unknown): Either<DomainError, Company> {
  const envelope = z.object({ company: companySchema }).safeParse(data)

  if (!envelope.success) {
    return Either.left(
      new ContractError('companies', toIssueList(envelope.error)),
    )
  }

  return Either.right(build(envelope.data.company))
}
