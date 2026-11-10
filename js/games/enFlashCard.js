import { h, shuffle, pick, pickN, cheer, makeHinter, choiceSet } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { EN_FLASH_SETS } from '../data.js';

// 단계별: 익히는 카드 수, 문제 차례(listen: 듣고 그림·단어 카드 고르기, listenWord: 듣고 단어만 있는 카드 고르기,
// read: 단어 카드를 읽고 그림 고르기), 보기 수, read 차례에 단어를 읽어 주는지
const CFG = [
  { learn: 3, turns: ['listen', 'listen', 'listen'], opts: 2, readAloud: true },
  { learn: 4, turns: ['listen', 'listen', 'listen', 'listen'], opts: 3, readAloud: true },
  { learn: 4, turns: ['listen', 'listen', 'read', 'read'], opts: 3, readAloud: true },
  { learn: 4, turns: ['listenWord', 'listenWord', 'read', 'read'], opts: 3, readAloud: false },
  { learn: 5, turns: ['listenWord', 'read', 'listenWord', 'read', 'read'], opts: 4, readAloud: false },
];

// 플래시 카드(FlashCard): 토리가 책상 너머에서 카드를 보여 주며 읽어 주고, 걷어 간 뒤 하나씩 다시 물어본다
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  // 영어 차시: 오늘 단어로 카드를 만든다 (주제 이름은 오늘 배우는 것)
  const set = ctx.unit ? { name: ctx.unit.show || ctx.unit.title, words: ctx.unit.words(cfg.learn).map((x) => [x.w, x.e]) } : pick(EN_FLASH_SETS);
  const words = pickN(set.words, cfg.learn).map(([w, e]) => ({ w, e }));
  const R = cfg.turns.length;
  const hinter = makeHinter();
  const paws = h('div', { class: 'efc-paws', 'aria-hidden': 'true' }, h('span', { class: 'efc-paw left' }), h('span', { class: 'efc-paw right' }), h('span', { class: 'efc-arm' }));
  const desk = h('div', { class: 'efc-desk' });
  stage.append(h('div', { class: 'enflash' }, paws, h('div', { class: 'efc-topic latin' }, set.name), desk));
  const targets = shuffle([...words, ...shuffle(words)]).slice(0, R);
  let n = 0;
  let firstTry = 0;

  const cardEl = (it, { pic = true, word = true, cls = '' } = {}) => h('span', { class: `efc-card ${cls}` },
    pic ? h('span', { class: 'efc-pic', 'aria-hidden': 'true' }, it.e) : null,
    word ? h('span', { class: 'efc-label latin' }, it.w) : null);

  // 1) 익히기: 카드를 한 장씩 내려놓으며 읽어 준다. 눌러서 다시 들을 수 있다
  function learn() {
    ctx.progress(0, R);
    const cards = words.map((it, i) => {
      const b = h('button', { class: 'efc-slot deal', type: 'button', style: { animationDelay: `${i * 0.9}s` }, 'aria-label': `${it.w} 카드 듣기` }, cardEl(it));
      b.addEventListener('click', () => {
        sfx.tap();
        b.classList.remove('say');
        void b.offsetWidth;
        b.classList.add('say');
        speak(it.w, 'en-US');
      });
      return b;
    });
    desk.className = 'efc-desk learn';
    desk.replaceChildren(...cards);
    words.forEach((it, i) => ctx.later(() => {
      cards[i].classList.add('say');
      speak(it.w, 'en-US');
    }, 500 + i * 900));
    const after = 700 + words.length * 900;
    // 한 번 더 천천히 들어 볼 시간을 준 다음, 토리 팔이 내려와 카드를 걷어 간다
    ctx.later(() => {
      paws.classList.add('sweep');
      sfx.pop();
    }, after + 2600);
    ctx.later(() => desk.classList.add('swept'), after + 2900);
    ctx.later(() => {
      paws.classList.remove('sweep');
      turn();
    }, after + 3700);
    ctx.prompt('카드를 잘 보고 들어요. 눌러서 다시 들을 수 있어요!', () => speak("Let's look at the cards!", 'en-US'));
  }

  // 2) 문제 차례
  function turn() {
    hinter.reset();
    ctx.progress(n, R);
    const it = targets[n];
    const mode = cfg.turns[n];
    const opts = shuffle([it, ...pickN(words.filter((x) => x !== it), cfg.opts - 1)]);
    const say = () => {
      speaker.classList.remove('talk');
      void speaker.offsetWidth;
      speaker.classList.add('talk');
      speak(it.w, 'en-US');
    };
    const speaker = h('button', { class: 'efc-speaker', type: 'button', 'aria-label': '단어 다시 듣기', onclick: say }, '🔊');
    desk.className = `efc-desk quiz ${mode}`;

    const done = (btn, miss) => {
      if (miss === 0) firstTry++;
      btn.classList.add('chosen');
      desk.classList.add('solved');
      speak(it.w, 'en-US');
      cheer(btn, 'en');
      ctx.later(() => desk.classList.add('swept'), 1500);
      ctx.later(() => {
        n++;
        if (n >= R) ctx.finish({ firstTry, total: R });
        else turn();
      }, 2100);
    };

    if (mode === 'read') {
      desk.replaceChildren(
        h('div', { class: 'efc-wordcard latin deal' }, it.w),
        choiceSet(opts, {
          answer: it,
          hinter,
          cls: 'efc-bubble',
          label: (o) => `그림 ${opts.indexOf(o) + 1}`,
          render: (o) => h('span', { class: 'efc-pic' }, o.e),
          onCorrect: done,
        }),
      );
      ctx.prompt(
        cfg.readAloud ? '단어 카드를 읽고, 알맞은 그림 말풍선을 골라요!' : '소리 없이 읽기! 단어 카드에 맞는 그림을 골라요.',
        cfg.readAloud ? () => speak(it.w, 'en-US') : () => speak('Read the card.', 'en-US'),
      );
      return;
    }
    desk.replaceChildren(
      speaker,
      choiceSet(opts, {
        answer: it,
        hinter,
        cls: 'efc-pickcard',
        label: (o) => (mode === 'listenWord' ? `단어 카드 ${o.w}` : `${o.w} 카드`),
        render: (o) => cardEl(o, { pic: mode !== 'listenWord' }),
        onCorrect: done,
      }),
    );
    ctx.prompt(mode === 'listenWord' ? '단어를 듣고, 알맞은 단어 카드를 골라요!' : '단어를 듣고, 알맞은 카드를 골라요!', say);
  }

  learn();
}
