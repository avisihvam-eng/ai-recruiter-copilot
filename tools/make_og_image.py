"""
Generate the 1200x630 social preview card.

A shared link to this app is the first thing a recruiter or a hiring manager
sees, and a bare link renders as a grey box. This draws the card that stands in
for it: the headline, the five assets, and the address.

Run from the repo root:

    python tools/make_og_image.py

Output: frontend/public/og.png, which Vite copies into the build.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
MARGIN = 72

BG = "#ffffff"
INK = "#09090b"
MUTED = "#52525b"
FAINT = "#6b6b73"
ACCENT = "#1d4ed8"

# Segoe UI ships with Windows; DejaVu is the usual Linux fallback.
_CANDIDATES = {
    "regular": ["segoeui.ttf", "DejaVuSans.ttf", "Arial.ttf", "Helvetica.ttc"],
    "semibold": ["seguisb.ttf", "segoeui.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf"],
    "bold": ["segoeuib.ttf", "segoeui.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf"],
}

_FONT_DIRS = [Path("C:/Windows/Fonts"), Path("/usr/share/fonts/truetype/dejavu")]


def _font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    for directory in _FONT_DIRS:
        for name in _CANDIDATES[weight]:
            path = directory / name
            if path.exists():
                return ImageFont.truetype(str(path), size)
    return ImageFont.load_default(size)


def build() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # A single accent rule, matching the app's one-accent-colour rule.
    draw.rectangle([0, 0, W, 8], fill=ACCENT)

    # Brand: the mark is the same dark rounded square as the header.
    draw.rounded_rectangle([MARGIN, MARGIN, MARGIN + 46, MARGIN + 46], radius=11, fill=INK)
    mark = _font("semibold", 26)
    box = draw.textbbox((0, 0), "M", font=mark)
    draw.text(
        (MARGIN + 23 - (box[2] - box[0]) / 2, MARGIN + 23 - (box[3] - box[1]) / 2 - box[1]),
        "M",
        font=mark,
        fill="#ffffff",
    )

    wordmark = _font("semibold", 28)
    draw.text((MARGIN + 60, MARGIN + 9), "MyHiringKit", font=wordmark, fill=INK)

    headline = _font("bold", 58)
    draw.text((MARGIN, 220), "One job description in.", font=headline, fill=INK)
    draw.text((MARGIN, 292), "A full recruiting kit out.", font=headline, fill=INK)

    body = _font("regular", 24)
    draw.text(
        (MARGIN, 392),
        "Formatted job description \u00b7 Boolean searches \u00b7 candidate outreach",
        font=body,
        fill=MUTED,
    )
    draw.text((MARGIN, 428), "LinkedIn post \u00b7 intake brief with screening questions", font=body, fill=MUTED)

    value = _font("semibold", 26)
    draw.text((MARGIN, 512), "About 45 minutes of recruiting admin, saved per req.", font=value, fill=ACCENT)

    url = _font("regular", 20)
    draw.text((MARGIN, 560), "myhiringkit.vercel.app", font=url, fill=FAINT)

    return img


def main() -> None:
    out = Path("frontend/public/og.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    build().save(out, "PNG", optimize=True)
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
