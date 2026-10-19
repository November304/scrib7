<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AvatarPicker from '@/components/AvatarPicker.vue'
import type { AvatarId, HatId } from '@/avatars'

type Mode = 'guest' | 'login' | 'register'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const mode = ref<Mode>('guest')
const username = ref('')
const password = ref('')
const avatar = ref<AvatarId | null>(null)
const hat = ref<HatId | null>(null)
const error = ref('')
const loading = ref(false)

const TABS: { mode: Mode; label: string }[] = [
    { mode: 'guest', label: 'Invité' },
    { mode: 'login', label: 'Connexion' },
    { mode: 'register', label: 'Inscription' },
]

async function submit() {
    error.value = ''
    loading.value = true
    try {
        if (mode.value === 'guest')
            await auth.loginAsGuest(username.value, { avatar: avatar.value, hat: hat.value })
        else if (mode.value === 'login') await auth.login(username.value, password.value)
        else
            await auth.register(username.value, password.value, {
                avatar: avatar.value,
                hat: hat.value,
            })
        const redirect = route.query.redirect
        router.replace(typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/')
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Erreur inconnue'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="card auth">
        <!-- Intercalaires de classeur qui dépassent du haut de la fiche -->
        <div class="tabs" role="tablist">
            <button
                v-for="tab in TABS"
                :key="tab.mode"
                role="tab"
                :aria-selected="mode === tab.mode"
                :class="{ active: mode === tab.mode }"
                @click="((mode = tab.mode), (error = ''))"
            >
                {{ tab.label }}
            </button>
        </div>

        <h1>Dessine. Devine. Démasque.</h1>
        <p class="intro">Rejoins une partie en invité, ou crée un compte pour garder tes stats.</p>

        <form @submit.prevent="submit">
            <label>
                Pseudo
                <input
                    v-model="username"
                    autocomplete="username"
                    required
                    minlength="3"
                    maxlength="20"
                    autofocus
                />
            </label>
            <label v-if="mode !== 'guest'">
                Mot de passe
                <input
                    v-model="password"
                    type="password"
                    :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                    required
                    minlength="6"
                />
            </label>
            <AvatarPicker
                v-if="mode !== 'login'"
                v-model:avatar="avatar"
                v-model:hat="hat"
                :username="username"
            />
            <p v-if="error" class="error" role="alert">{{ error }}</p>
            <button class="btn primary" :disabled="loading">
                {{
                    mode === 'guest'
                        ? 'Jouer en invité'
                        : mode === 'login'
                          ? 'Se connecter'
                          : 'Créer mon compte'
                }}
            </button>
        </form>
    </div>
</template>

<style scoped>
/* Fiche de bibliothèque : intercalaires en haut, filet rouge sous l'en-tête */
.auth {
    max-width: 460px;
    margin: 4.5rem auto 0;
    border-top-left-radius: 0;
}
h1 {
    margin-bottom: 0.4rem;
}
.intro {
    margin: 0 0 1.25rem;
    padding-bottom: 1rem;
    color: var(--ink-soft);
    border-bottom: 2px solid var(--red);
}
.tabs {
    position: absolute;
    bottom: 100%;
    left: 0;
    display: flex;
    gap: 3px;
}
.tabs button {
    min-height: 44px;
    padding: 0.5rem 1.1rem 0.4rem;
    font: inherit;
    font-weight: 700;
    color: var(--ink-soft);
    background: var(--paper-2);
    border: none;
    border-radius: var(--radius-tab) var(--radius-tab) 0 0;
    box-shadow: var(--shadow-tab);
    cursor: pointer;
    transition: color var(--dur-quick) ease-out;
}
.tabs button:hover {
    color: var(--ink);
}
.tabs button.active {
    color: var(--ink);
    background: var(--paper) var(--tex-paper);
    background-blend-mode: multiply;
    box-shadow: none;
}
form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-weight: 700;
}
@media (max-width: 420px) {
    .tabs button {
        padding-inline: 0.7rem;
    }
    form .btn {
        width: 100%;
    }
}
</style>
