import { h, shuffle, randInt, pickN, cheer, makeHinter, choiceSet } from '../ui.js';
import { speak } from '../audio.js';

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const R = 5;

// Lv1: 대문자, 가운데 빈칸 / Lv2: 대문자 / Lv3: 대·소문자 섞기 / Lv4: 소문자, 보기 4개 / Lv5: 소문자, 빈칸 2개
export function mount(stage, ctx) {
  const L = ctx.level;
  const nOpt = L >= 4 ? 4 : 3;
  const hinter = makeHinter();
  const root = h('div', { class: 'missing' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    // 영어 차시: 오늘 배우는 글자가 빈칸이 되도록 순서 조각을 고른다. 알파벳 단계는 대 · 소문자를 번갈아
    const unit = ctx.unit;
    const lower = unit?.track === 'alpha' ? n % 2 === 1 : L >= 4 || (L === 3 && n % 2 === 1);
    const len = L >= 5 ? 6 : 5;
    const target = unit ? ABC.indexOf(unit.letters(1, { review: n >= 3 })[0]) : -1;
    const start = target >= 0 ? Math.max(0, Math.min(ABC.length - len, target - randInt(1, len - 2))) : randInt(0, ABC.length - len);
    const upper = ABC.slice(start, start + len).split('');
    const seq = lower ? upper.map((c) => c.toLowerCase()) : upper;
    const blanks = target >= 0 && L < 5 ? [target - start]
      : L >= 5
        ? pickN([1, 2, 3, 4, 5], 2).sort((a, b) => a - b)
        : [L === 1 ? randInt(1, 3) : randInt(1, len - 1)];
    const tiles = seq.map((c, i) => h('span', { class: `abc${blanks.includes(i) ? ' blank' : ''}` }, blanks.includes(i) ? '?' : c));
    const choiceWrap = h('div', {});
    let roundMiss = 0;
    let bi = 0;

    const say = () => speak(upper.map((c, i) => (blanks.includes(i) && !tiles[i].classList.contains('filled') ? 'hmm?' : c)).join(', '), 'en-US', { rate: 0.75 });

    function askBlank() {
      hinter.reset();
      const idx = blanks[bi];
      const answer = seq[idx];
      tiles.forEach((t, i) => t.classList.toggle('now', i === idx));
      const pool = ABC.split('').filter((c) => !upper.includes(c));
      const near = pool.filter((c) => Math.abs(ABC.indexOf(c) - (start + idx)) <= 5);
      const distract = pickN(near.length >= nOpt - 1 ? near : pool, nOpt - 1).map((c) => (lower ? c.toLowerCase() : c));
      choiceWrap.replaceChildren(choiceSet(shuffle([answer, ...distract]), {
        answer,
        hinter,
        cls: 'choice latin',
        onCorrect: (b, miss) => {
          roundMiss += miss;
          tiles[idx].textContent = answer;
          tiles[idx].classList.remove('blank', 'now');
          tiles[idx].classList.add('filled');
          cheer(tiles[idx], 'en');
          bi++;
          if (bi < blanks.length) {
            speak(answer, 'en-US');
            ctx.later(askBlank, 700);
            return;
          }
          if (roundMiss === 0) firstTry++;
          speak(upper.join(', '), 'en-US', { rate: 0.75 });
          ctx.later(() => {
            n++;
            if (n >= R) ctx.finish({ firstTry, total: R });
            else round();
          }, 2400);
        },
      }));
    }

    root.replaceChildren(h('div', { class: 'abc-row', 'aria-label': '알파벳 순서' }, tiles), choiceWrap);
    askBlank();
    ctx.prompt(
      blanks.length > 1 ? '빠진 알파벳이 2개예요! 왼쪽 빈칸부터 차례로 채워요.' : lower ? '소문자 순서예요! 빠진 알파벳은 무엇일까요?' : '빠진 알파벳은 무엇일까요?',
      say,
    );
  }

  round();
}
