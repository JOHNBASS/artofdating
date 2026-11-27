#!/usr/bin/env python3
"""產生分享預覽圖（1200×630），放在 public/og/。

分享到 LINE、FB、Threads 時顯示的那張圖。改了課程標題、劇本殺標題或測驗類型之後，重新執行一次：

    python3 scripts/make-og.py

需要 Python 3 和 Pillow（pip3 install pillow），字型用 macOS 內建的宋體和蘋方。
文字從 src/data/*.js 讀（透過 node），所以不用在這裡重打。
"""
import json
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'og'
IMG = ROOT / 'public' / 'assets' / 'img'
W, H = 1200, 630

BG = '#fbf7f2'
INK = '#2b2024'
SOFT = '#6b5a5f'
LINE = '#eadfd8'
ACCENT = '#8e3b46'
ACCENT_SOFT = '#f4e2e1'
GOLD = '#b9832f'
GOLD_SOFT = '#f7ecd9'
DARK = '#2b2024'
CREAM = '#fbf7f2'

SONGTI = '/System/Library/Fonts/Supplemental/Songti.ttc'
PINGFANG = '/System/Library/Fonts/PingFang.ttc'


def serif(size):
    return ImageFont.truetype(SONGTI, size, index=2)  # Songti TC Bold


def sans(size, weight='regular'):
    idx = {'regular': 1, 'medium': 4, 'semibold': 7}[weight]
    return ImageFont.truetype(PINGFANG, size, index=idx)


def data():
    js = """
    const { sessions } = await import('./src/data/sessions.js');
    const { mystery } = await import('./src/data/mystery.js');
    const { quizMeta, types, typeOrder } = await import('./src/data/quiz.js');
    console.log(JSON.stringify({ sessions, mystery, quizMeta, types, typeOrder }));
    """
    out = subprocess.run(['node', '--input-type=module', '-e', js], cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


NO_START = '，。、！？；：」』）》…⋯'


def wrap(draw, text, font, max_w):
    lines, line = [], ''
    for ch in text:
        nxt = line + ch
        if draw.textlength(nxt, font=font) <= max_w or not line or ch in NO_START:
            line = nxt
        else:
            lines.append(line)
            line = ch
    if line:
        lines.append(line)
    return lines


def text_block(draw, xy, text, font, fill, max_w, line_h, max_lines=None):
    x, y = xy
    lines = wrap(draw, text, font, max_w)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1][:-1] + '⋯'
    for i, l in enumerate(lines):
        draw.text((x, y + i * line_h), l, font=font, fill=fill)
    return y + len(lines) * line_h


def logo(size, color=ACCENT):
    """網站左上角的雙環 logo（4 倍大畫再縮小，邊緣才平滑）"""
    s = 4
    S = size * s
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    u = S / 24
    r, dx, cx, cy, sw = 6.4 * u, 3.4 * u, 12 * u, 12 * u, 1.9 * u
    for px in (cx - dx, cx + dx):
        d.ellipse([px - r, cy - r, px + r, cy + r], outline=color, width=round(sw))
    t = math.acos(dx / r)
    pts = [(cx - dx + r * math.cos(a), cy + r * math.sin(a)) for a in [(-t + 2 * t * i / 40) for i in range(41)]]
    pts += [(cx + dx + r * math.cos(a), cy + r * math.sin(a)) for a in [(math.pi - t + 2 * t * i / 40) for i in range(41)]]
    d.polygon(pts, fill=color)
    return im.resize((size, size), Image.LANCZOS)


def brand(im, x, y, color=INK, mark=ACCENT):
    im.alpha_composite(logo(44, mark), (x, y))
    ImageDraw.Draw(im).text((x + 56, y + 2), '關係練習室', font=serif(32), fill=color)


