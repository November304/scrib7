<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar.vue'
import type { GameState, Player, User } from '@/types'

const props = defineProps<{
    players: Player[]
    hostId: User['id'] | null
    meId: User['id'] | undefined
    game: GameState | null
}>()

const isDrawer = (id: Player['id']) => props.game?.mode === 'classic' && props.game.drawerId === id
const hasGuessed = (id: Player['id']) =>
    props.game?.mode === 'classic' && props.game.guessed.includes(id)
const hasFinished = (id: Player['id']) =>
    props.game?.mode === 'impostor' && props.game.finished.includes(id)
const hasVoted = (id: Player['id']) =>
    props.game?.mode === 'impostor' && props.game.voted.includes(id)
</script>

<template>
    <section class="panel taped">
        <h2>
            Joueurs <span class="count">{{ players.length }}/10</span>
        </h2>
        <ul>
            <li
                v-for="player in players"
                :key="player.id"
                :class="{
                    me: player.id === meId,
                    guessed: hasGuessed(player.id),
                    drawing: isDrawer(player.id),
                }"
            >
                <span class="print">
                    <UserAvatar :user="player" :size="40" />
                </span>
                <div class="info">
                    <span class="name hand">{{ player.username }}</span>
                    <span class="meta">
                        <span v-if="game && game.phase !== 'lobby'" class="score"
                            >{{ game.scores[String(player.id)] ?? 0 }} pts</span
                        >
                        <span v-if="player.guest" class="tag">invité</span>
                    </span>
                </div>
                <!-- États : icône dessinée + texte pour les lecteurs d'écran -->
                <span class="states">
                    <span v-if="isDrawer(player.id)" class="state drawer" title="Dessine">
                        <span class="icon icon-pencil" aria-hidden="true"></span>
                        <span class="sr-only">Dessine</span>
                    </span>
                    <span v-if="hasGuessed(player.id)" class="state done" title="A trouvé">
                        <span class="icon icon-check" aria-hidden="true"></span>
                        <span class="sr-only">A trouvé</span>
                    </span>
                    <span
                        v-if="hasFinished(player.id)"
                        class="state done"
                        title="A fini son dessin"
                    >
                        <span class="icon icon-check" aria-hidden="true"></span>
                        <span class="sr-only">A fini son dessin</span>
                    </span>
                    <span v-if="hasVoted(player.id)" class="state" title="A voté">
                        <span class="icon icon-ballot" aria-hidden="true"></span>
                        <span class="sr-only">A voté</span>
                    </span>
                    <span v-if="player.id === hostId" class="state" title="Hôte de la salle">
                        <span class="icon icon-crown" aria-hidden="true"></span>
                        <span class="sr-only">Hôte de la salle</span>
                    </span>
                </span>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.panel {
    padding-top: 1.25rem;
}
ul {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin: 0;
    padding: 0;
    list-style: none;
}
li {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0.3rem 0.4rem;
    border-radius: var(--radius-paper);
}
li.drawing {
    background: var(--paper-2);
}
/* Tirages inclinés en alternance */
.print {
    rotate: calc(var(--tilt-soft) * -1);
}
li:nth-child(even) .print {
    rotate: var(--tilt-soft);
}
.info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    line-height: 1.2;
}
.name {
    overflow: hidden;
    font-size: 1.125rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
}
/* « Moi » : pseudo souligné au stylo bleu */
li.me .name {
    text-decoration: underline 2px var(--blue);
    text-underline-offset: 0.15em;
}
.meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: var(--fs-small);
    color: var(--ink-soft);
}
.score {
    font-variant-numeric: lining-nums tabular-nums;
}
.tag {
    padding: 0 0.35rem;
    font-size: 0.8125rem;
    background: var(--paper-2);
    border: 1px solid var(--line);
    border-radius: var(--radius-paper);
}
.states {
    display: flex;
    flex: none;
    gap: 0.3rem;
    font-size: 1.15rem;
}
.state {
    display: inline-flex;
    color: var(--ink);
}
.state.drawer {
    color: var(--blue);
}
.state.done {
    color: var(--green);
}
.count {
    font-weight: 400;
    color: var(--ink-soft);
}
</style>
