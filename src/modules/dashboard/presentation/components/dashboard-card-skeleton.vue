<script setup lang="ts">
/** Esqueleto no formato do cartão de indicador, para a troca não dar salto. */
import { Skeleton } from '@/shared/ui'
</script>

<template>
  <div
    class="rounded-2xl border border-line-2 bg-background p-5 ui-shadow-soft"
  >
    <div class="flex items-start justify-between gap-3">
      <Skeleton class="h-3 w-24 rounded" />
      <Skeleton class="h-9 w-9 rounded-xl" />
    </div>
    <Skeleton class="mt-5 h-7 w-28 rounded" />
    <Skeleton class="mt-2 h-3 w-32 rounded" />
  </div>
</template>
