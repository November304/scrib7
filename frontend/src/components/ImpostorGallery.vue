<script setup lang="ts">
import { computed } from 'vue'
import StrokeShape from '@/components/StrokeShape.vue'
import { CANVAS_COLOR } from '@/utils'
import type { ImpostorGameState, Player, Stroke, User } from '@/types'

const WIDTH = 800
const HEIGHT = 600

const props = defineProps<{
    game: ImpostorGameState
    players: Player[]
    strokes: Stroke[]
    meId: User['id'] | undefined
}>()
defineEmits<{ vote: [targetId: User['id']] }>()

const result = computed(() => props.game.result)
const nameOf = (id: User['id']) => props.players.find((p) => p.id === id)?.username ?? '?'

// Un dessin par joueur, avec qui a voté contre lui (affiché seulement aux résultats)
const drawings = computed(() =>
    props.players.map((player) => ({
        player,
        strokes: props.strokes.filter((s) => s.userId === player.id),
        voters: Object.entries(result.value?.votes ?? {})
            .filter(([, target]) => target === player.id)
            .map(([voter]) => props.players.find((p) => String(p.id) === voter)?.username ?? '?'),
        points: result.value?.points[String(player.id)] ?? 0,
    })),
)
</script>

<template>
    <section class="gallery">
        <header v-if="result" class="card verdict" :class="{ caught: result.caught }">
            <h2>
                {{ nameOf(result.impostorId) }} était l'imposteur
                {{ result.caught ? '… démasqué !' : 'et s’en sort !' }}
            </h2>
            <p class="words">
                <span
                    >Mot des joueurs : <b>{{ result.civilWord }}</b></span
                >
                <span
                    >Mot de l'imposteur : <b>{{ result.impostorWord }}</b></span
                >
            </p>
        </header>
        <p v-else class="panel intro">
            Ton mot était <b>{{ game.myWord }}</b
            >. Compare les dessins et vote pour l'imposteur (tu peux voter pour toi si tu penses que
            c'est toi !)
        </p>

        <!-- Des tirages épinglés au mur : rotation et scotch différents d'un dessin à l'autre -->
        <div class="grid" :class="{ votable: game.phase === 'voting' }">
            <article
                v-for="{ player, strokes: playerStrokes, voters, points } in drawings"
                :key="player.id"
                class="polaroid"
                :class="{
                    selected: game.myVote === player.id,
                    impostor: result?.impostorId === player.id,
                }"
            >
                <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" class="thumb">
                    <rect :width="WIDTH" :height="HEIGHT" :fill="CANVAS_COLOR" />
                    <StrokeShape
                        v-for="stroke in playerStrokes"
                        :key="stroke.id"
                        :stroke="stroke"
                    />
                </svg>
                <span v-if="result?.impostorId === player.id" class="verdict-stamp">Imposteur</span>
                <div class="footer">
                    <span class="name hand">
                        {{ player.username }}<template v-if="player.id === meId"> (toi)</template>
                    </span>
                    <button
                        v-if="game.phase === 'voting'"
                        class="btn small"
                        :class="{ primary: game.myVote === player.id }"
                        @click="$emit('vote', player.id)"
                    >
                        <span
                            v-if="game.myVote === player.id"
                            class="icon icon-check"
                            aria-hidden="true"
                        ></span>
                        {{ game.myVote === player.id ? 'Voté' : 'Voter' }}
                    </button>
                    <strong v-else-if="points" class="points">+{{ points }}</strong>
                </div>
                <p v-if="result" class="voters hand">
                    {{ voters.length ? `Accusé par ${voters.join(', ')}` : 'Aucune voix' }}
                </p>
            </article>
        </div>
    </section>
</template>

