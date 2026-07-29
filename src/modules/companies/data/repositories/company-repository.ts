import type { ICompanyRepository } from '@/modules/companies/domain/interfaces/i-company-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Company } from '@/modules/companies/domain/entities/company.entity'
import type { UpdateCompanyDto } from '@/modules/companies/domain/dto/update-company-dto'
import type { CreateCompanyDto } from '@/modules/companies/domain/dto/create-company-dto'
import type { OnboardCompanyDto } from '@/modules/companies/domain/dto/onboard-company-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toCompany,
  toCompanyList,
  toCreatedCompany,
} from '@/modules/companies/data/mappers/company.mapper'

export class CompanyRepository implements ICompanyRepository {
  async list(): Promise<Either<DomainError, Company[]>> {
    const result = await httpClient.get<unknown>('/companies')
    return result.flatMap(toCompanyList)
  }

  async getById(id: string): Promise<Either<DomainError, Company>> {
    const result = await httpClient.get<unknown>(`/companies/${id}`)
    return result.flatMap(toCompany)
  }

  async create(dto: CreateCompanyDto): Promise<Either<DomainError, Company>> {
    const payload: Record<string, unknown> = { name: dto.name }
    if (dto.type !== undefined) payload.type = dto.type
    if (dto.businessSegment !== undefined)
      payload.businessSegment = dto.businessSegment
    if (dto.phone !== undefined) payload.phone = dto.phone

    const result = await httpClient.post<unknown>('/companies', payload)
    return result.flatMap(toCreatedCompany)
  }

  async onboard(dto: OnboardCompanyDto): Promise<Either<DomainError, Company>> {
    const payload: Record<string, unknown> = {
      cnpj: dto.cnpj,
      taxRegime: dto.taxRegime,
      establishmentName: dto.establishmentName,
    }
    const optional: (keyof OnboardCompanyDto)[] = [
      'phone',
      'inscricaoEstadual',
      'inscricaoMunicipal',
      'cep',
      'street',
      'number',
      'complement',
      'neighborhood',
      'city',
      'state',
    ]
    for (const key of optional) {
      const value = dto[key]
      if (value !== undefined && value !== '') payload[key] = value
    }

    const result = await httpClient.post<unknown>(
      '/companies/onboarding',
      payload,
    )
    return result.flatMap(toCompany)
  }

  async update(
    id: string,
    dto: UpdateCompanyDto,
  ): Promise<Either<DomainError, Company>> {
    const result = await httpClient.patch<unknown>(
      `/companies/${id}`,
      this.toPayload(dto),
    )
    return result.flatMap(toCompany)
  }

  /** Envia apenas os campos definidos (PATCH parcial). */
  private toPayload(dto: UpdateCompanyDto): Record<string, unknown> {
    const payload: Record<string, unknown> = {}
    if (dto.name !== undefined) payload.name = dto.name
    if (dto.type !== undefined) payload.type = dto.type
    if (dto.cnpj !== undefined) payload.cnpj = dto.cnpj
    if (dto.stateRegistration !== undefined)
      payload.stateRegistration = dto.stateRegistration
    if (dto.phone !== undefined) payload.phone = dto.phone
    if (dto.taxRegime !== undefined) payload.taxRegime = dto.taxRegime
    return payload
  }
}
