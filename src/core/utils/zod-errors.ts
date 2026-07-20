import type { ZodError } from 'zod'

/**
 * Converte os erros de um ZodError no formato consumido pelos formulários:
 * `{ campo: 'primeira mensagem de erro' }`.
 */
export function toFormErrors<T>(
  error: ZodError<T>,
): Partial<Record<keyof T, string>> {
  const result: Partial<Record<keyof T, string>> = {}
  const fieldErrors = error.flatten().fieldErrors as Record<string, string[] | undefined>
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) {
      result[field as keyof T] = messages[0]
    }
  }
  return result
}
