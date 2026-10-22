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
import ImpostorGallery from '@/components/ImpostorGallery.vue'
import type { DrawingTool } from '@/types'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const room = useRoomStore()

const color = ref('#000000')
const width = ref(8)
const tool = ref<DrawingTool>('brush')
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

// Imposteur : une fois le temps écoulé, la galerie des dessins remplace le tableau
const showGallery = computed(
    () =>
        room.game?.mode === 'impostor' &&
        (room.game.phase === 'voting' || room.game.phase === 'results'),
)

const chatPlaceholder = computed(() => {
    const game = room.game
    if (game?.mode === 'impostor' && game.phase === 'voting') return 'Accuse, défends-toi…'
    if (game?.mode !== 'classic' || game.phase !== 'drawing') return 'Écris un message…'
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

    <div v-else class="room" :class="{ 'in-lobby': !room.game || room.game.phase === 'lobby' }">
        <aside class="side">
            <!-- Étiquette à bagage : le code de la salle à donner aux amis -->
            <div class="code-panel">
                <span class="muted">Code de la salle</span>
                <strong class="code">{{ room.code }}</strong>
                <button class="btn small" @click="copyInvite">
                    <span
                        class="icon"
                        :class="copied ? 'icon-check' : 'icon-copy'"
                        aria-hidden="true"
                    ></span>
                    {{ copied ? 'Lien copié' : "Copier le lien d'invitation" }}
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
            <p v-if="socket.status.value !== 'open'" class="reconnecting" role="status">
                Reconnexion en cours…
            </p>
            <GameHeader
                v-if="room.game"
                :game="room.game"
                :deadline="room.deadline"
                :players="room.players"
                :is-host="room.isHost"
                :is-drawer="room.isDrawer"
                :has-finished="room.hasFinished"
                @start="room.startGame"
                @finish="room.finishDrawing"
            />
            <ImpostorGallery
                v-if="showGallery && room.game?.mode === 'impostor'"
                :game="room.game"
                :players="room.players"
                :strokes="room.strokes"
                :me-id="auth.user?.id"
                @vote="room.vote"
            />
            <div v-else class="board-wrap taped-corners">
                <DrawingBoard
                    :strokes="room.strokes"
                    :color="color"
                    :width="width"
                    :tool="tool"
                    :disabled="socket.status.value !== 'open' || !room.canDraw"
                    @start="room.startStroke"
                    @points="room.sendPoints"
                    @fill="room.fill"
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
                v-model:tool="tool"
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
    grid-template-columns: 260px minmax(0, 1fr) 300px;
    gap: 1.5rem;
    align-items: start;
}
.side {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.stage {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
}
.board-wrap {
    position: relative;
}
.chat {
    height: min(680px, 82vh);
}

/* Étiquette à bagage : coin haut coupé, œillet dessiné, légèrement de travers */
.code-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: flex-start;
    padding: 1rem 1rem 1rem 3rem;
    background: var(--paper-2) var(--tex-paper);
    background-blend-mode: multiply;
    clip-path: polygon(1.4rem 0, 100% 0, 100% 100%, 1.4rem 100%, 0 calc(100% - 1.4rem), 0 1.4rem);
    filter: drop-shadow(0 2px 2px rgb(60 40 20 / 0.3));
    rotate: calc(var(--tilt-slight) * -1);
}
.code-panel::before {
    content: '';
    position: absolute;
    top: calc(50% - 9px);
    left: 0.9rem;
    width: 18px;
    height: 18px;
    background: var(--kraft);
    border: 3px solid var(--kraft-deep);
    border-radius: 50%;
}
.code {
    font-size: var(--fs-mark);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: 0.2em;
}
.notice {
    max-width: 440px;
    margin: 3rem auto 0;
    text-align: center;
}
.reconnecting {
    margin: 0;
    padding: 0.5rem 0.75rem;
    font-weight: 700;
    color: var(--red);
    background: var(--paper-bright);
    border: 1.5px solid var(--red);
    border-radius: var(--radius-paper);
}

/* Une colonne : bandeau → tableau → outils → chat → joueurs → code */
@media (max-width: 1000px) {
    .room {
        grid-template-columns: minmax(0, 1fr);
    }
    .stage {
        order: -2;
    }
    .chat {
        order: -1;
        height: 340px;
    }
    .side {
        flex-direction: column-reverse;
    }
    /* Avant la partie, le code à partager passe en premier */
    .in-lobby .side {
        order: -3;
        flex-direction: column;
    }
    .code-panel {
        align-self: flex-start;
    }
}
</style>
