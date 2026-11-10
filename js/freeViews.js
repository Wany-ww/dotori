// 자유 활동 화면: 활동 고르기 · 활동하기(앨범에 저장) · 앨범 · 작품 다시보기.
// 학습 과목 · 일일 수업과 따로 있고, 도토리 · 스티커 같은 보상은 없다
import { h, pop, burst } from './ui.js';
import { sfx, speak } from './audio.js';
import { store } from './store.js';
import { FREE_ACTS } from './data.js';
import { album } from './album.js';
import { replayOn } from './free/drawKit.js';
import { COLOR_PICS, picSvg } from './free/coloring.js';
import * as painting from './free/painting.js';
import * as coloring from './free/coloring.js';
import * as writing from './free/writing.js';
import * as letterColor from './free/letterColor.js';
import * as card from './free/card.js';

const MODULES = { painting, coloring, writing, letterColor, card };
const go = (hash) => { location.hash = hash; };
const dateText = (t) => new Date(t).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
const back = (href, label) => h('a', { class: 'icon-btn', href, 'aria-label': label }, '←');

export function viewFree() {
  const p = store.profile;
  const count = h('span', { class: 'fv-count' });
  album.list(p.id).then((ws) => { count.textContent = ws.length ? `${ws.length}점` : ''; }).catch(() => {});
  return h('main', { class: 'page free-hub' },
    h('div', { class: 'subject-head' },
      back('#/', '처음 화면으로'),
      h('div', {}, h('h1', { class: 'brand-title' }, '🎨 자유 활동'),
        h('p', { class: 'muted' }, '정답도 점수도 없어요. 마음껏 그리고 쓰고, 마음에 들면 앨범에 저장해요.'))),
    h('a', { class: 'fv-album-link', href: '#/album' }, h('span', { 'aria-hidden': 'true' }, '🖼️'), h('b', {}, `${p.name}의 앨범`), count, h('span', { 'aria-hidden': 'true' }, '›')),
    h('section', { class: 'game-grid fv-grid' }, Object.entries(FREE_ACTS).map(([id, a]) => h('a', { class: 'game-card fv-card', href: `#/free/${id}`, title: a.uKey },
      h('span', { class: 'gi', 'aria-hidden': 'true' }, a.icon),
      h('span', { class: 'gt' }, a.title),
      h('span', { class: 'gd' }, a.desc)))));
}

export function viewFreeAct(id) {
  const a = FREE_ACTS[id];
  const p = store.profile;
  const stage = h('div', { class: 'stage free-stage' });
  const promptText = h('p', { class: 'prompt-text', 'aria-live': 'polite' });
  const saveBtn = h('button', { class: 'btn fv-save', type: 'button' }, '💾 앨범에 저장');
  let replay = () => {};
  let saver = null;
  let saving = false;
  const timers = new Set();
  const cleanups = [];
  let alive = true;
  const root = h('div', { class: 'player free-player', 'data-scene': 'craft' },
    h('header', { class: 'player-bar' },
      h('a', { class: 'icon-btn', href: '#/free', 'aria-label': '자유 활동 목록으로' }, '✕'),
      h('div', { class: 'player-title' }, h('span', { class: 'player-icon', 'aria-hidden': 'true' }, a.icon), h('span', {}, a.title), h('span', { class: 'chip' }, '자유 활동')),
      saveBtn),
    h('div', { class: 'prompt-row' },
      h('button', { class: 'speaker-btn', 'aria-label': '다시 듣기', onclick: () => { sfx.tap(); replay(); } }, '🔊'),
      promptText),
    stage);
  const fx = {
    opts: a.opts || {},
    profile: p,
    prompt(text, say) {
      promptText.textContent = text;
      replay = typeof say === 'function' ? say : () => speak(say || text);
      fx.later(() => replay(), 300);
    },
    later(fn, ms) { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); return t; },
    onCleanup(fn) { cleanups.push(fn); },
    onSave(fn) { saver = fn; },
  };
  saveBtn.addEventListener('click', async () => {
    if (saving || !saver) return;
    saving = true;
    try {
      const work = await saver();
      if (!work) { speak('먼저 그리거나 써 봐요!'); pop(saveBtn); return; }
      if (!(work.image instanceof Blob)) throw new Error('no-image');
      await album.save({ profileId: p.id, act: id, title: work.title, image: work.image, replay: work.replay });
      sfx.correct();
      burst(saveBtn, ['🖼️', '✨', '⭐']);
      speak('앨범에 저장했어요!');
      saveBtn.textContent = '✅ 저장했어요';
      fx.later(() => { saveBtn.textContent = '💾 앨범에 저장'; }, 1800);
    } catch {
      speak('저장하지 못했어요. 다시 해 볼까요?');
    } finally {
      saving = false;
    }
  });
  root.teardown = () => {
    alive = false;
    timers.forEach(clearTimeout);
    cleanups.forEach((f) => { try { f(); } catch {} });
  };
  root.mount = () => MODULES[a.module].mount(stage, fx);
  return root;
}

