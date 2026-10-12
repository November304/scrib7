<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar.vue'
import type { GameState, Player, User } from '@/types'

defineProps<{
    players: Player[]
    hostId: User['id'] | null
    meId: User['id'] | undefined
    game: GameState | null
}>()
</script>

<template>
    <section class="panel">
        <h2>
            Joueurs <span class="count">{{ players.length }}/10</span>
        </h2>
        <ul>
            <li
                v-for="player in players"
                :key="player.id"
                :class="{
                    me: player.id === meId,
                    guessed: game?.guessed.includes(player.id),
                    drawing: player.id === game?.drawerId,
                }"
            >
                <UserAvatar :user="player" />
                <div class="info">
                    <span class="name">{{ player.username }}</span>
                    <span v-if="game && game.phase !== 'lobby'" class="score"
                        >{{ game.scores[String(player.id)] ?? 0 }} pts</span
                    >
                </div>
                <span v-if="player.id === game?.drawerId" title="Dessine">✏️</span>
                <span v-if="game?.guessed.includes(player.id)" title="A trouvé">✅</span>
                <span v-if="player.id === hostId" class="badge" title="Hôte de la salle">👑</span>
                <span v-if="player.guest" class="tag">invité</span>
            </li>
        </ul>
    </section>
</template>

<style scoped>
ul {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
    list-style: none;
}
li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 0.5rem;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
}
li.me {
    background: var(--accent-soft);
}
li.drawing {
    border-color: var(--accent);
    box-shadow: var(--accent-glow);
}
li.guessed {
    background: var(--success-soft);
}
.info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.2;
}
.score {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text-muted);
}
.name {
    overflow: hidden;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.tag {
    margin-left: auto;
    padding: 0.1rem 0.45rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
}
.count {
    font-weight: 400;
    color: var(--text-muted);
}
</style>
