from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
WIDTH, HEIGHT = 1360, 800
BLUE = (37, 99, 235)
INK = (23, 32, 42)
MUTED = (92, 102, 112)
BORDER = (220, 226, 232)
WHITE = (255, 255, 255)


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


F = {
    "xs": font(11), "small": font(13), "small_bold": font(13, True),
    "body": font(15), "body_bold": font(15, True), "h2": font(18, True),
    "h1": font(27, True),
}


def rounded(draw, box, radius=8, fill=WHITE, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def txt(draw, xy, value, style="body", fill=INK):
    draw.text(xy, value, font=F[style], fill=fill)


def button(draw, x, y, label, primary=False, width=None):
    width = width or max(94, 22 + int(draw.textlength(label, font=F["small_bold"])))
    rounded(draw, (x, y, x + width, y + 38), 7, BLUE if primary else (233, 237, 242))
    txt(draw, (x + 14, y + 11), label, "small_bold", WHITE if primary else INK)


def select(draw, x, y, label, value, width=142):
    txt(draw, (x, y), label, "xs")
    rounded(draw, (x, y + 18, x + width, y + 52), 6, WHITE, (174, 184, 194))
    txt(draw, (x + 9, y + 28), value, "small")
    txt(draw, (x + width - 20, y + 28), "⌄", "small", MUTED)


def chart(draw, box, title="Sales", bars=(76, 110, 91, 136)):
    x, y, w, h = box
    rounded(draw, (x, y, x + w, y + h), 8, (248, 250, 252), BORDER)
    txt(draw, (x + 20, y + 16), title, "h2")
    baseline = y + h - 34
    bar_width = 44
    gap = (w - 82 - bar_width * len(bars)) // (len(bars) - 1)
    for i, value in enumerate(bars):
        bx = x + 40 + i * (bar_width + gap)
        bh = int((h - 78) * value / 150)
        rounded(draw, (bx, baseline - bh, bx + bar_width, baseline), 5, BLUE)
        txt(draw, (bx + 5, baseline + 8), ("Jan", "Feb", "Mar", "Apr")[i], "xs", MUTED)


def host_frame():
    image = Image.new("RGB", (WIDTH, HEIGHT), (247, 248, 250))
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, WIDTH, 54), fill=(29, 35, 43))
    txt(draw, (24, 18), "Adobe Express", "body_bold", (238, 242, 246))
    txt(draw, (1012, 19), "Untitled design", "small", (198, 205, 214))
    rounded(draw, (1188, 10, 1269, 44), 6, (57, 65, 75))
    txt(draw, (1207, 20), "Share", "small_bold", WHITE)
    txt(draw, (1291, 20), "⋯", "body_bold", (198, 205, 214))
    draw.rectangle((0, 54, 864, HEIGHT), fill=(232, 235, 239))
    rounded(draw, (82, 116, 790, 740), 8, (213, 217, 222))
    rounded(draw, (124, 152, 748, 704), 3, WHITE)
    return image, draw


def panel(draw):
    draw.rectangle((864, 54, WIDTH, HEIGHT), fill=WHITE)
    draw.line((864, 54, 864, HEIGHT), fill=BORDER, width=1)
    rounded(draw, (884, 70, 1344, 184), 16, WHITE, BORDER)
    draw.line((900, 70, 1070, 70), fill=BLUE, width=4)
    draw.line((1070, 70, 1205, 70), fill=(139, 92, 246), width=4)
    txt(draw, (904, 84), "DATACANVAS", "small_bold", BLUE)
    txt(draw, (904, 108), "Turn data into a chart", "h1", INK)
    txt(draw, (904, 145), "Your CSV stays in this add-on until you choose to export it.", "small", MUTED)
    rounded(draw, (1255, 82, 1328, 116), 7, (233, 237, 242), BORDER)
    txt(draw, (1274, 91), "Help", "small_bold", INK)


def screenshot_import():
    image, draw = host_frame()
    txt(draw, (172, 205), "MONTHLY SALES", "small_bold", MUTED)
    txt(draw, (172, 240), "2026 performance", "h1")
    txt(draw, (172, 284), "Import your data to build a clear visual story.", "body", MUTED)
    rounded(draw, (172, 350, 700, 620), 8, (248, 250, 252), BORDER)
    txt(draw, (204, 438), "Your chart will appear here", "h2", MUTED)
    txt(draw, (236, 474), "Start with a CSV in DataCanvas", "body", MUTED)
    panel(draw)
    rounded(draw, (900, 184, 1328, 410), 9, WHITE, BORDER)
    txt(draw, (920, 208), "1. Add your data", "h2")
    txt(draw, (920, 237), "UTF-8 CSV · up to 2 MB · 5,000 rows · 20 columns", "xs", MUTED)
    button(draw, 920, 267, "Import CSV", True, 112)
    button(draw, 1040, 267, "Use sample", False, 108)
    rounded(draw, (920, 322, 1308, 380), 7, (250, 251, 252), BORDER)
    draw.rectangle((920, 322, 1308, 348), fill=(245, 247, 248))
    txt(draw, (932, 330), "Month", "xs")
    txt(draw, (1088, 330), "Sales", "xs")
    for row, values in enumerate((("Jan", "120"), ("Feb", "180"))):
        yy = 355 + row * 20
        txt(draw, (932, yy), values[0], "xs", MUTED)
        txt(draw, (1088, yy), values[1], "xs", MUTED)
    rounded(draw, (920, 395, 1308, 426), 6, (237, 247, 240))
    txt(draw, (934, 404), "Built-in sample loaded · 4 rows · 2 columns", "xs", (46, 101, 58))
    rounded(draw, (900, 430, 1328, 698), 9, WHITE, BORDER)
    txt(draw, (920, 455), "2. Map your chart", "h2")
    select(draw, 920, 486, "Category", "Month", 170)
    select(draw, 1112, 486, "Value", "Sales", 170)
    select(draw, 920, 566, "Chart type", "Bar", 170)
    select(draw, 1112, 566, "Sort", "Source order", 170)
    txt(draw, (920, 657), "Next: choose a style and add the chart to Express.", "small", MUTED)
    return image


