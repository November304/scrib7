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
        <section class="card taped new">
            <h2>Nouvelle partie</h2>
            <p class="muted">Crée une salle et partage le code à tes amis.</p>
            <RouterLink class="btn primary big" :to="{ name: 'room', params: { code: 'new' } }">
                Créer une salle
            </RouterLink>
        </section>
        <!-- Ticket détachable : deux moitiés encochées, séparées par une ligne perforée -->
        <section class="ticket" aria-labelledby="join-title">
            <div class="stub top">
                <h2 id="join-title">Rejoindre</h2>
                <p class="muted">Entre le code donné par l'hôte.</p>
            </div>
            <form class="stub bottom join" @submit.prevent="join">
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
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    gap: 2rem;
    align-items: start;
    max-width: 820px;
    margin: 3rem auto 0;
}
.new {
    padding: 2.25rem 2rem 2rem;
    rotate: calc(var(--tilt-slight) * -1);
}
.new h2 {
    font-size: var(--fs-display);
    font-weight: 800;
    line-height: 1.05;
}
.new p {
    margin: 0 0 1.5rem;
}
.big {
    min-height: 52px;
    padding: 0.9rem 1.6rem;
    font-size: 1.125rem;
}

.ticket {
    margin-top: 2.5rem;
    filter: drop-shadow(0 1px 1px rgb(60 40 20 / 0.22)) drop-shadow(0 5px 7px rgb(60 40 20 / 0.25));
    rotate: var(--tilt-soft);
}
.stub {
    padding: 1.25rem 1.5rem;
    background: var(--paper-2) var(--tex-paper);
    background-blend-mode: multiply;
    mask-composite: intersect;
}
.top {
    padding-bottom: 1rem;
    mask:
        radial-gradient(circle 10px at 0 100%, #0000 96%, #000) no-repeat,
        radial-gradient(circle 10px at 100% 100%, #0000 96%, #000) no-repeat;
    mask-composite: intersect;
}
.top p {
    margin: 0;
}
.bottom {
    border-top: 2px dashed var(--line);
    mask:
        radial-gradient(circle 10px at 0 0, #0000 96%, #000) no-repeat,
        radial-gradient(circle 10px at 100% 0, #0000 96%, #000) no-repeat;
    mask-composite: intersect;
}
.join {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}
/* Code tapé à la machine dans 5 cases : chaque case fait 1.8ch, la lettre est centrée dedans */
.code-input {
    width: calc(9.4ch + 3px);
    padding: 0 0 0 0.4ch;
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 0.8ch;
    text-transform: uppercase;
    background:
        repeating-linear-gradient(
            90deg,
            #0000 0 calc(1.8ch - 1.5px),
            var(--line) calc(1.8ch - 1.5px) 1.8ch
        )
        0 0 / calc(9ch - 1.5px) 100% no-repeat padding-box,
        var(--paper-bright);
}
.code-input::placeholder {
    color: rgb(94 81 69 / 0.45);
}

@media (max-width: 700px) {
    .home {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 2rem;
    }
    .ticket {
        margin-top: 0;
    }
}
</style>
