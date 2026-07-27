/**
 * useToast — dispara notificações (toast) de forma padronizada.
 *
 * O componente `toast-notification.vue` (montado em App.vue) escuta o evento
 * `toast` no window. Este composable encapsula o `dispatchEvent` para que as
 * telas não precisem conhecer o formato do CustomEvent.
 *
 * Uso:
 *   const toast = useToast()
 *   toast.success('Empresa atualizada com sucesso')
 */

type ToastType = 'success' | 'error' | 'info'

function emit(message: string, type: ToastType): void {
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, type } }))
}

export function useToast() {
  return {
    success: (message: string) => emit(message, 'success'),
    error: (message: string) => emit(message, 'error'),
    info: (message: string) => emit(message, 'info'),
  }
}
