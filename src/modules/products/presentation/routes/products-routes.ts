import type { RouteRecordRaw } from 'vue-router'
import ProductsPage from '@/modules/products/presentation/pages/products-page.vue'
import ProductFormPage from '@/modules/products/presentation/pages/product-form-page.vue'
import FiscalPendingProductsPage from '@/modules/products/presentation/pages/fiscal-pending-products-page.vue'
import { routeNames } from '@/router/route-names'

export const productsRoutes: RouteRecordRaw[] = [
  {
    path: 'produtos',
    name: routeNames.PRODUCTS,
    component: ProductsPage,
    meta: {
      tab: { id: 'products', title: 'Produtos' },
      title: 'Produtos',
      icon: 'Package',
      requiresPermission: 'products.list',
    },
  },
  {
    path: 'produtos/pendencias-fiscais',
    name: routeNames.PRODUCTS_FISCAL_PENDING,
    component: FiscalPendingProductsPage,
    meta: {
      tab: { id: 'products', title: 'Produtos' },
      title: 'Pendências fiscais',
      requiresPermission: 'products.list',
    },
  },
  {
    path: 'produtos/novo',
    name: routeNames.PRODUCT_NEW,
    component: ProductFormPage,
    meta: { tab: { id: 'products', title: 'Produtos' }, requiresPermission: 'products.create'  },
  },
  {
    // Abre em somente leitura para quem tem read mas não edit.
    path: 'produtos/:id/editar',
    name: routeNames.PRODUCT_EDIT,
    component: ProductFormPage,
    meta: { tab: { id: 'products', title: 'Produtos' }, requiresPermission: 'products.read'  },
  },
]
