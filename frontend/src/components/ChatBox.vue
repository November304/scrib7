<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { ChatMessage, User } from '@/types'

const props = defineProps<{ messages: ChatMessage[]; meId: User['id'] | undefined }>()
const emit = defineEmits<{ send: [text: string] }>()

const input = ref('')
const list = ref<HTMLElement>()

function send() {
    const text = input.value.trim()
    if (!text) return
    emit('send', text)
    input.value = ''
}

// Défilement automatique, sauf si l'utilisateur est remonté lire l'historique
watch(
    () => props.messages.length,
    async () => {
        const el = list.value
        if (!el) return
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
        await nextTick()
        if (atBottom) el.scrollTop = el.scrollHeight
    },
)
</script>

<template>
    <section class="panel chat">
        <h2>Chat</h2>
        <ul ref="list" aria-live="polite">
            <li
                v-for="(m, i) in messages"
                :key="i"
                :class="{ system: !m.from, me: m.from?.id === meId }"
            >
                <template v-if="m.from"
                    ><strong>{{ m.from.username }}</strong> {{ m.text }}</template
                >
                <template v-else>{{ m.text }}</template>
            </li>
        </ul>
        <form @submit.prevent="send">
            <input
                v-model="input"
                maxlength="200"
                placeholder="Écris ta réponse…"
                aria-label="Message"
            />
        </form>
    </section>
</template>

<style scoped>
.chat {
    display: flex;
    flex-direction: column;
    min-height: 0;
}
ul {
    flex: 1;
    min-height: 120px;
    margin: 0 0 0.5rem;
    padding: 0;
    overflow-y: auto;
    list-style: none;
    overflow-wrap: anywhere;
}
li {
    padding: 0.2rem 0.3rem;
    border-radius: 6px;
}
li:nth-child(odd) {
    background: var(--surface-2);
}
li.system {
    font-style: italic;
    color: var(--text-muted);
}
li.me strong {
    color: var(--accent);
}
</style>
