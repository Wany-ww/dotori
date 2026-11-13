# 녹음 조각들을 파일 수십 개(bucket)로 이어 붙이고, 조각마다 [파일 번호, 시작 초, 길이 초]를 manifest.json에 적는다
import hashlib, json, os, sys
src, cache, out = sys.argv[1], sys.argv[2], sys.argv[3]
PER = 40
BITRATE = {1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], 2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]}
RATE = {1: [44100, 48000, 32000], 2: [22050, 24000, 16000], 25: [11025, 12000, 8000]}

def duration(b):
    i, secs = 0, 0.0
    while i + 4 <= len(b):
        if b[i] != 0xFF or (b[i + 1] & 0xE0) != 0xE0:
            i += 1
            continue
        ver = {3: 1, 2: 2, 0: 25}.get((b[i + 1] >> 3) & 3)
        br = (b[i + 2] >> 4) & 15
        sr = (b[i + 2] >> 2) & 3
        if ver is None or br in (0, 15) or sr == 3:
            i += 1
            continue
        pad = (b[i + 2] >> 1) & 1
        rate = RATE[ver][sr]
        kbps = BITRATE[1 if ver == 1 else 2][br]
        spf = 1152 if ver == 1 else 576
        size = (144 if ver == 1 else 72) * kbps * 1000 // rate + pad
        secs += spf / rate
        i += size
    return secs

data = json.load(open(src, encoding='utf-8'))
items = []
for lang in ('ko', 'en'):
    for t in data[lang]:
        p = os.path.join(cache, hashlib.sha1(f'{lang}|{t}'.encode()).hexdigest() + '.mp3')
        if os.path.exists(p) and os.path.getsize(p) > 500:
            items.append((lang, t, p))
os.makedirs(out, exist_ok=True)
for f in os.listdir(out):
    if f.startswith('v') and f.endswith('.mp3'):
        os.remove(os.path.join(out, f))
files, clips = [], {}
for k in range(0, len(items), PER):
    chunk = items[k:k + PER]
    name = f'v{k // PER:03d}.mp3'
    pos = 0.0
    with open(os.path.join(out, name), 'wb') as w:
        for lang, t, p in chunk:
            b = open(p, 'rb').read()
            d = duration(b)
            clips[f'{lang}|{t}'] = [len(files), round(pos, 3), round(d, 3)]
            pos += d
            w.write(b)
    files.append(name)
# 파일마다 내용의 짧은 해시: 앱이 파일 주소 뒤에 붙여(?v=) 기기에 남은 예전 파일을 쓰지 않게 한다
ver = [hashlib.sha1(open(os.path.join(out, f), 'rb').read()).hexdigest()[:10] for f in files]
json.dump({'files': files, 'ver': ver, 'clips': clips}, open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
total = sum(os.path.getsize(os.path.join(out, f)) for f in files)
print('clips', len(clips), 'files', len(files), 'MB', round(total / 1e6, 1))
