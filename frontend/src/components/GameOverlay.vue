<script setup lang="ts">
import { computed } from 'vue'
import { DIFFICULTY_LABELS } from '@/utils'
import type { GameState, Player } from '@/types'

const props = defineProps<{ game: GameState; players: Player[]; isDrawer: boolean }>()
defineEmits<{ choose: [index: number] }>()

const nameOf = (id: Player['id'] | null) => props.players.find((p) => p.id === id)?.username ?? '…'

// Points gagnés pendant le tour qui vient de se terminer, du meilleur au moins bon
const turnResults = computed(() =>
    props.players
        .map((p) => ({ ...p, points: props.game.turnPoints?.[String(p.id)] ?? 0 }))
        .sort((a, b) => b.points - a.points),
)

const ranking = computed(() =>
    props.players
        .map((p) => ({ ...p, score: props.game.scores[String(p.id)] ?? 0 }))
        .sort((a, b) => b.score - a.score),
)
const MEDALS = ['🥇', '🥈', '🥉']
</script>

<template>
    <div v-if="game.phase === 'choosing'" class="overlay">
        <template v-if="isDrawer && game.choices">
            <h2>Choisis un mot à dessiner</h2>
            <div class="choices">
                <button
                    v-for="(choice, i) in game.choices"
                    :key="choice.text"
                    class="choice"
                    :class="choice.difficulty"
                    @click="$emit('choose', i)"
                >
                    <strong>{{ choice.text }}</strong>
                    <span>{{ DIFFICULTY_LABELS[choice.difficulty] }}</span>
                </button>
            </div>
            <p class="muted">Plus c'est difficile, plus ça rapporte de points</p>
        </template>
        <h2 v-else>{{ nameOf(game.drawerId) }} choisit un mot…</h2>
    </div>

    <div v-else-if="game.phase === 'turnEnd'" class="overlay">
        <p class="muted">Le mot était</p>
        <h2 class="reveal">{{ game.word }}</h2>
        <ul class="results">
            <li v-for="p in turnResults" :key="p.id">
                <span>{{ p.username }}<template v-if="p.id === game.drawerId"> ✏️</template></span>
                <strong :class="{ zero: !p.points }">+{{ p.points }}</strong>
            </li>
        </ul>
    </div>

    <div v-else-if="game.phase === 'gameEnd'" class="overlay">
        <h2>Partie terminée !</h2>
        <ol class="results">
            <li v-for="(p, i) in ranking" :key="p.id" :class="{ first: i === 0 }">
                <span>{{ MEDALS[i] ?? `${i + 1}.` }} {{ p.username }}</span>
                <strong>{{ p.score }} pts</strong>
            </li>
        </ol>
    </div>
</template>

<style scoped>
.overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    text-align: center;
    color: var(--text);
    background: var(--overlay);
    border-radius: var(--radius);
}
.overlay h2 {
    margin: 0;
    font-size: 1.4rem;
}
.overlay p {
    margin: 0;
}
.choices {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
}
.choice {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 9rem;
    padding: 0.8rem 1.1rem;
    font: inherit;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    cursor: pointer;
    transition:
        border-color var(--transition),
        box-shadow var(--transition),
        transform var(--transition);
}
.choice strong {
    font-size: 1.15rem;
}
.choice span {
    font-size: 0.8rem;
    font-weight: 700;
}
.choice.easy span {
    color: var(--success);
}
.choice.medium span {
    color: var(--warning);
}
.choice.hard span {
    color: var(--danger);
}
.choice:hover {
    border-color: var(--accent);
    box-shadow: var(--accent-glow);
    transform: translateY(-2px);
}
@media (prefers-reduced-motion: reduce) {
    .choice:hover {
        transform: none;
    }
}
.reveal {
    font-size: 2rem !important;
}
.results {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    width: min(320px, 100%);
    margin: 0;
    padding: 0;
    list-style: none;
}
.results li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.3rem 0.6rem;
    background: var(--surface-2);
    border-radius: var(--radius-sm);
}
.results li.first {
    font-size: 1.15rem;
    background: var(--accent-soft);
    box-shadow: var(--accent-glow);
}
.results strong {
    font-family: var(--font-mono);
    color: var(--success);
}
.results strong.zero {
    color: var(--text-muted);
}
</style>
