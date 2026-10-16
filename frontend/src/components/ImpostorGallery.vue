<script setup lang="ts">
import { computed } from 'vue'
import { pathOf } from '@/utils'
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
        <header v-if="result" class="verdict" :class="{ caught: result.caught }">
            <strong>
                {{ nameOf(result.impostorId) }} était l'imposteur
                {{ result.caught ? '… démasqué !' : 'et s’en sort !' }}
            </strong>
            <span>
                Mot des joueurs : <b>{{ result.civilWord }}</b> · Mot de l'imposteur :
                <b>{{ result.impostorWord }}</b>
            </span>
        </header>
        <p v-else class="muted intro">
            Ton mot était <b>{{ game.myWord }}</b
            >. Compare les dessins et vote pour l'imposteur (tu peux voter pour toi si tu penses que
            c'est toi !)
        </p>

        <div class="grid">
            <article
                v-for="{ player, strokes: playerStrokes, voters, points } in drawings"
                :key="player.id"
                class="card"
                :class="{
                    selected: game.myVote === player.id,
                    impostor: result?.impostorId === player.id,
                }"
            >
                <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" class="thumb">
                    <rect :width="WIDTH" :height="HEIGHT" fill="#ffffff" />
                    <path
                        v-for="stroke in playerStrokes"
                        :key="stroke.id"
                        :d="pathOf(stroke.points)"
                        :stroke="stroke.color"
                        :stroke-width="stroke.width"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
                <div class="footer">
                    <span class="name">
                        {{ player.username }}<template v-if="player.id === meId"> (toi)</template>
                        <template v-if="result?.impostorId === player.id"> 🕵️</template>
                    </span>
                    <button
                        v-if="game.phase === 'voting'"
                        class="btn small"
                        :class="{ primary: game.myVote === player.id }"
                        @click="$emit('vote', player.id)"
                    >
                        {{ game.myVote === player.id ? 'Voté ✓' : 'Voter' }}
                    </button>
                    <strong v-else-if="points" class="points">+{{ points }}</strong>
                </div>
                <p v-if="result" class="voters muted">
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
    gap: 0.75rem;
}
.intro {
    margin: 0;
}
.verdict {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.75rem 1rem;
    color: var(--warning);
    background: var(--surface);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}
.verdict.caught {
    color: var(--success);
}
.verdict span {
    color: var(--text);
}
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
}
.card {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.5rem;
    background: var(--surface);
    border: 3px solid transparent;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}
.card.selected {
    border-color: var(--accent);
}
.card.impostor {
    border-color: var(--danger);
}
.thumb {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 3;
    border: 1px solid var(--border);
    border-radius: 8px;
}
.footer {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
}
.name {
    overflow: hidden;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.points {
    color: var(--success);
}
.voters {
    margin: 0;
    font-size: 0.8rem;
}
</style>
