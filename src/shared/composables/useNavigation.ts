import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * useNavigation - Fornece dados de navegação dinâmicos
 *
 * Retorna:
 * - navigationItems: items da sidebar
 * - currentRouteName: nome da rota atual
 * - breadcrumbs: caminho de navegação
 */

interface NavigationItem {
  id: string
  label: string
  icon?: string
  to?: string
  children?: NavigationItem[]
}

const navigationItems = computed((): NavigationItem[] => {
  return [
    {
      id: 'dashboard',
      label: 'Dashboard',
      to: '/',
    },
    {
      id: 'permissions',
      label: 'Permissões',
      to: '/perfis-de-permissao',
    },
    {
      id: 'users',
      label: 'Usuários',
      to: '/usuarios',
    },
    {
      id: 'companies',
      label: 'Empresa',
      to: '/empresa',
    },
    {
      id: 'establishments',
      label: 'Estabelecimentos',
      to: '/estabelecimentos',
    },
    {
      id: 'products',
      label: 'Produtos',
      to: '/produtos',
    },
    {
      id: 'partners',
      label: 'Parceiros',
      to: '/parceiros',
    },
    {
      id: 'stock',
      label: 'Estoque',
      to: '/estoque',
    },
    {
      id: 'purchases',
      label: 'Compras',
      to: '/compras',
    },
    {
      id: 'sales',
      label: 'Vendas',
      to: '/vendas',
    },
    {
      id: 'receivables',
      label: 'Contas a receber',
      to: '/contas-a-receber',
    },
    {
      id: 'payables',
      label: 'Contas a pagar',
      to: '/contas-a-pagar',
    },
    {
      id: 'cash-registers',
      label: 'Caixas',
      to: '/caixas',
    },
    {
      id: 'cash-sessions',
      label: 'Sessões de caixa',
      to: '/sessoes-de-caixa',
    },
    {
      id: 'fiscal-documents',
      label: 'Documentos fiscais',
      to: '/documentos-fiscais',
    },
    {
      id: 'fiscal-settings',
      label: 'Configuração fiscal',
      to: '/configuracao-fiscal',
    },
    {
      id: 'account',
      label: 'Conta',
      children: [
        {
          id: 'account-settings',
          label: 'Configurações',
          to: '/conta/configuracoes',
        },
        {
          id: 'account-security',
          label: 'Segurança',
          to: '/conta/seguranca',
        },
      ],
    },
  ]
})

export const useNavigation = () => {
  // useRoute() PRECISA ser chamado dentro do setup — no escopo do módulo ele
  // retorna undefined e todo acesso a route.path/route.name quebrava.
  const route = useRoute()

  const currentRouteName = computed(() => {
    return route.name as string | undefined
  })

  const isRouteActive = (routePath: string): boolean => {
    return route.path === routePath || route.path.startsWith(routePath + '/')
  }

  const breadcrumbs = computed(() => {
    const crumbs: Array<{ label: string; to?: string }> = []

    const findBreadcrumbs = (
      items: NavigationItem[],
      path: Array<{ label: string; to?: string }>,
    ) => {
      for (const item of items) {
        if (item.to && isRouteActive(item.to)) {
          path.push({ label: item.label, to: item.to })
          return true
        }

        if (item.children) {
          if (findBreadcrumbs(item.children, path)) {
            path.unshift({ label: item.label })
            return true
          }
        }
      }
      return false
    }

    findBreadcrumbs(navigationItems.value, crumbs)

    // Adicionar Dashboard como primeiro breadcrumb
    return [{ label: 'Dashboard', to: '/' }, ...crumbs]
  })

  return {
    navigationItems,
    currentRouteName,
    isRouteActive,
    breadcrumbs,
  }
}
