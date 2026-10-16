<script setup lang="ts">
import { pathOf } from '@/utils'
import type { Stroke } from '@/types'

const WIDTH = 800
const HEIGHT = 600

defineProps<{ stroke: Stroke }>()
</script>

<template>
    <!-- Pot de peinture : la zone remplie est une image transparente de la taille du tableau -->
    <image
        v-if="stroke.image"
        :href="stroke.image"
        :width="WIDTH"
        :height="HEIGHT"
        preserveAspectRatio="none"
    />
    <path
        v-else
        :d="pathOf(stroke.points)"
        :stroke="stroke.color"
        :stroke-width="stroke.width"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</template>
