<script setup lang="ts">
import { Card } from '@/shared/ui'
</script>

<template>
  <div
    class="relative flex min-h-svh items-center justify-center overflow-hidden bg-background-1 px-4"
  >
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -top-20 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-200/70 via-primary-300/50 to-transparent blur-[90px]"></div>
      <div class="absolute -top-10 right-[10%] h-[400px] w-[500px] rounded-full bg-gradient-to-br from-primary-300/55 via-primary-200/40 to-transparent blur-[80px]"></div>
      <div class="absolute top-[25%] -left-10 h-[450px] w-[400px] rounded-full bg-gradient-to-r from-primary-200/50 via-secondary-200/35 to-transparent blur-[70px]"></div>
      <div class="absolute bottom-[10%] right-[10%] h-[350px] w-[350px] rounded-full bg-gradient-to-tl from-secondary-200/45 via-primary-200/30 to-transparent blur-[70px]"></div>
      <div class="absolute bottom-[5%] left-[15%] h-[300px] w-[400px] rounded-full bg-gradient-to-tr from-primary-200/45 via-primary-100/30 to-transparent blur-[60px]"></div>
      <div class="absolute top-[8%] left-[30%] h-[250px] w-[350px] rounded-full bg-gradient-to-b from-secondary-200/30 to-transparent blur-[70px]"></div>
    </div>

    <main class="relative z-10 flex w-full max-w-md flex-col items-center gap-7">
      <div class="flex items-center gap-2">
        <svg
          class="h-7 w-7 text-primary"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="3" fill="none" />
          <circle cx="16" cy="16" r="5" fill="currentColor" />
          <path d="M16 2a14 14 0 0 1 0 28" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" />
        </svg>
        <span class="text-xl font-bold text-primary">Gestão Fiscal</span>
      </div>

      <Card
        variant="elevated"
        padding="sm"
        class="w-full rounded-xl border border-line-2 bg-background"
      >
        <div v-if="$slots.title" class="mb-2">
          <slot name="title" />
        </div>

        <div v-if="$slots.subtitle" class="mb-6">
          <slot name="subtitle" />
        </div>

        <slot />
      </Card>
    </main>
  </div>
</template>
