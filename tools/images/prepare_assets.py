# 생성한 그림을 앱에 넣을 모양으로 다듬는다.
#  - 생성 모델이 투명 배경 대신 그려 넣은 체크무늬 · 흰 · 크림 바탕을 지워 진짜 투명(알파)으로 만든다
#  - 그림이 있는 곳만 잘라 내고, 쓰는 크기로 줄여 WebP로 저장한다 (2MB PNG → 수십 KB)
#  - 원본은 asset-src/에 옮겨 둔다 (다시 다듬을 때 쓴다)
# 실행: python tools/images/prepare_assets.py   (Pillow · numpy · scipy 필요)
import os, re, shutil, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'asset-src')
OUT = os.path.join(ROOT, 'assets')

# 생성 때 이름이 바뀐 파일은 asset-src에서 이름을 바로잡아 둔다 (1차: mosters → monsters)
RENAME = {}


def collect():
    """assets의 그림 원본을 asset-src로 옮긴다 (이미 옮긴 것은 그대로)."""
    for d in ['char', 'scenes', 'maps', 'ui', 'words', 'stickers']:
        os.makedirs(os.path.join(SRC, d), exist_ok=True)
        for f in os.listdir(os.path.join(OUT, d)):
            p = os.path.join(OUT, d, f)
            base, ext = os.path.splitext(f)
            if ext.lower() not in ('.png', '.webp', '.jpg', '.jpeg'):
                continue
            olds = [x for x in os.listdir(os.path.join(SRC, d)) if os.path.splitext(x)[0] == base]
            # 다듬은 결과물은 .webp뿐이라, 원본을 옮겨 둔 이름의 .webp는 결과물이다. png · jpg는 늘 새로 만든 원본
            if olds and ext.lower() == '.webp':
                continue
            # 같은 이름을 다시 만들어 넣었으면 예전 원본은 asset-src/_old로 비켜 둔다
            for x in olds:
                os.makedirs(os.path.join(SRC, '_old', d), exist_ok=True)
                shutil.move(os.path.join(SRC, d, x), os.path.join(SRC, '_old', d, x))
            shutil.move(p, os.path.join(SRC, d, f))


def sources():
    """이름마다 원본 하나 (png가 있으면 png, 아니면 webp)."""
    out = {}
    for d in os.listdir(SRC):
        if d.startswith('_'):
            continue
        for f in sorted(os.listdir(os.path.join(SRC, d))):
            base, ext = os.path.splitext(f)
            key = f'{d}/{base}'
            if key not in out or ext.lower() == '.png':
                out[key] = os.path.join(SRC, d, f)
    return out


def bg_mask(rgb, light_min, sat_max):
    """가장자리와 이어진 '바탕 같은' 화소(밝고 채도가 낮은 체크무늬 · 흰 · 크림)와,
    그림 속에 갇힌 체크무늬 구멍(밝기가 들쭉날쭉한 곳)을 바탕으로 본다."""
    sat = rgb.max(2).astype(int) - rgb.min(2).astype(int)
    light = rgb.mean(2)
    bgl = (sat <= sat_max) & (light >= light_min)
    lab, n = ndimage.label(bgl)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    edge = edge[edge > 0]
    mask = np.isin(lab, edge)
    # 갇힌 구멍: 넓고, 체크무늬처럼 밝기가 번갈아 바뀌면 바탕
    if n:
        idx = np.arange(1, n + 1)
        area = ndimage.sum(np.ones_like(light), lab, idx)
        std = ndimage.standard_deviation(light, lab, idx)
        holes = idx[(area > 400) & (std > 9) & ~np.isin(idx, edge)]
        mask |= np.isin(lab, holes)
    return mask


def checker_period(light):
    """체크 칸 한 변의 길이: 맨 위 줄에서 밝기가 크게 바뀌는 간격의 중앙값."""
    row = light[2, : min(400, light.shape[1])]
    jumps = np.where(np.abs(np.diff(row)) > 30)[0]
    gaps = np.diff(jumps)
    gaps = gaps[gaps > 4]
    return int(np.median(gaps)) if len(gaps) else 16


