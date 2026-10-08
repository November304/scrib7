<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRoomStore } from '@/stores/room'
import { socket } from '@/services/socket'
import DrawingBoard from '@/components/DrawingBoard.vue'
import DrawingToolbar from '@/components/DrawingToolbar.vue'
import PlayerList from '@/components/PlayerList.vue'
import ChatBox from '@/components/ChatBox.vue'

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
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
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
            <PlayerList :players="room.players" :host-id="room.hostId" :me-id="auth.user?.id" />
        </aside>

        <div class="stage">
            <p v-if="socket.status.value !== 'open'" class="reconnecting">Reconnexion en cours…</p>
            <DrawingBoard
                :strokes="room.strokes"
                :color="color"
                :width="width"
                :disabled="socket.status.value !== 'open'"
                @start="room.startStroke"
                @points="room.sendPoints"
            />
            <DrawingToolbar
                v-model:color="color"
                v-model:width="width"
                :can-clear="room.isHost"
                @undo="room.undo"
                @clear="room.clear"
            />
        </div>

        <ChatBox
            class="chat"
            :messages="room.messages"
            :me-id="auth.user?.id"
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
    font-family: ui-monospace, monospace;
    font-size: 1.8rem;
    letter-spacing: 0.15em;
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
