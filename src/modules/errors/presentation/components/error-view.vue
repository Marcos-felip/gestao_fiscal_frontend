<script setup lang="ts">
import { motion } from 'motion-v'
import { useRouter } from 'vue-router'
import { Button, Icon } from '@/shared/ui'

interface Props {
  code: string
  title: string
  description: string
  icon: string
  tone?: 'primary' | 'destructive'
  retry?: boolean
}

withDefaults(defineProps<Props>(), {
  tone: 'primary',
  retry: false,
})

const router = useRouter()

function goHome(): void {
  router.push('/')
}

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function reload(): void {
  window.location.reload()
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
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
    class="error-view relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background-1 px-4"
    :class="tone === 'destructive' ? 'tone-destructive' : 'tone-primary'"
  >
    <!-- Atmosfera tingida pelo tom do erro -->
    <div class="pointer-events-none absolute inset-0">
      <div
        class="ui-aurora tone-glow absolute left-1/2 top-[15%] h-[500px] w-[600px] -translate-x-1/2 rounded-full blur-[100px]"
      />
      <div
        class="ui-aurora tone-glow absolute bottom-[10%] right-[12%] h-[320px] w-[320px] rounded-full blur-[80px]"
        style="animation-delay: -7s"
      />
    </div>

    <motion.main
      class="relative z-10 flex max-w-lg flex-col items-center text-center"
      :variants="container"
      initial="hidden"
      animate="visible"
    >
      <motion.span
        :variants="item"
        class="badge flex h-16 w-16 items-center justify-center rounded-2xl"
      >
        <Icon :name="icon" size="xl" :stroke-width="2" />
      </motion.span>

      <motion.p
        :variants="item"
        class="code font-display mt-6 text-8xl leading-none font-bold tracking-tight sm:text-9xl"
      >
        {{ code }}
      </motion.p>

      <motion.h1
        :variants="item"
        class="mt-4 text-2xl font-bold tracking-tight text-balance text-foreground"
      >
        {{ title }}
      </motion.h1>

      <motion.p
        :variants="item"
        class="mt-2 max-w-md text-sm leading-relaxed text-balance text-muted-foreground"
      >
        {{ description }}
      </motion.p>

      <motion.div
        :variants="item"
        class="mt-8 flex flex-col-reverse gap-3 sm:flex-row"
      >
        <Button
          variant="ghost"
          size="md"
          class="sm:min-w-[150px]"
          @click="goBack"
        >
          Voltar
        </Button>
        <Button
          v-if="retry"
          variant="primary"
          size="md"
          class="sm:min-w-[150px]"
          text-class="text-white"
          @click="reload"
        >
          Tentar novamente
        </Button>
        <Button
          v-else
          variant="primary"
          size="md"
          class="sm:min-w-[150px]"
          text-class="text-white"
          @click="goHome"
        >
          Ir para o início
        </Button>
      </motion.div>
    </motion.main>
  </div>
</template>

<style scoped lang="css">
.error-view {
  --tone: var(--color-primary);
}

.error-view.tone-destructive {
  --tone: var(--color-destructive);
}

.badge {
  color: var(--tone);
  background: color-mix(in srgb, var(--tone) 12%, var(--color-background));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--tone) 22%, transparent),
    0 0 0 8px color-mix(in srgb, var(--tone) 7%, transparent);
}

.code {
  background: linear-gradient(
    180deg,
    var(--tone),
    color-mix(in srgb, var(--tone) 45%, var(--color-foreground))
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tone-glow {
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--tone) 30%, transparent),
    transparent 70%
  );
}
</style>
