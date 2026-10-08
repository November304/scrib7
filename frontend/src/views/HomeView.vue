<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const code = ref('')

function join() {
    const value = code.value.trim().toUpperCase()
    if (value) router.push({ name: 'room', params: { code: value } })
}
</script>

<template>
    <div class="home">
        <section class="card">
            <h2>Nouvelle partie</h2>
            <p class="muted">Crée une salle et partage le code à tes amis.</p>
            <RouterLink class="btn primary" :to="{ name: 'room', params: { code: 'new' } }">
                Créer une salle
            </RouterLink>
        </section>
        <section class="card">
            <h2>Rejoindre</h2>
            <p class="muted">Entre le code donné par l'hôte.</p>
            <form class="join" @submit.prevent="join">
                <input
                    v-model="code"
                    placeholder="ABCDE"
                    maxlength="5"
                    class="code-input"
                    aria-label="Code de la salle"
                />
                <button class="btn" :disabled="code.trim().length !== 5">Rejoindre</button>
            </form>
        </section>
    </div>
</template>

<style scoped>
.home {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
    max-width: 760px;
    margin: 3rem auto 0;
}
h2 {
    margin-top: 0;
}
.join {
    display: flex;
    gap: 0.5rem;
}
.code-input {
    flex: 1;
    min-width: 0;
    font-family: ui-monospace, monospace;
    font-size: 1.2rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
}
</style>
