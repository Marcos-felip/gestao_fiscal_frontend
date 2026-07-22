import { DomainError } from '@/core/errors/domain-error'

/** HTTP 404 — o recurso não existe ou foi removido. */
export class NotFoundError extends DomainError {
  readonly isUserFacing = true

  constructor(message = 'Registro não encontrado.') {
    super(message)
  }
}