def texture_mask(rgb):
    """체크무늬: 무채색이고, 칸 한 변만큼 옮긴 화소와 밝기가 크게 다른 곳(밝은 칸 ↔ 어두운 칸).
    회색 코끼리처럼 매끈한 회색은 옮겨도 밝기가 같아서 남는다. 아주 흰 곳(스티커 흰 테두리)도 바탕."""
    sat = rgb.max(2).astype(int) - rgb.min(2).astype(int)
    light = rgb.mean(2)
    p = checker_period(light)
    diff = np.zeros_like(light)
    for axis in (0, 1):
        for sh in (p, -p):
            diff = np.maximum(diff, np.abs(light - np.roll(light, sh, axis=axis)))
    return ((sat <= 16) & (diff > 25)) | ((light >= 247) & (sat <= 8))


def cut_word(im, margin=0.04):
    """낱말 그림: 가장자리에서 이어진 체크무늬 · 흰 테두리만 지우고, 큰 덩어리만 남긴다."""
    rgb = np.array(im.convert('RGB'))
    bgl = texture_mask(rgb)
    # 메우기는 가장자리를 깎아 먹으므로, 바깥을 바탕으로 한 겹 두르고 메운 뒤 벗긴다
    bgl = ndimage.binary_closing(np.pad(bgl, 4, constant_values=True), iterations=2)[4:-4, 4:-4]
    lab, n = ndimage.label(bgl)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge[edge > 0])
    fg = ndimage.binary_opening(~bg, iterations=2)
    lab, n = ndimage.label(fg)
    if n:
        sizes = ndimage.sum(fg, lab, np.arange(1, n + 1))
        # 작은 덩어리는 본체 둘레 안에 있을 때만(눈사람 팔 · 달팽이 더듬이) — 멀리 떨어진 체크 부스러기는 버린다
        boxes = ndimage.find_objects(lab)
        big = boxes[int(sizes.argmax())]
        pad = 0.08 * max(fg.shape)
        y0, y1 = big[0].start - pad, big[0].stop + pad
        x0, x1 = big[1].start - pad, big[1].stop + pad
        # 체크 부스러기는 무채색이라, 작은 덩어리는 색이 있어야 남긴다
        sat = rgb.max(2).astype(int) - rgb.min(2).astype(int)
        hue = ndimage.mean(sat, lab, np.arange(1, n + 1))
        keep = [i + 1 for i, (s, b, c) in enumerate(zip(sizes, boxes, hue))
                if s >= sizes.max() * 0.25
                or (s >= sizes.max() * 0.04 and c > 20 and b[0].start >= y0 and b[0].stop <= y1 and b[1].start >= x0 and b[1].stop <= x1)]
        fg = np.isin(lab, keep)
    fg = ndimage.binary_fill_holes(fg)
    fg = ndimage.binary_erosion(fg, iterations=1)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert('RGB').copy()
    out.putalpha(alpha)
    return crop(out, np.array(alpha) > 20, margin)


def cutout(im, light_min=150, sat_max=30, main_only=False, margin=0.04):
    rgb = np.array(im.convert('RGB'))
    bg = bg_mask(rgb, light_min, sat_max)
    fg = ~bg
    fg = ndimage.binary_opening(fg, iterations=2)
    lab, n = ndimage.label(fg)
    if n:
        sizes = ndimage.sum(fg, lab, np.arange(1, n + 1))
        if main_only:
            keep = [int(np.argmax(sizes)) + 1]
        else:
            keep = list(np.where(sizes > fg.size * 0.0004)[0] + 1)
        fg = np.isin(lab, keep)
    fg = ndimage.binary_fill_holes(fg) if main_only else fg
    # 가장자리 1화소를 깎고 부드럽게 (체크무늬 테두리 번짐을 줄인다)
    fg = ndimage.binary_erosion(fg, iterations=1)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert('RGB').copy()
    out.putalpha(alpha)
    return crop(out, np.array(alpha) > 20, margin)


# 다시 만드는 그림은 투명 대신 단색 바탕(크로마키)으로 받는다: 자홍 #FF00FF 또는 초록 #00FF00
KEYS = {'magenta': (255, 0, 255), 'green': (0, 255, 0)}


