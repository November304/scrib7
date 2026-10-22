<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import UserAvatar from '@/components/UserAvatar.vue'
import type { GameHistoryPage, GameMode, GameRecord, GameStats } from '@/types'

const MODE_LABELS: Record<GameMode, string> = { classic: 'Classique', impostor: 'Imposteur' }
const FILTERS: { value: GameMode | null; label: string }[] = [
    { value: null, label: 'Toutes' },
    { value: 'classic', label: MODE_LABELS.classic },
    { value: 'impostor', label: MODE_LABELS.impostor },
]

const auth = useAuthStore()
const stats = ref<GameStats | null>(null)
const games = ref<GameRecord[]>([])
const nextCursor = ref<number | null>(null)
const mode = ref<GameMode | null>(null)
const loading = ref(false)
const error = ref('')

async function loadStats() {
    stats.value = await api<GameStats>('/games/stats')
}

// Sans curseur : première page (on remplace la liste), sinon page suivante (on ajoute)
async function loadGames(cursor: number | null = null) {
    loading.value = true
    error.value = ''
    try {
        const params = new URLSearchParams()
        if (mode.value) params.set('mode', mode.value)
        if (cursor) params.set('cursor', String(cursor))
        const page = await api<GameHistoryPage>(`/games?${params}`)
        games.value = cursor ? [...games.value, ...page.games] : page.games
        nextCursor.value = page.nextCursor
    } catch (err) {
        error.value = (err as Error).message
    } finally {
        loading.value = false
    }
}

async function remove(game: GameRecord) {
    if (!confirm('Retirer cette partie de ton historique ?')) return
    try {
        await api(`/games/${game.id}`, { method: 'DELETE' })
        games.value = games.value.filter((g) => g.id !== game.id)
        await loadStats()
    } catch (err) {
        error.value = (err as Error).message
    }
}

onMounted(() => {
    if (auth.user?.guest) return
    loadStats().catch((err) => (error.value = err.message))
    loadGames()
})
watch(mode, () => loadGames())

const rankLabel = (rank: number) => (rank === 1 ? '1er' : `${rank}e`)
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
const formatDate = (iso: string) => dateFormat.format(new Date(iso))
const duration = (game: GameRecord) =>
    Math.max(1, Math.round((Date.parse(game.endedAt) - Date.parse(game.startedAt)) / 60000))
</script>

<template>
    <div class="history">
        <h1>Historique</h1>

        <section v-if="auth.user?.guest" class="card">
            <p>
                Les invités n'ont pas d'historique : crée un compte pour garder une trace de tes
                parties.
            </p>
        </section>

        <template v-else>
            <section v-if="stats" class="stats" aria-label="Statistiques">
                <div class="card stat">
                    <strong>{{ stats.played }}</strong>
                    <span class="muted">parties</span>
                </div>
                <div class="card stat">
                    <strong>{{ stats.wins }}</strong>
                    <span class="muted">victoires</span>
                </div>
                <div class="card stat">
                    <strong>{{ stats.totalPoints }}</strong>
                    <span class="muted">points au total</span>
                </div>
                <div class="card stat">
                    <strong>{{ stats.bestScore }}</strong>
                    <span class="muted">meilleur score</span>
                </div>
            </section>

            <div class="filters" role="group" aria-label="Filtrer par mode">
                <button
                    v-for="f in FILTERS"
                    :key="f.label"
                    class="btn small"
                    :class="{ primary: mode === f.value }"
                    :aria-pressed="mode === f.value"
                    @click="mode = f.value"
                >
                    {{ f.label }}
                    <template v-if="stats && f.value"
                        >({{ stats.byMode[f.value].played }})</template
                    >
                </button>
            </div>

            <p v-if="error" class="error" role="alert">{{ error }}</p>

            <p v-if="!loading && !games.length && !error" class="card muted">
                Aucune partie terminée pour l'instant. À tes crayons !
            </p>

            <ol class="games">
                <li v-for="game in games" :key="game.id" class="card game">
                    <header class="game-head">
                        <div>
                            <h2>{{ MODE_LABELS[game.mode] }}</h2>
                            <p class="muted meta">
                                {{ formatDate(game.endedAt) }} · {{ game.rounds }} manche{{
                                    game.rounds > 1 ? 's' : ''
                                }}
                                · {{ duration(game) }} min · salle {{ game.roomCode }}
                            </p>
                        </div>
                        <p v-if="game.me" class="mine">
                            <span class="rank" :class="{ stamp: game.me.rank === 1 }">{{
                                rankLabel(game.me.rank)
                            }}</span>
                            <strong>{{ game.me.score }} pts</strong>
                        </p>
                    </header>
                    <ol class="players">
                        <li
                            v-for="(p, i) in game.players"
                            :key="i"
                            :class="{ me: p.userId === auth.user?.id }"
                        >
                            <span class="muted">{{ rankLabel(p.rank) }}</span>
                            <UserAvatar
                                :user="{ ...p, id: p.userId ?? `${game.id}-${i}` }"
                                :size="28"
                            />
                            <span class="hand name">{{ p.username }}</span>
                            <span class="score">{{ p.score }}</span>
                        </li>
                    </ol>
                    <button class="btn ghost small remove" @click="remove(game)">
                        Retirer de mon historique
                    </button>
                </li>
            </ol>

            <button
                v-if="nextCursor"
                class="btn more"
                :disabled="loading"
                @click="loadGames(nextCursor)"
            >
                {{ loading ? 'Chargement…' : 'Voir plus' }}
            </button>
        </template>
    </div>
</template>

<style scoped>
.history {
    display: grid;
    gap: 1.25rem;
    max-width: 820px;
    margin: 1rem auto 0;
}
.stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
}
.stat {
    display: grid;
    padding: 1rem;
    text-align: center;
}
.stat:nth-child(odd) {
    rotate: calc(var(--tilt-slight) * -1);
}
.stat:nth-child(even) {
    rotate: var(--tilt-slight);
}
.stat strong {
    font-size: var(--fs-mark);
    line-height: 1.1;
}
.filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.games {
    display: grid;
    gap: 1.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
}
.game {
    padding: 1.25rem 1.5rem;
}
.game-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}
.game-head h2 {
    margin: 0;
}
.meta {
    margin: 0;
    font-size: var(--fs-small);
}
.mine {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0;
    font-size: var(--fs-lead);
}
.rank:not(.stamp) {
    font-weight: 700;
}
.players {
    display: grid;
    gap: 0.35rem;
    margin: 1rem 0 0.5rem;
    padding: 0.75rem 0 0;
    list-style: none;
    border-top: 2px dashed var(--line);
}
.players li {
    display: grid;
    grid-template-columns: 2.5em auto 1fr auto;
    align-items: center;
    gap: 0.6rem;
}
.players .me .name {
    font-weight: 700;
    color: var(--blue);
}
.name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.score {
    font-variant-numeric: tabular-nums;
}
.remove {
    margin-left: -0.75rem;
    color: var(--ink-soft);
}
.more {
    justify-self: center;
}

@media (max-width: 600px) {
    .stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
