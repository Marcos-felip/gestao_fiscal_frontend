import type { RouteRecordRaw } from 'vue-router'
import FiscalSettingsPage from '@/modules/fiscal/presentation/pages/fiscal-settings-page.vue'
import FiscalSettingsDetailPage from '@/modules/fiscal/presentation/pages/fiscal-settings-detail-page.vue'
import FiscalDocumentsPage from '@/modules/fiscal/presentation/pages/fiscal-documents-page.vue'
import FiscalDocumentDetailPage from '@/modules/fiscal/presentation/pages/fiscal-document-detail-page.vue'
import { routeNames } from '@/router/route-names'

export const fiscalRoutes: RouteRecordRaw[] = [
  {
    path: 'configuracao-fiscal',
    name: routeNames.FISCAL_SETTINGS,
    component: FiscalSettingsPage,
    meta: {
      tab: { id: 'fiscal-settings', title: 'Configuração fiscal' },
      title: 'Configuração fiscal',
      icon: 'ScrollText',
      requiresPermission: 'fiscal.settings.read',
    },
  },
  {
    // A seção é opcional: sem ela a página abre em 'Ambiente e emissão'.
    path: 'configuracao-fiscal/:establishmentId/:secao?',
    name: routeNames.FISCAL_SETTINGS_DETAIL,
    component: FiscalSettingsDetailPage,
    meta: {
      tab: { id: 'fiscal-settings', title: 'Configuração fiscal' },
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
      tab: { id: 'fiscal-documents', title: 'Documentos fiscais' },
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
      tab: { id: 'fiscal-documents', title: 'Documentos fiscais' },
      title: 'Documento fiscal',
      icon: 'FileText',
      requiresPermission: 'fiscal.read',
    },
  },
]
