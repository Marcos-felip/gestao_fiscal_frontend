<script setup lang="ts">
import { motion } from 'motion-v'
import { Card } from '@/shared/ui'

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28 },
  },
}
</script>

<template>
  <div
    class="relative flex min-h-svh items-center justify-center overflow-hidden bg-background-1 px-4"
  >
    <div class="pointer-events-none absolute inset-0">
      <div
        class="ui-aurora absolute -top-20 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-200/70 via-primary-300/50 to-transparent blur-[90px]"
      ></div>
      <div
        class="ui-aurora absolute -top-10 right-[10%] h-[400px] w-[500px] rounded-full bg-gradient-to-br from-primary-300/55 via-primary-200/40 to-transparent blur-[80px]"
        style="animation-delay: -6s"
      ></div>
      <div
        class="ui-aurora absolute top-[25%] -left-10 h-[450px] w-[400px] rounded-full bg-gradient-to-r from-primary-200/50 via-secondary-200/35 to-transparent blur-[70px]"
        style="animation-delay: -3s"
      ></div>
      <div
        class="ui-aurora absolute bottom-[10%] right-[10%] h-[350px] w-[350px] rounded-full bg-gradient-to-tl from-secondary-200/45 via-primary-200/30 to-transparent blur-[70px]"
        style="animation-delay: -9s"
      ></div>
      <div
        class="ui-aurora absolute bottom-[5%] left-[15%] h-[300px] w-[400px] rounded-full bg-gradient-to-tr from-primary-200/45 via-primary-100/30 to-transparent blur-[60px]"
        style="animation-delay: -12s"
      ></div>
      <div
        class="absolute top-[8%] left-[30%] h-[250px] w-[350px] rounded-full bg-gradient-to-b from-secondary-200/30 to-transparent blur-[70px]"
      ></div>
    </div>

    <motion.main
      class="relative z-10 flex w-full max-w-md flex-col items-center gap-7"
      :variants="container"
      initial="hidden"
      animate="visible"
    >
      <motion.div class="flex items-center gap-2" :variants="item">
        <svg
          class="h-7 w-7 text-primary"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="currentColor"
            stroke-width="3"
            fill="none"
          />
          <circle cx="16" cy="16" r="5" fill="currentColor" />
          <path
            d="M16 2a14 14 0 0 1 0 28"
            stroke="currentColor"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
          />
        </svg>
        <span class="font-display text-xl font-bold tracking-tight text-primary"
          >Gestão Fiscal</span
        >
      </motion.div>

      <motion.div class="w-full" :variants="item">
        <Card
          variant="elevated"
          padding="sm"
          class="w-full rounded-2xl border border-line-2 bg-background ui-shadow-float"
        >
          <div v-if="$slots.title" class="mb-2">
            <slot name="title" />
          </div>

          <div v-if="$slots.subtitle" class="mb-6">
            <slot name="subtitle" />
          </div>

          <slot />
        </Card>
      </motion.div>
    </motion.main>
  </div>
</template>
