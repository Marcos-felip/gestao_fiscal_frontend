import { ref } from 'vue'

/**
 * Recarrega o conteúdo da tela atual sem recarregar a aplicação.
 *
 * O contador entra na `key` do `RouterView`: incrementá-lo desmonta e remonta o
 * componente da rota, o que refaz `onMounted` e, com ele, as buscas de dados.
 *
 * Um `location.reload()` também resolveria, mas jogaria fora a sessão em
 * memória, o estado das abas e o tempo de carregar o bundle — para atualizar
 * uma lista.
 */
const refreshKey = ref(0)

function refreshView(): void {
  refreshKey.value += 1
}

export function useViewRefresh() {
  return { refreshKey, refreshView }
}
