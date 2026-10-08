<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar.vue'
import type { Player, User } from '@/types'

defineProps<{ players: Player[]; hostId: User['id'] | null; meId: User['id'] | undefined }>()
</script>

<template>
    <section class="panel">
        <h2>
            Joueurs <span class="count">{{ players.length }}/10</span>
        </h2>
        <ul>
            <li v-for="player in players" :key="player.id" :class="{ me: player.id === meId }">
                <UserAvatar :user="player" />
                <span class="name">{{ player.username }}</span>
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
    border-radius: 10px;
}
li.me {
    background: var(--accent-soft);
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
    border-radius: 999px;
}
.count {
    font-weight: 400;
    color: var(--text-muted);
}
</style>
