import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import type {
  ProductFiscalPending,
  ProductFiscalPendingList,
} from '@/modules/products/domain/responses/product-fiscal-pending'
import { toIssueList } from '@/core/utils/zod-errors'

const pendingSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().nullable().default(null),
  ncm: z.string().nullable().default(null),
  cfop: z.string().nullable().default(null),
  origin: z.number().nullable().default(null),
  csosn: z.string().nullable().default(null),
  cstIcms: z.string().nullable().default(null),
  // A lista existe por causa deste campo: sem os motivos, a tela seria uma
  // lista de produtos sem dizer o que fazer com eles.
  pendencias: z.array(z.string()),
})

const pendingListSchema = z.object({
  data: z.array(pendingSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

function build(value: z.infer<typeof pendingSchema>): ProductFiscalPending {
  return {
    id: value.id,
    name: value.name,
    sku: value.sku,
    ncm: value.ncm,
    cfop: value.cfop,
    origin: value.origin,
    csosn: value.csosn,
    cstIcms: value.cstIcms,
    pendencias: value.pendencias,
  }
}

export function toProductFiscalPendingList(
  data: unknown,
): Either<DomainError, ProductFiscalPendingList> {
  const parsed = pendingListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('products-fiscal-pending', toIssueList(parsed.error)),
    )
  }

  const value = parsed.data
  return Either.right({
    items: value.data.map(build),
    total: value.total,
    page: value.page,
    limit: value.limit,
  })
}
