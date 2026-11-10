import asyncio, hashlib, json, os, sys
import edge_tts

src, cache = sys.argv[1], sys.argv[2]
os.makedirs(cache, exist_ok=True)
data = json.load(open(src, encoding='utf-8'))
VOICE = {'ko': ('ko-KR-SunHiNeural', '-6%'), 'en': ('en-US-AnaNeural', '-8%')}
jobs = [(lang, t) for lang in ('ko', 'en') for t in data[lang]]

def path(lang, t):
    return os.path.join(cache, hashlib.sha1(f'{lang}|{t}'.encode()).hexdigest() + '.mp3')

sem = asyncio.Semaphore(6)
done = 0
fail = []
async def one(lang, t):
    global done
    p = path(lang, t)
    if os.path.exists(p) and os.path.getsize(p) > 500:
        done += 1
        return
    voice, rate = VOICE[lang]
    async with sem:
        for attempt in range(4):
            try:
                await edge_tts.Communicate(t, voice, rate=rate).save(p + '.part')
                os.replace(p + '.part', p)
                break
            except Exception as e:
                await asyncio.sleep(1.5 * (attempt + 1))
        else:
            fail.append(t)
    done += 1
    if done % 200 == 0:
        print(done, '/', len(jobs), flush=True)

async def main():
    await asyncio.gather(*(one(l, t) for l, t in jobs))
    print('done', done, 'fail', len(fail), fail[:10], flush=True)
asyncio.run(main())

