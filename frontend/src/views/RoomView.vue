<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRoomStore } from '@/stores/room'
import { socket } from '@/services/socket'
import DrawingBoard from '@/components/DrawingBoard.vue'
import DrawingToolbar from '@/components/DrawingToolbar.vue'
import PlayerList from '@/components/PlayerList.vue'
import ChatBox from '@/components/ChatBox.vue'
import GameHeader from '@/components/GameHeader.vue'
import GameOverlay from '@/components/GameOverlay.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const room = useRoomStore()

const color = ref('#000000')
const width = ref(8)
const copied = ref(false)

function enterFromRoute() {
    const code = String(route.params.code)
    if (code.toUpperCase() === room.code) return // on vient juste de remplacer /room/new
    room.enter(code === 'new' ? null : code)
}

// Une fois la salle créée, l'URL /room/new devient /room/ABCDE (partageable)
watch(
    () => room.code,
    (code) => {
        if (code && route.params.code !== code) router.replace({ name: 'room', params: { code } })
    },
)
watch(() => route.params.code, enterFromRoute)

function onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT') return
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && room.canDraw) {
        event.preventDefault()
        room.undo()
    }
}

onMounted(() => {
    enterFromRoute()
    window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
    room.leave()
    window.removeEventListener('keydown', onKeydown)
})

const chatPlaceholder = computed(() => {
    const game = room.game
    if (game?.phase !== 'drawing') return 'Écris un message…'
    if (room.isDrawer) return 'Seuls ceux qui ont trouvé te lisent'
    if (game.word) return 'Bien joué ! Seuls ceux qui ont trouvé te lisent'
    return 'Écris ta réponse…'
})

async function copyInvite() {
    await navigator.clipboard.writeText(location.href)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
    <div v-if="room.error" class="card notice">
        <h2>Oups</h2>
        <p>{{ room.error.message }}</p>
        <RouterLink to="/" class="btn primary">Retour à l'accueil</RouterLink>
    </div>

    <div v-else-if="!room.code" class="card notice">
        <p class="muted">Connexion à la salle…</p>
    </div>

    <div v-else class="room">
        <aside class="side">
            <div class="panel code-panel">
                <span class="muted">Code de la salle</span>
                <strong class="code">{{ room.code }}</strong>
                <button class="btn small" @click="copyInvite">
                    {{ copied ? 'Lien copié ✓' : "Copier le lien d'invitation" }}
                </button>
            </div>
            <PlayerList
                :players="room.players"
                :host-id="room.hostId"
                :me-id="auth.user?.id"
                :game="room.game"
            />
        </aside>

        <div class="stage">
            <p v-if="socket.status.value !== 'open'" class="reconnecting">Reconnexion en cours…</p>
            <GameHeader
                v-if="room.game"
                :game="room.game"
                :deadline="room.deadline"
                :players="room.players"
                :is-host="room.isHost"
                :is-drawer="room.isDrawer"
                @start="room.startGame"
            />
            <div class="board-wrap">
                <DrawingBoard
                    :strokes="room.strokes"
                    :color="color"
                    :width="width"
                    :disabled="socket.status.value !== 'open' || !room.canDraw"
                    @start="room.startStroke"
                    @points="room.sendPoints"
                />
                <GameOverlay
                    v-if="room.game"
                    :game="room.game"
                    :players="room.players"
                    :is-drawer="room.isDrawer"
                    @choose="room.chooseWord"
                />
            </div>
            <DrawingToolbar
                v-if="room.canDraw"
                v-model:color="color"
                v-model:width="width"
                :can-clear="room.canClear"
                @undo="room.undo"
                @clear="room.clear"
            />
        </div>

        <ChatBox
            class="chat"
            :messages="room.messages"
            :me-id="auth.user?.id"
            :placeholder="chatPlaceholder"
            @send="room.sendChat"
        />
    </div>
</template>

<style scoped>
.room {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr) 280px;
    gap: 1rem;
    align-items: start;
}
.side {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.stage {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.board-wrap {
    position: relative;
}
.chat {
    height: min(640px, 80vh);
}
.code-panel {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: flex-start;
}
.code {
    font-family: var(--font-mono);
    font-size: 1.8rem;
    letter-spacing: 0.15em;
    color: var(--accent);
    text-shadow: var(--accent-text-glow);
}
.notice {
    max-width: 420px;
    margin: 3rem auto 0;
    text-align: center;
}
.reconnecting {
    margin: 0;
    padding: 0.4rem 0.75rem;
    color: var(--danger);
    background: var(--surface);
    border: 1px solid var(--danger);
    border-radius: var(--radius);
}

@media (max-width: 1000px) {
    .room {
        grid-template-columns: 1fr;
    }
    .stage {
        order: -1;
    }
    .chat {
        height: 320px;
    }
}
</style>
