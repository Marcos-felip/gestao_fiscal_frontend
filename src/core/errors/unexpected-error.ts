import { DomainError } from '@/core/errors/domain-error'

/** Falha que não se encaixa em nenhuma categoria conhecida. */
export class UnexpectedError extends DomainError {
  readonly isUserFacing = false

  constructor(message = 'Ocorreu um erro inesperado.') {
    super(message)
  }
}
