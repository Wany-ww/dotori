import { h, pick, shuffle, pop, cheer, wiggle } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { ALIEN_TALK } from '../data.js';
import { makeMic } from './sayKit.js';

// 전화를 거는 친구 (목소리 높이가 다르다)
export const CALLERS = [
  { name: 'Alien', e: '👽', pitch: 1.25 },
  { name: 'Robot', e: '🤖', pitch: 0.85 },
  { name: 'Fox', e: '🦊', pitch: 1.15 },
  { name: 'Panda', e: '🐼', pitch: 1.0 },
  { name: 'Penguin', e: '🐧', pitch: 1.3 },
];
export const CALL_LINES = {
  ring: 'Ring ring!',
  hello: 'Hello.',
  helloBack: 'Nice to see you!',
  bye: 'I have to go now. Bye!',
  byeOk: 'Catch you later.',
  byeBack: 'See you soon!',
  huh: 'Hmm? Listen again.',
};
export const greetOf = (name) => `Hi, ${name}.`;

// 메신저(CallwithFriends): 따르르릉 — 누군가 영상 전화를 걸어 왔어요! 받으면 친구가 말을 걸고,
// 아래 대답 두 개(알맞은 대답 · 엉뚱한 대답)를 차례로 들려준다. 알맞은 대답을 골라 마이크에 말하면 친구가 맞장구친다.
// 인사 → 차시 대화 3개 → 작별 인사, 모두 5번 주고받는다
export function mount(stage, ctx) {
  const L = ctx.level;
  const caller = pick(CALLERS);
  const pool = ctx.unit?.dialogs || ALIEN_TALK.filter((t) => t.min <= L && t !== ALIEN_TALK[0]);
  const talks = shuffle(pool).slice(0, 3);
  const others = (t) => pool.filter((x) => x !== t).flatMap((x) => x.a.map((a) => a[0])).filter((a) => !t.a.some((b) => b[0] === a));
  const turns = [
    { q: CALL_LINES.hello, right: greetOf(caller.name), wrong: CALL_LINES.byeOk, back: CALL_LINES.helloBack },
    ...talks.map((t) => {
      const [right, , back] = pick(t.a);
      return { q: t.q, right, wrong: pick(others(t)) || CALL_LINES.byeOk, back };
    }),
    { q: CALL_LINES.bye, right: CALL_LINES.byeOk, wrong: greetOf(caller.name), back: CALL_LINES.byeBack },
  ];
  const R = turns.length;

  const face = h('span', { class: 'msg-face', 'aria-hidden': 'true' }, '❔');
  const bubble = h('p', { class: 'msg-bubble latin', 'aria-live': 'polite' });
  const phone = h('button', { class: 'msg-phone', type: 'button', 'aria-label': '전화 받기' }, '📞');
  const screen = h('div', { class: 'msg-screen ringing' }, h('span', { class: 'msg-ring', 'aria-hidden': 'true' }, phone), face, bubble);
  const lines = h('div', { class: 'msg-lines' });
  const mic = makeMic(ctx, { lang: 'en-US' });
  const dots = h('span', { class: 'msg-dots', 'aria-hidden': 'true' }, turns.map(() => h('i')));
  stage.append(h('div', { class: 'messenger' }, dots, screen, h('div', { class: 'msg-bottom' }, lines, mic.el)));

  let n = 0;
  let firstTry = 0;

  async function talk(text) {
    bubble.textContent = text;
    screen.classList.add('talk');
    await speak(text, 'en-US', { pitch: caller.pitch });
    screen.classList.remove('talk');
  }

  // 따르르릉: 전화기를 누르면 받는다 (누가 걸었는지는 받아야 보인다)
  function ring() {
    bubble.textContent = CALL_LINES.ring;
    sfx.bark();
    const t = setInterval(() => { if (ctx.alive && screen.classList.contains('ringing')) sfx.sparkle(); }, 450);
    ctx.onCleanup(() => clearInterval(t));
    phone.addEventListener('click', () => {
      if (!screen.classList.contains('ringing')) return;
      clearInterval(t);
      sfx.pop();
      screen.classList.remove('ringing');
      face.textContent = caller.e;
      pop(face);
      round();
    }, { once: true });
    ctx.prompt('따르르릉! 누군가 전화를 걸었어요. 전화기를 눌러 받아 보세요!', () => speak(CALL_LINES.ring, 'en-US'));
  }

  // 대답 두 개를 하나씩 들려주며 보여 준다
  async function offer(t) {
    const opts = shuffle([t.right, t.wrong]);
    lines.replaceChildren();
    const rows = opts.map((text) => {
      const sp = h('button', { class: 'msg-say', type: 'button', 'aria-label': `${text} 듣기` }, '🔊');
      const tx = h('span', { class: 'msg-text latin' });
      sp.addEventListener('click', () => { sfx.tap(); speak(text, 'en-US'); });
      const row = h('div', { class: 'msg-line' }, sp, tx);
      lines.append(row);
      return { row, sp, tx, text };
    });
    for (const r of rows) {
      if (!ctx.alive) return rows;
      r.sp.classList.add('on');
      r.tx.textContent = r.text;
      await speak(r.text, 'en-US');
      r.sp.classList.remove('on');
      await new Promise((ok) => setTimeout(ok, 250));
    }
    return rows;
  }

  async function round() {
    ctx.progress(n, R);
    [...dots.children].forEach((d, i) => d.classList.toggle('now', i === n));
    const t = turns[n];
    ctx.prompt('친구의 말을 듣고, 알맞은 대답을 마이크에 말해요!', () => talk(t.q), { auto: false });
    mic.wait();
    await talk(t.q);
    if (!ctx.alive) return;
    const rows = await offer(t);
    if (!ctx.alive) return;
    let miss = 0;
    // 엉뚱한 대답을 말하면 친구가 갸웃하고 다시 듣는다
    for (;;) {
      const res = await mic.ask({ options: [t.right, t.wrong] });
      if (!ctx.alive) return;
      if (res.choice !== 1) break;
      miss++;
      sfx.wrong();
      wiggle(rows.find((r) => r.text === t.wrong).row);
      screen.classList.add('huh');
      await talk(CALL_LINES.huh);
      screen.classList.remove('huh');
      if (!ctx.alive) return;
      await talk(t.q);
    }
    if (miss === 0) firstTry++;
    rows.find((r) => r.text === t.right).row.classList.add('chosen');
    dots.children[n].classList.add('on');
    sfx.correct();
    screen.classList.add('happy');
    await talk(t.back);
    screen.classList.remove('happy');
    if (!ctx.alive) return;
    cheer(screen, 'en');
    ctx.later(() => {
      n++;
      if (n < R) round();
      else {
        screen.classList.add('hangup');
        ctx.finish({ firstTry, total: R });
      }
    }, 900);
  }

  ring();
}
