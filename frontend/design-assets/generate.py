"""Génère les assets scrapbook de scrib7 (voir PHILOSOPHIE.md).

Usage, depuis frontend/ :  python3 design-assets/generate.py
Graine fixe : deux exécutions produisent des fichiers identiques.
"""

import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / 'public' / 'assets' / 'scrapbook'
TILE = 256

INK = '#2a1f16'
RED = '#b3362b'
BLUE = '#2b4c9a'
TAPE = '#e9ddb0'


# ---------- Textures (« Fibre lente ») ----------

def periodic_noise(rng, n, beta):
    """Bruit en 1/f^beta, périodique par construction (filtré dans le domaine de Fourier)."""
    white = rng.standard_normal((n, n))
    fx = np.fft.fftfreq(n)
    f = np.sqrt(fx[None, :] ** 2 + fx[:, None] ** 2)
    f[0, 0] = 1
    filt = 1 / f**beta
    filt[0, 0] = 0
    out = np.real(np.fft.ifft2(np.fft.fft2(white) * filt))
    return (out - out.mean()) / out.std()


def fibers(rng, n, count, angle, spread, colors):
    """Fibres courtes couchées dans le sens du tamis, dessinées sur le tore (3×3 copies)."""
    layer = Image.new('RGBA', (3 * n, 3 * n), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for _ in range(count):
        x, y = rng.uniform(0, n), rng.uniform(0, n)
        length = rng.uniform(5, 26)
        a = math.radians(angle + rng.normal(0, spread))
        bend = rng.normal(0, 0.06)
        color = colors[rng.integers(len(colors))]
        alpha = int(rng.uniform(*color[1]))
        pts = []
        for i in range(8):
            t = i / 7 * length
            a_i = a + bend * i
            pts.append((x + math.cos(a_i) * t, y + math.sin(a_i) * t))
        for ox in (0, n, 2 * n):
            for oy in (0, n, 2 * n):
                draw.line([(px + ox, py + oy) for px, py in pts], fill=(*color[0], alpha), width=1)
    return layer


def texture(seed, base, mottle_amp, grain_amp, fiber_count, fiber_colors, name, gray=False):
    rng = np.random.default_rng(seed)
    n = TILE
    mottle = periodic_noise(rng, n, 1.7)
    grain = periodic_noise(rng, n, 0.2)
    factor = 1 + mottle_amp * mottle + grain_amp * grain
    rgb = np.clip(np.array(base, dtype=float)[None, None, :] * factor[:, :, None], 0, 255)
    img = Image.fromarray(np.tile(rgb.astype(np.uint8), (3, 3, 1)), 'RGB').convert('RGBA')
    img.alpha_composite(fibers(rng, n, fiber_count, 12, 22, fiber_colors))
    img = img.filter(ImageFilter.GaussianBlur(0.35)).crop((n, n, 2 * n, 2 * n)).convert('RGB')
    if gray:
        img = img.convert('L')
    img.save(OUT / name, 'WEBP', quality=80, method=6)


# ---------- Formes à la main (« Encre d'atelier ») ----------

def fmt(points):
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in points)


def svg(view_box, body, extra=''):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}"{extra}>{body}</svg>\n'
    )


def tape(seed):
    r = random.Random(seed)
    w, h = 120, 32
    left = [(r.uniform(0, 5), y) for y in range(0, h + 1, 4)]
    right = [(w - r.uniform(0, 5), y) for y in range(h, -1, -4)]
    body = f'<polygon points="{fmt(left + right)}" fill="{TAPE}" fill-opacity=".88"/>'
    # plis du ruban : deux traits presque invisibles
    for k in range(2):
        y = r.uniform(7, h - 7)
        body += (
            f'<path d="M8 {y:.1f}Q{w / 2:.0f} {y + r.uniform(-2, 2):.1f} {w - 8} {y + r.uniform(-1.5, 1.5):.1f}"'
            f' stroke="{"#fff" if k else "#b9a970"}" stroke-opacity=".3" fill="none"/>'
        )
    return svg(f'0 0 {w} {h}', body, ' preserveAspectRatio="none"')