def key_color(rgb):
    """테두리 화소 대부분이 자홍이나 초록이면 그 색을 돌려준다."""
    border = np.concatenate([rgb[:6].reshape(-1, 3), rgb[-6:].reshape(-1, 3), rgb[:, :6].reshape(-1, 3), rgb[:, -6:].reshape(-1, 3)]).astype(int)
    for k in KEYS.values():
        if (np.abs(border - k).sum(1) < 150).mean() > 0.6:
            return np.array(k)
    return None


def key_cut(im, key, main_only=True, margin=0.04):
    """단색 바탕을 빼고, 가장자리는 바탕색이 섞인 만큼 반투명으로 · 색은 바탕색을 덜어 낸다."""
    rgb = np.array(im.convert('RGB')).astype(float)
    dist = np.abs(rgb - key).sum(2)
    a = np.clip((dist - 90) / 160, 0, 1)
    fg = a > 0.5
    lab, n = ndimage.label(fg)
    if n:
        sizes = ndimage.sum(fg, lab, np.arange(1, n + 1))
        keep = [int(np.argmax(sizes)) + 1] if main_only else list(np.where(sizes > sizes.max() * 0.03)[0] + 1)
        body = ndimage.binary_dilation(np.isin(lab, keep), iterations=3)
        a = a * body
    safe = np.maximum(a, 1e-3)[..., None]
    col = np.clip((rgb - (1 - a[..., None]) * key) / safe, 0, 255)
    out = Image.fromarray(np.dstack([col, a * 255]).astype(np.uint8), 'RGBA')
    return crop(out, a > 0.1, margin)


def crop(im, keep, margin=0.04):
    ys, xs = np.where(keep)
    if not len(xs):
        return im
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    m = int(max(x1 - x0, y1 - y0) * margin)
    return im.crop((max(0, x0 - m), max(0, y0 - m), min(im.width, x1 + m + 1), min(im.height, y1 + m + 1)))


def content_box(im, tol=18):
    """크림색 빈 바탕을 빼고 그림이 그려진 사각형 (표지 · 언덕 · 햇살)."""
    rgb = np.array(im.convert('RGB')).astype(int)
    bgc = np.median(np.concatenate([rgb[:4].reshape(-1, 3), rgb[:, :4].reshape(-1, 3)]), axis=0)
    diff = np.abs(rgb - bgc).sum(2) > tol * 3
    cols = np.where(diff.mean(0) > 0.08)[0]
    rows = np.where(diff.mean(1) > 0.08)[0]
    if not len(cols) or not len(rows):
        return im
    return im.crop((cols.min(), rows.min(), cols.max() + 1, rows.max() + 1))


def sticker(im):
    """동그란 스티커: 흰 테두리 원 밖은 투명, 원 안의 체크무늬는 크림색으로 채운다."""
    rgb = np.array(im.convert('RGB')).astype(int)
    h, w = rgb.shape[:2]
    light = rgb.mean(2)
    sat = rgb.max(2) - rgb.min(2)
    white = (light > 236) & (sat < 16)
    # 흰 테두리: 가운데에서 본 거리마다 흰 화소가 가장 많은 반지름
    cy, cx = h / 2, w / 2
    yy, xx = np.mgrid[:h, :w]
    r = np.hypot(yy - cy, xx - cx)
    hist = np.bincount(r[white].astype(int), minlength=int(r.max()) + 1)
    hist[: int(h * 0.25)] = 0
    R = int(np.argmax(hist)) + 6
    inside = r <= R
    # 원 안의 체크무늬: 테두리 바로 안쪽에서 시작해 이어진 회색 화소
    ring_in = (r > R - 22) & (r <= R - 10)
    checker = (sat <= 26) & ~white
    lab, n = ndimage.label(checker & inside)
    seeds = np.unique(lab[ring_in & checker])
    seeds = seeds[seeds > 0]
    fillm = np.isin(lab, seeds)
    out = rgb.copy()
    out[fillm] = [255, 246, 232]
    a = (inside * 255).astype(np.uint8)
    img = Image.fromarray(out.astype(np.uint8))
    img.putalpha(Image.fromarray(a).filter(ImageFilter.GaussianBlur(1)))
    return img.crop((int(cx - R - 2), int(cy - R - 2), int(cx + R + 2), int(cy + R + 2)))


