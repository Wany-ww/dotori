import { h, pick, pickN, cheer, makeHinter } from '../ui.js';
import { sfx, speak } from '../audio.js';
import { draggable, hits } from './dragTap.js';

const R = 3;
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  kids.forEach((k) => k && el.append(k));
  return el;
};
// 접은 선(x = 0)에서 시작해 접은 선으로 끝나는 자르는 선. 두 번 접으면 x = 0에서 시작해 y = 0에서 끝난다
const HALF = {
  '원': 'M0,-30 A30,30 0 0 1 0,30',
  '하트': 'M0,-16 C0,-38 36,-40 36,-14 C36,6 16,20 0,36',
  '마름모': 'M0,-38 L28,0 L0,38',
  '집': 'M0,-36 L32,-8 L22,-8 L22,30 L0,30',
  '나무': 'M0,-42 L22,-16 L12,-16 L30,10 L8,10 L8,32 L0,32',
  '별': 'M0,-38 L9,-12 L36,-12 L15,5 L23,31 L0,16',
  '리본': 'M0,-8 C8,-30 38,-34 36,-12 C35,2 20,4 9,2 L24,30 L14,27 L10,36 L0,10',
  '나비': 'M0,-20 C10,-40 40,-40 34,-12 C30,0 16,0 8,2 C22,6 30,24 16,30 C8,34 2,22 0,14',
};
const QUARTER = {
  '원': 'M0,-32 A32,32 0 0 1 32,0',
  '마름모': 'M0,-36 L30,0',
  '십자': 'M0,-36 L11,-36 L11,-11 L36,-11 L36,0',
  '꽃': 'M0,-36 C12,-36 16,-24 10,-12 C22,-18 36,-12 36,0',
};
const SAID = {
  '원': '원 모양이 나왔어요!', '하트': '하트 모양이 나왔어요!', '마름모': '마름모 모양이 나왔어요!', '집': '집 모양이 나왔어요!',
  '나무': '나무 모양이 나왔어요!', '별': '별 모양이 나왔어요!', '리본': '리본 모양이 나왔어요!', '나비': '나비 모양이 나왔어요!',
  '십자': '십자 모양이 나왔어요!', '꽃': '꽃 모양이 나왔어요!',
};
const LEVEL = { 1: ['원', '하트'], 2: ['마름모', '집', '하트'], 3: ['나무', '별', '집'], 4: ['리본', '나비', '별'], 5: Object.keys(QUARTER) };
const PAPERS = [['#2FB5A4', '#2E89C6'], ['#9320C0', '#4F3CC0'], ['#F06292', '#C2457A'], ['#F5A623', '#D9781A']];

