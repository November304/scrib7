<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { ChatMessage, User } from '@/types'

const props = defineProps<{
    messages: ChatMessage[]
    meId: User['id'] | undefined
    placeholder?: string
}>()
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
                :class="[m.variant, { system: !m.from, me: m.from?.id === meId }]"
            >
                <template v-if="m.from"
                    ><strong>{{ m.from.username }}</strong> {{ m.text }}</template
                >
                <template v-else
                    ><span
                        v-if="m.variant === 'success'"
                        class="icon icon-check"
                        aria-hidden="true"
                    ></span>
                    {{ m.text }}</template
                >
            </li>
        </ul>
        <form @submit.prevent="send">
            <input
                v-model="input"
                maxlength="200"
                :placeholder="placeholder ?? 'Écris ta réponse…'"
                aria-label="Message"
            />
        </form>
    </section>
</template>

<style scoped>
/* Fiche bristol lignée : une ligne bleue tous les 26px, marge rouge à gauche */
.chat {
    --rule: 26px;
    --margin: 2.25rem;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0.9rem 0.9rem 0.9rem calc(var(--margin) + 0.6rem);
    background-color: var(--paper-bright);
}
.chat::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--margin);
    width: 1.5px;
    background: rgb(179 54 43 / 0.55);
}
h2 {
    margin-bottom: 0.25rem;
}
ul {
    flex: 1;
    min-height: calc(var(--rule) * 4);
    margin: 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
    overflow-wrap: anywhere;
    line-height: var(--rule);
    background: repeating-linear-gradient(
            #0000 0 calc(var(--rule) - 1px),
            rgb(43 76 154 / 0.2) calc(var(--rule) - 1px) var(--rule)
        )
        local;
}
li.system {
    font-family: var(--font-hand);
    font-size: 1rem;
    color: var(--ink-soft);
}
li.success {
    font-weight: 700;
    color: var(--green);
}
li.close {
    color: var(--red);
}
li.me strong {
    text-decoration: underline 2px var(--blue);
    text-underline-offset: 0.15em;
}
/* Le champ de saisie est la dernière ligne de la fiche */
input {
    margin-top: 0.4rem;
    padding-inline: 0.25rem;
    background: none;
    border: none;
    border-bottom: 2px solid var(--line);
    border-radius: 0;
}
input:focus-visible {
    border-bottom-color: var(--blue);
}
</style>
