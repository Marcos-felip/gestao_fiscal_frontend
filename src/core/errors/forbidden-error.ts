import { DomainError } from '@/core/errors/domain-error'

/** HTTP 403 — autenticado, mas sem permissão (OWNER > ADMIN > MEMBER). */
export class ForbiddenError extends DomainError {
  readonly isUserFacing = true

  constructor(message = 'Você não tem permissão para executar esta ação.') {
    super(message)
  }
}
