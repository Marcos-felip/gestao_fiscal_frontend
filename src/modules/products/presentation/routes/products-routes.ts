import type { RouteRecordRaw } from 'vue-router'
import ProductsPage from '@/modules/products/presentation/pages/products-page.vue'
import ProductFormPage from '@/modules/products/presentation/pages/product-form-page.vue'
import { routeNames } from '@/router/route-names'

export const productsRoutes: RouteRecordRaw[] = [
  {
    path: 'produtos',
    name: routeNames.PRODUCTS,
    component: ProductsPage,
    meta: {
      title: 'Produtos',
      icon: 'Package',
      requiresPermission: 'products.list',
    },
  },
  {
    path: 'produtos/novo',
    name: routeNames.PRODUCT_NEW,
    component: ProductFormPage,
    meta: { requiresPermission: 'products.create' },
  },
  {
    // Abre em somente leitura para quem tem read mas não edit.
    path: 'produtos/:id/editar',
    name: routeNames.PRODUCT_EDIT,
    component: ProductFormPage,
    meta: { requiresPermission: 'products.read' },
  },
]
