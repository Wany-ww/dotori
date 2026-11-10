/* ---------- 말하기: 아이가 소리 내어 말한 것을 듣고 맞는지 본다 ----------
   1) 브라우저 음성인식(SpeechRecognition): 크롬·엣지·사파리. 들은 말 후보 여러 개를 받아 목표 말과 비교한다.
      기기 안에서 알아듣는 기능(processLocally)이 있으면 그것을 쓰고, 없으면 브라우저가 음성 서버로 보낸다.
   2) 음성인식이 없으면(파이어폭스 등) 마이크 소리 크기로 "말을 했는지"만 본다.
   3) 마이크도 못 쓰면 어른이 "다 말했어요"를 눌러 넘어간다.
   녹음은 어디에도 저장하지 않는다.
   개발용: window.__speechMock = (목표 말, 언어) => '들은 말'을 두면 마이크 없이 시험할 수 있다. */
import { stopSpeech } from './audio.js';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export function speechMode() {
  if (window.__speechMock) return 'mock';
  if (SR) return 'sr';
  if (navigator.mediaDevices?.getUserMedia) return 'level';
  return 'none';
}

// 기기 안 음성인식을 쓸 수 있으면 켠다 (크롬 최신판)
const local = new Map();
async function canLocal(lang) {
  if (!SR?.available) return false;
  if (!local.has(lang)) {
    local.set(lang, SR.available({ langs: [lang], processLocally: true }).then((s) => s === 'available').catch(() => false));
  }
  return local.get(lang);
}

/* listen(): 한 번 듣는다. 결과 { texts: 들은 말 후보, heard: 소리를 냈는지, verified: 말까지 알아들었는지, error }
   onInterim(text): 말하는 도중에 들은 말 (문장 읽기에서 전구를 하나씩 켤 때)
   onVoice(on): 소리가 들리기 시작/끝 */
export function listen({ lang = 'ko-KR', expect = '', long = false, maxMs, onInterim, onVoice } = {}) {
  stopSpeech();
  const limit = maxMs || (long ? 12000 : 6000);
  const mode = speechMode();
  let stopFn = () => {};
  const promise = new Promise((resolve) => {
    let done = false;
    const finish = (r) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      onVoice?.(false);
      resolve({ texts: [], heard: false, verified: false, ...r });
    };
    const timer = setTimeout(() => stopFn(), limit);

    if (mode === 'mock') {
      onVoice?.(true);
      const said = window.__speechMock(expect, lang);
      const texts = (Array.isArray(said) ? said : [said]).filter((t) => t != null).map(String);
      setTimeout(() => {
        if (texts[0]) onInterim?.(texts[0]);
        finish({ texts, heard: texts.length > 0, verified: true });
      }, 250);
      stopFn = () => finish({ texts, heard: texts.length > 0, verified: true });
      return;
    }

    if (mode === 'sr') {
      const rec = new SR();
      rec.lang = lang;
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      rec.continuous = long;
      const finals = [];
      let interim = '';
      let silence = 0;
      // 문장은 말이 1.8초 멈추면 끝난 것으로 본다
      const quiet = () => {
        clearTimeout(silence);
        if (long) silence = setTimeout(() => { try { rec.stop(); } catch {} }, 1800);
      };
      rec.onsoundstart = () => onVoice?.(true);
      rec.onspeechstart = () => onVoice?.(true);
      rec.onsoundend = () => onVoice?.(false);
      rec.onresult = (e) => {
        interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finals.push([...res].map((a) => a.transcript));
          else interim += res[0].transcript;
        }
        const sofar = [...finals.map((f) => f[0]), interim].join(' ').trim();
        if (sofar) onInterim?.(sofar);
        quiet();
      };
      const texts = () => {
        // 이어 말한 문장은 첫 후보끼리 이어 붙이고, 마지막 조각은 후보마다 하나씩 만든다
        if (!finals.length) return interim ? [interim] : [];
        const head = finals.slice(0, -1).map((f) => f[0]).join(' ');
        return finals[finals.length - 1].map((alt) => `${head} ${alt}`.trim());
      };
      rec.onerror = (e) => {
        clearTimeout(silence);
        const blocked = e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture';
        finish({ texts: texts(), heard: texts().length > 0, verified: true, error: blocked ? 'blocked' : e.error });
      };
      rec.onend = () => {
        clearTimeout(silence);
        finish({ texts: texts(), heard: texts().length > 0, verified: true });
      };
      stopFn = () => { try { rec.stop(); } catch { finish({ texts: texts(), verified: true }); } };
      canLocal(lang).then((ok) => {
        if (ok) rec.processLocally = true;
        try { rec.start(); } catch { finish({ error: 'start' }); }
      });
      return;
    }

    if (mode === 'level') {
      // 말소리를 알아듣지는 못하고, 일정 시간 이상 목소리가 났는지만 잰다
      let stream = null;
      let ac = null;
      let raf = 0;
      let voiced = 0;
      let last = 0;
      let talking = false;
      const need = Math.min(1.2, 0.3 + expect.length * 0.06);
      const close = (r) => {
        cancelAnimationFrame(raf);
        stream?.getTracks().forEach((t) => t.stop());
        ac?.close().catch(() => {});
        finish(r);
      };
      stopFn = () => close({ heard: voiced >= need * 0.6 });
      navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
        if (done) { s.getTracks().forEach((t) => t.stop()); return; }
        stream = s;
        ac = new (window.AudioContext || window.webkitAudioContext)();
        const an = ac.createAnalyser();
        an.fftSize = 1024;
        ac.createMediaStreamSource(s).connect(an);
        const buf = new Float32Array(an.fftSize);
        last = performance.now();
        const tick = (now) => {
          an.getFloatTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
          const loud = Math.sqrt(sum / buf.length) > 0.035;
          if (loud !== talking) { talking = loud; onVoice?.(loud); }
          if (loud) voiced += (now - last) / 1000;
          last = now;
          // 충분히 말하고 잠깐 조용해지면 끝
          if (voiced >= need && !loud) return close({ heard: true });
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }).catch(() => finish({ error: 'blocked' }));
      return;
    }

    finish({ error: 'none' });
  });
  return { promise, stop: () => stopFn() };
}

