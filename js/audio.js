import { store } from './store.js';

let ctx = null;
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function note(freq, start, dur, type = 'sine', gain = 0.16) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + start;
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

const on = () => store.state.sound;

export const sfx = {
  tap() { if (on()) note(660, 0, 0.08, 'triangle', 0.1); },
  pop() { if (!on()) return; note(520, 0, 0.1); note(780, 0.06, 0.14); },
  correct() { if (!on()) return; [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.08, 0.24, 'triangle', 0.14)); },
  wrong() { if (!on()) return; note(330, 0, 0.16, 'sine', 0.1); note(262, 0.12, 0.24, 'sine', 0.08); },
  sparkle() { if (on()) note(1200 + Math.random() * 700, 0, 0.07, 'sine', 0.035); },
  bark() { if (!on()) return; note(480, 0, 0.07, 'square', 0.05); note(330, 0.06, 0.12, 'square', 0.045); },
  chomp() { if (!on()) return; [0, 0.13, 0.26].forEach((t) => note(170, t, 0.06, 'triangle', 0.14)); },
  // 리듬 한글: 북·박자 소리 위에 짧은 가락 (i마다 가락이 달라요), 약 1.8초
  rhythm(i = 0) {
    if (!on()) return;
    const scale = [523, 587, 659, 784, 880, 1047];
    const tune = [0, 2, 4, 2, 3, 5, 4, 0];
    const beat = 0.22;
    for (let k = 0; k < 8; k++) {
      note(k % 4 === 0 ? 110 : 165, k * beat, 0.12, 'sine', 0.22);
      if (k % 2) note(2400, k * beat, 0.04, 'square', 0.03);
      note(scale[(i * 2 + tune[k]) % scale.length], k * beat, 0.18, 'triangle', 0.09);
    }
  },
  win() {
    if (!on()) return;
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => note(f, i * 0.11, 0.3, 'triangle', 0.14));
  },
};

/* ---------- 목소리 ----------
   1) 미리 만들어 둔 녹음(assets/voice): Microsoft 신경망 음성(한국어 선희, 영어 Ana)으로 만든 낱말·문장 조각.
      조각 수십 개를 파일 하나(bucket)에 이어 붙여 두고, manifest.json에 [파일 번호, 시작 초, 길이 초]를 적어 둔다.
   2) 녹음이 없는 말(아이 이름 등)은 브라우저 음성으로 읽는다. 기기에 있는 가장 자연스러운 음성을 고른다.
   speak()에 배열을 주면 조각을 차례로 이어서 읽는다: speak(['가', '글자를 만들어 볼까요?']) */
const VOICE_DIR = 'assets/voice/';
let manifest = null;
const buckets = new Map();
fetch(`${VOICE_DIR}manifest.json`).then((r) => (r.ok ? r.json() : null)).then((m) => { manifest = m; }).catch(() => {});

const clipKey = (text, lang) => `${lang.startsWith('en') ? 'en' : 'ko'}|${text.trim()}`;
const clipOf = (text, lang) => manifest?.clips[clipKey(text, lang)];

// 파일 하나를 받아 풀어 둔다 (최근에 쓴 것만 남긴다)
function bucket(i) {
  if (!buckets.has(i)) {
    const c = ac();
    const p = fetch(`${VOICE_DIR}${manifest.files[i]}`).then((r) => r.arrayBuffer()).then((b) => c.decodeAudioData(b));
    p.catch(() => buckets.delete(i));
    buckets.set(i, p);
    if (buckets.size > 24) buckets.delete(buckets.keys().next().value);
  }
  return buckets.get(i);
}

let playing = null;
let ttsVoices = [];
const loadVoices = () => { ttsVoices = window.speechSynthesis?.getVoices() || []; };
if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}
// 자연스러운 음성 순서: 신경망(Natural/Online) → 구글 → 애플(유나·Samantha) → 그 밖
const PREFER = [/SunHi|InJoon|Hyunsu|Ana|Jenny|Aria/i, /natural|online|neural/i, /google/i, /yuna|samantha|siri/i];
function voiceFor(lang) {
  const base = lang.slice(0, 2).toLowerCase();
  const list = ttsVoices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(base));
  for (const re of PREFER) {
    const v = list.find((x) => re.test(x.name));
    if (v) return v;
  }
  return list[0] || null;
}