def burst(im):
    """보상 햇살: 가장 큰 덩어리(햇살)의 가운데를 중심으로 동그랗게 잘라, 모서리 장식은 뺀다."""
    rgb = np.array(im.convert('RGB'))
    fg = ~bg_mask(rgb, 135, 34)
    lab, n = ndimage.label(fg)
    sizes = ndimage.sum(fg, lab, np.arange(1, n + 1))
    big = lab == int(np.argmax(sizes)) + 1
    ys, xs = np.where(big)
    cy, cx = (ys.min() + ys.max()) / 2, (xs.min() + xs.max()) / 2
    R = max(ys.max() - ys.min(), xs.max() - xs.min()) / 2 * 1.08
    yy, xx = np.mgrid[:rgb.shape[0], :rgb.shape[1]]
    keep = fg & (np.hypot(yy - cy, xx - cx) <= R)
    keep = ndimage.binary_erosion(keep, iterations=1)
    out = im.convert('RGB').copy()
    out.putalpha(Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)))
    return out.crop((int(max(0, cx - R)), int(max(0, cy - R)), int(min(im.width, cx + R)), int(min(im.height, cy + R))))


def fit(im, max_w, max_h=None):
    max_h = max_h or max_w
    s = min(max_w / im.width, max_h / im.height, 1)
    return im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS) if s < 1 else im


def save(im, key, q=84):
    p = os.path.join(OUT, key + '.webp')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, 'WEBP', quality=q, method=6)
    return p


def write_word_list():
    """앱이 낱말 그림이 있는지 알 수 있게 js/wordArtList.js에 낱말 목록을 적는다 (그림만 넣고 이 스크립트를 돌리면 연결 끝)."""
    words = sorted(os.path.splitext(f)[0] for f in os.listdir(os.path.join(OUT, 'words')) if f.endswith('.webp'))
    body = ', '.join(f"'{w}'" for w in words)
    with open(os.path.join(ROOT, 'js', 'wordArtList.js'), 'w', encoding='utf8') as f:
        f.write('// tools/images/prepare_assets.py가 만든 파일: assets/words에 그림이 있는 낱말\n')
        f.write(f'export const WORD_ART_LIST = [{body}];\n')


def main(only=None):
    collect()
    done = []
    for key, src in sorted(sources().items()):
        name = RENAME.get(key, key)
        if only and not re.search(only, name):
            continue
        d, base = name.split('/')
        im = Image.open(src)
        key = None if d in ('scenes', 'maps') else key_color(np.array(im.convert('RGB')))
        size = {'words': 420, 'stickers': 320}.get(d, 256 if base.startswith('stage-') else 640)
        if key is not None:
            out = fit(key_cut(im, key, main_only=d != 'words' and name != 'ui/reward-burst', margin=0.02 if d == 'ui' else 0.04), size)
        elif d in ('scenes', 'maps'):
            out = fit(im.convert('RGB'), 1600)
        elif name in ('ui/home-hills',):
            out = fit(content_box(im).convert('RGB'), 2000)
        elif base.startswith('cover-'):
            out = fit(content_box(im).convert('RGB'), 800)
        elif name == 'ui/reward-burst':
            out = fit(burst(content_box(im)), 640)
        elif name == 'char/tori-sheet':
            continue
        elif d == 'char':
            out = fit(cutout(im, light_min=150, sat_max=32), 640)
        elif d == 'words':
            out = fit(cut_word(im), 420)
        elif d == 'stickers':
            out = fit(sticker(im), 320)
        elif base.startswith('stage-'):
            out = fit(cutout(im, light_min=150, sat_max=32, main_only=True, margin=0.02), 256)
        else:
            # 물건 그림은 그림자 쪽 체크무늬가 어두워서 기준을 낮춘다
            out = fit(cutout(im, light_min=100, sat_max=30, main_only=True, margin=0.02), 640)
        p = save(out, name)
        done.append((name, out.size, os.path.getsize(p)))
    write_word_list()
    for name, size, b in done:
        print(f'{name:28s} {size[0]}x{size[1]} {b // 1024}KB')
    print('total', len(done), sum(b for *_, b in done) // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else None)
