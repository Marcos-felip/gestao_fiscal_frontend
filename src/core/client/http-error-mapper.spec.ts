import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosResponse } from 'axios'
import { toDomainError } from '@/core/client/http-error-mapper'
import { NetworkError } from '@/core/errors/network-error'
import { UnauthorizedError } from '@/core/errors/unauthorized-error'
import { ForbiddenError } from '@/core/errors/forbidden-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { ValidationError } from '@/core/errors/validation-error'
import { ServerError } from '@/core/errors/server-error'
import { UnexpectedError } from '@/core/errors/unexpected-error'

function axiosErroCom(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() }
  const response = {
    status,
    data,
    statusText: '',
    headers: {},
    config,
  } as AxiosResponse

  return new AxiosError('falhou', String(status), config, {}, response)
}

describe('toDomainError', () => {
  it('traduz erro que não é do Axios para UnexpectedError', () => {
    expect(toDomainError(new Error('boom'))).toBeInstanceOf(UnexpectedError)
    expect(toDomainError('string solta')).toBeInstanceOf(UnexpectedError)
  })

  it('traduz ausência de resposta para NetworkError', () => {
    const semResposta = new AxiosError('Network Error', 'ERR_NETWORK')

    const error = toDomainError(semResposta)

    expect(error).toBeInstanceOf(NetworkError)
    expect(error.isUserFacing).toBe(true)
  })

  it('mapeia os status para os erros de domínio correspondentes', () => {
    expect(toDomainError(axiosErroCom(401, {}))).toBeInstanceOf(
      UnauthorizedError,
    )
    expect(toDomainError(axiosErroCom(403, {}))).toBeInstanceOf(ForbiddenError)
    expect(toDomainError(axiosErroCom(404, {}))).toBeInstanceOf(NotFoundError)
    expect(toDomainError(axiosErroCom(422, {}))).toBeInstanceOf(ValidationError)
    expect(toDomainError(axiosErroCom(503, {}))).toBeInstanceOf(ServerError)
  })

  it('usa a mensagem enviada pelo backend quando existe', () => {
    const error = toDomainError(
      axiosErroCom(401, { statusCode: 401, message: 'Credenciais inválidas' }),
    )

    expect(error.message).toBe('Credenciais inválidas')
  })

  it('cai na mensagem padrão quando o backend não manda nenhuma', () => {
    const error = toDomainError(axiosErroCom(404, {}))

    expect(error.message).toBe('Registro não encontrado.')
  })

  it('coleta a lista de validação do NestJS em details', () => {
    const error = toDomainError(
      axiosErroCom(400, {
        statusCode: 400,
        message: ['email deve ser válido', 'senha é obrigatória'],
      }),
    ) as ValidationError

    expect(error).toBeInstanceOf(ValidationError)
    expect(error.message).toBe('email deve ser válido')
    expect(error.details).toHaveLength(2)
  })

  it('marca 5xx como não exibível ao usuário e preserva o status', () => {
    const error = toDomainError(axiosErroCom(500, {})) as ServerError

    expect(error.isUserFacing).toBe(false)
    expect(error.statusCode).toBe(500)
  })
})