/* ---------- 말 비교 ---------- */
const SINO = { 0: '영', 1: '일', 2: '이', 3: '삼', 4: '사', 5: '오', 6: '육', 7: '칠', 8: '팔', 9: '구', 10: '십' };
const NATIVE = { 1: '한', 2: '두', 3: '세', 4: '네', 5: '다섯', 6: '여섯', 7: '일곱', 8: '여덟', 9: '아홉', 10: '열' };
const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

// 한글 글자를 자모로 풀어 쓴다 (사과 → ㅅㅏㄱㅘ 와 같은 자모 번호 줄)
function jamoSeq(s) {
  const out = [];
  for (const ch of s) {
    const i = ch.charCodeAt(0) - 0xac00;
    if (i < 0 || i > 11171) continue;
    out.push(`c${Math.floor(i / 588)}`, `v${Math.floor((i % 588) / 28)}`);
    if (i % 28) out.push(`t${i % 28}`);
  }
  return out;
}

// 영어 철자를 소리 나는 대로 비슷하게 줄인다 (phone/fone, cat/kat를 같게)
function enKey(w) {
  return w.toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k').replace(/q/g, 'k')
    .replace(/x/g, 'ks').replace(/wh/g, 'w').replace(/^kn/, 'n').replace(/^wr/, 'r').replace(/gh/g, '')
    .replace(/z/g, 's').replace(/(.)\1+/g, '$1').replace(/(.{3,})e$/, '$1');
}

function enWords(s) {
  return s.toLowerCase().replace(/\d+/g, (d) => ` ${EN_NUM[Number(d)] || d} `).replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean);
}
function koWords(s, nums) {
  return s.replace(/\d+/g, (d) => nums[Number(d)] || d).replace(/[^가-힣\s]/g, ' ').split(/\s+/).filter(Boolean);
}

// 목표 줄(a)이 들은 줄(b) 어딘가에 얼마나 비슷하게 들어 있는지 (앞뒤에 다른 말이 붙어도 괜찮게)
function within(a, b) {
  if (!a.length) return 1;
  if (!b.length) return 0;
  let prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return Math.max(0, 1 - Math.min(...prev) / a.length);
}

const units = (s, lang) => (lang.startsWith('en') ? [...enWords(s).map(enKey).join('')] : jamoSeq(s));

/* similarity(): 들은 말 후보 중 목표 말과 가장 비슷한 정도 0~1 */
export function similarity(texts, target, lang) {
  const t = units(target, lang);
  let best = 0;
  for (const raw of texts) {
    const forms = lang.startsWith('en') ? [raw] : [koWords(raw, NATIVE).join(''), koWords(raw, SINO).join('')];
    for (const f of forms) best = Math.max(best, within(t, units(f, lang)));
  }
  return best;
}

/* wordHits(): 문장의 낱말(어절)마다 들었는지. 순서대로 짝을 지어 [true, false, ...] */
export function wordHits(texts, words, lang) {
  const en = lang.startsWith('en');
  const key = (w) => (en ? [...enKey(w)] : jamoSeq(w));
  let best = words.map(() => false);
  for (const raw of texts) {
    const heard = en ? enWords(raw) : koWords(raw, NATIVE);
    const hk = heard.map(key);
    const hits = [];
    let from = 0;
    for (const w of words) {
      const wk = key(w);
      // 조사나 끝이 조금 달라도(먹어요/먹어) 앞부분이 맞으면 들은 것으로 본다
      let found = -1;
      for (let j = from; j < hk.length && found < 0; j++) {
        const s = within(wk, hk[j]);
        const pre = within(wk.slice(0, Math.max(2, Math.ceil(wk.length * 0.6))), hk[j]);
        // 조사를 빼고 말해도(우유를 → 우유) 들은 것으로 본다
        const head = hk[j].length >= wk.length * 0.5 && within(hk[j], wk) >= 0.85;
        if (s >= 0.6 || (pre >= 0.85 && wk.length >= 4) || head) found = j;
      }
      // 두 어절을 붙여서 알아들었을 때(비가와요): 앞서 짝지은 긴 말 안에 들어 있으면
      let stay = false;
      if (found < 0 && from > 0 && hk[from - 1].length > wk.length && within(wk, hk[from - 1]) >= 0.85) {
        found = from - 1;
        stay = true;
      }
      // 낱말을 붙여서 알아들었을 때(고마워요 → 고마워 요)도 이어 붙여서 본다
      if (found < 0 && from < hk.length - 1) {
        const joined = hk.slice(from, from + 2).flat();
        if (within(wk, joined) >= 0.7) found = from + 1;
      }
      hits.push(found >= 0);
      if (found >= 0 && !stay) from = found + 1;
    }
    if (hits.filter(Boolean).length > best.filter(Boolean).length) best = hits;
  }
  return best;
}

// 단계별 통과 기준 (아이 발음과 음성인식의 실수를 생각해 넉넉하게)
// (한 글자가 통째로 다르면(나비/나무) 떨어지고, 자모 하나쯤 다른 것(사과/사가)은 붙는 정도)
export const PASS_WORD = [0.6, 0.6, 0.65, 0.65, 0.7];
export const PASS_SENTENCE = [0.5, 0.6, 0.6, 0.7, 0.75];
