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
      to: '/users/permissions',
    },
    {
      id: 'users',
      label: 'Usuários',
      to: '/users',
    },
    {
      id: 'companies',
      label: 'Empresa',
      to: '/companies',
    },
    {
      id: 'establishments',
      label: 'Estabelecimentos',
      to: '/establishments',
    },
    {
      id: 'account',
      label: 'Conta',
      children: [
        {
          id: 'account-settings',
          label: 'Configurações',
          to: '/account/settings',
        },
        {
          id: 'account-security',
          label: 'Segurança',
          to: '/account/security',
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
