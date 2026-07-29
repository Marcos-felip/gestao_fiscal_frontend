<script setup lang="ts">
import { motion } from 'motion-v'
import { Icon } from '@/shared/ui'
import type { OnboardingStep } from '@/modules/companies/presentation/schemas/onboarding-schema'

defineProps<{
  steps: OnboardingStep[]
  current: number
}>()
</script>

<template>
  <aside class="brand-panel relative hidden overflow-hidden lg:flex">
    <div class="pointer-events-none absolute inset-0">
      <div
        class="ui-aurora absolute -top-24 -left-16 h-[460px] w-[460px] rounded-full bg-white/15 blur-[100px]"
      />
      <div
        class="ui-aurora absolute right-[-5%] bottom-[-10%] h-[420px] w-[420px] rounded-full bg-secondary-400/25 blur-[110px]"
        style="animation-delay: -8s"
      />
      <div class="brand-grid absolute inset-0" />
    </div>

    <div class="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
      <!-- Marca -->
      <motion.div
        class="flex items-center gap-3"
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ type: 'spring', stiffness: 320, damping: 28 }"
      >
        <span
          class="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg ring-1 ring-white/25"
        >
          <img src="/apple-touch-icon.png" alt="Gestão Fiscal" class="h-8 w-8" />
        </span>
        <span class="font-display text-xl font-bold tracking-tight text-white">
          Gestão Fiscal
        </span>
      </motion.div>

      <!-- Manifesto + trilha -->
      <div>
        <motion.h1
          class="font-display text-4xl leading-[1.05] font-bold tracking-tight text-white xl:text-[2.75rem]"
          :initial="{ opacity: 0, y: 16 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{
            delay: 0.05,
            type: 'spring',
            stiffness: 320,
            damping: 28,
          }"
        >
          Falta pouco para<br />
          começar<span class="text-secondary-300">.</span>
        </motion.h1>
        <motion.p
          class="mt-4 max-w-md text-base leading-relaxed text-white/70"
          :initial="{ opacity: 0, y: 16 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.12, duration: 0.4 }"
        >
          Alguns dados da sua empresa e a matriz — e o sistema está pronto para
          operar.
        </motion.p>

        <!-- Trilha vertical de passos (sincronizada com o formulário) -->
        <ol class="mt-10 space-y-1">
          <li
            v-for="(step, index) in steps"
            :key="step.key"
            class="flex items-start gap-4"
          >
            <div class="flex flex-col items-center">
              <span
                :class="[
                  'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1 transition-colors duration-300',
                  index < current
                    ? 'bg-white text-primary-700 ring-white'
                    : index === current
                      ? 'bg-secondary-400 text-white ring-secondary-300'
                      : 'bg-white/10 text-white/60 ring-white/20',
                ]"
              >
                <Icon v-if="index < current" name="Check" size="sm" />
                <template v-else>{{ index + 1 }}</template>
              </span>
              <span
                v-if="index < steps.length - 1"
                :class="[
                  'my-1 w-px flex-1 transition-colors duration-300',
                  index < current ? 'bg-white/60' : 'bg-white/15',
                ]"
                style="min-height: 1.75rem"
              />
            </div>

            <div class="pt-1.5 pb-2">
              <p
                :class="[
                  'font-medium transition-colors duration-300',
                  index === current ? 'text-white' : 'text-white/70',
                ]"
              >
                {{ step.title }}
              </p>
              <p class="text-sm text-white/50">{{ step.description }}</p>
            </div>
          </li>
        </ol>
      </div>

      <p class="text-xs text-white/40">
        Passo {{ current + 1 }} de {{ steps.length }}
      </p>
    </div>
  </aside>
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