function tts(text, lang, opts) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window) || !text) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = voiceFor(lang);
    if (v) u.voice = v;
    u.rate = opts.rate ?? (lang.startsWith('en') ? 0.85 : 0.92);
    u.pitch = opts.pitch ?? 1.05;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve();
    };
    u.onend = finish;
    u.onerror = finish;
    if (opts.onboundary) u.onboundary = opts.onboundary;
    const timer = setTimeout(finish, 1800 + text.length * 150);
    playing = { stop: () => { speechSynthesis.cancel(); finish(); } };
    speechSynthesis.speak(u);
  });
}

// 녹음 앞뒤의 조용한 부분을 잘라 낸 [시작, 길이] (이어 읽을 때 말 사이가 길게 늘어지지 않도록)
const trimmed = new Map();
function trim(buf, start, dur) {
  const key = `${start}|${buf.length}`;
  if (trimmed.has(key)) return trimmed.get(key);
  const d = buf.getChannelData(0);
  const sr = buf.sampleRate;
  const a = Math.floor(start * sr);
  const b = Math.min(d.length, Math.floor((start + dur) * sr));
  let i = a;
  let j = b - 1;
  while (i < b && Math.abs(d[i]) < 0.012) i++;
  while (j > i && Math.abs(d[j]) < 0.012) j--;
  const pad = 0.05 * sr;
  const out = i >= j ? [start, dur] : [Math.max(a, i - pad) / sr, (Math.min(b, j + pad) - Math.max(a, i - pad)) / sr];
  trimmed.set(key, out);
  return out;
}

async function playClip(clip, opts, token) {
  const [file, rawStart, rawDur] = clip;
  const buf = await bucket(file);
  if (token !== speakToken) return;
  const [start, dur] = trim(buf, rawStart, rawDur);
  const c = ac();
  const src = c.createBufferSource();
  src.buffer = buf;
  // 목소리 높이를 바꾸면(몬스터 친구들) 빠르기도 조금 같이 바뀐다
  src.playbackRate.value = opts.pitch ? Math.max(0.75, Math.min(1.35, opts.pitch)) : 1;
  const g = c.createGain();
  g.gain.value = 1.15;
  src.connect(g).connect(c.destination);
  await new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    src.onended = finish;
    playing = { stop: () => { try { src.stop(); } catch {} finish(); } };
    src.start(0, start, dur);
    setTimeout(finish, (dur / src.playbackRate.value) * 1000 + 400);
  });
}

let speakToken = 0;
const missed = new Set();
export const voiceMisses = missed;

export function speak(text, lang = 'ko-KR', opts = {}) {
  stopSpeech();
  // 개발용: window.__voiceLog(Set)가 있으면 소리를 꺼 둬도 읽으려던 말을 모아 둔다 (녹음 목록 만들 때)
  if (window.__voiceLog && text) (Array.isArray(text) ? text : [text]).forEach((t) => window.__voiceLog.add(clipKey(String(t), lang)));
  if (!on() || !text || (Array.isArray(text) && !text.length)) return Promise.resolve();
  const token = ++speakToken;
  // 세 자리 수(352)는 녹음이 없으면 백의 자리와 나머지 녹음(300 · 52)을 이어 읽는다
  const parts = (Array.isArray(text) ? text : [text]).map((t) => String(t).trim()).filter(Boolean)
    .flatMap((t) => (/^[1-9]\d\d$/.test(t) && manifest && !clipOf(t, lang) ? [String(Math.floor(t / 100) * 100), t % 100 ? String(t % 100) : ''].filter(Boolean) : [t]));
  // 낱말 하나하나를 짚어 주는 그림책(onboundary)은 브라우저 음성으로 읽는다
  const whole = parts.join(' ');
  const clips = !opts.onboundary && manifest ? parts.map((p) => clipOf(p, lang)) : [];
  if (!clips.length || clips.some((c) => !c)) {
    // 문장 전체 녹음이 있으면 그것으로, 아니면 브라우저 음성
    const all = !opts.onboundary && clipOf(whole, lang);
    if (all) return playClip(all, opts, token);
    if (manifest) parts.forEach((p, i) => { if (!clips[i]) missed.add(clipKey(p, lang)); });
    return tts(whole, lang, opts);
  }
  return (async () => {
    for (let i = 0; i < clips.length; i++) {
      if (token !== speakToken) return;
      await playClip(clips[i], opts, token);
      if (i < clips.length - 1) await new Promise((r) => setTimeout(r, 180));
    }
  })();
}

export function stopSpeech() {
  speakToken++;
  playing?.stop();
  playing = null;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
