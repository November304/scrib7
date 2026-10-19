<script setup lang="ts">
import { AVATARS, HATS, type AvatarId, type HatId } from '@/avatars'
import { initials } from '@/utils'
import UserAvatar from '@/components/UserAvatar.vue'

defineProps<{ username: string }>()
const avatar = defineModel<AvatarId | null>('avatar', { required: true })
const hat = defineModel<HatId | null>('hat', { required: true })
</script>

<template>
    <div class="picker">
        <div class="preview">
            <UserAvatar
                :user="{ id: 'apercu', username: username || '?', avatar, hat }"
                :size="88"
            />
            <span class="hand caption">{{ username || 'Aperçu' }}</span>
        </div>

        <div class="groups">
            <!-- Vrais boutons radio (masqués) : navigation aux flèches et lecteurs d'écran gratuits -->
            <fieldset>
                <legend>Avatar <span class="muted">(facultatif)</span></legend>
                <div class="grid">
                    <label class="option" title="Aucun avatar">
                        <input v-model="avatar" type="radio" name="avatar" :value="null" />
                        <span class="tile none" aria-hidden="true">{{
                            initials(username) || '?'
                        }}</span>
                        <span class="sr-only">Aucun avatar (initiales)</span>
                    </label>
                    <label v-for="a in AVATARS" :key="a.id" class="option" :title="a.label">
                        <input v-model="avatar" type="radio" name="avatar" :value="a.id" />
                        <img class="tile" :src="`/avatars/${a.id}.svg`" :alt="a.label" />
                    </label>
                </div>
            </fieldset>

            <fieldset>
                <legend>Couvre-chef <span class="muted">(facultatif)</span></legend>
                <div class="grid">
                    <label class="option" title="Aucun couvre-chef">
                        <input v-model="hat" type="radio" name="hat" :value="null" />
                        <span class="tile none hand" aria-hidden="true">sans</span>
                        <span class="sr-only">Aucun couvre-chef</span>
                    </label>
                    <label v-for="h in HATS" :key="h.id" class="option" :title="h.label">
                        <input v-model="hat" type="radio" name="hat" :value="h.id" />
                        <span class="tile hat">
                            <img :src="`/hats/${h.id}.svg`" :alt="h.label" />
                        </span>
                    </label>
                </div>
            </fieldset>
        </div>
    </div>
</template>

<style scoped>
.picker {
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
}
/* Aperçu : un tirage plus grand, légendé au stylo */
.preview {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: 0.2rem;
    align-items: center;
    max-width: 104px;
    padding: 6px 6px 4px;
    background: var(--paper-bright);
    box-shadow: var(--shadow-print);
    rotate: calc(var(--tilt-soft) * -1);
}
.caption {
    max-width: 100%;
    overflow: hidden;
    font-size: 1rem;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.groups {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
}
fieldset {
    margin: 0;
    padding: 0;
    border: none;
}
legend {
    margin-bottom: 0.4rem;
    padding: 0;
    font-weight: 700;
}
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
    gap: 0.5rem;
}
.option {
    position: relative;
    cursor: pointer;
}
.option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}
/* Chaque choix est un petit tirage */
.tile {
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 1;
    padding: 2px;
    background: var(--paper-bright);
    box-shadow: var(--shadow-print);
    transition: translate var(--dur-quick) ease-out;
}
.tile.none,
.tile.hat {
    font-weight: 700;
    color: var(--ink-soft);
    background: var(--paper-2);
}
.tile.none.hand {
    font-size: var(--fs-small);
}
.tile.hat img {
    width: 85%;
}
.option:hover .tile {
    translate: 0 -2px;
}
/* Choix actif entouré au stylo bleu */
.option:has(input:checked)::after {
    content: '';
    position: absolute;
    inset: -7px -8px;
    background: url('/assets/scrapbook/scribble-circle.svg') 0 0 / 100% 100%;
    pointer-events: none;
}
.option input:focus-visible + .tile {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
}

/* Sur mobile, l'aperçu passe au-dessus des grilles */
@media (max-width: 420px) {
    .picker {
        flex-direction: column;
        align-items: center;
    }
    .groups {
        width: 100%;
    }
}
</style>
