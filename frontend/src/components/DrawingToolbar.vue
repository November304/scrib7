<script setup lang="ts">
import { CANVAS_COLOR } from '@/utils'
import type { DrawingTool } from '@/types'

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
const ERASER = CANVAS_COLOR

const color = defineModel<string>('color', { required: true })
const width = defineModel<number>('width', { required: true })
const tool = defineModel<DrawingTool>('tool', { required: true })

function pickWidth(w: number) {
    width.value = w
    tool.value = 'brush'
}

function pickEraser() {
    color.value = ERASER
    tool.value = 'brush'
}
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
                @click="pickWidth(w)"
            >
                <svg viewBox="0 0 32 32" width="28" height="28">
                    <circle cx="16" cy="16" :r="Math.max(w / 2.4, 2)" fill="currentColor" />
                </svg>
            </button>
        </div>

        <div class="actions">
            <button
                class="tool"
                :class="{ active: tool === 'brush' && color === ERASER }"
                title="Gomme"
                @click="pickEraser"
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
            <button
                class="tool"
                :class="{ active: tool === 'fill' }"
                title="Pot de peinture"
                @click="tool = tool === 'fill' ? 'brush' : 'fill'"
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
                    <path d="M11 3L3 11l7 7 8-8-7-7z" />
                    <path d="M3 11h15" />
                    <path d="M20 14s2 2.6 2 4a2 2 0 01-4 0c0-1.4 2-4 2-4z" fill="currentColor" />
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
/* Bande de papier sous le tableau */
.toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.5rem;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--paper-2) var(--tex-paper);
    background-blend-mode: multiply;
    border-radius: var(--radius-paper);
    box-shadow: var(--shadow-sheet);
}
.colors {
    display: grid;
    grid-template-columns: repeat(8, 28px);
    gap: 6px;
}
/* Pastilles rondes, comme des gouttes de peinture */
.swatch {
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: 50%;
    box-shadow:
        inset 0 0 0 1.5px rgb(42 31 22 / 0.22),
        0 1px 1px rgb(60 40 20 / 0.25);
    cursor: pointer;
    transition: scale var(--dur-quick) ease-out;
}
.swatch:hover {
    scale: 1.1;
}
.swatch.active {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
}
.swatch.custom {
    position: relative;
    overflow: hidden;
    /* Seul dégradé autorisé : il montre qu'on peut choisir n'importe quelle couleur */
    background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
}
.swatch.custom:focus-within {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
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
    gap: 6px;
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
    color: var(--ink);
    background: var(--paper-bright);
    border: 1.5px solid var(--line);
    border-radius: var(--radius-btn);
    cursor: pointer;
    transition:
        background-color var(--dur-quick) ease-out,
        border-color var(--dur-quick) ease-out;
}
.tool:hover {
    background: var(--paper);
}
.tool.active {
    color: var(--blue);
    background: var(--paper);
    border: 2px solid var(--blue);
}
.tool.danger {
    color: var(--red);
}
.tool.danger:hover {
    border-color: var(--red);
}

/* Au doigt : pastilles et outils de 44px */
@media (pointer: coarse) {
    .colors {
        grid-template-columns: repeat(auto-fill, 44px);
        width: 100%;
    }
    .swatch,
    .tool {
        width: 44px;
        height: 44px;
    }
}
@media (max-width: 600px) {
    .actions {
        margin-left: 0;
    }
}
</style>
