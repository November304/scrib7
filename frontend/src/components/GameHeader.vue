<script setup lang="ts">
import { computed, ref } from 'vue'
import { DIFFICULTY_LABELS, useNow } from '@/utils'
import type { GameMode, GameState, Player } from '@/types'

const ROUNDS = [1, 2, 3, 4, 5, 6, 8, 10]
const DRAW_TIMES = [30, 45, 60, 80, 100, 120, 150, 180]
const MODES: Record<GameMode, { label: string; minPlayers: number }> = {
    classic: { label: 'Classique', minPlayers: 2 },
    impostor: { label: 'Imposteur', minPlayers: 3 },
}

const props = defineProps<{
    game: GameState
    deadline: number
    players: Player[]
    isHost: boolean
    isDrawer: boolean
    hasFinished: boolean
}>()
defineEmits<{
    start: [settings: { mode: GameMode; rounds: number; drawTime: number }]
    finish: [done: boolean]
}>()

const mode = ref<GameMode>(props.game.mode)
const minPlayers = computed(() => MODES[mode.value].minPlayers)
const rounds = ref(props.game.rounds)
const drawTime = ref(props.game.drawTime)

const now = useNow()
const seconds = computed(() => Math.ceil(Math.max(0, props.deadline - now.value) / 1000))
const inLobby = computed(() => props.game.phase === 'lobby' || props.game.phase === 'gameEnd')
const nameOf = (id: Player['id'] | null | undefined) =>
    props.players.find((p) => p.id === id)?.username ?? '…'

// Raccourcis typés pour chaque mode (null si ce n'est pas le mode en cours)
const classic = computed(() => (props.game.mode === 'classic' ? props.game : null))
const impostor = computed(() => (props.game.mode === 'impostor' ? props.game : null))
const letterCount = computed(() => classic.value?.hint?.replace(/[^_\p{L}\p{N}]/gu, '').length ?? 0)
</script>

<template>
    <div class="game-header">
        <template v-if="inLobby">
            <form
                v-if="isHost"
                class="settings"
                @submit.prevent="$emit('start', { mode, rounds, drawTime })"
            >
                <label>
                    Mode
                    <select v-model="mode">
                        <option v-for="(m, key) in MODES" :key="key" :value="key">
                            {{ m.label }}
                        </option>
                    </select>
                </label>
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
                <button class="btn primary" :disabled="players.length < minPlayers">
                    {{ game.phase === 'gameEnd' ? 'Rejouer' : 'Lancer la partie' }}
                </button>
                <span v-if="players.length < minPlayers" class="muted">
                    Il faut au moins {{ minPlayers }} joueurs pour ce mode
                </span>
            </form>
            <p v-else class="muted">En attente que l'hôte lance la partie…</p>
        </template>

        <template v-else>
            <span class="round">Manche {{ game.round }}/{{ game.rounds }}</span>

            <div v-if="classic" class="word" aria-live="polite">
                <template v-if="classic.phase === 'choosing'">
                    <span class="muted">{{
                        isDrawer ? 'Choisis un mot' : `${nameOf(classic.drawerId)} choisit un mot…`
                    }}</span>
                </template>
                <template v-else-if="classic.word">
                    <span class="muted">{{
                        classic.phase === 'turnEnd'
                            ? 'Le mot était'
                            : isDrawer
                              ? 'Tu dessines'
                              : 'Trouvé !'
                    }}</span>
                    <strong>{{ classic.word }}</strong>
                </template>
                <template v-else-if="classic.hint">
                    <span class="hint" :aria-label="`Mot de ${letterCount} lettres`">
                        <span
                            v-for="(char, i) in classic.hint"
                            :key="i"
                            :class="char === '_' ? 'blank' : char === ' ' ? 'space' : 'shown'"
                            >{{ char === '_' ? '' : char }}</span
                        >
                    </span>
                    <sup class="muted">{{ letterCount }}</sup>
                </template>
                <span
                    v-if="classic.difficulty && classic.phase !== 'choosing'"
                    class="difficulty"
                    :class="classic.difficulty"
                    >{{ DIFFICULTY_LABELS[classic.difficulty] }}</span
                >
            </div>

            <div v-else-if="impostor" class="word" aria-live="polite">
                <template v-if="impostor.phase === 'results' && impostor.result">
                    <span class="muted">Imposteur :</span>
                    <strong>{{ nameOf(impostor.result.impostorId) }}</strong>
                </template>
                <template v-else-if="impostor.myWord">
                    <span class="muted">{{
                        impostor.phase === 'voting' ? 'Qui est l’imposteur ? Ton mot :' : 'Dessine'
                    }}</span>
                    <strong>{{ impostor.myWord }}</strong>
                </template>
            </div>

            <button
                v-if="impostor?.phase === 'drawing'"
                class="btn small"
                :class="{ primary: !hasFinished }"
                @click="$emit('finish', !hasFinished)"
            >
                {{
                    hasFinished
                        ? `Modifier (${impostor.finished.length}/${players.length} prêts)`
                        : "J'ai fini ✓"
                }}
            </button>

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
}
.round {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
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
    border: 1px solid currentColor;
    border-radius: var(--radius-sm);
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
    font-family: var(--font-mono);
    font-size: 1.2rem;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    text-align: right;
}
.timer.urgent {
    color: var(--danger);
    text-shadow: var(--danger-glow);
}
</style>