def rough_ring(r, cx, cy, radius, width, gaps):
    """Anneau de tampon : cercle légèrement irrégulier, avec des manques d'encre."""
    paths, current = [], []
    steps = 90
    for i in range(steps + 1):
        a = i / steps * 2 * math.pi
        rad = radius + r.uniform(-0.5, 0.5)
        pt = (cx + math.cos(a) * rad, cy + math.sin(a) * rad)
        if r.random() < gaps and current:
            paths.append(current)
            current = []
        else:
            current.append(pt)
    paths.append(current)
    return ''.join(
        f'<polyline points="{fmt(p)}" fill="none" stroke="{RED}" stroke-width="{width}" stroke-linecap="round"/>'
        for p in paths
        if len(p) > 1
    )


def rough_rect(r, x0, y0, x1, y1, width, gaps):
    corners = [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)]
    pts = []
    for (ax, ay), (bx, by) in zip(corners, corners[1:]):
        for i in range(20):
            t = i / 20
            pts.append((ax + (bx - ax) * t + r.uniform(-0.4, 0.4), ay + (by - ay) * t + r.uniform(-0.4, 0.4)))
    pts.append(corners[-1])
    paths, current = [], []
    for pt in pts:
        if r.random() < gaps and current:
            paths.append(current)
            current = []
        current.append(pt)
    paths.append(current)
    return ''.join(
        f'<polyline points="{fmt(p)}" fill="none" stroke="{RED}" stroke-width="{width}"'
        f' vector-effect="non-scaling-stroke" stroke-linejoin="round"/>'
        for p in paths
        if len(p) > 1
    )


def torn_edge(seed):
    """Masque du bord bas d'une fiche arrachée : opaque en haut, dents irrégulières en bas."""
    r = random.Random(seed)
    w, h = 240, 14
    pts, x = [(0, 0), (w, 0), (w, 8)], w
    while x > 0:
        x = max(0, x - r.uniform(3, 8))
        pts.append((x, r.uniform(5, h)))
    pts.append((0, 8))
    return svg(f'0 0 {w} {h}', f'<polygon points="{fmt(pts)}" fill="#000"/>', ' preserveAspectRatio="none"')


def scribble_circle(seed):
    """Cercle au stylo bille : un tour et quart, qui dépasse son point de départ."""
    r = random.Random(seed)
    pts = []
    turns = 1.18
    for i in range(121):
        t = i / 120
        a = -2.2 + t * turns * 2 * math.pi
        wobble = 1 + 0.03 * math.sin(t * 9 + 1) + r.uniform(-0.006, 0.006)
        rx, ry = 94 * wobble * (1 - 0.04 * t), 54 * wobble * (1 + 0.05 * t)
        pts.append((100 + math.cos(a) * rx, 60 + math.sin(a) * ry))
    body = (
        f'<polyline points="{fmt(pts)}" fill="none" stroke="{BLUE}" stroke-width="3"'
        ' stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'
    )
    return svg('0 0 200 120', body, ' preserveAspectRatio="none"')