def screenshot_preview():
    image, draw = host_frame()
    txt(draw, (172, 196), "MONTHLY SALES", "small_bold", MUTED)
    txt(draw, (172, 228), "2026 performance", "h1")
    txt(draw, (172, 270), "A clear view of the latest results", "body", MUTED)
    chart(draw, (172, 348, 528, 240))
    txt(draw, (172, 624), "Source: quarterly CSV export", "xs", MUTED)
    panel(draw)
    rounded(draw, (900, 184, 1328, 716), 9, WHITE, BORDER)
    txt(draw, (920, 208), "3. Style and create", "h2")
    txt(draw, (920, 237), "Preview the output before placing it on your page.", "xs", MUTED)
    txt(draw, (920, 274), "Title", "xs")
    rounded(draw, (920, 292, 1308, 328), 6, WHITE, (174, 184, 194))
    txt(draw, (931, 302), "Sales", "small")
    select(draw, 920, 348, "Chart colour", "Blue", 120)
    select(draw, 1058, 348, "Background", "White", 120)
    select(draw, 1196, 348, "Decimals", "0", 112)
    chart(draw, (920, 436, 388, 154), bars=(76, 110, 91, 136))
    rounded(draw, (920, 604, 1308, 646), 7, (245, 247, 248))
    txt(draw, (934, 613), "Accessible data summary", "small_bold")
    txt(draw, (934, 631), "4 categories · total 665 · Jan: 120 · Feb: 180 · Mar: 145", "xs", MUTED)
    button(draw, 920, 668, "Add chart to Express", True, 164)
    button(draw, 1092, 668, "Download PNG", False, 125)
    return image


def screenshot_recipes():
    image, draw = host_frame()
    txt(draw, (172, 196), "MONTHLY SALES", "small_bold", MUTED)
    txt(draw, (172, 228), "2026 performance", "h1")
    chart(draw, (172, 316, 528, 240), bars=(76, 110, 91, 136))
    rounded(draw, (172, 600, 700, 658), 7, (237, 247, 240))
    txt(draw, (190, 618), "Chart inserted as a flat PNG image", "small_bold", (46, 101, 58))
    panel(draw)
    rounded(draw, (900, 184, 1328, 420), 9, WHITE, BORDER)
    txt(draw, (920, 208), "Recipes", "h2")
    txt(draw, (920, 237), "Preserve mapping, transformations and styles for later editing.", "xs", MUTED)
    button(draw, 920, 274, "Import recipe", False, 120)
    rounded(draw, (920, 328, 1308, 370), 7, (248, 250, 252), BORDER)
    txt(draw, (934, 340), "datacanvas-recipe.json", "small_bold")
    txt(draw, (1178, 341), "With data", "xs", MUTED)
    button(draw, 920, 390, "Export with data", False, 142)
    button(draw, 1073, 390, "Export no-data recipe", False, 174)
    rounded(draw, (900, 442, 1328, 542), 8, (237, 247, 240))
    txt(draw, (920, 463), "Recipe exported", "small_bold", (46, 101, 58))
    txt(draw, (920, 488), "Your chart settings are ready to reuse.", "small", (46, 101, 58))
    rounded(draw, (900, 566, 1328, 700), 9, WHITE, BORDER)
    txt(draw, (920, 590), "Local-first workflow", "h2")
    txt(draw, (920, 623), "CSV data stays local. Export only when you choose.", "small", MUTED)
    txt(draw, (920, 650), "Flat PNG output · versioned recipe source", "small", MUTED)
    return image


def main():
    ASSETS.mkdir(exist_ok=True)
    icon_path = ASSETS / "datacanvas-icon.png"
    if icon_path.exists():
        with Image.open(icon_path) as icon:
            for size in (36, 64, 144):
                icon.resize((size, size), Image.Resampling.LANCZOS).save(
                    ASSETS / f"datacanvas-icon-{size}.png", "PNG", optimize=True
                )
    images = {
        "datacanvas-screenshot-1.png": screenshot_import(),
        "datacanvas-screenshot-2.png": screenshot_preview(),
        "datacanvas-screenshot-3.png": screenshot_recipes(),
    }
    for name, image in images.items():
        image.save(ASSETS / name, "PNG", optimize=True)
        print(f"wrote {ASSETS / name} ({WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()
