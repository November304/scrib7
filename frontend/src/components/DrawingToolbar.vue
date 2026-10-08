<script setup lang="ts">
const COLORS = [
    '#000000',
    '#7f7f7f',
    '#c3c3c3',
    '#ffffff',
    '#e53935',
    '#fb8c00',
    '#fdd835',
    '#43a047',
    '#00acc1',
    '#1e88e5',
    '#8e24aa',
    '#ec407a',
    '#6d4c41',
    '#ffccbc',
]
const WIDTHS = [3, 8, 16, 32]
const ERASER = '#ffffff'

const color = defineModel<string>('color', { required: true })
const width = defineModel<number>('width', { required: true })
defineProps<{ canClear: boolean }>()
defineEmits<{ undo: []; clear: [] }>()
</script>

<template>
    <div class="toolbar">
        <div class="colors" role="radiogroup" aria-label="Couleur">
            <button
                v-for="c in COLORS"
                :key="c"
                class="swatch"
                :class="{ active: color === c }"
                :style="{ background: c }"
                :aria-label="c"
                :aria-checked="color === c"
                role="radio"
                @click="color = c"
            />
            <label class="swatch custom" title="Couleur personnalisée">
                <input v-model="color" type="color" />
            </label>
        </div>

        <div class="widths" role="radiogroup" aria-label="Épaisseur">
            <button
                v-for="w in WIDTHS"
                :key="w"
                class="tool"
                :class="{ active: width === w }"
                :aria-label="`Épaisseur ${w}`"
                role="radio"
                :aria-checked="width === w"
                @click="width = w"
            >
                <svg viewBox="0 0 32 32" width="28" height="28">
                    <circle cx="16" cy="16" :r="Math.max(w / 2.4, 2)" fill="currentColor" />
                </svg>
            </button>
        </div>

        <div class="actions">
            <button
                class="tool"
                :class="{ active: color === ERASER }"
                title="Gomme"
                @click="color = ERASER"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                >
                    <path d="M16 3l5 5-11 11H5l-2-2 13-14z" />
                    <path d="M9 21h12" />
                </svg>
            </button>
            <button class="tool" title="Annuler (Ctrl+Z)" @click="$emit('undo')">
                <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                >
                    <path d="M9 14L4 9l5-5" />
                    <path d="M4 9h11a5 5 0 010 10h-3" />
                </svg>
            </button>
            <button
                v-if="canClear"
                class="tool danger"
                title="Tout effacer"
                @click="$emit('clear')"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                >
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
    align-items: center;
    padding: 0.6rem 0.75rem;
    background: var(--surface);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}
.colors {
    display: grid;
    grid-template-columns: repeat(8, 24px);
    gap: 4px;
}
.swatch {
    width: 24px;
    height: 24px;
    padding: 0;
    border: 2px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
}
.swatch.active {
    outline: 3px solid var(--accent);
    outline-offset: 1px;
}
.swatch.custom {
    position: relative;
    overflow: hidden;
    background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
}
.swatch.custom input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
}
.widths,
.actions {
    display: flex;
    gap: 4px;
}
.actions {
    margin-left: auto;
}
.tool {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    color: var(--text);
    background: var(--surface-2);
    border: 2px solid transparent;
    border-radius: 10px;
    cursor: pointer;
}
.tool:hover {
    background: var(--border);
}
.tool.active {
    border-color: var(--accent);
    color: var(--accent);
}
.tool.danger:hover {
    color: var(--danger);
}
</style>
