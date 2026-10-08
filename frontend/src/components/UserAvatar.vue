<script setup lang="ts">
import { computed } from 'vue'
import { colorFromId, initials } from '@/utils'
import type { User } from '@/types'

const props = withDefaults(defineProps<{ user: User; size?: number }>(), { size: 36 })
const background = computed(() => colorFromId(props.user.id))
</script>

<template>
    <img
        v-if="user.avatar"
        :src="user.avatar"
        :alt="user.username"
        :width="size"
        :height="size"
        class="avatar"
    />
    <svg
        v-else
        :width="size"
        :height="size"
        viewBox="0 0 40 40"
        class="avatar"
        role="img"
        :aria-label="user.username"
    >
        <circle cx="20" cy="20" r="20" :fill="background" />
        <text
            x="20"
            y="21"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#fff"
            font-size="15"
            font-weight="700"
        >
            {{ initials(user.username) }}
        </text>
    </svg>
</template>

<style scoped>
.avatar {
    flex-shrink: 0;
    border-radius: 50%;
    object-fit: cover;
}
</style>
