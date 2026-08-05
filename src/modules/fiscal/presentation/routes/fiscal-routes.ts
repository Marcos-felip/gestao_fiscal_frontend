import type { RouteRecordRaw } from 'vue-router'
import FiscalSettingsPage from '@/modules/fiscal/presentation/pages/fiscal-settings-page.vue'
import FiscalSettingsDetailPage from '@/modules/fiscal/presentation/pages/fiscal-settings-detail-page.vue'
import FiscalDocumentsPage from '@/modules/fiscal/presentation/pages/fiscal-documents-page.vue'
import FiscalDocumentDetailPage from '@/modules/fiscal/presentation/pages/fiscal-document-detail-page.vue'
import FiscalRejectionsPage from '@/modules/fiscal/presentation/pages/fiscal-rejections-page.vue'
import { routeNames } from '@/router/route-names'

export const fiscalRoutes: RouteRecordRaw[] = [
  {
    path: 'configuracao-fiscal',
    name: routeNames.FISCAL_SETTINGS,
    component: FiscalSettingsPage,
    meta: {
      title: 'Configuração fiscal',
      icon: 'ScrollText',
      requiresPermission: 'fiscal.settings.read',
    },
  },
  {
    path: 'configuracao-fiscal/:establishmentId',
    name: routeNames.FISCAL_SETTINGS_DETAIL,
    component: FiscalSettingsDetailPage,
    meta: {
      title: 'Configuração do estabelecimento',
      icon: 'ScrollText',
      requiresPermission: 'fiscal.settings.read',
    },
  },
  {
    path: 'documentos-fiscais',
    name: routeNames.FISCAL_DOCUMENTS,
    component: FiscalDocumentsPage,
    meta: {
      title: 'Documentos fiscais',
      icon: 'FileText',
      requiresPermission: 'fiscal.read',
    },
  },
  {
    path: 'documentos-fiscais/:id',
    name: routeNames.FISCAL_DOCUMENT_DETAIL,
    component: FiscalDocumentDetailPage,
    meta: {
      title: 'Documento fiscal',
      icon: 'FileText',
      requiresPermission: 'fiscal.read',
    },
  },
  {
    path: 'rejeicoes-fiscais',
    name: routeNames.FISCAL_REJECTIONS,
    component: FiscalRejectionsPage,
    meta: {
      title: 'Central de rejeições',
      icon: 'TriangleAlert',
      requiresPermission: 'fiscal.read',
    },
  },
]
