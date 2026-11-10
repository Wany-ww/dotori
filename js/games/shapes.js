import { h, shuffle, pick, pickN, randInt, cheer, makeHinter, choiceSet } from '../ui.js';
import { speak } from '../audio.js';
import { objJosa, numEn } from '../data.js';

const R = 5;
const NS = 'http://www.w3.org/2000/svg';
const COLORS = ['#F2604F', '#2E95F0', '#8A5CF6', '#24A355', '#FFB21A', '#FF8A3D'];
const SHAPES = {
  circle: { kid: '동그라미', name: '원', sides: 0, en: 'circle' },
  triangle: { kid: '세모', name: '삼각형', sides: 3, en: 'triangle' },
  square: { kid: '네모', name: '사각형', sides: 4, en: 'square' },
  pentagon: { kid: '오각형', name: '오각형', sides: 5, en: 'pentagon' },
  hexagon: { kid: '육각형', name: '육각형', sides: 6, en: 'hexagon' },
  star: { kid: '별', name: '별 모양', sides: 10, en: 'star' },
};
const POOL = [
  ['circle', 'triangle', 'square'],
  ['circle', 'triangle', 'square', 'star'],
  ['circle', 'triangle', 'square', 'star', 'pentagon', 'hexagon'],
  ['circle', 'triangle', 'square', 'star', 'pentagon', 'hexagon'],
  ['circle', 'triangle', 'square', 'star', 'pentagon', 'hexagon'],
];
const POLYGONS = ['triangle', 'square', 'pentagon', 'hexagon'];

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function points(type, rot, scale) {
  const r = 40 * scale;
  if (type === 'star') {
    return Array.from({ length: 10 }, (_, i) => {
      const a = (-90 + rot + i * 36) * (Math.PI / 180);
      const rr = i % 2 ? r * 0.45 : r;
      return `${50 + rr * Math.cos(a)},${50 + rr * Math.sin(a)}`;
    }).join(' ');
  }
  const n = SHAPES[type].sides;
  const offset = type === 'square' ? 45 : -90;
  return Array.from({ length: n }, (_, i) => {
    const a = (offset + rot + (i * 360) / n) * (Math.PI / 180);
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(' ');
}

function shapeSvg(type, color, rot, scale) {
  const svg = svgEl('svg', { viewBox: '0 0 100 100', class: 'shape-svg', 'aria-hidden': 'true' });
  const style = { fill: color, stroke: 'rgba(0,0,0,.18)', 'stroke-width': 3, 'stroke-linejoin': 'round' };
  svg.append(type === 'circle'
    ? svgEl('circle', { cx: 50, cy: 50, r: 38 * scale, ...style })
    : svgEl('polygon', { points: points(type, rot, scale), ...style }));
  return svg;
}

// 영어판(ctx.lang 'en'): 도형 이름과 변의 수를 영어로 묻고 읽어 준다
export function mount(stage, ctx) {
  const L = ctx.level;
  const en = ctx.lang === 'en';
  const say = (t) => speak(t, en ? 'en-US' : 'ko-KR');
  const pool = POOL[L - 1];
  const nOpt = L >= 3 ? 4 : 3;
  const formal = L >= 3;
  const hinter = makeHinter();
  const root = h('div', { class: 'shapes' });
  stage.append(root);
  let n = 0;
  let firstTry = 0;

  function round() {
    hinter.reset();
    ctx.progress(n, R);
    // Lv4: 2번, Lv5: 3번은 '변의 개수' 같은 성질로 묻는다
    const propRounds = L >= 5 ? 3 : L === 4 ? 2 : 0;
    const byProperty = n >= R - propRounds;
    let answer;
    let options;
    let question;
    let spoken;
    if (byProperty) {
      answer = pick([...POLYGONS, 'circle']);
      options = shuffle([answer, ...pickN([...POLYGONS, 'circle'].filter((s) => s !== answer), nOpt - 1)]);
      question = answer === 'circle' ? '곧은 선(변)이 하나도 없는 도형을 찾아요!' : `변이 ${SHAPES[answer].sides}개인 도형을 찾아요!`;
      spoken = answer === 'circle' ? 'Find the shape with no straight sides!' : `Find the shape with ${numEn(SHAPES[answer].sides)} sides!`;
    } else {
      answer = pick(pool);
      options = shuffle([answer, ...pickN(pool.filter((s) => s !== answer), nOpt - 1)]);
      const nm = formal ? SHAPES[answer].name : SHAPES[answer].kid;
      question = `${nm}${objJosa(nm)} 찾아요!`;
      spoken = `Find the ${SHAPES[answer].en}!`;
    }
    const colors = shuffle(COLORS);
    const varied = L >= 3;
    root.replaceChildren(
      choiceSet(options, {
        answer,
        hinter,
        cls: 'choice shape-choice',
        label: (o) => `도형 ${options.indexOf(o) + 1}`,
        render: (o) => shapeSvg(o, colors[options.indexOf(o)], varied ? randInt(-25, 25) : 0, varied ? randInt(70, 100) / 100 : 1),
        onCorrect: (b, miss) => {
          if (miss === 0) firstTry++;
          const s = SHAPES[answer];
          b.append(h('span', { class: `choice-caption${en ? ' latin' : ''}` }, en ? s.en : formal ? s.name : s.kid));
          cheer(b, en ? 'en' : 'ko');
          if (en) say(answer === 'circle' ? 'A circle is round!' : answer === 'star' ? 'A star! Twinkle, twinkle!' : `A ${s.en} has ${numEn(s.sides)} sides.`);
          else speak(answer === 'circle' ? '원은 둥글둥글, 곧은 선이 없어요!' : answer === 'star' ? '반짝반짝 별 모양이에요!' : `${s.name}! 변이 ${s.sides}개, 꼭짓점도 ${s.sides}개예요.`);
          ctx.later(() => {
            n++;
            if (n >= R) ctx.finish({ firstTry, total: R });
            else round();
          }, 1900);
        },
      }),
    );
    ctx.prompt(en ? spoken : question, () => (en ? say(spoken) : speak(question)));
  }

  round();
}
