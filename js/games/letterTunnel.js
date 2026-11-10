import { h, shuffle, pick, pickN, pop, cheer, makeHinter, choiceSet, wordPic } from '../ui.js';
import { speak } from '../audio.js';
import { WORDS, WORDS2, CHO, JUNG, JONG, JAMO_NAME, decompose } from '../data.js';

const R = 5;
const EASY_V = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ', 'ㅑ', 'ㅕ', 'ㅛ', 'ㅠ'];
const EASY_C = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const EASY_T = ['ㄱ', 'ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ'];
// 헷갈리기 쉬운 짝 (높은 단계의 보기)
const LOOK = { ㅏ: 'ㅑㅓ', ㅓ: 'ㅕㅏ', ㅗ: 'ㅛㅜ', ㅜ: 'ㅠㅗ', ㅡ: 'ㅣㅜ', ㅣ: 'ㅡㅏ', ㄱ: 'ㅋㄲ', ㄷ: 'ㅌㄸ', ㅂ: 'ㅍㅃ', ㅅ: 'ㅆㅈ', ㅈ: 'ㅊㅉ', ㄴ: 'ㄷㄹ', ㅁ: 'ㅂㅇ', ㅇ: 'ㅁㅎ', ㄹ: 'ㄴㄷ' };
// 단계별 빠지는 자리: 모음 → 자음 → 둘 다 → 받침 → 섞어서(헷갈리는 보기)
const PART = [['j'], ['c'], ['c', 'j'], ['t'], ['c', 'j', 't']];

// 으랏차 글자 광산(LetterTunnel): 광차를 타고 터널을 지나며, 빈칸에 들어갈 자음·모음을 골라 글자를 완성한다
export function mount(stage, ctx) {
  const L = ctx.level;
  const hinter = makeHinter();
  const pool = (L >= 4 ? WORDS2 : [...WORDS, ...WORDS2]).map((x) => ({ w: x.word, e: x.emoji }));
  const qs = [];
  const used = new Set();
  while (qs.length < R) {
    const it = pick(pool.filter((x) => !used.has(x.w)));
    used.add(it.w);
    const chars = [...it.w];
    // 빠질 자리를 고를 수 있는 글자 (받침 단계는 받침 있는 글자만)
    const part = pick(PART[L - 1]);
    const cand = chars.map((c, i) => ({ c, i, d: decompose(c) })).filter((x) => x.d && (part !== 't' || x.d.t));
    if (!cand.length) continue;
    const { c, i, d } = pick(cand);
    const ans = part === 'c' ? CHO[d.c] : part === 'j' ? JUNG[d.j] : JONG[d.t];
    const base = part === 'c' ? EASY_C : part === 'j' ? EASY_V : EASY_T;
    const near = L >= 5 && LOOK[ans] ? [...LOOK[ans]] : [];
    const opts = shuffle([ans, ...[...new Set([...near, ...pickN(base.filter((x) => x !== ans), 3)])].filter((x) => x !== ans).slice(0, 2)]);
    qs.push({ it, i, c, d, part, ans, opts });
  }
  const tunnel = h('div', { class: 'lt-tunnel' });
  const cart = h('div', { class: 'lt-cart', 'aria-hidden': 'true' }, '🛒');
  const sack = h('div', { class: 'lt-sack', 'aria-label': '모은 보석' });
  const panel = h('div', { class: 'lt-panel' });
  stage.append(h('div', { class: 'letter-tunnel' }, h('div', { class: 'lt-track' }, tunnel, cart), sack, panel));
  tunnel.append(...qs.map((_, k) => h('span', { class: 'lt-stop', style: { left: `${8 + (k * 84) / (R - 1)}%` } }, '⛏️')));
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    cart.style.left = `${8 + (n * 84) / (R - 1)}%`;
    const q = qs[n];
    const parts = { c: CHO[q.d.c], j: JUNG[q.d.j], t: JONG[q.d.t] };
    const box = (k) => (k === q.part ? h('span', { class: 'lt-jamo hole' }, '?') : parts[k] ? h('span', { class: 'lt-jamo' }, parts[k]) : null);
    const build = h('div', { class: `lt-build${q.d.t ? ' t' : ''}` }, box('c'), box('j'), box('t'));
    const word = h('div', { class: 'lt-word' }, [...q.it.w].map((ch, k) => (k === q.i ? h('span', { class: 'lt-miss' }, '□') : h('span', {}, ch))));
    panel.replaceChildren(
      h('div', { class: 'lt-q' }, h('span', { class: 'lt-e', 'aria-hidden': 'true' }, wordPic(q.it.w, q.it.e)), word, build),
      choiceSet(q.opts, {
        answer: q.ans,
        hinter,
        cls: 'choice lt-choice',
        label: (o) => JAMO_NAME[o] || o,
        onCorrect: (b, miss) => {
          if (miss === 0) firstTry++;
          build.querySelector('.hole').textContent = q.ans;
          build.querySelector('.hole').classList.remove('hole');
          word.querySelector('.lt-miss').textContent = q.c;
          pop(word);
          sack.append(h('span', { class: 'lt-gem', 'aria-hidden': 'true' }, pick(['💎', '🔷', '💠', '🔶'])));
          cheer(word);
          speak(q.it.w);
          ctx.later(() => {
            n++;
            if (n >= R) { cart.style.left = '96%'; ctx.later(() => ctx.finish({ firstTry, total: R }), 900); }
            else round();
          }, 1800);
        },
      }),
    );
    const what = q.part === 'c' ? '자음' : q.part === 'j' ? '모음' : '받침';
    ctx.prompt(`광차가 멈췄어요! '${q.it.w}'의 빈칸에 들어갈 ${what}을 골라 글자를 완성해요.`, () => speak(q.it.w));
  }

  round();
}
