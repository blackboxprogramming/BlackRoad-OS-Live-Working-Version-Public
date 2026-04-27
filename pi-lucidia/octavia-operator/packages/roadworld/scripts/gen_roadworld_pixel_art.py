from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw


@dataclass(frozen=True)
class Palette:
    outline: tuple[int, int, int, int] = (20, 18, 16, 255)
    shadow: tuple[int, int, int, int] = (0, 0, 0, 120)
    white: tuple[int, int, int, int] = (244, 240, 232, 255)
    yellow: tuple[int, int, int, int] = (245, 200, 74, 255)
    orange: tuple[int, int, int, int] = (229, 139, 61, 255)
    red: tuple[int, int, int, int] = (200, 74, 74, 255)
    blue: tuple[int, int, int, int] = (62, 107, 174, 255)
    cyan: tuple[int, int, int, int] = (123, 168, 200, 255)
    green: tuple[int, int, int, int] = (91, 168, 91, 255)
    gray: tuple[int, int, int, int] = (158, 156, 142, 255)
    dk: tuple[int, int, int, int] = (42, 40, 37, 255)


P = Palette()


def icon_canvas(size: int = 16) -> Image.Image:
    return Image.new("RGBA", (size, size), (0, 0, 0, 0))


def scale_nn(img: Image.Image, scale: int) -> Image.Image:
    if scale == 1:
        return img
    w, h = img.size
    return img.resize((w * scale, h * scale), resample=Image.Resampling.NEAREST)


def put_px(draw: ImageDraw.ImageDraw, x: int, y: int, c: tuple[int, int, int, int]):
    draw.point((x, y), fill=c)


def box(draw: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, c):
    draw.rectangle([x0, y0, x1, y1], fill=c)


def outline_rect(draw: ImageDraw.ImageDraw, x0: int, y0: int, x1: int, y1: int, c):
    draw.rectangle([x0, y0, x1, y1], outline=c)


def icon_star() -> Image.Image:
    img = icon_canvas(16)
    d = ImageDraw.Draw(img)
    # shadow
    box(d, 6, 12, 9, 12, P.shadow)
    # star core
    for x, y in [
        (8, 2),
        (7, 3),
        (8, 3),
        (9, 3),
        (6, 4),
        (7, 4),
        (8, 4),
        (9, 4),
        (10, 4),
        (5, 5),
        (6, 5),
        (7, 5),
        (8, 5),
        (9, 5),
        (10, 5),
        (11, 5),
        (6, 6),
        (7, 6),
        (8, 6),
        (9, 6),
        (10, 6),
        (7, 7),
        (8, 7),
        (9, 7),
        (8, 8),
        (7, 9),
        (8, 9),
        (9, 9),
        (6, 10),
        (7, 10),
        (8, 10),
        (9, 10),
        (10, 10),
    ]:
        put_px(d, x, y, P.yellow)
    # highlight
    for x, y in [(8, 3), (9, 4), (10, 5), (9, 6), (8, 7)]:
        put_px(d, x, y, P.white)
    # outline (sparse)
    for x, y in [(8, 2), (6, 4), (10, 4), (5, 5), (11, 5), (6, 10), (10, 10), (7, 9), (9, 9)]:
        put_px(d, x, y, P.outline)
    return img


def icon_gem() -> Image.Image:
    img = icon_canvas(16)
    d = ImageDraw.Draw(img)
    # shadow
    box(d, 6, 13, 9, 13, P.shadow)
    # gem body
    for y in range(4, 12):
        for x in range(5, 11):
            if abs(x - 8) + abs(y - 8) <= 5:
                put_px(d, x, y, P.blue)
    # facets
    for x, y in [(7, 5), (8, 5), (9, 6), (8, 7), (7, 8), (9, 8), (8, 10)]:
        put_px(d, x, y, P.cyan)
    for x, y in [(7, 6), (6, 7), (6, 8), (7, 9)]:
        put_px(d, x, y, P.white)
    # outline
    for x, y in [(8, 3), (6, 4), (10, 4), (5, 6), (11, 6), (5, 10), (11, 10), (6, 12), (10, 12), (8, 13)]:
        put_px(d, x, y, P.outline)
    return img


