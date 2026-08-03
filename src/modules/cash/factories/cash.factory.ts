import { CashRegistersRepository } from '@/modules/cash/data/repositories/cash-registers-repository'
import { CashSessionsRepository } from '@/modules/cash/data/repositories/cash-sessions-repository'
import { ListCashRegistersUseCase } from '@/modules/cash/application/use-cases/list-cash-registers.use-case'
import { CreateCashRegisterUseCase } from '@/modules/cash/application/use-cases/create-cash-register.use-case'
import { UpdateCashRegisterUseCase } from '@/modules/cash/application/use-cases/update-cash-register.use-case'
import { DeleteCashRegisterUseCase } from '@/modules/cash/application/use-cases/delete-cash-register.use-case'
import { OpenCashSessionUseCase } from '@/modules/cash/application/use-cases/open-cash-session.use-case'
import { GetCurrentCashSessionUseCase } from '@/modules/cash/application/use-cases/get-current-cash-session.use-case'
import { ListCashSessionsUseCase } from '@/modules/cash/application/use-cases/list-cash-sessions.use-case'
import { GetCashSessionUseCase } from '@/modules/cash/application/use-cases/get-cash-session.use-case'
import { AddCashMovementUseCase } from '@/modules/cash/application/use-cases/add-cash-movement.use-case'
import { CloseCashSessionUseCase } from '@/modules/cash/application/use-cases/close-cash-session.use-case'
import { CashRegistersController } from '@/modules/cash/presentation/controllers/cash-registers-controller'
import type { EstablishmentOptionsLoader } from '@/modules/cash/presentation/controllers/cash-registers-controller'
import { CashSessionController } from '@/modules/cash/presentation/controllers/cash-session-controller'
import { CashSessionsListController } from '@/modules/cash/presentation/controllers/cash-sessions-list-controller'
import { CashSessionDetailController } from '@/modules/cash/presentation/controllers/cash-session-detail-controller'
import { EstablishmentRepository } from '@/modules/establishments/data/repositories/establishment-repository'
import { ListEstablishmentsUseCase } from '@/modules/establishments/application/use-cases/list-establishments.use-case'

/**
 * Adapta a listagem de estabelecimentos (outro módulo) para o formato mínimo
 * `{ id, name }` que o cadastro de caixas precisa. A costura entre módulos vive
 * na factory — o único ponto autorizado a cruzar fronteiras.
 */
function makeEstablishmentOptionsLoader(): EstablishmentOptionsLoader {
  const listEstablishments = new ListEstablishmentsUseCase(
    new EstablishmentRepository(),
  )
  return async () => {
    const result = await listEstablishments.execute()
    return result.map((items) =>
      items.map((e) => ({ id: e.id, name: e.name })),
    )
  }
}

export function makeCashRegistersController(): CashRegistersController {
  const repository = new CashRegistersRepository()

  return new CashRegistersController(
    new ListCashRegistersUseCase(repository),
    new CreateCashRegisterUseCase(repository),
    new UpdateCashRegisterUseCase(repository),
    new DeleteCashRegisterUseCase(repository),
    makeEstablishmentOptionsLoader(),
  )
}

export function makeCashSessionController(): CashSessionController {
  const sessionsRepository = new CashSessionsRepository()
  const registersRepository = new CashRegistersRepository()

  return new CashSessionController(
    new GetCurrentCashSessionUseCase(sessionsRepository),
    new OpenCashSessionUseCase(sessionsRepository),
    new AddCashMovementUseCase(sessionsRepository),
    new CloseCashSessionUseCase(sessionsRepository),
    new ListCashRegistersUseCase(registersRepository),
  )
}

export function makeCashSessionsListController(): CashSessionsListController {
  const sessionsRepository = new CashSessionsRepository()
  const registersRepository = new CashRegistersRepository()

  return new CashSessionsListController(
    new ListCashSessionsUseCase(sessionsRepository),
    new ListCashRegistersUseCase(registersRepository),
  )
}

export function makeCashSessionDetailController(): CashSessionDetailController {
  const repository = new CashSessionsRepository()

  return new CashSessionDetailController(new GetCashSessionUseCase(repository))
}
