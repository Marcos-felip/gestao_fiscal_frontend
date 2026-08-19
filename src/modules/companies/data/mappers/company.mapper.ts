import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { Company } from '@/modules/companies/domain/entities/company.entity'
import { CompanyType } from '@/core/enums/company-type.enum'
import { TaxRegime } from '@/core/enums/tax-regime.enum'
import { TaxRegimeCode } from '@/core/enums/tax-regime-code.enum'
import { toIssueList } from '@/core/utils/zod-errors'

/**
 * Campos que toda resposta de empresa traz.
 *
 * `stateRegistration` fica de fora de propósito: ele é derivado da IE da matriz
 * e só existe onde o backend faz esse join — no detalhe e na atualização. A
 * listagem e a criação devolvem a empresa crua.
 */
const companyBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(CompanyType).nullable().default(null),
  cnpj: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  taxRegime: z.nativeEnum(TaxRegime).nullable().default(null),
  businessSegment: z.string().nullable().default(null),
  isOnboarded: z.boolean().default(false),
  razaoSocial: z.string().nullable().default(null),
  nomeFantasia: z.string().nullable().default(null),
  inscricaoEstadual: z.string().nullable().default(null),
  inscricaoMunicipal: z.string().nullable().default(null),
  crt: z.nativeEnum(TaxRegimeCode).nullable().default(null),
  contribuinteIcms: z.boolean().default(false),
  codigoIbgeMunicipio: z.string().nullable().default(null),
  telefoneFiscal: z.string().nullable().default(null),
  emailFiscal: z.string().nullable().default(null),
  fiscalConfigComplete: z.boolean().default(false),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
})

/**
 * Detalhe da empresa (`GET /companies/:id`) e resposta do `PATCH`.
 *
 * Aqui `stateRegistration` é **obrigatório e sem default**: é a IE do emitente
 * da NFC-e, e um `.default(null)` transformaria contrato quebrado em `null`
 * válido e silencioso — foi assim que o campo sumiu da tela sem ninguém ver.
 */
const companySchema = companyBaseSchema.extend({
  stateRegistration: z.string().nullable(),
})

type CompanyPayload = z.infer<typeof companyBaseSchema> & {
  stateRegistration?: string | null
}

function build(value: CompanyPayload): Company {
  return new Company(
    value.id,
    value.name,
    value.type,
    value.cnpj,
    value.stateRegistration ?? null,
    value.phone,
    value.taxRegime,
    value.businessSegment,
    value.isOnboarded,
    value.razaoSocial,
    value.nomeFantasia,
    value.inscricaoEstadual,
    value.inscricaoMunicipal,
    value.crt,
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

/**
 * `GET /companies` devolve um array simples (sem envelope de paginação).
 *
 * Usa o schema base: a listagem não carrega a matriz de cada empresa só para
 * expor uma IE que a lista nem exibe, então `stateRegistration` não vem aqui.
 */
export function toCompanyList(data: unknown): Either<DomainError, Company[]> {
  const parsed = z.array(companyBaseSchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('companies', toIssueList(parsed.error)),
    )
  }

  return Either.right(parsed.data.map(build))
}

/**
 * `POST /companies` devolve `{ company, membership }`; extrai a empresa.
 *
 * Schema base: a empresa acabou de nascer e ainda não tem matriz, então não há
 * IE de emitente para derivar.
 */
export function toCreatedCompany(data: unknown): Either<DomainError, Company> {
  const envelope = z.object({ company: companyBaseSchema }).safeParse(data)

  if (!envelope.success) {
    return Either.left(
      new ContractError('companies', toIssueList(envelope.error)),
    )
  }

  return Either.right(build(envelope.data.company))
}
