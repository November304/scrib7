<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

type Mode = 'guest' | 'login' | 'register'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const mode = ref<Mode>('guest')
const username = ref('')
const password = ref('')
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
        if (mode.value === 'guest') await auth.loginAsGuest(username.value)
        else if (mode.value === 'login') await auth.login(username.value, password.value)
        else await auth.register(username.value, password.value)
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
        <h1>Dessine. Devine. <span class="accent">Démasque.</span></h1>
        <p class="muted">Rejoins une partie en invité, ou crée un compte pour garder tes stats.</p>

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
.auth {
    max-width: 420px;
    margin: 3rem auto 0;
}
h1 {
    margin: 0 0 0.5rem;
    font-size: 1.8rem;
    line-height: 1.15;
}
.tabs {
    display: flex;
    gap: 4px;
    margin: 1.25rem 0;
    padding: 4px;
    background: var(--surface-2);
    border-radius: 12px;
}
.tabs button {
    flex: 1;
    padding: 0.5rem;
    font: inherit;
    font-weight: 600;
    color: var(--text-muted);
    background: none;
    border: none;
    border-radius: 9px;
    cursor: pointer;
}
.tabs button.active {
    color: var(--text);
    background: var(--surface);
    box-shadow: var(--shadow);
}
form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
}
label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-weight: 600;
}
</style>
