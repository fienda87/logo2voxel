import numpy as np
from PIL import Image, ImageOps
from collections import Counter

RESOLUTIONS = [16, 32, 48, 64]


def generate_flat_voxels(img: Image.Image, res: int, height_multiplier: float = 1.5) -> list[int]:
    img_rgba = img.resize((res, res), Image.Resampling.LANCZOS)
    if img_rgba.mode != "RGBA":
        img_rgba = img_rgba.convert("RGBA")

    alpha_array = np.array(img_rgba.split()[3])

    thickness = max(1, min(3, int(height_multiplier * 2)))

    flat_voxels = []

    for y in range(res):
        for x in range(res):
            if alpha_array[y, x] < 50:
                continue

            r, g, b = img_rgba.getpixel((x, y))[:3]

            if r < 20 and g < 20 and b < 20:
                r, g, b = 180, 180, 190

            for h in range(thickness):
                flat_voxels.extend([x, h, y, int(r), int(g), int(b)])

    return flat_voxels


def _quantize_color(r: int, g: int, b: int, steps: int = 4) -> tuple:
    step = 256 // steps
    return (r // step * step, g // step * step, b // step * step)


def get_dominant_colors(image: Image.Image, n: int = 5) -> list[str]:
    img = image.resize((64, 64), Image.Resampling.LANCZOS).convert("RGBA")
    pixels = np.array(img)

    colors = []
    for y in range(64):
        for x in range(64):
            r, g, b, a = pixels[y, x]
            if a < 50:
                continue
            if r > 240 and g > 240 and b > 240:
                continue
            q = _quantize_color(int(r), int(g), int(b))
            colors.append(q)

    if not colors:
        return ["#8b5cf6", "#06b6d4", "#10b981", "#ef4444", "#d97706"]

    counter = Counter(colors)
    most_common = counter.most_common(n)

    hex_colors = []
    for (r, g, b), _ in most_common:
        hex_colors.append(f"#{r:02x}{g:02x}{b:02x}")

    while len(hex_colors) < n:
        hex_colors.append("#8b5cf6")

    return hex_colors[:n]


def generate_voxel_grids(image: Image.Image, height_multiplier: float = 1.5) -> dict:
    results = {}
    for res in RESOLUTIONS:
        results[str(res)] = generate_flat_voxels(image, res, height_multiplier)
    return results
