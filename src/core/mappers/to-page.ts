import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import type { PaginatedResponse } from '@/core/types/paginated-response'
import { toIssueList } from '@/core/utils/zod-errors'

/**
 * Fábrica de mappers para respostas paginadas `{ data, total, page, limit }`.
 *
 * Evita repetir o envelope de paginação em cada módulo: o mapper informa apenas
 * o schema do item e como construir a entidade.
 *
 * ```ts
 * const productSchema = z.object({ id: z.string(), name: z.string() })
 *
 * export const toProductPage = toPage('products', productSchema, (p) =>
 *   new Product(p.id, p.name),
 * )
 * ```
 */
export function toPage<TSchema extends z.ZodTypeAny, TEntity>(
  resource: string,
  itemSchema: TSchema,
  build: (item: z.infer<TSchema>) => TEntity,
): (data: unknown) => Either<DomainError, PaginatedResponse<TEntity>> {
  const pageSchema = z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  })

  return (data: unknown) => {
    const parsed = pageSchema.safeParse(data)

    if (!parsed.success) {
      return Either.left(new ContractError(resource, toIssueList(parsed.error)))
    }

    return Either.right({
      data: parsed.data.data.map((item) => build(item as z.infer<TSchema>)),
      total: parsed.data.total,
      page: parsed.data.page,
      limit: parsed.data.limit,
    })
  }
}