def icon_trophy() -> Image.Image:
    img = icon_canvas(16)
    d = ImageDraw.Draw(img)
    # cup
    box(d, 5, 4, 10, 8, P.yellow)
    box(d, 6, 5, 9, 7, P.white)
    # handles
    put_px(d, 4, 5, P.yellow)
    put_px(d, 4, 6, P.yellow)
    put_px(d, 11, 5, P.yellow)
    put_px(d, 11, 6, P.yellow)
    # stem + base
    box(d, 7, 9, 8, 10, P.orange)
    box(d, 6, 11, 9, 12, P.orange)
    box(d, 5, 13, 10, 13, P.dk)
    # outline
    outline_rect(d, 5, 4, 10, 8, P.outline)
    for x, y in [(4, 5), (4, 6), (11, 5), (11, 6), (6, 11), (9, 11)]:
        put_px(d, x, y, P.outline)
    return img


def icon_key() -> Image.Image:
    img = icon_canvas(16)
    d = ImageDraw.Draw(img)
    # shadow
    box(d, 7, 13, 12, 13, P.shadow)
    # ring
    for x, y in [(5, 6), (6, 5), (7, 5), (8, 6), (8, 7), (7, 8), (6, 8), (5, 7)]:
        put_px(d, x, y, P.yellow)
    for x, y in [(6, 6), (7, 6), (6, 7), (7, 7)]:
        put_px(d, x, y, (0, 0, 0, 0))
    # shaft
    box(d, 8, 6, 12, 7, P.yellow)
    put_px(d, 12, 8, P.yellow)
    put_px(d, 11, 9, P.yellow)
    put_px(d, 12, 9, P.yellow)
    # highlight
    put_px(d, 9, 6, P.white)
    # outline
    for x, y in [(5, 6), (6, 5), (7, 5), (8, 6), (12, 7), (12, 9)]:
        put_px(d, x, y, P.outline)
    return img


def ui_icon(kind: str) -> Image.Image:
    img = icon_canvas(16)
    d = ImageDraw.Draw(img)
    o = P.outline
    w = P.white
    a = P.cyan
    y = P.yellow

    if kind == "home":
        # roof
        for i in range(6):
            put_px(d, 8, 2 + i, o)
            put_px(d, 8 - i, 2 + i, o)
            put_px(d, 8 + i, 2 + i, o)
        box(d, 5, 8, 11, 13, a)
        outline_rect(d, 5, 8, 11, 13, o)
        box(d, 7, 10, 9, 13, P.dk)
    elif kind == "compass":
        box(d, 7, 2, 8, 13, a)
        box(d, 2, 7, 13, 8, a)
        for x, y0 in [(7, 2), (8, 2), (7, 13), (8, 13), (2, 7), (2, 8), (13, 7), (13, 8)]:
            put_px(d, x, y0, o)
        put_px(d, 8, 4, w)
        put_px(d, 10, 8, w)
    elif kind == "plus":
        box(d, 7, 3, 8, 12, y)
        box(d, 3, 7, 12, 8, y)
        outline_rect(d, 3, 7, 12, 8, o)
    elif kind == "minus":
        box(d, 3, 7, 12, 8, y)
        outline_rect(d, 3, 7, 12, 8, o)
    elif kind == "buildings":
        box(d, 3, 5, 7, 13, a)
        box(d, 8, 3, 12, 13, y)
        outline_rect(d, 3, 5, 7, 13, o)
        outline_rect(d, 8, 3, 12, 13, o)
        for yy in range(6, 13, 3):
            put_px(d, 5, yy, w)
            put_px(d, 10, yy, w)
    elif kind == "globe":
        box(d, 4, 4, 11, 11, a)
        outline_rect(d, 4, 4, 11, 11, o)
        box(d, 7, 4, 8, 11, w)
        box(d, 4, 7, 11, 8, w)
    elif kind == "locate":
        # pin
        for yy in range(4, 11):
            for xx in range(6, 10):
                if abs(xx - 8) + abs(yy - 6) <= 3:
                    put_px(d, xx, yy, P.red)
        put_px(d, 8, 12, P.red)
        for p in [(8, 3), (6, 4), (10, 4)]:
            put_px(d, p[0], p[1], o)
        put_px(d, 8, 6, w)
    elif kind == "save":
        box(d, 4, 3, 11, 12, a)
        outline_rect(d, 4, 3, 11, 12, o)
        box(d, 6, 3, 9, 5, P.dk)
        box(d, 6, 8, 9, 11, w)
    elif kind == "target":
        outline_rect(d, 4, 4, 11, 11, o)
        outline_rect(d, 6, 6, 9, 9, o)
        put_px(d, 8, 8, P.red)
    elif kind == "ruler":
        box(d, 3, 6, 12, 9, a)
        outline_rect(d, 3, 6, 12, 9, o)
        for xx in range(4, 12, 2):
            put_px(d, xx, 6, w)
    elif kind == "share":
        put_px(d, 4, 10, a)
        put_px(d, 8, 6, a)
        put_px(d, 12, 10, a)
        box(d, 4, 10, 12, 10, a)
        box(d, 8, 6, 12, 10, a)
        for p in [(4, 10), (12, 10), (8, 6), (12, 6)]:
            put_px(d, p[0], p[1], o)
    elif kind == "tools":
        box(d, 5, 5, 10, 6, y)
        box(d, 7, 6, 8, 12, y)
        outline_rect(d, 5, 5, 10, 12, o)
        put_px(d, 7, 9, w)
    elif kind == "game":
        box(d, 4, 7, 11, 11, a)
        outline_rect(d, 4, 7, 11, 11, o)
        put_px(d, 6, 9, w)
        put_px(d, 9, 9, w)
        box(d, 6, 6, 9, 6, a)
        put_px(d, 7, 8, P.dk)
        put_px(d, 8, 8, P.dk)
    elif kind == "menu":
        box(d, 4, 5, 11, 5, y)
        box(d, 4, 8, 11, 8, y)
        box(d, 4, 11, 11, 11, y)
        for yy in [5, 8, 11]:
            put_px(d, 4, yy, o)
            put_px(d, 11, yy, o)
    elif kind == "close":
        for i in range(4, 12):
            put_px(d, i, i, P.red)
            put_px(d, i, 15 - i, P.red)
        put_px(d, 4, 4, o)
        put_px(d, 11, 11, o)
    else:
        raise ValueError(f"Unknown icon kind: {kind}")

    return img


