<script setup lang="ts">
import { DIFFICULTY_LABELS } from '@/utils'
import type { Difficulty } from '@/types'

// 1, 2 ou 3 points d'encre + le libellé : la difficulté ne dépend jamais de la couleur seule
const LEVELS: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }

defineProps<{ difficulty: Difficulty }>()
</script>

<template>
    <span class="difficulty" :class="difficulty">
        <span class="dots" aria-hidden="true">
            <i v-for="n in 3" :key="n" :class="{ on: n <= LEVELS[difficulty] }"></i>
        </span>
        {{ DIFFICULTY_LABELS[difficulty] }}
    </span>
</template>

<style scoped>
.difficulty {
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
    font-size: var(--fs-small);
    font-weight: 700;
    color: var(--ink-soft);
}
.dots {
    display: inline-flex;
    gap: 2px;
}
.dots i {
    width: 7px;
    height: 7px;
    border: 1.5px solid currentColor;
    border-radius: 50%;
}
.dots i.on {
    background: currentColor;
}
.easy {
    color: var(--green);
}
.hard {
    color: var(--red);
}
</style>
