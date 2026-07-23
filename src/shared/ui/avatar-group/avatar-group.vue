<template>
  <div :class="['avatar-group', 'flex items-center -space-x-3']">
    <!-- Avatares visíveis -->
    <div
      v-for="(avatar, index) in visibleAvatars"
      :key="`avatar-${index}`"
      :title="avatar.name"
      :class="[
        'avatar',
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-background',
        'flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary to-primary/60',
      ]"
    >
      <img
        v-if="avatar.src"
        :src="avatar.src"
        :alt="avatar.name"
        class="h-full w-full object-cover"
      />
      <span v-else class="text-xs font-bold text-primary-foreground">
        {{ avatar.initials }}
      </span>
    </div>

    <!-- Overflow indicator -->
    <div
      v-if="overflowCount > 0"
      :class="[
        'avatar-overflow',
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-background',
        'flex-shrink-0 bg-muted text-xs font-bold text-muted-foreground',
      ]"
      :title="`+${overflowCount} more`"
    >
      +{{ overflowCount }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Avatar {
  name: string
  initials: string
  src?: string
}

interface Props {
  avatars: Avatar[]
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 3,
})

const visibleAvatars = computed(() => props.avatars.slice(0, props.maxVisible))

const overflowCount = computed(() => {
  const overflow = props.avatars.length - props.maxVisible
  return overflow > 0 ? overflow : 0
})
</script>

<style scoped lang="css">
.avatar-group {
  --avatar-overlap: 0.75rem;
}

.avatar {
  box-shadow: 0 0 0 2px var(--color-background);
}

.avatar-overflow {
  box-shadow: 0 0 0 2px var(--color-background);
}
</style>
