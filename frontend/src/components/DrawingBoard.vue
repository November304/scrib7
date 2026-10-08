<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { Point, Stroke } from '@/types'

const WIDTH = 800
const HEIGHT = 600
const MIN_DISTANCE = 1.5 // on ignore les mouvements plus petits (moins de points à envoyer)
const FLUSH_INTERVAL = 40 // ms entre deux envois de points (~25 messages/s max)

const props = defineProps<{
    strokes: Stroke[]
    color: string
    width: number
    disabled?: boolean
}>()

const emit = defineEmits<{
    start: [stroke: Stroke]
    points: [id: string, points: Point[]]
}>()

const svg = ref<SVGSVGElement>()
let current: Stroke | null = null
let pending: Point[] = []
let flushTimer: ReturnType<typeof setInterval> | undefined

// Coordonnées écran -> coordonnées du viewBox, quelle que soit la taille affichée
function toSvgPoint(event: PointerEvent): Point {
    const matrix = svg.value!.getScreenCTM()!.inverse()
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix)
    // Arrondi au dixième, comme le serveur : tout le monde voit exactement le même tracé
    const clamp = (v: number, max: number) => Math.round(Math.min(Math.max(v, 0), max) * 10) / 10
    return [clamp(p.x, WIDTH), clamp(p.y, HEIGHT)]
}

function flush() {
    if (current && pending.length) {
        emit('points', current.id, pending)
        pending = []
    }
}

function onPointerDown(event: PointerEvent) {
    if (props.disabled || event.button !== 0) return
    svg.value!.setPointerCapture(event.pointerId)
    current = {
        id: crypto.randomUUID(),
        userId: 0, // rempli par le serveur pour les autres joueurs
        color: props.color,
        width: props.width,
        points: [toSvgPoint(event)],
    }
    emit('start', current)
    // On récupère l'objet devenu réactif dans le store pour que l'affichage suive
    current = props.strokes.at(-1) ?? current
    flushTimer = setInterval(flush, FLUSH_INTERVAL)
}

function onPointerMove(event: PointerEvent) {
    if (!current) return
    // Les "coalesced events" donnent tous les points intermédiaires : tracé plus fluide
    const events = event.getCoalescedEvents?.() ?? [event]
    for (const e of events.length ? events : [event]) {
        const point = toSvgPoint(e)
        const last = current.points.at(-1)!
        if (Math.hypot(point[0] - last[0], point[1] - last[1]) < MIN_DISTANCE) continue
        current.points.push(point)
        pending.push(point)
    }
}

function onPointerUp() {
    if (!current) return
    flush()
    clearInterval(flushTimer)
    current = null
}

onBeforeUnmount(onPointerUp)

// Courbe lissée : on passe par les milieux des segments avec des courbes de Bézier
function pathOf(points: Point[]) {
    const [first, ...rest] = points
    if (!first) return ''
    if (rest.length === 0) return `M${first[0]} ${first[1]}l0.01 0` // un simple point
    let d = `M${first[0]} ${first[1]}`
    for (let i = 0; i < rest.length - 1; i++) {
        const [x1, y1] = rest[i]!
        const [x2, y2] = rest[i + 1]!
        d += `Q${x1} ${y1} ${(x1 + x2) / 2} ${(y1 + y2) / 2}`
    }
    const last = rest.at(-1)!
    return d + `L${last[0]} ${last[1]}`
}
</script>

<template>
    <svg
        ref="svg"
        class="board"
        :class="{ disabled }"
        :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
    >
        <rect :width="WIDTH" :height="HEIGHT" fill="#ffffff" />
        <path
            v-for="stroke in strokes"
            :key="stroke.id"
            :d="pathOf(stroke.points)"
            :stroke="stroke.color"
            :stroke-width="stroke.width"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
</template>

<style scoped>
.board {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    cursor: crosshair;
    touch-action: none; /* sinon le doigt fait défiler la page au lieu de dessiner */
    user-select: none;
}
.board.disabled {
    cursor: not-allowed;
}
</style>
