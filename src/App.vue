<script setup lang="ts">
import { MotionConfig } from 'motion-v'
import ToastNotification from '@/shared/components/toast/toast-notification.vue'
import ProgressBar from '@/shared/components/feedback/progress-bar.vue'
</script>

<template>
  <MotionConfig :transition="{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }">
    <ProgressBar />
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
    <ToastNotification />
  </MotionConfig>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.3s var(--ease-out-quart),
    transform 0.3s var(--ease-out-quart);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
