<script setup lang="ts">
import { computed } from 'vue'
import DifficultyTag from '@/components/DifficultyTag.vue'
import type { GameState, Player } from '@/types'

const props = defineProps<{ game: GameState; players: Player[]; isDrawer: boolean }>()
defineEmits<{ choose: [index: number] }>()

const nameOf = (id: Player['id'] | null) => props.players.find((p) => p.id === id)?.username ?? '…'

// Le choix du mot et la fin de tour n'existent qu'en mode classique
const classic = computed(() => (props.game.mode === 'classic' ? props.game : null))

// Points gagnés pendant le tour qui vient de se terminer, du meilleur au moins bon
const turnResults = computed(() =>
    props.players
        .map((p) => ({ ...p, points: classic.value?.turnPoints?.[String(p.id)] ?? 0 }))
        .sort((a, b) => b.points - a.points),
)

const ranking = computed(() =>
    props.players
        .map((p) => ({ ...p, score: props.game.scores[String(p.id)] ?? 0 }))
        .sort((a, b) => b.score - a.score),
)
// Rang écrit à l'encre ; le premier reçoit un tampon rouge
const rankOf = (i: number) => (i === 0 ? '1er' : `${i + 1}e`)
</script>

<template>
    <div v-if="classic?.phase === 'choosing'" class="overlay">
        <div class="sheet torn">
            <template v-if="isDrawer && classic.choices">
                <h2>Choisis un mot à dessiner</h2>
                <!-- Trois bouts de papier différents : rotation et tape propres à chacun -->
                <div class="choices">
                    <button
                        v-for="(choice, i) in classic.choices"
                        :key="choice.text"
                        class="choice"
                        @click="$emit('choose', i)"
                    >
                        <strong>{{ choice.text }}</strong>
                        <DifficultyTag :difficulty="choice.difficulty" />
                    </button>
                </div>
                <p class="muted">Plus c'est difficile, plus ça rapporte de points</p>
            </template>
            <h2 v-else class="hand waiting">{{ nameOf(classic.drawerId) }} choisit un mot…</h2>
        </div>
    </div>

    <div v-else-if="classic?.phase === 'turnEnd'" class="overlay">
        <div class="sheet torn">
            <p class="hand was">Le mot était</p>
            <h2 class="reveal">{{ classic.word }}</h2>
            <ul class="results">
                <li v-for="p in turnResults" :key="p.id">
                    <span class="who"
                        >{{ p.username
                        }}<template v-if="p.id === classic.drawerId"
                            ><span class="icon icon-pencil" aria-hidden="true"></span
                            ><span class="sr-only"> (dessinateur)</span></template
                        ></span
                    >
                    <strong :class="{ zero: !p.points }">+{{ p.points }}</strong>
                </li>
            </ul>
        </div>
    </div>

    <div v-else-if="game.phase === 'gameEnd'" class="overlay">
        <div class="sheet torn">
            <h2>Partie terminée !</h2>
            <ol class="results ranking">
                <li v-for="(p, i) in ranking" :key="p.id" :class="{ first: i === 0 }">
                    <span class="who">
                        <span class="rank" :class="{ stamp: i === 0 }">{{ rankOf(i) }}</span>
                        {{ p.username }}
                    </span>
                    <strong>{{ p.score }} pts</strong>
                </li>
            </ol>
        </div>
    </div>
</template>

