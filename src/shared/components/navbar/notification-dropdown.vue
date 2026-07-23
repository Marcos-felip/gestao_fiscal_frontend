<template>
  <div :class="['notification-dropdown', 'w-96 max-h-96 flex flex-col']">
    <!-- Header -->
    <div :class="['header', 'border-b border-border px-4 py-3']">
      <h3 class="text-sm font-semibold text-foreground">Notificações</h3>
    </div>

    <!-- Tabs -->
    <div :class="['tabs', 'flex items-center gap-4 border-b border-border px-4 py-2']">
      <button
        :class="[
          'tab',
          'text-xs font-medium pb-2 border-b-2 transition-colors',
          activeTab === 'all'
            ? 'text-primary border-primary'
            : 'text-muted-foreground border-transparent hover:text-foreground',
        ]"
        @click="activeTab = 'all'"
      >
        Tudo
      </button>
      <button
        :class="[
          'tab',
          'text-xs font-medium pb-2 border-b-2 transition-colors',
          activeTab === 'archived'
            ? 'text-primary border-primary'
            : 'text-muted-foreground border-transparent hover:text-foreground',
        ]"
        @click="activeTab = 'archived'"
      >
        Arquivadas
      </button>
    </div>

    <!-- Content -->
    <div :class="['content', 'flex-1 overflow-y-auto']">
      <!-- All notifications -->
      <div v-if="activeTab === 'all'">
        <div v-if="notifications.length === 0" class="p-4 text-center text-sm text-muted-foreground">
          Nenhuma notificação
        </div>
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'notification-item',
            'px-4 py-3 border-b border-border hover:bg-muted transition-colors cursor-pointer',
            !notification.isRead && 'bg-muted/50',
          ]"
          @click="markAsRead(notification.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-foreground truncate">
                {{ notification.title }}
              </h4>
              <p class="text-xs text-muted-foreground mt-1 line-clamp-2">
                {{ notification.message }}
              </p>
              <time class="text-xs text-muted-foreground mt-2 block">
                {{ formatTime(notification.timestamp) }}
              </time>
            </div>
            <button
              class="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              @click.stop="archiveNotification(notification.id)"
            >
              <Icon name="Archive" size="sm" />
            </button>
          </div>
        </div>
      </div>

      <!-- Archived notifications -->
      <div v-else>
        <div v-if="archivedNotifications.length === 0" class="p-4 text-center text-sm text-muted-foreground">
          Nenhuma notificação arquivada
        </div>
        <div
          v-for="notification in archivedNotifications"
          :key="notification.id"
          class="notification-item px-4 py-3 border-b border-border hover:bg-muted transition-colors"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-foreground truncate">
                {{ notification.title }}
              </h4>
              <p class="text-xs text-muted-foreground mt-1 line-clamp-2">
                {{ notification.message }}
              </p>
            </div>
            <button
              class="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              @click.stop="restoreNotification(notification.id)"
            >
              <Icon name="RotateCcw" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div :class="['footer', 'border-t border-border px-4 py-3']">
      <button class="w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors">
        Ver todas as notificações
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@/shared/ui'
import { useNotifications } from '@/composables'

const { notifications, archivedNotifications, markAsRead, archiveNotification, restoreNotification } =
  useNotifications()

const activeTab = ref<'all' | 'archived'>('all')

const formatTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `${diffMins}m atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`

  return date.toLocaleDateString('pt-BR')
}
</script>

<style scoped lang="css">
.notification-dropdown {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}
</style>
