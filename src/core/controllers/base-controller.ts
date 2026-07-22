import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'

export abstract class BaseController {
  protected readonly loading = ref(false)
  protected readonly error = ref<string | null>(null)
  readonly router = useRouter()

  protected setLoading(value: boolean): void {
    this.loading.value = value
  }

  protected setError(message: string | null): void {
    this.error.value = message
  }

  protected clearError(): void {
    this.error.value = null
  }

  /**
   * Erros marcados como `isUserFacing` são exibidos como vieram. Os demais
   * (falha de contrato, 5xx, inesperado) são bugs nossos ou de infraestrutura:
   * o usuário vê um texto genérico e o erro real vai para o console.
   */
  private messageFor(error: DomainError): string {
    if (error.isUserFacing) return error.message

    console.error(error)
    return 'Não foi possível concluir a operação. Tente novamente.'
  }

  protected handleResult<R>(
    either: Either<DomainError, R>,
    onSuccess: (value: R) => void,
    onError?: (error: DomainError) => void,
  ): void {
    either.fold(
      (error) => {
        this.setError(this.messageFor(error))
        onError?.(error)
      },
      (value) => {
        this.clearError()
        onSuccess(value)
      },
    )
  }

  get isLoading(): boolean {
    return this.loading.value
  }

  get hasError(): boolean {
    return this.error.value !== null
  }

  get errorMessage(): string | null {
    return this.error.value
  }
}
