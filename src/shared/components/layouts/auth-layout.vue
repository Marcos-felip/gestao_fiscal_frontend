<script setup lang="ts">
import { motion } from 'motion-v'
import { Icon } from '@/shared/ui'

const brandContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const formContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28 },
  },
}

const features = [
  { icon: 'Building2', label: 'Gestão multiempresa num só lugar' },
  { icon: 'FileText', label: 'Notas fiscais e documentos sob controle' },
  { icon: 'TrendingUp', label: 'Indicadores em tempo real' },
]
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <!-- ============ PAINEL DE MARCA (desktop) ============ -->
    <aside class="brand-panel relative hidden overflow-hidden lg:flex">
      <!-- Atmosfera -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="ui-aurora absolute -top-24 -left-16 h-[460px] w-[460px] rounded-full bg-white/15 blur-[100px]"
        />
        <div
          class="ui-aurora absolute bottom-[-10%] right-[-5%] h-[420px] w-[420px] rounded-full bg-secondary-400/25 blur-[110px]"
          style="animation-delay: -8s"
        />
        <div class="brand-grid absolute inset-0" />
      </div>

      <motion.div
        class="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16"
        :variants="brandContainer"
        initial="hidden"
        animate="visible"
      >
        <!-- Marca -->
        <motion.div class="flex items-center gap-3" :variants="item">
          <img
            src="/apple-touch-icon.png"
            alt="Gestão Fiscal"
            class="h-11 w-11 rounded-xl shadow-lg ring-1 ring-white/20"
          />
          <span
            class="font-display text-xl font-bold tracking-tight text-white"
          >
            Gestão Fiscal
          </span>
        </motion.div>

        <!-- Manifesto (tagline da marca) -->
        <div>
          <motion.h1
            class="font-display text-4xl leading-[1.05] font-bold tracking-tight text-white xl:text-5xl"
            :variants="item"
          >
            Controle<span class="text-secondary-300">.</span><br />
            Inteligência<span class="text-secondary-300">.</span><br />
            Resultados<span class="text-secondary-300">.</span>
          </motion.h1>
          <motion.p
            class="mt-6 max-w-md text-base leading-relaxed text-white/70"
            :variants="item"
          >
            A plataforma fiscal que centraliza a operação das suas empresas com
            clareza e agilidade.
          </motion.p>
        </div>

        <!-- Diferenciais -->
        <motion.ul class="flex flex-col gap-3.5" :variants="item">
          <li
            v-for="feature in features"
            :key="feature.icon"
            class="flex items-center gap-3 text-sm text-white/80"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-secondary-200 ring-1 ring-white/15"
            >
              <Icon :name="feature.icon" size="sm" />
            </span>
            {{ feature.label }}
          </li>
        </motion.ul>
      </motion.div>
    </aside>

    <!-- ============ PAINEL DO FORMULÁRIO ============ -->
    <main
      class="relative flex items-center justify-center overflow-hidden bg-background-1 px-6 py-10 sm:px-10"
    >
      <!-- Atmosfera sutil (mobile, onde não há painel de marca) -->
      <div class="pointer-events-none absolute inset-0 lg:hidden">
        <div
          class="ui-aurora absolute -top-20 left-1/2 h-[380px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-200/60 to-transparent blur-[90px]"
        />
      </div>

      <motion.div
        class="relative z-10 w-full max-w-sm"
        :variants="formContainer"
        initial="hidden"
        animate="visible"
      >
        <!-- Logo (mobile) -->
        <motion.div
          class="mb-8 flex items-center justify-center gap-2.5 lg:hidden"
          :variants="item"
        >
          <img
            src="/apple-touch-icon.png"
            alt="Gestão Fiscal"
            class="h-10 w-10 rounded-xl"
          />
          <span class="font-display text-lg font-bold tracking-tight">
            <span class="text-foreground">Gestão</span>
            <span class="text-primary">Fiscal</span>
          </span>
        </motion.div>

        <motion.div class="mb-6" :variants="item">
          <slot name="title" />
          <slot name="subtitle" />
        </motion.div>

        <motion.div :variants="item">
          <slot />
        </motion.div>
      </motion.div>
    </main>
  </div>
</template>

<style scoped lang="css">
.brand-panel {
  background:
    radial-gradient(
      120% 120% at 0% 0%,
      var(--color-primary-600),
      transparent 55%
    ),
    linear-gradient(
      145deg,
      var(--color-primary-800),
      var(--color-primary-950) 60%,
      var(--color-secondary-950)
    );
}

/* Malha de pontos sutil sobre o gradiente */
.brand-grid {
  background-image: radial-gradient(
    circle,
    rgb(255 255 255 / 0.08) 1px,
    transparent 1px
  );
  background-size: 22px 22px;
  mask-image: linear-gradient(160deg, black, transparent 75%);
}
</style>
