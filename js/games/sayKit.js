import { h, wiggle, pop } from '../ui.js';
import { sfx } from '../audio.js';
import { listen, speechMode, similarity, wordHits, PASS_WORD, PASS_SENTENCE } from '../speech.js';

/* 말하기 놀이가 함께 쓰는 마이크 단추.
   mic.ask({ target })              낱말·짧은 말 하나를 말하면 통과
   mic.ask({ words: [...] })        문장을 읽으면 낱말마다 onHits([true,false,...])로 알려 주고, 기준만큼 읽으면 통과
   mic.ask({ options: [...] })      보기 중 하나를 말하면 통과 (어떤 것을 말했는지 choice로 돌려준다)
   결과: { ok, tries, choice, said, verified }
   - 세 번 넘게 못 알아들으면 '다음으로' 단추를 보여 준다 (무벌점 원칙)
   - 음성인식이 없거나 마이크를 막아 두면 '다 말했어요' 단추로 넘어간다 */
export function makeMic(ctx, { lang = 'ko-KR', label } = {}) {
  const en = lang.startsWith('en');
  const L = ctx.level;
  const btn = h('button', { class: 'mic-btn', type: 'button', 'aria-label': '눌러서 말하기' },
    h('span', { class: 'mic-ring', 'aria-hidden': 'true' }), h('span', { class: 'mic-icon', 'aria-hidden': 'true' }, '🎤'));
  const status = h('p', { class: 'mic-status', 'aria-live': 'polite' });
  const heard = h('p', { class: `mic-heard${en ? ' latin' : ''}` });
  const extra = h('div', { class: 'mic-extra' });
  const el = h('div', { class: 'mic-panel', 'data-state': 'idle' }, btn, status, heard, extra);
  if (label) el.prepend(h('p', { class: 'mic-label' }, label));

  let job = null;
  let session = null;
  ctx.onCleanup(() => { job = null; session?.stop(); });
  const setState = (s, text) => {
    el.dataset.state = s;
    if (text != null) status.textContent = text;
  };
  const idleText = () => (speechMode() === 'level' ? '마이크를 누르고 크게 말해요!' : '마이크를 누르고 말해요!');

  function judge(res, q) {
    const texts = res.texts;
    if (q.options) {
      let best = -1;
      let score = 0;
      q.options.forEach((o, i) => {
        const s = similarity(texts, o, lang);
        if (s > score) { score = s; best = i; }
      });
      return { pass: best >= 0 && score >= PASS_WORD[L - 1], choice: best, score };
    }
    if (q.words) {
      const hits = wordHits(texts, q.words, lang);
      const ratio = hits.filter(Boolean).length / q.words.length;
      return { pass: ratio >= PASS_SENTENCE[L - 1], hits, score: ratio };
    }
    const score = similarity(texts, q.target, lang);
    return { pass: score >= PASS_WORD[L - 1], score };
  }

  async function attempt() {
    if (!job || session) return;
    const q = job.q;
    sfx.tap();
    setState('listening', en ? 'Listening… 말해 보세요!' : '듣고 있어요… 말해 보세요!');
    heard.textContent = '';
    extra.replaceChildren();
    const expect = q.target || (q.words ? q.words.join(' ') : q.options[0]);
    session = listen({
      lang,
      expect,
      long: Boolean(q.words),
      onVoice: (on) => el.classList.toggle('voice', on),
      onInterim: (t) => {
        if (speechMode() !== 'level') heard.textContent = t;
        if (q.words && q.onHits) q.onHits(wordHits([t], q.words, lang), false);
      },
    });
    const res = await session.promise;
    session = null;
    if (!job || !ctx.alive) return;
    job.tries++;

    // 마이크를 쓸 수 없으면: 소리 내어 말한 뒤 어른이 눌러 주는 단추
    if (res.error === 'blocked' || res.error === 'none' || res.error === 'start') {
      setState('blocked', '마이크를 쓸 수 없어요. 소리 내어 말한 다음 아래 단추를 눌러요.');
      offerDone();
      return;
    }
    if (!res.verified) {
      // 소리 크기로만 들었을 때: 말을 했으면 통과
      if (res.heard) return pass({ score: 1 }, res);
      return retry('조금 더 크게 말해 볼까요?');
    }
    const r = judge(res, q);
    if (q.words && q.onHits) q.onHits(r.hits, true);
    q.onTry?.({ pass: r.pass, said: res.texts[0] || '', choice: r.choice ?? -1 });
    if (r.pass) return pass(r, res);
    if (!res.texts.length) return retry(en ? '잘 안 들렸어요. 다시 크게 말해 볼까요?' : '잘 안 들렸어요. 다시 크게 말해 볼까요?');
    return retry(q.words ? '조금만 더 또박또박 읽어 볼까요?' : '비슷해요! 한 번 더 말해 볼까요?');
  }

  function pass(r, res) {
    const great = r.score >= 0.92;
    setState('pass', great ? (en ? 'Perfect!' : '정말 잘했어요!') : (en ? 'Good job!' : '잘했어요!'));
    pop(btn);
    const j = job;
    job = null;
    j.resolve({ ok: true, tries: j.tries, choice: r.choice ?? -1, said: res.texts[0] || '', verified: res.verified, hits: r.hits });
  }

  function retry(text) {
    setState('retry', text);
    wiggle(btn);
    sfx.wrong();
    if (job.tries >= 3) {
      // 여러 번 못 알아들어도 벌점 없이 넘어갈 수 있다
      const next = h('button', { class: 'btn btn-ghost mic-skip', type: 'button' }, '다음으로 ▶');
      next.addEventListener('click', () => {
        const j = job;
        if (!j) return;
        job = null;
        setState('idle', '');
        extra.replaceChildren();
        j.resolve({ ok: true, skipped: true, tries: j.tries, choice: -1, said: '', verified: true });
      });
      extra.replaceChildren(next);
    }
  }

  function offerDone() {
    const q = job.q;
    const items = q.options
      ? q.options.map((o, i) => [o, i])
      : [[en ? 'I said it! 다 말했어요 👍' : '다 말했어요 👍', -1]];
    extra.replaceChildren(...items.map(([text, i]) => {
      const b = h('button', { class: `btn mic-done${en ? ' latin' : ''}`, type: 'button' }, q.options ? `“${text}” 말했어요` : text);
      b.addEventListener('click', () => {
        const j = job;
        if (!j) return;
        job = null;
        setState('pass', '잘했어요!');
        extra.replaceChildren();
        j.resolve({ ok: true, tries: j.tries, choice: i, said: '', verified: false });
      });
      return b;
    }));
  }

  btn.addEventListener('click', () => {
    if (session) { session.stop(); return; }
    attempt();
  });

  return {
    el,
    // 질문 하나를 맡긴다. 이전 질문은 취소된다
    ask(q) {
      session?.stop();
      heard.textContent = '';
      extra.replaceChildren();
      return new Promise((resolve) => {
        job = { q, tries: 0, resolve };
        if (speechMode() === 'none') {
          setState('blocked', '이 브라우저는 마이크로 들을 수 없어요. 소리 내어 말한 다음 단추를 눌러요.');
          offerDone();
        } else setState('ready', q.hint || idleText());
      });
    },
    // 다른 소리를 들려주는 동안 잠시 막아 둔다
    wait(text = '') {
      session?.stop();
      setState('wait', text);
    },
    ready(text) { if (job) setState('ready', text || idleText()); },
    cancel() {
      session?.stop();
      job = null;
      setState('idle', '');
    },
    press: () => attempt(),
  };
}
