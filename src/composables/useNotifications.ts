import { ref, computed } from 'vue'

/**
 * useNotifications - Gerencia notificações
 *
 * Estado:
 * - notifications: lista de notificações
 * - archivedNotifications: notificações arquivadas
 * - unreadCount: contador de não lidas
 */

export interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

const notifications = ref<Notification[]>([
  {
    id: '1',
    title: 'Nova empresa criada',
    message: 'Acme Corp foi criada com sucesso',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min atrás
    isRead: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Relatório gerado',
    message: 'Seu relatório fiscal está pronto',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
    isRead: false,
    type: 'info',
  },
  {
    id: '3',
    title: 'Atenção: Prazo próximo',
    message: 'Prazo para entrega de ECF vence em 3 dias',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
    isRead: true,
    type: 'warning',
  },
])

const archivedNotifications = ref<Notification[]>([])

const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.isRead).length
})

const totalCount = computed(() => {
  return notifications.value.length + archivedNotifications.value.length
})

const markAsRead = (id: string) => {
  const notification = notifications.value.find((n) => n.id === id)
  if (notification) {
    notification.isRead = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach((n) => {
    n.isRead = true
  })
}

const archiveNotification = (id: string) => {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    const [archived] = notifications.value.splice(index, 1)
    archivedNotifications.value.push(archived)
  }
}

const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString()
  notifications.value.unshift({
    ...notification,
    id,
  })
}

const deleteNotification = (id: string) => {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const deleteArchivedNotification = (id: string) => {
  const index = archivedNotifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    archivedNotifications.value.splice(index, 1)
  }
}

const restoreNotification = (id: string) => {
  const index = archivedNotifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    const [restored] = archivedNotifications.value.splice(index, 1)
    notifications.value.unshift(restored)
  }
}

export const useNotifications = () => ({
  // State
  notifications,
  archivedNotifications,
  unreadCount,
  totalCount,

  // Methods
  markAsRead,
  markAllAsRead,
  archiveNotification,
  addNotification,
  deleteNotification,
  deleteArchivedNotification,
  restoreNotification,
})
