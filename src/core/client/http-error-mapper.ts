import { isAxiosError } from 'axios'
import type { ApiError } from '@/core/types/api-error'
import type { DomainError } from '@/core/errors/domain-error'
import { NetworkError } from '@/core/errors/network-error'
import { UnauthorizedError } from '@/core/errors/unauthorized-error'
import { ForbiddenError } from '@/core/errors/forbidden-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { ValidationError } from '@/core/errors/validation-error'
import { ServerError } from '@/core/errors/server-error'
import { UnexpectedError } from '@/core/errors/unexpected-error'

/**
 * O backend responde erros no formato `{ statusCode, message, error }`, onde
 * `message` pode ser uma string ou uma lista.
 */
function readApiError(data: unknown): { message?: string; details: string[] } {
  if (typeof data !== 'object' || data === null) return { details: [] }

  const body = data as Partial<ApiError> & { message?: string | string[] }

  if (Array.isArray(body.message)) {
    return { message: body.message[0], details: body.message }
  }
  if (typeof body.message === 'string') {
    return { message: body.message, details: [] }
  }
  return { details: [] }
}

/**
 * Traduz qualquer falha de transporte para um `DomainError`.
 *
 * É o único ponto do projeto que conhece Axios como fonte de erro — as camadas
 * de cima decidem o comportamento por `instanceof`, nunca pela mensagem.
 */
export function toDomainError(error: unknown): DomainError {
  if (!isAxiosError(error)) {
    return new UnexpectedError(
      error instanceof Error ? error.message : String(error),
    )
  }

  if (!error.response) {
    return new NetworkError()
  }

  const status = error.response.status
  const { message, details } = readApiError(error.response.data)

  if (status === 401) return new UnauthorizedError(message)
  if (status === 403) return new ForbiddenError(message)
  if (status === 404) return new NotFoundError(message)
  if (status === 400 || status === 422) {
    return new ValidationError(message, details)
  }
  if (status >= 500) return new ServerError(status, message)

  return new UnexpectedError(message)
}
