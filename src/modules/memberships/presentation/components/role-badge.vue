<script setup lang="ts">
import { computed } from 'vue'
import { MembershipRole, membershipRoleLabels } from '@/core/enums/membership-role.enum'

const props = defineProps<{ role: MembershipRole }>()

const label = computed(() => membershipRoleLabels[props.role] ?? props.role)

const toneClasses = computed(() => {
  switch (props.role) {
    case MembershipRole.OWNER:
      return 'bg-primary/10 text-primary'
    case MembershipRole.ADMIN:
      return 'bg-secondary/10 text-secondary'
    default:
      return 'bg-muted text-muted-foreground'
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      toneClasses,
    ]"
  >
    {{ label }}
  </span>
</template>