ICON = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000"'
    ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{}</svg>\n'
)
ICONS = {
    'pencil': '<path d="M4.5 19.5l1.1-4.3L15.8 5a2 2 0 012.8 0l.4.4a2 2 0 010 2.8L8.8 18.4z"/>'
    '<path d="M13.6 7.2l3.2 3.2M5.6 15.2l3.2 3.2"/>',
    'check': '<path d="M4.3 12.8c1.7 1.1 3.1 2.7 4.3 4.9 2.3-5 5.9-9.4 11-12.9"/>',
    'ballot': '<path d="M4.5 12.5h15l.8 7.5H3.7z"/><path d="M8.6 12.5V4.2h6.8v8.3"/>'
    '<path d="M10.5 7.3h3M10.5 9.6h2"/>',
    'crown': '<path d="M4.2 18.2L3.4 8.3l4.9 3.9 3.8-6.6 3.7 6.6 4.9-3.9-.9 9.9z"/>'
    '<path d="M5 21h14"/>',
    'clock': '<circle cx="12" cy="13" r="7.6"/><path d="M12 9v4.3l2.8 1.8M9.5 3.2h5"/>',
    'copy': '<rect x="8.5" y="8.3" width="11" height="12" rx="1"/>'
    '<path d="M15.5 8.3V4.6a1 1 0 00-1-1h-9a1 1 0 00-1 1v10.6a1 1 0 001 1h3"/>',
}


def logo():
    """Feuille scotchée et tampon rouge du 7 (le 7 de Scrib7 mis en avant)."""
    r = random.Random(7)
    ring = rough_ring(r, 32, 35, 17, 3.2, 0.03)
    seven = (
        f'<path d="M23.5 26.5h17.5l-9.6 18.5" fill="none" stroke="{RED}" stroke-width="5"'
        ' stroke-linecap="round" stroke-linejoin="round"/>'
    )
    body = (
        '<rect x="7" y="9" width="50" height="50" rx="1.5" fill="#a88758" opacity=".5"'
        ' transform="rotate(-4 32 34) translate(1 2)"/>'
        '<rect x="7" y="9" width="50" height="50" rx="1.5" fill="#f8f1e2" transform="rotate(-4 32 34)"/>'
        f'<g transform="rotate(-8 32 35)">{ring}{seven}</g>'
        f'<rect x="20" y="3" width="24" height="10" fill="{TAPE}" fill-opacity=".9" transform="rotate(5 32 8)"/>'
    )
    return svg('0 0 64 64', body)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'icons').mkdir(exist_ok=True)

    texture(
        seed=17,
        base=(196, 165, 122),
        mottle_amp=0.016,
        grain_amp=0.022,
        fiber_count=320,
        fiber_colors=[((118, 88, 54), (35, 75)), ((236, 214, 172), (35, 70))],
        name='kraft.webp',
    )
    texture(
        seed=29,
        base=(248, 248, 248),
        mottle_amp=0.012,
        grain_amp=0.014,
        fiber_count=160,
        fiber_colors=[((200, 200, 200), (20, 45)), ((255, 255, 255), (40, 80))],
        name='paper-grain.webp',
        gray=True,
    )

    files = {
        'tape-1.svg': tape(1),
        'tape-2.svg': tape(2),
        'tape-3.svg': tape(3),
        'photo-corner.svg': svg(
            '0 0 20 20',
            f'<path d="M0 0h20L0 20z" fill="{INK}"/><path d="M19 1L1 19" stroke="#fff" stroke-opacity=".14"/>',
        ),
        'stamp-ring.svg': svg('0 0 100 100', rough_ring(random.Random(4), 50, 50, 46, 4, 0.05)
                              + rough_ring(random.Random(5), 50, 50, 39.5, 1.6, 0.04)),
        'stamp-rect.svg': svg(
            '0 0 200 70',
            rough_rect(random.Random(6), 3, 3, 197, 67, 3.5, 0.03)
            + rough_rect(random.Random(8), 8.5, 8.5, 191.5, 61.5, 1.4, 0.03),
            ' preserveAspectRatio="none"',
        ),
        'torn-edge.svg': torn_edge(11),
        'scribble-circle.svg': scribble_circle(3),
    }
    for name, content in files.items():
        (OUT / name).write_text(content)
    for name, paths in ICONS.items():
        (OUT / 'icons' / f'{name}.svg').write_text(ICON.format(paths))
    (OUT.parent.parent / 'logo.svg').write_text(logo())


if __name__ == '__main__':
    main()