<style scoped>
.overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: grid;
    place-items: center;
    padding: 1rem;
    overflow: auto;
    background: rgb(168 135 88 / 0.22); /* voile kraft, pas gris */
}
/* Fiche bristol posée sur le tableau : elle glisse et se cale */
.sheet {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    max-width: 100%;
    padding: 1.25rem 1.75rem 1.75rem;
    text-align: center;
    filter: drop-shadow(0 2px 2px rgb(60 40 20 / 0.2)) drop-shadow(0 12px 14px rgb(60 40 20 / 0.35));
    rotate: calc(var(--tilt-slight) * -1);
    animation: settle var(--dur-settle) var(--ease-settle);
}
@keyframes settle {
    from {
        opacity: 0;
        translate: 0 -8px;
        rotate: 0deg;
    }
}
.sheet h2 {
    margin: 0;
}
.sheet p {
    margin: 0;
}
.waiting {
    font-size: 1.375rem;
}
.choices {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 1.25rem;
    justify-content: center;
    padding-top: 0.5rem;
}
.choice {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    align-items: center;
    min-width: 9rem;
    padding: 1rem 1.1rem 0.8rem;
    font: inherit;
    color: var(--ink);
    background: var(--paper-bright);
    border: none;
    border-radius: var(--radius-paper);
    box-shadow: var(--shadow-print);
    cursor: pointer;
    rotate: -2deg;
    transition:
        box-shadow var(--dur-quick) ease-out,
        rotate var(--dur-quick) ease-out,
        translate var(--dur-quick) ease-out;
}
.choice::before {
    content: '';
    position: absolute;
    top: -9px;
    left: 0.4rem;
    width: 52px;
    height: 17px;
    background: url('/assets/scrapbook/tape-1.svg') 0 0 / 100% 100%;
    rotate: -8deg;
}
.choice:nth-child(2) {
    rotate: 1.4deg;
}
.choice:nth-child(2)::before {
    left: calc(50% - 26px);
    rotate: 3deg;
    background-image: url('/assets/scrapbook/tape-2.svg');
}
.choice:nth-child(3) {
    rotate: -0.8deg;
}
.choice:nth-child(3)::before {
    right: 0.4rem;
    left: auto;
    rotate: 10deg;
    background-image: url('/assets/scrapbook/tape-3.svg');
}
.choice strong {
    font-size: 1.25rem;
    line-height: 1.2;
}
/* Survol : le papier se soulève et se redresse à moitié */
.choice:hover {
    box-shadow: var(--shadow-lift);
    translate: 0 -3px;
    rotate: -1deg;
}
.choice:nth-child(2):hover {
    rotate: 0.7deg;
}
.choice:nth-child(3):hover {
    rotate: -0.4deg;
}

.was {
    font-size: 1.125rem;
    color: var(--ink-soft);
}
.reveal {
    font-size: var(--fs-display);
    font-weight: 800;
    line-height: 1.05;
}
/* Feuille de score : lignes en pointillés */
.results {
    display: flex;
    flex-direction: column;
    width: min(320px, 100%);
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: left;
}
.results li {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    min-height: 2.25rem;
    border-bottom: 1.5px dashed var(--line);
}
.who {
    display: inline-flex;
    gap: 0.4rem;
    align-items: center;
    min-width: 0;
    font-weight: 700;
}
.who .icon {
    color: var(--blue);
}
.results strong {
    font-variant-numeric: lining-nums tabular-nums;
    color: var(--green);
}
.results strong.zero {
    color: var(--ink-soft);
}
.ranking strong {
    color: var(--ink);
}
.rank {
    display: inline-grid;
    place-items: center;
    width: 2.5rem;
    font-weight: 800;
    color: var(--ink-soft);
}
.ranking li.first {
    min-height: 3.5rem;
    font-size: 1.125rem;
}
/* Tampon « 1er » : il tape une fois */
.rank.stamp {
    width: 48px;
    height: 48px;
    font-size: 1rem;
    animation: stamp var(--dur-stamp) ease-out both;
    animation-delay: var(--dur-settle);
}
@keyframes stamp {
    from {
        opacity: 0;
        scale: 1.25;
    }
}

@media (max-width: 600px) {
    .sheet {
        padding: 0.9rem 1rem 1.4rem;
        gap: 0.5rem;
    }
    .choices {
        flex-wrap: nowrap;
        gap: 0.6rem;
    }
    .choice {
        flex: 1 1 0;
        min-width: 0;
        padding: 0.7rem 0.5rem 0.5rem;
    }
    .choice strong {
        font-size: 1rem;
    }
    .sheet > p.muted {
        display: none;
    }
}
</style>
