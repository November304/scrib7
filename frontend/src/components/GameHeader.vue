<script setup lang="ts">
import { computed, ref } from 'vue'
import DifficultyTag from '@/components/DifficultyTag.vue'
import { useNow } from '@/utils'
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
    <div class="game-header torn taped">
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
            <p v-else class="hand waiting">En attente que l'hôte lance la partie…</p>
        </template>

        <template v-else>
            <span class="round hand">Manche {{ game.round }}/{{ game.rounds }}</span>

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
                <DifficultyTag
                    v-if="classic.difficulty && classic.phase !== 'choosing'"
                    :difficulty="classic.difficulty"
                />
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
                <span v-if="!hasFinished" class="icon icon-check" aria-hidden="true"></span>
                {{
                    hasFinished
                        ? `Modifier (${impostor.finished.length}/${players.length} prêts)`
                        : "J'ai fini"
                }}
            </button>

            <!-- Tampon du minuteur : sous 10 s il s'encre en plein et dit « vite ! » -->
            <span
                class="stamp timer"
                :class="{ urgent: game.phase === 'drawing' && seconds <= 10 }"
            >
                <span class="sr-only">Temps restant :</span>
                <span>{{ seconds }}<span class="sr-only"> secondes</span></span>
                <small v-if="game.phase === 'drawing' && seconds <= 10" class="hand">vite !</small>
            </span>
        </template>
    </div>
</template>

<style scoped>
/* Bande de papier déchirée en bas, tenue par un tape, légèrement de travers */
.game-header {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    align-items: center;
    justify-content: space-between;
    min-height: 4.75rem;
    padding: 0.6rem 1.1rem 1.1rem;
    rotate: calc(var(--tilt-slight) * -1);
}
.game-header p {
    margin: 0;
}
.waiting {
    font-size: var(--fs-lead);
    color: var(--ink-soft);
}
.settings {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1.25rem;
    align-items: center;
}
.settings label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-weight: 700;
}
.round {
    font-size: var(--fs-lead);
    font-weight: 700;
    color: var(--ink-soft);
}
.word {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 0.4rem 0.75rem;
    align-items: baseline;
    justify-content: center;
}
.word strong {
    font-size: var(--fs-word);
    font-weight: 800;
    line-height: 1.1;
}
/* Indice : lettres cachées = traits d'encre, lettres révélées en gras */
.hint {
    display: flex;
    gap: 0.3rem;
    align-items: flex-end;
    font-size: var(--fs-word);
    font-weight: 800;
    line-height: 1.1;
}
.hint .blank {
    width: 0.75em;
    height: 1.1em;
    border-bottom: 3px solid var(--ink);
}
.hint .shown {
    min-width: 0.75em;
    text-align: center;
}
.hint .space {
    width: 0.5em;
}
.timer {
    position: relative;
    flex-direction: column;
    gap: 0;
}
.timer small {
    font-size: var(--fs-small);
    line-height: 1;
}
.timer.urgent {
    color: var(--paper);
    background-color: var(--red);
    border-radius: 50%;
}

@media (max-width: 600px) {
    .word {
        order: 3;
        flex-basis: 100%;
    }
}
</style>
