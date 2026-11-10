import { h, shuffle, pickN, cheer, pop } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { WORDS, WORDS2, SENTENCES, VOCAB, VOCAB2, SPELL_WORDS, EN_PHRASES, EN_SENTENCES } from '../data.js';
import { makeMic } from './sayKit.js';

const R = 5;
// 친구마다 판 수 (참고 영상: 너구리 7번 · 받아쓰기 6번)
const ROUNDS = { raccoon: 7, pet: 6 };
// 친구별 모습과 말
const CAST = {
  koala: { e: '🐨', name: '코알라', lang: 'ko-KR', mode: 'repeat', ask: '따라 해 보세요!', yes: ['잘했어요!', '최고예요!', '멋져요!'] },
  fox: { e: '🦊', name: '여우', lang: 'ko-KR', mode: 'dictate', ask: '읽어 주세요!', yes: ['다 받아썼어요!', '고마워요!'] },
  raccoon: { e: '🦝', name: '너구리', lang: 'en-US', mode: 'repeat', ask: 'Say it with me!', yes: ['Great job!', 'Awesome!', 'Well done!'] },
  pet: { e: '🦊', name: '여우', lang: 'en-US', mode: 'dictate', ask: 'Read it to me!', yes: ['I wrote it!', 'Thank you!'] },
  bird: { e: '🐦', name: '새', lang: 'en-US', mode: 'bird', ask: 'Read it out loud!', yes: ['Great job!', 'You got it!', 'Well done!'] },
  quiz: { e: '🦊', name: '여우 선생님', lang: 'en-US', mode: 'dictate', ask: 'Can you read this?', yes: ['Correct!', 'You got it!', 'Great reading!'] },
};
const w2 = (list) => list.map((x) => ({ text: x.word ?? x.w, e: x.emoji ?? x.e }));
const pairs = (list) => list.map(([text, e]) => ({ text, e }));

// 단계별: 무엇을 말하나(items), 그림을 보여 주는지(pic), 친구가 먼저 읽어 주는지(model), 카드의 🔊로 다시 들을 수 있는지(hint)
function plan(cast, L, lesson, unit, R) {
  const ko = cast.lang === 'ko-KR';
  if (ko) {
    const sent = (n) => SENTENCES[n].map((s) => ({ text: s.words.join(' '), e: s.e }));
    const fromLesson = lesson && (lesson.sentence && lesson.sentences(R).length >= R
      ? lesson.sentences(R).map((s) => ({ text: s.text, e: s.e }))
      : w2(lesson.words(R, { pic: true, maxLen: 4 })));
    if (cast.mode === 'repeat') {
      const items = fromLesson || [w2(WORDS), w2(WORDS), w2(WORDS2), sent(2), sent(3)][L - 1];
      return { items, pic: L <= 3, model: true, hint: true };
    }
    const items = fromLesson || [w2(WORDS), w2(WORDS), w2(WORDS2), w2(WORDS2), sent(2)][L - 1];
    return { items, pic: L <= 3, model: false, hint: L <= 2 };
  }
  // 영어 차시: 알파벳 단계는 'A is for apple.', 단어 단계는 오늘 단어, 문장 단계는 오늘 문장 (그림 · 시범은 단계를 따른다)
  if (unit) {
    const items = unit.sentenceUnit
      ? unit.sentences(R).map((x) => ({ text: x.text, e: x.e }))
      : unit.track === 'alpha' ? unit.letters(R).map((U) => ({ text: unit.sayFor(U), e: unit.wordFor(U).e }))
        : w2(unit.words(R + 2));
    if (cast.mode === 'repeat') return { items, pic: true, model: true, hint: true };
    if (cast === CAST.quiz) return { items, pic: false, model: false, hint: L <= 3 };
    if (cast.mode === 'dictate') return { items, pic: L <= 2, model: false, hint: L <= 2 };
    return { items, pic: L <= 3, model: L <= 2, hint: L <= 3 };
  }
  if (cast.mode === 'repeat') {
    return { items: [w2(VOCAB), w2(VOCAB), w2(VOCAB2), pairs(EN_PHRASES), pairs(EN_SENTENCES)][L - 1], pic: L <= 4, model: true, hint: true };
  }
  // 펫 퀴즈: 칠판 앞 여우 선생님의 읽기 퀴즈 (카드의 🔊로 들어 볼 수 있다)
  if (cast === CAST.quiz) {
    return { items: [w2(SPELL_WORDS[3]), w2(SPELL_WORDS[4]), w2(SPELL_WORDS[5]), pairs(EN_PHRASES), pairs(EN_SENTENCES)][L - 1], pic: false, model: false, hint: L <= 3 };
  }
  if (cast.mode === 'dictate') {
    return { items: [w2(SPELL_WORDS[3]), w2(SPELL_WORDS[4]), w2(VOCAB2), pairs(EN_PHRASES), pairs(EN_SENTENCES)][L - 1], pic: L <= 2, model: false, hint: L <= 2 };
  }
  // 새: 1~2단계는 새가 먼저 읽어 주고, 3단계부터는 아이가 먼저 읽는다
  return { items: [w2(SPELL_WORDS[3]), w2(SPELL_WORDS[4]), w2(SPELL_WORDS[5]), w2(VOCAB2), pairs(EN_SENTENCES)][L - 1], pic: L <= 3, model: L <= 2, hint: L <= 3 };
}

