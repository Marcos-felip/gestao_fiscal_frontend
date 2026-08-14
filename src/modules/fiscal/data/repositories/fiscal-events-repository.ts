import type { IFiscalEventsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-events-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalCorrectionLetter } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'
import type { FiscalInutilization } from '@/modules/fiscal/domain/entities/fiscal-inutilization.entity'
import type { FiscalPendingRange } from '@/modules/fiscal/domain/responses/fiscal-pending-range'
import type { CreateCorrectionLetterDto } from '@/modules/fiscal/domain/dto/create-correction-letter-dto'
import type { InutilizeNumberingDto } from '@/modules/fiscal/domain/dto/inutilize-numbering-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toFiscalCorrectionLetter,
  toFiscalCorrectionLetterList,
  toFiscalInutilization,
  toFiscalPendingRanges,
} from '@/modules/fiscal/data/mappers/fiscal-events.mapper'

export class FiscalEventsRepository implements IFiscalEventsRepository {
  async createCorrectionLetter(
    fiscalDocumentId: string,
    dto: CreateCorrectionLetterDto,
  ): Promise<Either<DomainError, FiscalCorrectionLetter>> {
    // Sem `sequencia` no corpo: quem a atribui é o servidor.
    const result = await httpClient.post<unknown>(
      `/fiscal/documents/${fiscalDocumentId}/carta-correcao`,
      { correcao: dto.correcao },
    )
    return result.flatMap(toFiscalCorrectionLetter)
  }

  async listCorrectionLetters(
    fiscalDocumentId: string,
  ): Promise<Either<DomainError, FiscalCorrectionLetter[]>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/documents/${fiscalDocumentId}/cartas-correcao`,
    )
    return result.flatMap(toFiscalCorrectionLetterList)
  }

  async getCorrectionLetterXml(
    fiscalDocumentId: string,
    sequencia: number,
  ): Promise<Either<DomainError, string>> {
    // O XML volta como texto cru, não JSON — igual ao do documento.
    return httpClient.get<string>(
      `/fiscal/documents/${fiscalDocumentId}/cartas-correcao/${sequencia}/xml`,
      { responseType: 'text' },
    )
  }

  async inutilize(
    dto: InutilizeNumberingDto,
  ): Promise<Either<DomainError, FiscalInutilization>> {
    const payload: Record<string, unknown> = {
      establishmentId: dto.establishmentId,
      modelo: dto.modelo,
      serie: dto.serie,
      numeroInicial: dto.numeroInicial,
      numeroFinal: dto.numeroFinal,
      justificativa: dto.justificativa,
    }
    if (dto.ano !== undefined) payload.ano = dto.ano

    const result = await httpClient.post<unknown>(
      '/fiscal/inutilizacoes',
      payload,
    )
    return result.flatMap(toFiscalInutilization)
  }

  async listPendingRanges(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalPendingRange[]>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/inutilizacoes/pendentes/${establishmentId}`,
    )
    return result.flatMap(toFiscalPendingRanges)
  }
}
