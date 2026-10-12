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
            <span class="muted">Aperçu</span>
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
                        <span class="tile none" aria-hidden="true">∅</span>
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
    gap: 1rem;
    align-items: flex-start;
}
.preview {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    align-items: center;
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}
.preview :deep(.avatar) {
    box-shadow: var(--accent-glow);
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
    margin-bottom: 0.3rem;
    padding: 0;
    font-weight: 600;
}
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 0.4rem;
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
.tile {
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 1;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    transition:
        border-color var(--transition),
        box-shadow var(--transition);
}
.tile.none,
.tile.hat {
    font-weight: 700;
    color: var(--text-muted);
    background: var(--surface-2);
}
.tile.hat img {
    width: 85%;
}
.option:hover .tile {
    border-color: var(--accent);
}
.option input:checked + .tile {
    border-color: var(--accent);
    box-shadow: var(--accent-glow);
}
.option input:focus-visible + .tile {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
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
