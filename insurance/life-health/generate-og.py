#!/usr/bin/env python3
"""Generate OG image (1200x630) for the insurance life & health landing page."""

from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
BG = (13, 14, 22)  # #0d0e16

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# Try to use Inter font if available, otherwise fall back
font_paths = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial Bold.ttf",
]
font_path_regular = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial.ttf",
]

def find_font(paths, size):
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

# Fonts
font_eyebrow = find_font(font_path_regular, 16)
font_headline = find_font(font_paths, 52)
font_headline_accent = find_font(font_paths, 48)
font_sub = find_font(font_path_regular, 19)
font_wordmark = find_font(font_paths, 28)

# Subtle purple glow ellipse in background (top center)
for i in range(200):
    alpha = max(0, 25 - i // 8)
    r = 300 + i
    draw.ellipse(
        [W // 2 - r, 50 - r // 2, W // 2 + r, 50 + r // 2],
        fill=(143 * alpha // 25, 120 * alpha // 25, 255 * alpha // 25),
    )

# Eyebrow: "Life & Health Insurance"
eyebrow = "Life & Health Insurance"
ey_bbox = draw.textbbox((0, 0), eyebrow, font=font_eyebrow)
ey_w = ey_bbox[2] - ey_bbox[0]
ey_x = (W - ey_w) // 2
ey_y = 120

# Draw a subtle pill behind eyebrow
pill_pad_x, pill_pad_y = 16, 6
pill_rect = [ey_x - pill_pad_x, ey_y - pill_pad_y, ey_x + ey_w + pill_pad_x, ey_y + (ey_bbox[3] - ey_bbox[1]) + pill_pad_y]
draw.rounded_rectangle(pill_rect, radius=12, fill=(30, 31, 45))

# Green dot
dot_r = 4
dot_x = ey_x - 10
dot_y = ey_y + (ey_bbox[3] - ey_bbox[1]) // 2
draw.ellipse([dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r], fill=(74, 222, 128))

draw.text((ey_x, ey_y), eyebrow, fill=(200, 200, 210), font=font_eyebrow)

# Headline line 1: "Get your reps selling"
line1 = "Get your reps selling"
l1_bbox = draw.textbbox((0, 0), line1, font=font_headline)
l1_w = l1_bbox[2] - l1_bbox[0]
l1_x = (W - l1_w) // 2
l1_y = 185
draw.text((l1_x, l1_y), line1, fill=(255, 255, 255), font=font_headline)

# Headline line 2: "Better and Faster."
line2 = "Better, Faster."
l2_bbox = draw.textbbox((0, 0), line2, font=font_headline)
l2_w = l2_bbox[2] - l2_bbox[0]
l2_x = (W - l2_w) // 2
l2_y = l1_y + 62
draw.text((l2_x, l2_y), line2, fill=(255, 255, 255), font=font_headline)

# Headline line 3: "With Attention." in purple gradient approximation
line3 = "With Attention."
l3_bbox = draw.textbbox((0, 0), line3, font=font_headline_accent)
l3_w = l3_bbox[2] - l3_bbox[0]
l3_x = (W - l3_w) // 2
l3_y = l2_y + 62
draw.text((l3_x, l3_y), line3, fill=(143, 120, 255), font=font_headline_accent)

# Subtext
sub = "Plugs into your dialer. Coaches every agent."
sub2 = "Catches churned leads and missed disclosures."
sub_bbox = draw.textbbox((0, 0), sub, font=font_sub)
sub_w = sub_bbox[2] - sub_bbox[0]
sub_x = (W - sub_w) // 2
sub_y = l3_y + 85
draw.text((sub_x, sub_y), sub, fill=(160, 160, 175), font=font_sub)

sub2_bbox = draw.textbbox((0, 0), sub2, font=font_sub)
sub2_w = sub2_bbox[2] - sub2_bbox[0]
sub2_x = (W - sub2_w) // 2
sub2_y = sub_y + 28
draw.text((sub2_x, sub2_y), sub2, fill=(160, 160, 175), font=font_sub)

# Attention wordmark (icon + text)
root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
icon_path = os.path.join(root, "attention-icon-color.png")
if os.path.exists(icon_path):
    icon = Image.open(icon_path).convert("RGBA")
    icon_size = 40
    icon = icon.resize((icon_size, icon_size), Image.LANCZOS)

    wordmark_text = "Attention"
    wm_bbox = draw.textbbox((0, 0), wordmark_text, font=font_wordmark)
    wm_w = wm_bbox[2] - wm_bbox[0]
    total_w = icon_size + 12 + wm_w

    wm_y = sub2_y + 55
    start_x = (W - total_w) // 2

    img.paste(icon, (start_x, wm_y), icon)
    draw.text((start_x + icon_size + 12, wm_y + 4), wordmark_text, fill=(255, 255, 255), font=font_wordmark)

# Save
out = os.path.join(os.path.dirname(__file__), "og-image.png")
img.save(out, "PNG")
print(f"Saved: {out} ({W}x{H})")