// 종이 접어 자르기(Origami): 점선을 눌러 종이를 접고, 자를 모양을 종이에 끌어 놓은 뒤
// 가위를 점선을 따라 끌어 오리면, 종이를 펼쳐 접은 선을 따라 대칭인 모양을 본다 (참고 영상 기준)
export function mount(stage, ctx) {
  const L = ctx.level;
  const twice = L === 5;
  const hinter = makeHinter();
  const svg = sv('svg', { viewBox: '0 0 200 200', class: 'pc-board', role: 'img', 'aria-label': '종이' });
  const side = h('div', { class: 'pc-side' });
  const say = h('p', { class: 'pc-say', 'aria-live': 'polite' });
  stage.append(h('div', { class: 'paper-cut' }, h('div', { class: 'pc-desk' }, svg, side), say));
  const names = pickN(LEVEL[L], R);
  let r = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(r, R);
    const name = names[r % names.length];
    const d = (twice ? QUARTER : HALF)[name];
    const [front, back] = pick(PAPERS);
    const id = `pc${Date.now()}`;
    let step = 'fold';
    let folds = 0;
    let missed = false;
    svg.replaceChildren();
    side.replaceChildren();
    // 종이: 왼쪽 반(접힘) · 오른쪽 위 · 오른쪽 아래(두 번 접을 때 접힘)
    const g = sv('g', { transform: 'translate(100 100)' });
    const left = sv('rect', { x: -60, y: -60, width: 60, height: 120, fill: front, class: 'pc-flap h' });
    const rightTop = sv('rect', { x: 0, y: -60, width: 60, height: 120, fill: front });
    const rightBot = twice ? sv('rect', { x: 0, y: 0, width: 60, height: 60, fill: front, class: 'pc-flap v' }) : null;
    const lineV = sv('line', { x1: 0, y1: -64, x2: 0, y2: 64, class: 'pc-line' });
    const lineH = sv('line', { x1: 0, y1: 0, x2: 64, y2: 0, class: 'pc-line off' });
    const hit = sv('rect', { x: -60, y: -60, width: 120, height: 120, fill: 'transparent', class: 'pc-hit' });
    g.append(left, rightTop, ...(rightBot ? [rightBot] : []), lineV, lineH, hit);
    svg.append(g);
    say.textContent = '점선을 눌러 종이를 반으로 접어요.';
    speak('점선을 눌러 종이를 접어요.');

    hit.addEventListener('click', () => {
      if (step !== 'fold') return;
      sfx.pop();
      folds++;
      if (folds === 1) {
        left.classList.add('folded');
        ctx.later(() => { left.remove(); rightTop.setAttribute('fill', back); rightBot?.setAttribute('fill', back); }, 350);
        hit.setAttribute('x', 0);
        hit.setAttribute('width', 60);
        if (twice) {
          lineV.classList.add('off');
          lineH.classList.remove('off');
          say.textContent = '한 번 더! 점선을 눌러 위로 접어요.';
          speak('한 번 더 접어요.');
          return;
        }
      } else {
        rightTop.setAttribute('height', 60);
        rightBot.classList.add('folded');
        ctx.later(() => rightBot.remove(), 350);
        hit.setAttribute('height', 60);
      }
      lineV.classList.add('off');
      lineH.classList.add('off');
      step = 'place';
      ctx.later(showTemplate, 600);
    });

    // 오른쪽에 자를 모양 틀이 나오면 종이 위로 끌어 놓는다
    function showTemplate() {
      const tpl = h('button', { class: 'pc-tpl', type: 'button', 'aria-label': '자를 모양' },
        (() => { const s = sv('svg', { viewBox: twice ? '-6 -42 48 48' : '-6 -44 48 88' }, sv('path', { d, class: 'pc-tpl-line' })); return s; })());
      side.replaceChildren(tpl);
      const place = () => {
        if (step !== 'place') return;
        step = 'cut';
        tpl.remove();
        hit.classList.remove('target');
        startCut();
      };
      draggable(tpl, {
        onMove: (pt) => hit.classList.toggle('target', hits(svg, pt, 0)),
        onDrop: (pt) => { if (hits(svg, pt, 0)) place(); else { hit.classList.remove('target'); hinter.miss(tpl); } },
      });
      tpl.addEventListener('click', place);
      say.textContent = '자를 모양을 종이 위로 끌어 놓아요.';
      speak('모양을 종이 위로 옮겨요.');
    }

    // 가위를 점선 따라 끌면 잘린 만큼 실선이 된다
    function startCut() {
      const path = sv('path', { d, class: 'pc-cut' });
      const done = sv('path', { d, class: 'pc-done', pathLength: 100, 'stroke-dasharray': '0 100' });
      const scissors = sv('text', { class: 'pc-sc', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
      scissors.textContent = '✂️';
      g.append(path, done, scissors);
      const total = path.getTotalLength();
      const pts = Array.from({ length: 81 }, (_, i) => path.getPointAtLength((total * i) / 80));
      let at = 0;
      let cutting = false;
      const show = () => {
        scissors.setAttribute('x', pts[at].x);
        scissors.setAttribute('y', pts[at].y);
        done.setAttribute('stroke-dasharray', `${(at / 80) * 100} 100`);
      };
      show();
      const local = (e) => {
        const m = g.getScreenCTM();
        if (!m) return null;
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        return p;
      };
      const near = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
      svg.onpointerdown = (e) => {
        const p = local(e);
        if (step !== 'cut' || !p) return;
        if (near(p, pts[at]) > 22) { missed = true; hinter.miss(); speak('가위를 잡고 점선을 따라 움직여요.'); return; }
        cutting = true;
        try { svg.setPointerCapture(e.pointerId); } catch {}
      };
      svg.onpointermove = (e) => {
        if (!cutting) return;
        const p = local(e);
        if (!p) return;
        // 지금 자리에서 조금 앞까지만 찾아서, 점선을 건너뛰지 않게 한다
        let best = at;
        for (let i = at; i <= Math.min(80, at + 10); i++) if (near(p, pts[i]) < 16 && i > best) best = i;
        if (best === at) return;
        at = best;
        if (at % 6 === 0) sfx.tap();
        show();
        if (at >= 79) { cutting = false; at = 80; show(); unfold(); }
      };
      svg.onpointerup = () => { cutting = false; };
      svg.onpointercancel = svg.onpointerup;
      say.textContent = '가위를 점선을 따라 끌어 오려요.';
      speak('가위로 점선을 따라 오려요.');
    }

    // 잘린 조각이 떨어지고 종이를 펼친다
    function unfold() {
      step = 'open';
      svg.onpointerdown = svg.onpointermove = svg.onpointerup = svg.onpointercancel = null;
      sfx.pop();
      const piece = sv('path', { d: `${d} ${twice ? 'L0,0 ' : ''}Z`, fill: back, class: 'pc-piece' });
      g.append(piece);
      ctx.later(() => piece.classList.add('fall'), 50);
      ctx.later(() => {
        const mirrors = twice ? ['', 'scale(-1 1)', 'scale(1 -1)', 'scale(-1 -1)'] : ['', 'scale(-1 1)'];
        const mask = sv('mask', { id }, sv('rect', { x: -70, y: -70, width: 140, height: 140, fill: '#fff' }),
          ...mirrors.map((t) => sv('path', { d: `${d} ${twice ? 'L0,0 ' : ''}Z`, transform: t, fill: '#000' })));
        g.replaceChildren(sv('defs', {}, mask), sv('rect', { x: -60, y: -60, width: 120, height: 120, fill: front, mask: `url(#${id})`, class: 'pc-open' }));
        sfx.correct();
        cheer(svg);
        if (!missed) firstTry++;
        hinter.reset();
        say.textContent = `펼쳤더니 ${name} 모양이 나왔어요!`;
        speak(['펼쳤더니', SAID[name]]);
        ctx.later(() => { r++; if (r >= R) ctx.finish({ firstTry, total: R }); else round(); }, 2400);
      }, 900);
    }
  }

  ctx.prompt('종이를 접고, 모양을 올려 가위로 점선을 따라 오린 다음 펼쳐 봐요. 어떤 모양이 나올까요?', () => speak('종이를 접어서 오려 봐요!'));
  round();
}
