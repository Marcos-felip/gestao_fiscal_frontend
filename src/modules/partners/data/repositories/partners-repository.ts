import type { IPartnersRepository } from '@/modules/partners/domain/interfaces/i-partners-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Partner } from '@/modules/partners/domain/entities/partner.entity'
import type { PartnerList } from '@/modules/partners/domain/responses/partner-list-response'
import type { ListPartnersDto } from '@/modules/partners/domain/dto/list-partners-dto'
import type { CreatePartnerDto } from '@/modules/partners/domain/dto/create-partner-dto'
import type { UpdatePartnerDto } from '@/modules/partners/domain/dto/update-partner-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toPartner,
  toPartnerList,
} from '@/modules/partners/data/mappers/partner.mapper'

export class PartnersRepository implements IPartnersRepository {
  async list(dto: ListPartnersDto): Promise<Either<DomainError, PartnerList>> {
    const params: Record<string, string | number> = {
      page: dto.page,
      limit: dto.limit,
    }
    if (dto.search) params.search = dto.search
    if (dto.type) params.type = dto.type

    const result = await httpClient.get<unknown>('/partners', { params })
    return result.flatMap(toPartnerList)
  }

  async getById(id: string): Promise<Either<DomainError, Partner>> {
    const result = await httpClient.get<unknown>(`/partners/${id}`)
    return result.flatMap(toPartner)
  }

  async create(dto: CreatePartnerDto): Promise<Either<DomainError, Partner>> {
    const result = await httpClient.post<unknown>(
      '/partners',
      this.toPayload(dto),
    )
    return result.flatMap(toPartner)
  }

  async update(
    id: string,
    dto: UpdatePartnerDto,
  ): Promise<Either<DomainError, Partner>> {
    const result = await httpClient.patch<unknown>(
      `/partners/${id}`,
      this.toPayload(dto),
    )
    return result.flatMap(toPartner)
  }

  async remove(id: string): Promise<Either<DomainError, void>> {
    return httpClient.delete<void>(`/partners/${id}`)
  }

  /** Envia apenas os campos definidos (POST/PATCH parcial). */
  private toPayload(dto: object): Record<string, unknown> {
    const payload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) payload[key] = value
    }
    return payload
  }
}
