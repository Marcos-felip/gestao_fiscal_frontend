import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CashRegister } from '@/modules/cash/domain/entities/cash-register.entity'
import type { CreateCashRegisterDto } from '@/modules/cash/domain/dto/create-cash-register-dto'
import type { UpdateCashRegisterDto } from '@/modules/cash/domain/dto/update-cash-register-dto'
import type { ListCashRegistersDto } from '@/modules/cash/domain/dto/list-cash-registers-dto'

export interface ICashRegistersRepository {
  list(dto: ListCashRegistersDto): Promise<Either<DomainError, CashRegister[]>>
  create(
    dto: CreateCashRegisterDto,
  ): Promise<Either<DomainError, CashRegister>>
  update(
    id: string,
    dto: UpdateCashRegisterDto,
  ): Promise<Either<DomainError, CashRegister>>
  delete(id: string): Promise<Either<DomainError, void>>
}