def write_icons(out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)

    # collectibles
    collectibles = {
        "star": icon_star(),
        "gem": icon_gem(),
        "trophy": icon_trophy(),
        "key": icon_key(),
    }

    for name, img in collectibles.items():
        scale_nn(img, 4).save(out_dir / f"{name}.png")

    return list(collectibles.keys())


def write_ui(out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    kinds = [
        "home",
        "compass",
        "plus",
        "minus",
        "buildings",
        "globe",
        "locate",
        "save",
        "target",
        "ruler",
        "share",
        "tools",
        "game",
        "menu",
        "close",
    ]
    for k in kinds:
        scale_nn(ui_icon(k), 4).save(out_dir / f"{k}.png")

    return kinds


def write_avatar(out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    # Simple top-down-ish pixel head/body, 16x16 scaled to 64x64
    img = icon_canvas(16)
    d = ImageDraw.Draw(img)
    # shadow
    box(d, 6, 14, 9, 14, P.shadow)
    # body
    box(d, 6, 9, 9, 13, P.blue)
    box(d, 7, 10, 8, 12, P.cyan)
    # head
    box(d, 6, 4, 9, 8, (245, 201, 160, 255))
    # hair
    box(d, 6, 3, 9, 5, (92, 58, 33, 255))
    put_px(d, 7, 6, P.dk)
    put_px(d, 8, 6, P.dk)
    # outline
    outline_rect(d, 6, 4, 9, 8, P.outline)
    outline_rect(d, 6, 9, 9, 13, P.outline)
    scale_nn(img, 4).save(out_dir / "player.png")

    return ["player"]


def write_atlas(assets_dir: Path, icons: list[str], ui: list[str], avatars: list[str]):
    # All items are 64x64 PNGs.
    items: list[tuple[str, str]] = []
    items += [("icons", n) for n in icons]
    items += [("ui", n) for n in ui]
    items += [("avatars", n) for n in avatars]

    cell = 64
    cols = 5
    rows = (len(items) + cols - 1) // cols
    atlas = Image.new("RGBA", (cols * cell, rows * cell), (0, 0, 0, 0))

    import json

    frames = {}
    for idx, (group, name) in enumerate(items):
        x = (idx % cols) * cell
        y = (idx // cols) * cell
        src = assets_dir / group / f"{name}.png"
        img = Image.open(src).convert("RGBA")
        atlas.alpha_composite(img, (x, y))
        frames[f"{group}/{name}"] = {"x": x, "y": y, "w": cell, "h": cell}

    atlas.save(assets_dir / "atlas.png")
    (assets_dir / "atlas.json").write_text(json.dumps({"cell": cell, "cols": cols, "frames": frames}, indent=2) + "\n")


def main():
    root = Path(__file__).resolve().parents[1]  # packages/roadworld
    assets = root / "public" / "assets" / "roadworld"
    icons = write_icons(assets / "icons")
    ui = write_ui(assets / "ui")
    avatars = write_avatar(assets / "avatars")
    write_atlas(assets, icons, ui, avatars)
    print(f"Wrote RoadWorld pixel art to {assets}")


if __name__ == "__main__":
    main()
