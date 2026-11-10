import { h, pickN, cheer, pop } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { store } from '../store.js';
import { ALIEN_TALK, ALIEN_BYE } from '../data.js';
import { makeMic } from './sayKit.js';

// 외계인 챗(AlienChat): 지구로 이사 온 외계인 친구 지브와 화상 통화를 한다.
// 지브가 묻는 말에 보기 중 하나를 골라 영어로 대답하면, 지브가 그 대답에 맞장구를 친다.
// (진짜 카메라는 켜지 않는다. 내 화면에는 내 캐릭터가 나온다)
export function mount(stage, ctx) {
  const L = ctx.level;
  // 처음 인사 + 단계에 맞는 질문 3개 + 작별 인사
  // 영어 차시: 단계 목표에 맞춘 대화(묻고 답하기 · 좋아요/싫어요 · 시간 · 주문 …)가 있으면 그것으로
  const pool = ctx.unit?.dialogs || ALIEN_TALK.filter((t) => t.min <= L && t.min >= L - 2 && t !== ALIEN_TALK[0]);
  const turns = [ALIEN_TALK[0], ...pickN(pool, 3), ALIEN_BYE];
  const R = turns.length;
  const alien = h('div', { class: 'ac-alien', 'aria-hidden': 'true' }, h('i', { class: 'ac-ant' }), h('i', { class: 'ac-eye' }), h('i', { class: 'ac-mouth' }));
  const say = h('p', { class: 'ac-say latin', 'aria-live': 'polite' });
  const me = h('div', { class: 'ac-me', 'aria-hidden': 'true' }, store.profile?.avatar || '🙂');
  const answers = h('div', { class: 'ac-answers' });
  const mic = makeMic(ctx, { lang: 'en-US' });
  const call = h('div', { class: 'ac-call' },
    h('div', { class: 'ac-screen' }, h('span', { class: 'ac-live' }, '● LIVE'), h('span', { class: 'ac-name latin' }, 'Zib 🛸'), alien, say, me));
  stage.append(h('div', { class: 'alienchat' }, call, answers, mic.el));

  let n = 0;
  let firstTry = 0;

  async function talk(line) {
    say.textContent = line;
    alien.classList.add('talk');
    await speak(line, 'en-US', { pitch: 1.25 });
    alien.classList.remove('talk');
  }

  async function round() {
    ctx.progress(n, R);
    const t = turns[n];
    answers.replaceChildren(...t.a.map(([text, e]) => {
      const b = h('button', { class: 'ac-chip', type: 'button', 'aria-label': `${text} 듣기` }, h('span', { 'aria-hidden': 'true' }, e), h('span', { class: 'latin' }, text));
      b.addEventListener('click', () => { sfx.tap(); speak(text, 'en-US'); });
      return b;
    }));
    ctx.prompt('외계인 친구 지브가 물어봐요. 아래 대답 중 하나를 골라 영어로 말해 주세요!', () => talk(t.q), { auto: false });
    mic.wait();
    await talk(t.q);
    if (!ctx.alive) return;
    const res = await mic.ask({ options: t.a.map((x) => x[0]) });
    if (!ctx.alive) return;
    if (!res.skipped && res.tries === 1) firstTry++;
    const i = res.choice >= 0 ? res.choice : 0;
    const chip = answers.children[i];
    chip.classList.add('chosen');
    pop(me);
    sfx.correct();
    alien.classList.add('happy');
    await talk(t.a[i][2]);
    alien.classList.remove('happy');
    if (!ctx.alive) return;
    cheer(call, 'en');
    ctx.later(() => {
      n++;
      if (n >= R) ctx.finish({ firstTry, total: R });
      else round();
    }, 900);
  }

  round();
}
