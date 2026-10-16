import { pathOf } from '@/utils'
import type { Point, Stroke } from '@/types'

// Pot de peinture : on redessine les traits sur un canvas caché, on remplit la zone cliquée
// pixel par pixel, puis on envoie la zone remplie comme une image PNG transparente.

const WIDTH = 800
const HEIGHT = 600
const TOLERANCE = 48 // écart max par canal : absorbe l'anticrénelage du bord des traits
export const MAX_FILL_IMAGE = 60_000 // caractères, comme le serveur (messages limités à 64 ko)

// Les remplissages déjà faits sont des images : on ne les décode qu'une fois
const images = new Map<string, Promise<HTMLImageElement>>()
function loadImage(src: string) {
    let image = images.get(src)
    if (!image) {
        const img = new Image()
        img.src = src
        image = img.decode().then(() => img)
        images.set(src, image)
    }
    return image
}

function hexToRgb(hex: string) {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
}

// Renvoie l'image (data URL) de la zone remplie, ou null s'il n'y a rien à remplir
export async function computeFill(strokes: Stroke[], [x, y]: Point, color: string) {
    const canvas = document.createElement('canvas')
    canvas.width = WIDTH
    canvas.height = HEIGHT
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const stroke of strokes) {
        if (stroke.image) {
            ctx.drawImage(await loadImage(stroke.image), 0, 0, WIDTH, HEIGHT)
        } else {
            ctx.strokeStyle = stroke.color
            ctx.lineWidth = stroke.width
            ctx.stroke(new Path2D(pathOf(stroke.points)))
        }
    }

    const { data } = ctx.getImageData(0, 0, WIDTH, HEIGHT)
    const start = Math.min(Math.floor(y), HEIGHT - 1) * WIDTH + Math.min(Math.floor(x), WIDTH - 1)
    const target = [data[start * 4]!, data[start * 4 + 1]!, data[start * 4 + 2]!]
    const matches = (i: number) =>
        Math.abs(data[i * 4]! - target[0]!) <= TOLERANCE &&
        Math.abs(data[i * 4 + 1]! - target[1]!) <= TOLERANCE &&
        Math.abs(data[i * 4 + 2]! - target[2]!) <= TOLERANCE
    const [r, g, b] = hexToRgb(color)
    if (target[0] === r && target[1] === g && target[2] === b) return null // déjà de cette couleur

    // Remplissage par lignes : on s'étend à gauche et à droite, puis on regarde au-dessus/dessous
    const mask = new Uint8Array(WIDTH * HEIGHT)
    const stack = [start]
    while (stack.length) {
        const i = stack.pop()!
        if (mask[i] || !matches(i)) continue
        const rowStart = i - (i % WIDTH)
        let left = i
        let right = i
        while (left > rowStart && !mask[left - 1] && matches(left - 1)) left--
        while (right < rowStart + WIDTH - 1 && !mask[right + 1] && matches(right + 1)) right++
        for (let j = left; j <= right; j++) {
            mask[j] = 1
            if (j >= WIDTH && !mask[j - WIDTH]) stack.push(j - WIDTH)
            if (j < WIDTH * (HEIGHT - 1) && !mask[j + WIDTH]) stack.push(j + WIDTH)
        }
    }

    // On déborde d'un pixel pour passer sous le bord adouci des traits (sinon un liseré blanc reste)
    const out = ctx.createImageData(WIDTH, HEIGHT)
    for (let i = 0; i < mask.length; i++) {
        const col = i % WIDTH
        const filled =
            mask[i] ||
            (col > 0 && mask[i - 1]) ||
            (col < WIDTH - 1 && mask[i + 1]) ||
            mask[i - WIDTH] ||
            mask[i + WIDTH]
        if (!filled) continue
        out.data[i * 4] = r
        out.data[i * 4 + 1] = g
        out.data[i * 4 + 2] = b
        out.data[i * 4 + 3] = 255
    }
    ctx.putImageData(out, 0, 0)
    const image = canvas.toDataURL('image/png')
    return image.length <= MAX_FILL_IMAGE ? image : null
}
