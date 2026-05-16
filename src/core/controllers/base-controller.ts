import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Either } from '@/core/either/either'

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

  protected handleResult<L, R>(
    either: Either<L, R>,
    onSuccess: (value: R) => void,
    onError?: (error: L) => void,
  ): void {
    either.fold(
      (left) => {
        const message = left instanceof Error ? left.message : String(left)
        this.setError(message)
        onError?.(left)
      },
      (right) => {
        this.clearError()
        onSuccess(right)
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
