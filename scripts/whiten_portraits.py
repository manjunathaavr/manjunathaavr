from PIL import Image
import os

paths = [
    r'd:\SwayamKrushi\public\images\hero-skill-giver.png',
    r'd:\SwayamKrushi\public\images\hero-job-giver.png',
]

for path in paths:
    img = Image.open(path).convert('RGBA')
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            mx, mn = max(r, g, b), min(r, g, b)
            sat = (mx - mn) / mx if mx else 0
            bright = (r + g + b) / 3
            if bright > 175 and sat < 0.32:
                pixels[x, y] = (255, 255, 255, 255)
            elif bright > 200:
                pixels[x, y] = (255, 255, 255, 255)
            elif bright > 155 and sat < 0.22:
                pixels[x, y] = (255, 255, 255, 255)
    fade = int(min(w, h) * 0.05)
    for y in range(h):
        for x in range(w):
            edge = min(x, y, w - 1 - x, h - 1 - y)
            if edge < fade:
                t = edge / fade
                r, g, b, a = pixels[x, y]
                pixels[x, y] = (
                    int(r * t + 255 * (1 - t)),
                    int(g * t + 255 * (1 - t)),
                    int(b * t + 255 * (1 - t)),
                    255,
                )
    img.save(path, 'PNG')
    print('cleaned', os.path.basename(path), img.size)