export function viewAlbum() {
  const p = store.profile;
  const grid = h('div', { class: 'al-grid' }, h('p', { class: 'muted' }, '앨범을 여는 중…'));
  const urls = [];
  album.list(p.id).then((works) => {
    if (!works.length) {
      grid.replaceChildren(h('div', { class: 'al-empty' }, h('span', { 'aria-hidden': 'true' }, '🖼️'), h('p', {}, '아직 저장한 작품이 없어요.'), h('a', { class: 'btn', href: '#/free' }, '🎨 자유 활동 하러 가기')));
      return;
    }
    grid.replaceChildren(...works.filter((w) => w.image instanceof Blob).map((w) => {
      const url = URL.createObjectURL(w.image);
      urls.push(url);
      const a = FREE_ACTS[w.act];
      return h('a', { class: 'al-item', href: `#/album/${w.id}` },
        h('img', { src: url, alt: w.title, loading: 'lazy' }),
        h('span', { class: 'al-meta' }, h('b', {}, `${a?.icon || ''} ${w.title}`), h('small', {}, dateText(w.createdAt))));
    }));
  }).catch((e) => { console.error(e); grid.replaceChildren(h('p', { class: 'muted' }, '이 브라우저에서는 앨범을 열 수 없어요.')); });
  const el = h('main', { class: 'page album' },
    h('div', { class: 'subject-head' },
      back('#/free', '자유 활동으로'),
      h('div', {}, h('h1', { class: 'brand-title' }, `🖼️ ${p.name}의 앨범`),
        h('p', { class: 'muted' }, '자유 활동에서 저장한 작품이 모여 있어요. 누르면 크게 보고, 그리는 모습을 다시 볼 수 있어요.'))),
    grid);
  el.teardown = () => urls.forEach((u) => URL.revokeObjectURL(u));
  return el;
}

export function viewWork(id) {
  const box = h('div', { class: 'wk-box' }, h('p', { class: 'muted' }, '여는 중…'));
  const urls = [];
  let stop = () => {};
  const el = h('main', { class: 'page work' },
    h('div', { class: 'subject-head' }, back('#/album', '앨범으로'), h('div', {}, h('h1', { class: 'brand-title wk-title' }, '작품'))),
    box);
  album.get(id).then(async (w) => {
    if (!w || w.profileId !== store.profile.id) { box.replaceChildren(h('p', { class: 'muted' }, '작품을 찾을 수 없어요.')); return; }
    const a = FREE_ACTS[w.act];
    el.querySelector('.wk-title').textContent = `${a?.icon || ''} ${w.title}`;
    const url = URL.createObjectURL(w.image);
    urls.push(url);
    const img = h('img', { class: 'wk-img', src: url, alt: w.title });
    const view = h('div', { class: 'wk-view' }, img);
    const replayBtn = h('button', { class: 'btn', type: 'button' }, '▶ 다시 그리기 보기');
    const del = h('button', { class: 'btn btn-ghost', type: 'button' }, '🗑️ 지우기');
    del.addEventListener('click', async () => {
      if (!confirm('이 작품을 앨범에서 지울까요? 지우면 다시 볼 수 없어요.')) return;
      await album.remove(w.id);
      go('#/album');
    });
    replayBtn.addEventListener('click', () => { stop(); stop = playReplay(w, view, img, urls) || (() => {}); });
    box.replaceChildren(view, h('p', { class: 'muted wk-meta' }, `${a?.title || ''} · ${dateText(w.createdAt)}`), h('div', { class: 'wk-actions' }, w.replay ? replayBtn : null, del));
  });
  el.teardown = () => { stop(); urls.forEach((u) => URL.revokeObjectURL(u)); };
  return el;
}

// 다시보기: 획 기록이면 배경 위에 천천히 다시 그리고, 색칠하기면 칠한 차례대로 다시 칠한다
function playReplay(w, view, img, urls) {
  const r = w.replay;
  if (r.kind === 'fills') {
    const pic = COLOR_PICS.find((p) => p.id === r.pic);
    if (!pic) return null;
    const svg = picSvg(pic, {});
    view.replaceChildren(svg);
    let i = 0;
    const t = setInterval(() => {
      if (i >= r.fills.length) { clearInterval(t); return; }
      const [k, c] = r.fills[i++];
      svg.querySelector(`[data-i="${k}"]`)?.setAttribute('fill', c);
    }, 350);
    return () => clearInterval(t);
  }
  const W = img.naturalWidth || 800;
  const H = img.naturalHeight || Math.round(W * (r.ratio || 0.75));
  const bgC = h('canvas', { class: 'wk-layer', width: W, height: H });
  const inkC = h('canvas', { class: 'wk-layer', width: W, height: H });
  const wrap = h('div', { class: 'wk-stack', style: { aspectRatio: `${W} / ${H}` } }, bgC, inkC);
  view.replaceChildren(wrap);
  const load = (blob) => new Promise((res) => {
    if (!blob) return res(null);
    const u = URL.createObjectURL(blob);
    urls.push(u);
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = u;
  });
  let cancel = () => {};
  Promise.all([load(r.bg), load(r.mask)]).then(([bgImg, maskImg]) => {
    const g = bgC.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, W, H);
    if (bgImg) g.drawImage(bgImg, 0, 0, W, H);
    cancel = replayOn(inkC, r, { mask: maskImg });
  });
  return () => cancel();
}
