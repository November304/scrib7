<script setup lang="ts">
import { computed, ref } from 'vue'
import { DIFFICULTY_LABELS, useNow } from '@/utils'
import type { GameState, Player } from '@/types'

const ROUNDS = [1, 2, 3, 4, 5, 6, 8, 10]
const DRAW_TIMES = [30, 45, 60, 80, 100, 120, 150, 180]
const MIN_PLAYERS = 2

const props = defineProps<{
    game: GameState
    deadline: number
    players: Player[]
    isHost: boolean
    isDrawer: boolean
}>()
defineEmits<{ start: [settings: { rounds: number; drawTime: number }] }>()

const rounds = ref(props.game.rounds)
const drawTime = ref(props.game.drawTime)

const now = useNow()
const seconds = computed(() => Math.ceil(Math.max(0, props.deadline - now.value) / 1000))
const inLobby = computed(() => props.game.phase === 'lobby' || props.game.phase === 'gameEnd')
const drawerName = computed(
    () => props.players.find((p) => p.id === props.game.drawerId)?.username ?? '…',
)
const letterCount = computed(() => props.game.hint?.replace(/[^_\p{L}\p{N}]/gu, '').length ?? 0)
</script>

<template>
    <div class="game-header">
        <template v-if="inLobby">
            <form
                v-if="isHost"
                class="settings"
                @submit.prevent="$emit('start', { rounds, drawTime })"
            >
                <label>
                    Manches
                    <select v-model.number="rounds">
                        <option v-for="r in ROUNDS" :key="r" :value="r">{{ r }}</option>
                    </select>
                </label>
                <label>
                    Temps de dessin
                    <select v-model.number="drawTime">
                        <option v-for="t in DRAW_TIMES" :key="t" :value="t">{{ t }} s</option>
                    </select>
                </label>
                <button class="btn primary" :disabled="players.length < MIN_PLAYERS">
                    {{ game.phase === 'gameEnd' ? 'Rejouer' : 'Lancer la partie' }}
                </button>
                <span v-if="players.length < MIN_PLAYERS" class="muted">
                    Invite au moins un ami pour jouer
                </span>
            </form>
            <p v-else class="muted">En attente que l'hôte lance la partie…</p>
        </template>

        <template v-else>
            <span class="round">Manche {{ game.round }}/{{ game.rounds }}</span>

            <div class="word" aria-live="polite">
                <template v-if="game.phase === 'choosing'">
                    <span class="muted">{{
                        isDrawer ? 'Choisis un mot' : `${drawerName} choisit un mot…`
                    }}</span>
                </template>
                <template v-else-if="game.word">
                    <span class="muted">{{
                        game.phase === 'turnEnd'
                            ? 'Le mot était'
                            : isDrawer
                              ? 'Tu dessines'
                              : 'Trouvé !'
                    }}</span>
                    <strong>{{ game.word }}</strong>
                </template>
                <template v-else-if="game.hint">
                    <span class="hint" :aria-label="`Mot de ${letterCount} lettres`">
                        <span
                            v-for="(char, i) in game.hint"
                            :key="i"
                            :class="char === '_' ? 'blank' : char === ' ' ? 'space' : 'shown'"
                            >{{ char === '_' ? '' : char }}</span
                        >
                    </span>
                    <sup class="muted">{{ letterCount }}</sup>
                </template>
                <span
                    v-if="game.difficulty && game.phase !== 'choosing'"
                    class="difficulty"
                    :class="game.difficulty"
                    >{{ DIFFICULTY_LABELS[game.difficulty] }}</span
                >
            </div>

            <span class="timer" :class="{ urgent: game.phase === 'drawing' && seconds <= 10 }">
                ⏱ {{ seconds }}
            </span>
        </template>
    </div>
</template>

<style scoped>
.game-header {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    justify-content: space-between;
    min-height: 3.5rem;
    padding: 0.5rem 0.9rem;
    background: var(--surface);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}
.game-header p {
    margin: 0;
}
.settings {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
}
.settings label {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    font-weight: 600;
}
select {
    padding: 0.35rem 0.5rem;
    font: inherit;
    color: var(--text);
    background: var(--surface-2);
    border: 2px solid transparent;
    border-radius: 8px;
}
.round {
    font-weight: 700;
}
.word {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
}
.word strong {
    font-size: 1.3rem;
    letter-spacing: 0.05em;
}
.hint {
    display: flex;
    gap: 0.3rem;
    align-items: flex-end;
    font-size: 1.3rem;
    font-weight: 700;
}
.hint .blank {
    width: 0.9em;
    height: 1.4em;
    border-bottom: 3px solid currentColor;
}
.hint .shown {
    min-width: 0.9em;
    text-align: center;
}
.hint .space {
    width: 0.6em;
}
.difficulty {
    padding: 0.1rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 999px;
    background: var(--surface-2);
}
.difficulty.easy {
    color: var(--success);
}
.difficulty.medium {
    color: var(--warning);
}
.difficulty.hard {
    color: var(--danger);
}
.timer {
    min-width: 3.5rem;
    font-size: 1.2rem;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    text-align: right;
}
.timer.urgent {
    color: var(--danger);
}
</style>