def rounded(src, size, radius):
    src = src.resize(size, Image.LANCZOS).convert('RGBA')
    mask = Image.new('L', size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    src.putalpha(mask)
    return src


def cover_crop(path, w, h):
    im = Image.open(path).convert('RGB')
    scale = max(w / im.width, h / im.height)
    im = im.resize((math.ceil(im.width * scale), math.ceil(im.height * scale)), Image.LANCZOS)
    left = (im.width - w) // 2
    top = (im.height - h) // 2
    return im.crop((left, top, left + w, top + h))


def save(im, name):
    OUT.mkdir(parents=True, exist_ok=True)
    im.convert('RGB').save(OUT / name, quality=88, optimize=True, progressive=True)
    print('public/og/' + name)


def session_card(s):
    photos = {1: 'ai-s1-listen', 2: 'ai-s2-repair', 3: 'ai-s3-choose', 4: 'ai-s4-share', 5: 'ai-s5-journey'}
    im = Image.new('RGBA', (W, H), BG)
    im.paste(cover_crop(IMG / f"{photos[s['num']]}-1024.jpg", 470, H), (0, 0))
    d = ImageDraw.Draw(im)
    x, mw = 540, W - 540 - 64
    d.text((x, 86), f"第 {s['num']} 堂 · {s['theme']}", font=sans(30, 'semibold'), fill=ACCENT)
    d.text((x, 134), s['title'], font=serif(88), fill=INK)
    d.text((x, 254), s['tagline'], font=serif(38), fill=SOFT)
    text_block(d, (x, 330), s['summary'], sans(27), SOFT, mw, 44, max_lines=3)
    brand(im, x, H - 92)
    save(im, f"s{s['num']}.jpg")


def mystery_card(m):
    im = Image.new('RGBA', (W, H), DARK)
    ids = [r['id'] for r in m['roles']]
    cw, ch, gap = 176, 264, 12
    gx = W - 52 - (cw * 3 + gap * 2)
    gy = (H - (ch * 2 + gap)) // 2
    for i, rid in enumerate(ids[:6]):
        c = rounded(cover_crop(IMG / 'mystery' / f'cover-{rid}-600.jpg', cw, ch), (cw, ch), 14)
        im.alpha_composite(c, (gx + (i % 3) * (cw + gap), gy + (i // 3) * (ch + gap)))
    d = ImageDraw.Draw(im)
    x, mw = 64, gx - 64 - 40
    d.text((x, 92), '劇本殺版', font=sans(30, 'semibold'), fill='#e2b46a')
    d.text((x, 140), f"《{m['title']}》", font=serif(62), fill=CREAM)
    # 副標在逗號後換行，比自動換行好讀
    y = 236
    for part in m['tagline'].replace('，', '，\n').split('\n'):
        y = text_block(d, (x, y), part, serif(32), '#d9cbc6', mw, 50)
    text_block(d, (x, y + 24), '2.5 小時 · 6 人 · 情感推理，沒有命案', sans(25), '#bfaeb2', mw, 40)
    brand(im, x, H - 92, color=CREAM, mark='#e48a95')
    save(im, 'mystery.jpg')


def quiz_card(q, types, order):
    im = Image.new('RGBA', (W, H), ACCENT_SOFT)
    d = ImageDraw.Draw(im)
    d.ellipse([820, -180, 1380, 380], fill=GOLD_SOFT)
    d.text((64, 96), '1 分鐘小測驗', font=sans(30, 'semibold'), fill=ACCENT)
    d.text((64, 146), q['title'], font=serif(80), fill=INK)
    text_block(d, (64, 262), q['subtitle'], sans(30), SOFT, W - 128, 46)
    x = 64
    for k in order:
        t = types[k]
        f = serif(40)
        w = int(d.textlength(t['name'], font=f)) + 64
        d.rounded_rectangle([x, 360, x + w, 360 + 76], radius=38, fill='#ffffff', outline=t['color'], width=3)
        d.text((x + 32, 372), t['name'], font=f, fill=t['color'])
        x += w + 18
    brand(im, 64, H - 92)
    save(im, 'quiz.jpg')


def questions_card():
    im = Image.new('RGBA', (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((64, 96), '免費小工具', font=sans(30, 'semibold'), fill=ACCENT)
    d.text((64, 146), '好問題抽卡', font=serif(84), fill=INK)
    text_block(d, (64, 262), '約會、和朋友聊天、和家人吃飯，都用得到的 30 個好問題。', sans(30), SOFT, 520, 48)
    card = Image.new('RGBA', (500, 330), (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle([0, 0, 499, 329], radius=28, fill=GOLD_SOFT, outline=LINE, width=2)
    cd.text((40, 36), '深入', font=sans(26, 'semibold'), fill=GOLD)
    text_block(cd, (40, 96), '什麼事情會讓你覺得「被愛」？', serif(40), INK, 420, 62)
    card = card.rotate(-4, resample=Image.BICUBIC, expand=True)
    back = Image.new('RGBA', (500, 330), (0, 0, 0, 0))
    ImageDraw.Draw(back).rounded_rectangle([0, 0, 499, 329], radius=28, fill=ACCENT_SOFT, outline=LINE, width=2)
    back = back.rotate(5, resample=Image.BICUBIC, expand=True)
    im.alpha_composite(back, (640, 120))
    im.alpha_composite(card, (620, 140))
    brand(im, 64, H - 92)
    save(im, 'questions.jpg')


def contact_card():
    im = Image.new('RGBA', (W, H), BG)
    d = ImageDraw.Draw(im)
    d.ellipse([760, 120, 1240, 600], fill=ACCENT_SOFT)
    d.ellipse([900, 40, 1300, 440], fill=GOLD_SOFT)
    d.text((64, 96), '關係練習室', font=sans(30, 'semibold'), fill=ACCENT)
    d.text((64, 146), '一起來做這件事', font=serif(80), fill=INK)
    text_block(d, (64, 262), '想參加活動、想一起辦，或只是想說說話，都歡迎留言給我。', sans(30), SOFT, 660, 48)
    brand(im, 64, H - 92)
    save(im, 'contact.jpg')


def main():
    dt = data()
    for s in dt['sessions']:
        session_card(s)
    mystery_card(dt['mystery'])
    quiz_card(dt['quizMeta'], dt['types'], dt['typeOrder'])
    questions_card()
    contact_card()


if __name__ == '__main__':
    main()
