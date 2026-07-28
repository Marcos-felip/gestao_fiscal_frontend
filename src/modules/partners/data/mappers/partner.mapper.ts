import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { Partner } from '@/modules/partners/domain/entities/partner.entity'
import type { PartnerList } from '@/modules/partners/domain/responses/partner-list-response'
import type { PartnerType } from '@/enums/partner-type.enum'
import type { PersonType } from '@/enums/person-type.enum'
import { toIssueList } from '@/core/utils/zod-errors'

const partnerSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  type: z.string(),
  personType: z.string(),
  name: z.string(),
  tradeName: z.string().nullable().default(null),
  cpfCnpj: z.string().nullable().default(null),
  rgIe: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  cep: z.string().nullable().default(null),
  street: z.string().nullable().default(null),
  number: z.string().nullable().default(null),
  complement: z.string().nullable().default(null),
  neighborhood: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
  state: z.string().nullable().default(null),
  isActive: z.boolean().default(true),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
})

type PartnerPayload = z.infer<typeof partnerSchema>

const partnerListSchema = z.object({
  data: z.array(partnerSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

function build(value: PartnerPayload): Partner {
  return new Partner(
    value.id,
    value.companyId,
    value.type as PartnerType,
    value.personType as PersonType,
    value.name,
    value.tradeName,
    value.cpfCnpj,
    value.rgIe,
    value.email,
    value.phone,
    value.cep,
    value.street,
    value.number,
    value.complement,
    value.neighborhood,
    value.city,
    value.state,
    value.isActive,
    value.createdAt,
    value.updatedAt,
  )
}

export function toPartner(data: unknown): Either<DomainError, Partner> {
  const parsed = partnerSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('partners', toIssueList(parsed.error)))
  }

  return Either.right(build(parsed.data))
}

export function toPartnerList(data: unknown): Either<DomainError, PartnerList> {
  const parsed = partnerListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('partners', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right({
    items: value.data.map(build),
    total: value.total,
    page: value.page,
    limit: value.limit,
  })
}
