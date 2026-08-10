import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { toIssueList } from '@/core/utils/zod-errors'
import type { FiscalConsultaResult } from '@/modules/fiscal/domain/responses/fiscal-consulta-result'
import type { FiscalDocumentStatus } from '@/core/enums/fiscal-document-status.enum'

const fiscalConsultaSchema = z.object({
  situacao: z.string().nullable().default(null),
  protocolo: z.string().nullable().default(null),
  status: z.string(),
  atualizado: z.boolean().default(false),
  mensagem: z.string().nullable().default(null),
})

export function toFiscalConsultaResult(
  data: unknown,
): Either<DomainError, FiscalConsultaResult> {
  const parsed = fiscalConsultaSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-consulta', toIssueList(parsed.error)),
    )
  }

  const value = parsed.data
  return Either.right({
    situacao: value.situacao,
    protocolo: value.protocolo,
    status: value.status as FiscalDocumentStatus,
    atualizado: value.atualizado,
    mensagem: value.mensagem,
  })
}
