import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import {
  NfeImport,
  NfeImportItem,
} from '@/modules/nfe-import/domain/entities/nfe-import.entity'
import type { NfeImportList } from '@/modules/nfe-import/domain/responses/nfe-import-list'
// Import de valor, não `import type`: `z.nativeEnum` precisa do objeto em
// runtime, e `import type` some na compilação.
import { NfeImportMatch } from '@/core/enums/nfe-import-match.enum'
import { NfeImportStatus } from '@/core/enums/nfe-import-status.enum'
import { toIssueList } from '@/core/utils/zod-errors'

/** Decimais trafegam como string no JSON — o backend usa `Decimal`. */
const decimal = z.union([z.number(), z.string()])

const duplicataSchema = z.object({
  numero: z.string().nullable().default(null),
  vencimento: z.string().nullable().default(null),
  valor: decimal,
})

const itemSchema = z.object({
  id: z.string(),
  itemNumber: z.number(),
  supplierCode: z.string(),
  gtin: z.string().nullable().default(null),
  description: z.string(),
  ncm: z.string().nullable().default(null),
  cest: z.string().nullable().default(null),
  cfop: z.string().nullable().default(null),
  unit: z.string(),
  quantity: decimal,
  unitPrice: decimal,
  totalAmount: decimal,
  productId: z.string().nullable().default(null),
  match: z.nativeEnum(NfeImportMatch),
  origem: z.number().nullable().default(null),
  situacaoIcms: z.string().nullable().default(null),
  cstPis: z.string().nullable().default(null),
  cstCofins: z.string().nullable().default(null),
})

const importSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(NfeImportStatus),
  chaveAcesso: z.string(),
  number: z.number(),
  series: z.number(),
  issuedAt: z.string(),
  issuerCnpj: z.string(),
  issuerName: z.string(),
  totalAmount: decimal,
  supplierId: z.string().nullable().default(null),
  supplier: z
    .object({ id: z.string(), name: z.string() })
    .nullable()
    .default(null),
  establishment: z
    .object({ id: z.string(), name: z.string() })
    .nullable()
    .default(null),
  purchase: z
    .object({ id: z.string(), purchaseNumber: z.number() })
    .nullable()
    .default(null),
  duplicatas: z.array(duplicataSchema).nullable().default([]),
  items: z.array(itemSchema).default([]),
  createdAt: z.string().nullable().default(null),
})

const listSchema = z.object({
  data: z.array(importSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

type ImportPayload = z.infer<typeof importSchema>

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toDate(value: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function build(value: ImportPayload): NfeImport {
  return new NfeImport({
    id: value.id,
    status: value.status,
    chaveAcesso: value.chaveAcesso,
    number: value.number,
    series: value.series,
    issuedAt: toDate(value.issuedAt) ?? new Date(value.issuedAt),
    issuerCnpj: value.issuerCnpj,
    issuerName: value.issuerName,
    totalAmount: toNumber(value.totalAmount),
    supplierId: value.supplierId ?? value.supplier?.id ?? null,
    supplierName: value.supplier?.name ?? null,
    establishmentName: value.establishment?.name ?? null,
    purchaseId: value.purchase?.id ?? null,
    purchaseNumber: value.purchase?.purchaseNumber ?? null,
    duplicatas: (value.duplicatas ?? []).map((duplicata) => ({
      numero: duplicata.numero,
      vencimento: toDate(duplicata.vencimento),
      valor: toNumber(duplicata.valor),
    })),
    items: value.items.map(
      (item) =>
        new NfeImportItem({
          id: item.id,
          itemNumber: item.itemNumber,
          supplierCode: item.supplierCode,
          gtin: item.gtin,
          description: item.description,
          ncm: item.ncm,
          cest: item.cest,
          cfop: item.cfop,
          unit: item.unit,
          quantity: toNumber(item.quantity),
          unitPrice: toNumber(item.unitPrice),
          totalAmount: toNumber(item.totalAmount),
          productId: item.productId,
          match: item.match,
          origem: item.origem,
          situacaoIcms: item.situacaoIcms,
          cstPis: item.cstPis,
          cstCofins: item.cstCofins,
        }),
    ),
    createdAt: toDate(value.createdAt),
  })
}

export function toNfeImport(data: unknown): Either<DomainError, NfeImport> {
  const parsed = importSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('nfe-import', toIssueList(parsed.error)),
    )
  }

  return Either.right(build(parsed.data))
}

export function toNfeImportList(
  data: unknown,
): Either<DomainError, NfeImportList> {
  const parsed = listSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('nfe-import-list', toIssueList(parsed.error)),
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
