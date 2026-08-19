import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalCorrectionLetter } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'
import type { FiscalInutilization } from '@/modules/fiscal/domain/entities/fiscal-inutilization.entity'
import type { FiscalPendingRange } from '@/modules/fiscal/domain/responses/fiscal-pending-range'
import type { CreateCorrectionLetterDto } from '@/modules/fiscal/domain/dto/create-correction-letter-dto'
import type { InutilizeNumberingDto } from '@/modules/fiscal/domain/dto/inutilize-numbering-dto'

/**
 * Eventos fiscais que não são emissão nem cancelamento.
 *
 * Repositório próprio, e não mais métodos no de documentos: a inutilização nem
 * documento tem — ela fala de numeração que nunca virou nota.
 */
export interface IFiscalEventsRepository {
  createCorrectionLetter(
    fiscalDocumentId: string,
    dto: CreateCorrectionLetterDto,
  ): Promise<Either<DomainError, FiscalCorrectionLetter>>

  listCorrectionLetters(
    fiscalDocumentId: string,
  ): Promise<Either<DomainError, FiscalCorrectionLetter[]>>

  getCorrectionLetterXml(
    fiscalDocumentId: string,
    sequencia: number,
  ): Promise<Either<DomainError, string>>

  inutilize(
    dto: InutilizeNumberingDto,
  ): Promise<Either<DomainError, FiscalInutilization>>

  listPendingRanges(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalPendingRange[]>>
}
