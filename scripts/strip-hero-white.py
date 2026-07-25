"""Make near-white paper backgrounds transparent on hero sketch PNGs."""
from pathlib import Path
from PIL import Image

img_dir = Path(__file__).resolve().parents[1] / 'public' / 'images'
files = sorted(img_dir.glob('hero-*.png'))
print(f'Processing {len(files)} files in {img_dir}')

for path in files:
    im = Image.open(path).convert('RGBA')
    src = im.getdata()
    out = []
    for r, g, b, _a in src:
        luminance = (r + g + b) / 3.0
        alpha = int(round(255 - luminance))
        if alpha < 10:
            alpha = 0
        else:
            alpha = min(255, int(alpha * 1.12))
        out.append((r, g, b, alpha))
    im.putdata(out)
    im.save(path, 'PNG', optimize=True)
    print(f'  OK {path.name}')

print('Done')
