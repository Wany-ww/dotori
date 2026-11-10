import { h, shuffle, pickN, wiggle, pop, cheer, burst, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { EN_COLORS, MONSTER_PARTS } from '../data.js';

const R = 5;
// 단계별: 크레파스 수, 칠할 곳을 반짝여 주는지(아니면 말을 듣고 직접 찾아 누르기), 말풍선 글자를 감추는지(듣기만)
const CFG = [
  { crayons: 3, glow: true },
  { crayons: 4, glow: true },
  { crayons: 4, glow: false },
  { crayons: 5, glow: false },
  { crayons: 6, glow: false, hide: true },
];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// 스케치북 속 숲속 몬스터 (선만 있는 밑그림). data-part가 칠할 수 있는 부분
const SVG_NS = 'http://www.w3.org/2000/svg';
const MONSTER = `
<g class="cm-part" data-part="feet"><ellipse cx="112" cy="330" rx="32" ry="16"/><ellipse cx="188" cy="330" rx="32" ry="16"/></g>
<g class="cm-part" data-part="arms"><ellipse cx="60" cy="222" rx="16" ry="36" transform="rotate(38 60 222)"/><ellipse cx="240" cy="222" rx="16" ry="36" transform="rotate(-38 240 222)"/></g>
<g class="cm-part" data-part="horns"><path d="M96 124 C70 100 70 70 84 54 C92 80 106 98 124 108 Z"/><path d="M204 124 C230 100 230 70 216 54 C208 80 194 98 176 108 Z"/></g>
<path class="cm-body" d="M150 96 C226 96 250 160 248 226 C246 292 206 322 150 322 C94 322 54 292 52 226 C50 160 74 96 150 96 Z"/>
<g class="cm-part" data-part="belly"><ellipse cx="150" cy="284" rx="50" ry="30"/></g>
<g class="cm-part" data-part="hat"><path d="M98 116 C100 66 200 66 202 116 Z"/><rect x="92" y="106" width="116" height="20" rx="10"/><circle cx="150" cy="62" r="14"/></g>
<circle class="cm-white" cx="116" cy="168" r="27"/><circle class="cm-white" cx="184" cy="168" r="27"/>
<g class="cm-part" data-part="eyes"><circle cx="119" cy="170" r="15"/><circle cx="181" cy="170" r="15"/></g>
<g class="cm-ink"><circle cx="121" cy="171" r="7"/><circle cx="179" cy="171" r="7"/></g>
<g class="cm-shine"><circle cx="125" cy="165" r="3"/><circle cx="185" cy="165" r="3"/></g>
<g class="cm-part" data-part="nose"><ellipse cx="150" cy="204" rx="15" ry="10"/></g>
<g class="cm-part" data-part="mouth"><path d="M110 226 Q150 266 190 226 Q150 246 110 226 Z"/></g>
<path class="cm-white" d="M140 236 L148 236 L147 246 L141 245 Z"/>
`;

// 몬스터 색칠공부(ColoringMonster): 몬스터가 말하는 색 크레파스를 골라 몸을 칠해 준다
export function mount(stage, ctx) {
  const cfg = CFG[ctx.level - 1];
  const hinter = makeHinter();
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '30 40 240 310');
  svg.setAttribute('class', 'cm-monster');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = MONSTER;
  const partEl = Object.fromEntries([...svg.querySelectorAll('.cm-part')].map((g) => [g.dataset.part, g]));
  const bubble = h('button', { class: 'cm-bubble latin', type: 'button', 'aria-label': '몬스터의 말 다시 듣기' });
  const palette = h('div', { class: 'cm-palette' });
  const paper = h('div', { class: 'cm-paper' }, svg, bubble);
  stage.append(h('div', { class: 'coloring' }, h('div', { class: 'cm-book' }, paper), palette));

  const order = pickN(MONSTER_PARTS, R);
  const colors = pickN(EN_COLORS, R);
  let n = 0;
  let firstTry = 0;
  let replay = () => {};
  bubble.addEventListener('click', () => replay());

  function talk(text, done) {
    bubble.classList.toggle('done', Boolean(done));
    bubble.textContent = cfg.hide && !done ? '🔊' : text;
    pop(bubble);
    speak(text, 'en-US');
  }

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    const part = order[n];
    const col = colors[n];
    const target = partEl[part];
    const ask = cfg.glow ? `${cap(col.w)}!` : `${cap(col.w)} ${part}!`;
    let miss = 0;
    let chosen = null;
    let busy = false;
    Object.values(partEl).forEach((g) => g.classList.remove('glow', 'pick'));
    if (cfg.glow) target.classList.add('glow');

    const opts = shuffle([col, ...pickN(EN_COLORS.filter((c) => c !== col), cfg.crayons - 1)]);
    const crayons = opts.map((c, i) => {
      const b = h('button', {
        class: 'crayon',
        type: 'button',
        style: { '--c': c.c, animationDelay: `${i * 0.06}s` },
        'aria-label': `${c.w} 크레파스`,
      }, h('span', { class: 'crayon-tip' }), h('span', { class: 'crayon-body' }));
      b.addEventListener('click', () => pickCrayon(b, c));
      return b;
    });
    const answerBtn = crayons[opts.indexOf(col)];
    palette.replaceChildren(...crayons);

    // 칠할 곳을 직접 찾는 단계: 크레파스를 고른 뒤 몬스터의 그 부분을 누른다
    const onPart = (e) => {
      const g = e.target.closest('.cm-part');
      if (!g || busy || cfg.glow || g.classList.contains('painted-now')) return;
      if (!chosen) {
        sfx.tap();
        wiggle(palette);
        return;
      }
      if (g !== target) {
        miss++;
        wiggle(g);
        sfx.wrong();
        if (miss >= 2) target.classList.add('glow');
        return;
      }
      if (chosen !== col) {
        miss++;
        hinter.miss(answerBtn);
        return;
      }
      paint();
    };
    svg.onclick = onPart;
    svg.classList.toggle('choosing', !cfg.glow);

    function pickCrayon(b, c) {
      if (busy) return;
      speak(c.w, 'en-US');
      crayons.forEach((x) => x.classList.remove('sel'));
      if (cfg.glow) {
        if (c !== col) {
          miss++;
          wiggle(b);
          hinter.miss(answerBtn);
          return;
        }
        b.classList.add('sel');
        chosen = c;
        paint();
        return;
      }
      sfx.tap();
      b.classList.add('sel');
      chosen = c;
    }

    function paint() {
      busy = true;
      hinter.reset();
      target.classList.remove('glow');
      target.style.setProperty('--paint', col.c);
      target.classList.add('painted', 'painted-now');
      sfx.correct();
      burst(paper, ['✨', '🖍️', '⭐', '💖']);
      if (miss === 0) firstTry++;
      ctx.later(() => {
        talk(`${cap(col.w)} ${part}!`, true);
        cheer(bubble, 'en');
      }, 350);
      ctx.later(() => {
        target.classList.remove('painted-now');
        n++;
        if (n < R) {
          round();
          return;
        }
        svg.classList.add('dance');
        talk('Thank you!', true);
        ctx.later(() => ctx.finish({ firstTry, total: R }), 2600);
      }, 2300);
    }

    replay = () => talk(ask);
    ctx.prompt(
      cfg.glow ? '몬스터가 말하는 색 크레파스를 골라 반짝이는 곳을 칠해 줘요!'
        : cfg.hide ? '잘 듣고 크레파스를 고른 다음, 몬스터의 그 부분을 눌러 칠해요!'
          : '말풍선을 읽고 크레파스를 고른 다음, 몬스터의 그 부분을 눌러 칠해요!',
      replay,
    );
  }

  round();
}
