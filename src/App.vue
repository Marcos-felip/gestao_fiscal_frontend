<script lang="ts">
import { defineComponent } from 'vue'
import ToastNotification from '@/shared/components/toast-notification.vue'

export default defineComponent({
  name: 'App',
  components: { ToastNotification },
})
</script>

<template>
  <router-view />
  <ToastNotification />
</template>