<style scoped>
.gallery {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.intro {
    margin: 0;
}
.verdict {
    padding: 1rem 1.25rem;
}
.verdict h2 {
    margin-bottom: 0.3rem;
    color: var(--red);
}
.verdict.caught h2 {
    color: var(--green);
}
.words {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1.5rem;
    margin: 0;
    color: var(--ink-soft);
}
.words b {
    color: var(--ink);
}
.grid {
    --k: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem 1.5rem;
    padding: 0.75rem 0.25rem 0;
}
/* Polaroïd : bord papier clair, légende en bas */
.polaroid {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 10px 10px 8px;
    background: var(--paper-bright);
    box-shadow: var(--shadow-print);
    rotate: calc(-2deg * var(--k));
    transition:
        box-shadow var(--dur-quick) ease-out,
        translate var(--dur-quick) ease-out;
}
.polaroid::before {
    content: '';
    position: absolute;
    top: -10px;
    left: calc(50% - 32px);
    z-index: 1;
    width: 64px;
    height: 19px;
    background: url('/assets/scrapbook/tape-1.svg') 0 0 / 100% 100%;
    rotate: -3deg;
}
.polaroid:nth-child(5n + 2) {
    rotate: calc(1.5deg * var(--k));
}
.polaroid:nth-child(5n + 2)::before {
    left: -14px;
    top: 2px;
    rotate: -38deg;
    background-image: url('/assets/scrapbook/tape-2.svg');
}
.polaroid:nth-child(5n + 3) {
    rotate: calc(-0.8deg * var(--k));
}
.polaroid:nth-child(5n + 3)::before {
    left: auto;
    right: -14px;
    top: 2px;
    rotate: 36deg;
    background-image: url('/assets/scrapbook/tape-3.svg');
}
.polaroid:nth-child(5n + 4) {
    rotate: calc(2.2deg * var(--k));
}
.polaroid:nth-child(5n + 4)::before {
    left: 18%;
    rotate: 4deg;
    background-image: url('/assets/scrapbook/tape-3.svg');
}
.polaroid:nth-child(5n + 5) {
    rotate: calc(-1.4deg * var(--k));
}
.polaroid:nth-child(5n + 5)::before {
    left: auto;
    right: 16%;
    rotate: -5deg;
    background-image: url('/assets/scrapbook/tape-2.svg');
}
.votable .polaroid:hover {
    box-shadow: var(--shadow-lift);
    translate: 0 -3px;
}
/* Mon vote : entouré au stylo bleu */
.polaroid.selected::after {
    content: '';
    position: absolute;
    inset: -16px -18px;
    background: url('/assets/scrapbook/scribble-circle.svg') 0 0 / 100% 100%;
    pointer-events: none;
}
.thumb {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 3;
    box-shadow: inset 0 0 0 1px rgb(42 31 22 / 0.12);
}
/* Tampon « Imposteur » posé de travers : il tape une fois */
.verdict-stamp {
    position: absolute;
    top: 28%;
    left: 50%;
    padding: 0.4rem 0.9rem;
    font-size: 1.375rem;
    font-weight: 800;
    line-height: 1;
    color: var(--red);
    background: rgb(255 252 245 / 0.75) url('/assets/scrapbook/stamp-rect.svg') 0 0 / 100% 100%;
    translate: -50% 0;
    rotate: -12deg;
    animation: stamp var(--dur-stamp) ease-out both;
}
@keyframes stamp {
    from {
        opacity: 0;
        scale: 1.25;
    }
}
.footer {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    min-height: 2.25rem;
}
.name {
    overflow: hidden;
    font-size: 1.125rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.points {
    font-variant-numeric: lining-nums tabular-nums;
    color: var(--green);
}
.voters {
    margin: 0;
    color: var(--ink-soft);
}

@media (max-width: 600px) {
    .grid {
        --k: 0.5;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1.5rem 1rem;
    }
    .polaroid {
        padding: 6px 6px 4px;
    }
    .footer {
        flex-wrap: wrap;
    }
    .footer .btn {
        width: 100%;
    }
    .verdict-stamp {
        font-size: 1rem;
    }
}
</style>