// 따라 말하기(TalkingRaccoon) · 받아쓰기(PetDictation) · 따라서 읽어보기(ReadingBird)
// 친구가 말해 주면 따라 말하거나, 카드를 소리 내어 읽어 준다. 받아쓰기 친구는 들은 말을 수첩에 적는다
export function mount(stage, ctx) {
  const cast = CAST[ctx.opts.cast];
  const L = ctx.level;
  const en = cast.lang === 'en-US';
  const R = ROUNDS[ctx.opts.cast] || 5;
  const p = plan(cast, L, ctx.lesson, ctx.unit, R);
  const items = pickN(p.items, R);
  // 말하는 너구리: 글자 카드 없이 듣기만 하고 따라 말한다 (참고 영상)
  const listenOnly = ctx.opts.cast === 'raccoon';
  const friend = h('button', { class: 'sa-friend', type: 'button', 'aria-label': `${cast.name} 말 다시 듣기` }, cast.e);
  const bubble = h('span', { class: `sa-bubble${en ? ' latin' : ''}` });
  const pic = h('span', { class: 'sa-pic', 'aria-hidden': 'true' });
  const text = h('span', { class: `sa-text${en ? ' latin' : ''}` });
  const hint = h('button', { class: 'sa-hint', type: 'button', 'aria-label': '카드 소리 듣기' }, '🔊');
  const card = h('div', { class: 'sa-card' }, pic, text, hint);
  const pad = h('div', { class: `sa-pad${en ? ' latin' : ''}`, 'aria-live': 'polite' });
  const mic = makeMic(ctx, { lang: cast.lang });
  const scene = h('div', { class: `sayafter cast-${ctx.opts.cast} mode-${cast.mode}` },
    h('div', { class: 'sa-stage' }, h('div', { class: 'sa-who' }, bubble, friend), card, cast.mode === 'dictate' ? pad : null),
    mic.el);
  stage.append(scene);

  let n = 0;
  let firstTry = 0;
  // 펫 퀴즈: 맞힐 때마다 발바닥 우표를 모은다
  const stamps = ctx.opts.cast === 'quiz' ? h('div', { class: 'sa-stamps', 'aria-label': '모은 우표' }) : null;
  if (stamps) scene.prepend(stamps);

  const say = (it) => speak(it.text, cast.lang);
  const talk = async (line, lang = cast.lang) => {
    bubble.textContent = line;
    bubble.classList.add('show');
    friend.classList.remove('talk');
    void friend.offsetWidth;
    friend.classList.add('talk');
    await speak(line, lang);
    friend.classList.remove('talk');
  };

  // 받아쓰기 친구가 들은 말을 한 글자씩 수첩에 적는다
  function write(line, ok) {
    pad.classList.toggle('ok', ok);
    pad.replaceChildren(...[...line].map((c, i) => h('span', { style: { animationDelay: `${i * 0.07}s` } }, c)));
    if (ok) pad.append(h('b', { class: 'sa-stamp', 'aria-hidden': 'true' }, '💯'));
  }

  async function round() {
    ctx.progress(n, R);
    const it = items[n];
    friend.classList.remove('happy', 'puzzled');
    bubble.classList.remove('show');
    pic.textContent = p.pic && it.e ? it.e : '';
    card.classList.toggle('no-pic', !(p.pic && it.e));
    text.textContent = it.text;
    hint.hidden = !p.hint;
    pad.replaceChildren();
    pad.classList.remove('ok');
    card.classList.remove('deal');
    void card.offsetWidth;
    card.classList.add('deal');
    card.hidden = listenOnly;
    hint.onclick = () => { sfx.tap(); say(it); };
    friend.onclick = () => (p.model || cast.mode === 'repeat' ? talk(it.text) : talk(cast.ask, cast.lang));

    const doing = cast.mode === 'repeat'
      ? (en ? '너구리가 하는 말을 듣고 똑같이 따라 말해요!' : '코알라가 하는 말을 듣고 똑같이 따라 말해요!')
      : stamps
        ? '여우 선생님의 퀴즈예요! 카드를 소리 내어 읽으면 선생님이 칠판에 적어 줘요.'
      : cast.mode === 'dictate'
        ? `${cast.name}가 받아쓰기를 해요. 카드를 소리 내어 읽어 주세요!`
        : p.model ? '새가 읽어 주는 단어를 듣고 큰 소리로 따라 읽어요!' : '새가 보여 주는 단어를 큰 소리로 읽어 보세요!';
    ctx.prompt(doing, () => (p.model ? talk(it.text) : talk(cast.ask)), { auto: false });

    mic.wait();
    if (p.model) {
      await talk(cast.mode === 'repeat' ? cast.ask : 'Listen!', cast.lang);
      if (!ctx.alive) return;
      await talk(it.text);
    } else {
      await talk(cast.ask);
    }
    if (!ctx.alive) return;
    const res = await mic.ask({
      target: it.text,
      onTry: (t) => {
        if (cast.mode !== 'dictate') return;
        if (!t.pass) {
          write(t.said || '…?', false);
          friend.classList.add('puzzled');
        }
      },
    });
    if (!ctx.alive) return;
    friend.classList.remove('puzzled');
    if (res.ok && !res.skipped && res.tries === 1) firstTry++;
    if (cast.mode === 'dictate') write(it.text, true);
    if (stamps && res.ok && !res.skipped) stamps.append(h('span', { class: 'sa-paw', 'aria-hidden': 'true' }, '🐾'));
    friend.classList.add('happy');
    pop(card);
    sfx.correct();
    cheer(card, en ? 'en' : 'ko');
    // 새는 아이가 먼저 읽은 다음에 맞게 읽었다고 다시 읽어 준다
    if (cast.mode === 'bird' && !p.model) await talk(it.text);
    // 너구리는 확성기로 같은 말을 크게 외친다
    else if (listenOnly) {
      friend.classList.add('shout');
      await talk(it.text);
      friend.classList.remove('shout');
    }
    else await talk(shuffle(cast.yes)[0]);
    ctx.later(() => {
      n++;
      if (n >= R) ctx.finish({ firstTry, total: R });
      else round();
    }, 900);
  }

  round();
}
