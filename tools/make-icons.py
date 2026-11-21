from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / "icons"
ANDROID = ROOT / "android" / "res"
SOURCE = ROOT / "tools" / "icon-source.png"
S = 2048


def vertical_gradient(size, top, bottom):
    image = Image.new("RGBA", (size, size))
    draw = ImageDraw.Draw(image)
    for y in range(size):
        ratio = y / max(1, size - 1)
        color = tuple(int(top[i] * (1 - ratio) + bottom[i] * ratio) for i in range(3))
        draw.line((0, y, size, y), fill=color + (255,))
    return image


def source_h():
    image = Image.open(SOURCE).convert("RGB")
    box = (94, 90, 217, 206)
    crop = image.crop(box).convert("RGBA")
    data = np.array(crop).astype(int)
    mask = (data[:, :, 0] < 90) & (data[:, :, 1] < 110) & (data[:, :, 2] > 30) & (data[:, :, 2] < 160)
    alpha = Image.new("L", crop.size, 0)
    alpha.putdata([255 if mask[y, x] else 0 for y in range(crop.height) for x in range(crop.width)])
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))
    crop.putalpha(alpha)
    return crop


H_ART = source_h()


def build_tile():
    canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    tile_size = int(S * 0.84)
    left = (S - tile_size) // 2
    top = (S - tile_size) // 2
    radius = int(tile_size * 0.225)

    shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (left, top + int(S * 0.02), left + tile_size, top + tile_size + int(S * 0.02)),
        radius=radius,
        fill=(32, 54, 82, 70),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(S * 0.016)))
    canvas.alpha_composite(shadow)

    tile = vertical_gradient(tile_size, (255, 255, 255), (230, 238, 246))
    mask = Image.new("L", (tile_size, tile_size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, tile_size - 1, tile_size - 1), radius=radius, fill=255)
    tile.putalpha(mask)
    canvas.alpha_composite(tile, (left, top))

    outline = ImageDraw.Draw(canvas)
    outline.rounded_rectangle(
        (left, top, left + tile_size - 1, top + tile_size - 1),
        radius=radius,
        outline=(185, 211, 232, 255),
        width=max(2, int(S * 0.0018)),
    )

    target_height = int(tile_size * 0.44)
    ratio = target_height / H_ART.height
    h_icon = H_ART.resize(
        (max(1, int(H_ART.width * ratio)), target_height),
        Image.Resampling.LANCZOS,
    )
    h_icon = h_icon.filter(ImageFilter.UnsharpMask(radius=2, percent=55, threshold=2))
    canvas.alpha_composite(
        h_icon,
        ((S - h_icon.width) // 2, (S - h_icon.height) // 2),
    )
    return canvas.resize((1024, 1024), Image.Resampling.LANCZOS)


BASE = build_tile()


def place(size, scale, background=None):
    canvas = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    target = int(size * scale)
    icon = BASE.resize((target, target), Image.Resampling.LANCZOS)
    canvas.alpha_composite(icon, ((size - target) // 2, (size - target) // 2))
    return canvas


def save(image, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, optimize=True)


save(BASE, ICONS / "icon-1024.png")
save(BASE.resize((512, 512), Image.Resampling.LANCZOS), ICONS / "icon-512.png")
save(BASE.resize((192, 192), Image.Resampling.LANCZOS), ICONS / "icon-192.png")
save(BASE.resize((32, 32), Image.Resampling.LANCZOS), ICONS / "favicon-32.png")
save(place(180, 0.86, (246, 249, 252, 255)), ICONS / "apple-touch-icon.png")
save(place(512, 0.80, (236, 244, 251, 255)), ICONS / "icon-maskable-512.png")

for folder, size in {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}.items():
    icon = BASE.resize((size, size), Image.Resampling.LANCZOS)
    save(icon, ANDROID / folder / "ic_launcher.png")
    save(icon, ANDROID / folder / "ic_launcher_round.png")

save(Image.new("RGBA", (432, 432), (236, 244, 251, 255)), ANDROID / "drawable-nodpi" / "ic_launcher_background.png")
save(place(432, 0.70), ANDROID / "drawable-nodpi" / "ic_launcher_foreground.png")

print("centered light-gradient H icon written")
