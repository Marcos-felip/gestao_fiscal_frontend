import type { INfeImportRepository } from '@/modules/nfe-import/domain/interfaces/i-nfe-import-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { NfeImport } from '@/modules/nfe-import/domain/entities/nfe-import.entity'
import type { NfeImportList } from '@/modules/nfe-import/domain/responses/nfe-import-list'
import type { ListNfeImportsDto } from '@/modules/nfe-import/domain/dto/list-nfe-imports-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toNfeImport,
  toNfeImportList,
} from '@/modules/nfe-import/data/mappers/nfe-import.mapper'

const BASE = '/purchases/import'

export class NfeImportRepository implements INfeImportRepository {
  /**
   * O envio do arquivo vive aqui, não na página.
   *
   * `FormData` numa view atravessaria as fronteiras que o ESLint impõe, e o
   * `eslint-disable` que isso pediria seria o sinal de que o desenho está
   * errado.
   */
  async importXml(file: File): Promise<Either<DomainError, NfeImport>> {
    const formData = new FormData()
    formData.append('xml', file)

    const result = await httpClient.post<unknown>(`${BASE}/nfe`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return result.flatMap(toNfeImport)
  }

  async list(
    dto: ListNfeImportsDto,
  ): Promise<Either<DomainError, NfeImportList>> {
    const result = await httpClient.get<unknown>(BASE, {
      params: { page: dto.page, limit: dto.limit },
    })

    return result.flatMap(toNfeImportList)
  }

  async getById(id: string): Promise<Either<DomainError, NfeImport>> {
    const result = await httpClient.get<unknown>(`${BASE}/${id}`)
    return result.flatMap(toNfeImport)
  }

  async setItemProduct(
    id: string,
    itemId: string,
    productId: string,
  ): Promise<Either<DomainError, NfeImport>> {
    const result = await httpClient.patch<unknown>(
      `${BASE}/${id}/items/${itemId}`,
      { productId },
    )

    return result.flatMap(toNfeImport)
  }

  async confirm(id: string): Promise<Either<DomainError, NfeImport>> {
    const result = await httpClient.post<unknown>(`${BASE}/${id}/confirm`)
    return result.flatMap(toNfeImport)
  }

  // Sem download do XML: quem importa por upload já tem o arquivo. Ele
  // continua guardado no servidor, para a busca na SEFAZ e para reprocessar.
}
