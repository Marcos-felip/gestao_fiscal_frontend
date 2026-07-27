import type { IEstablishmentRepository } from '@/modules/establishments/domain/interfaces/i-establishment-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import type { CreateEstablishmentDto } from '@/modules/establishments/domain/dto/create-establishment-dto'
import type { UpdateEstablishmentDto } from '@/modules/establishments/domain/dto/update-establishment-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toEstablishment,
  toEstablishmentList,
} from '@/modules/establishments/data/mappers/establishment.mapper'

export class EstablishmentRepository implements IEstablishmentRepository {
  async list(): Promise<Either<DomainError, Establishment[]>> {
    const result = await httpClient.get<unknown>('/establishments')
    return result.flatMap(toEstablishmentList)
  }

  async getById(id: string): Promise<Either<DomainError, Establishment>> {
    const result = await httpClient.get<unknown>(`/establishments/${id}`)
    return result.flatMap(toEstablishment)
  }

  async create(
    dto: CreateEstablishmentDto,
  ): Promise<Either<DomainError, Establishment>> {
    const result = await httpClient.post<unknown>(
      '/establishments',
      this.toPayload(dto),
    )
    return result.flatMap(toEstablishment)
  }

  async update(
    id: string,
    dto: UpdateEstablishmentDto,
  ): Promise<Either<DomainError, Establishment>> {
    const result = await httpClient.patch<unknown>(
      `/establishments/${id}`,
      this.toPayload(dto),
    )
    return result.flatMap(toEstablishment)
  }

  async delete(id: string): Promise<Either<DomainError, void>> {
    return httpClient.delete<void>(`/establishments/${id}`)
  }

  /** Envia apenas os campos definidos (POST/PATCH parcial). */
  private toPayload(
    dto: CreateEstablishmentDto | UpdateEstablishmentDto,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) payload[key] = value
    }
    return payload
  }
}
