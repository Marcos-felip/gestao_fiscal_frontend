import type { ICashRegistersRepository } from '@/modules/cash/domain/interfaces/i-cash-registers-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CashRegister } from '@/modules/cash/domain/entities/cash-register.entity'
import type { CreateCashRegisterDto } from '@/modules/cash/domain/dto/create-cash-register-dto'
import type { UpdateCashRegisterDto } from '@/modules/cash/domain/dto/update-cash-register-dto'
import type { ListCashRegistersDto } from '@/modules/cash/domain/dto/list-cash-registers-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toCashRegister,
  toCashRegisterList,
} from '@/modules/cash/data/mappers/cash-register.mapper'

export class CashRegistersRepository implements ICashRegistersRepository {
  async list(
    dto: ListCashRegistersDto,
  ): Promise<Either<DomainError, CashRegister[]>> {
    const params: Record<string, string | boolean> = {}
    if (dto.establishmentId) params.establishmentId = dto.establishmentId
    if (dto.isActive !== undefined) params.isActive = dto.isActive

    const result = await httpClient.get<unknown>('/cash-registers', { params })
    return result.flatMap(toCashRegisterList)
  }

  async create(
    dto: CreateCashRegisterDto,
  ): Promise<Either<DomainError, CashRegister>> {
    const payload: Record<string, unknown> = {
      establishmentId: dto.establishmentId,
      name: dto.name,
    }
    if (dto.isActive !== undefined) payload.isActive = dto.isActive

    const result = await httpClient.post<unknown>('/cash-registers', payload)
    return result.flatMap(toCashRegister)
  }

  async update(
    id: string,
    dto: UpdateCashRegisterDto,
  ): Promise<Either<DomainError, CashRegister>> {
    const payload: Record<string, unknown> = {}
    if (dto.name !== undefined) payload.name = dto.name
    if (dto.isActive !== undefined) payload.isActive = dto.isActive

    const result = await httpClient.patch<unknown>(
      `/cash-registers/${id}`,
      payload,
    )
    return result.flatMap(toCashRegister)
  }

  async delete(id: string): Promise<Either<DomainError, void>> {
    return httpClient.delete<void>(`/cash-registers/${id}`)
  }
}
