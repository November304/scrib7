<script setup lang="ts">
import { computed } from 'vue'
import { avatarUrl, hatUrl, headTop } from '@/avatars'
import { colorFromId, initials } from '@/utils'
import type { User } from '@/types'

type Look = Pick<User, 'id' | 'username' | 'avatar' | 'hat'>

const props = withDefaults(defineProps<{ user: Look; size?: number }>(), { size: 36 })
const color = computed(() => colorFromId(props.user.id))
const src = computed(() => avatarUrl(props.user.avatar))
const hat = computed(() => hatUrl(props.user.hat))
// Le couvre-chef (40×20) est centré et recouvre légèrement le haut de la tête
const hatY = computed(() => headTop(props.user.avatar) - 17)
</script>

<template>
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 64 64"
        class="avatar"
        role="img"
        :aria-label="user.username"
    >
        <image v-if="src" :href="src" width="64" height="64" />
        <template v-else>
            <!-- Même style que les avatars dessinés : fond sombre, liseré et initiales néon -->
            <rect width="64" height="64" class="initials-bg" />
            <rect x="1" y="1" width="62" height="62" fill="none" :stroke="color" stroke-width="2" />
            <text
                x="32"
                y="40"
                text-anchor="middle"
                dominant-baseline="middle"
                :fill="color"
                font-size="24"
                font-weight="700"
            >
                {{ initials(user.username) }}
            </text>
        </template>
        <image v-if="hat" :href="hat" x="12" :y="hatY" width="40" height="20" />
    </svg>
</template>

<style scoped>
.avatar {
    flex-shrink: 0;
    border-radius: var(--radius-sm);
}
.initials-bg {
    fill: var(--surface);
}
</style>
