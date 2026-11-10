// 보호자 계정 화면(로그인 · 가입)과 관리자 화면(이용자 정보 열람).
import { h, charFace } from './ui.js';
import { store } from './store.js';
import { sync } from './sync.js';
import { sfx } from './audio.js';
import { GAMES, FREE_ACTS } from './data.js';
import { HANGUL_STEPS } from './curriculum.js';
import { EN_UNITS } from './enCurriculum.js';
import { MATH_UNITS } from './mathCurriculum.js';
import { CHALLENGES } from './challengeMap.js';
import { viewReport } from './report.js';

const go = (hash) => { location.hash = hash; };
const fmt = (ts, withTime = true) => {
  if (!ts) return '-';
  const d = new Date(ts);
  const day = d.toLocaleDateString('sv');
  return withTime ? `${day} ${d.toTimeString().slice(0, 5)}` : day;
};
// 기기 이름: 브라우저가 알려 준 정보에서 짧게
export function deviceOf(ua = '') {
  const os = /iPad/.test(ua) ? 'iPad' : /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : '';
  const br = /Edg\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? '삼성 인터넷' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
  return [os, br].filter(Boolean).join(' · ') || (ua ? ua.slice(0, 30) : '-');
}

/* ---------- 로그인 · 가입 ---------- */
function form(fields, submitText, onSubmit) {
  const error = h('p', { class: 'acc-error', role: 'alert' });
  const btn = h('button', { class: 'btn', type: 'submit' }, submitText);
  const el = h('form', { class: 'acc-form', novalidate: true }, fields, error, btn);
  el.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.textContent = '';
    btn.disabled = true;
    try { await onSubmit(new FormData(el)); } catch (err) { error.textContent = err.message || '잠시 뒤에 다시 해 주세요.'; sfx.wrong(); }
    btn.disabled = false;
  });
  return el;
}
const field = (label, input, hint) => h('label', { class: 'acc-field' }, h('span', {}, label), input, hint ? h('small', {}, hint) : null);

async function enter(state) {
  store.replaceState(state);
  sync.log('open', {});
  sfx.pop();
  go(sync.admin && !store.state.profiles.length ? '#/admin' : '#/login');
}

export function viewAccount() {
  const id = h('input', { class: 'text-input', name: 'username', autocomplete: 'username', autocapitalize: 'off', spellcheck: 'false', required: true });
  const pw = h('input', { class: 'text-input', name: 'password', type: 'password', autocomplete: 'current-password', required: true });
  return h('main', { class: 'page narrow' },
    h('section', { class: 'login-hero' },
      h('div', { class: 'mascot', 'aria-hidden': 'true' }, charFace('tori-wave', '🐿️')),
      h('h1', {}, '도토리숲 로그인'),
      h('p', { class: 'muted' }, '보호자 계정으로 로그인하면, 아이들의 학습 기록과 작품이 계정에 차곡차곡 쌓여요.')),
    h('section', { class: 'panel acc-panel' },
      form([field('아이디', id), field('비밀번호', pw)], '로그인', async (fd) => {
        const state = await sync.login(String(fd.get('username')).trim().toLowerCase(), String(fd.get('password')));
        await enter(state);
      }),
      h('p', { class: 'acc-switch' }, '처음 왔나요? ', h('a', { href: '#/signup' }, '보호자 계정 만들기'))),
    h('p', { class: 'privacy-note' }, '🔒 비밀번호는 알아볼 수 없게 바꿔서 저장해요. 학습 기록은 이 서비스의 서버에 저장돼요.'));
}

export function viewSignup() {
  const name = h('input', { class: 'text-input', name: 'name', maxlength: 20, autocomplete: 'name', required: true, placeholder: '예) 하늘이 엄마' });
  const id = h('input', { class: 'text-input', name: 'username', maxlength: 20, autocomplete: 'username', autocapitalize: 'off', spellcheck: 'false', required: true, placeholder: '영어 소문자 · 숫자 · _' });
  const pw = h('input', { class: 'text-input', name: 'password', type: 'password', autocomplete: 'new-password', required: true });
  const pw2 = h('input', { class: 'text-input', name: 'password2', type: 'password', autocomplete: 'new-password', required: true });
  const agree = h('input', { type: 'checkbox', name: 'agree', value: '1' });
  return h('main', { class: 'page narrow' },
    h('section', { class: 'login-hero' },
      h('h1', {}, '보호자 계정 만들기'),
      h('p', { class: 'muted' }, '계정 하나에 아이를 여러 명 등록할 수 있어요.')),
    h('section', { class: 'panel acc-panel' },
      form([
        field('보호자 이름', name),
        field('아이디', id, '영어 소문자 · 숫자 · _ 로 3~20자'),
        field('비밀번호', pw, '8자 이상'),
        field('비밀번호 확인', pw2),
        h('label', { class: 'acc-agree' }, agree,
          h('span', {}, '아이의 학습 기록(배운 차시 · 놀이 결과 · 작품)과 접속 기록(시각 · 기기 · IP)을 서비스 운영을 위해 저장하는 데 동의해요. 관리자가 이 기록을 볼 수 있어요.')),
      ], '가입하고 시작하기', async (fd) => {
        if (fd.get('password') !== fd.get('password2')) throw new Error('비밀번호 확인이 달라요.');
        await sync.signup({ name: String(fd.get('name')).trim(), username: String(fd.get('username')).trim().toLowerCase(), password: String(fd.get('password')), agree: fd.get('agree') === '1' });
        await enter(null);
      }),
      h('p', { class: 'acc-switch' }, '이미 계정이 있나요? ', h('a', { href: '#/account' }, '로그인'))));
}

// 아이 고르기 화면 위의 계정 줄: 보호자 이름 · (관리자) · 로그아웃, 이 기기에 남은 예전 기록 가져오기
export function accountBar() {
  if (!sync.user) return null;
  const device = store.deviceState();
  const canImport = !store.state.profiles.length && device.profiles.length;
  return h('section', { class: 'acc-bar' },
    h('span', {}, '👤 ', h('b', {}, sync.user.name), ` (${sync.user.username})`, sync.admin ? h('em', { class: 'acc-role' }, '관리자') : null),
    sync.admin ? h('a', { class: 'btn btn-ghost small', href: '#/admin' }, '🛠️ 관리자 화면') : null,
    h('button', { class: 'btn btn-ghost small', type: 'button', onclick: async () => { await sync.logout(); store.replaceState(null); go('#/account'); } }, '로그아웃'),
    canImport
      ? h('div', { class: 'acc-import' },
        h('span', {}, `이 기기에 계정 없이 쓰던 아이 기록이 ${device.profiles.length}명 있어요.`),
        h('button', { class: 'btn small', type: 'button', onclick: () => {
          store.replaceState(device);
          store.state.currentId = null;
          store.save();
          device.profiles.forEach((p) => sync.log('kid-add', { kid: p.id, name: p.name, age: p.age, imported: true }));
          location.reload();
        } }, '이 계정으로 가져오기'))
      : null);
}

/* ---------- 관리자: 이용자 목록 ---------- */
export function viewAdmin() {
  const body = h('div', { class: 'adm-body' }, h('p', { class: 'muted' }, '불러오는 중…'));
  const q = h('input', { class: 'text-input', type: 'search', placeholder: '아이디 · 보호자 · 아이 이름으로 찾기' });
  const view = h('main', { class: 'page adm' },
    h('div', { class: 'subject-head' },
      h('a', { class: 'icon-btn', href: '#/login', 'aria-label': '돌아가기' }, '←'),
      h('div', {}, h('h1', {}, '🛠️ 관리자 화면'), h('p', { class: 'muted' }, '이용자 계정과 아이별 학습 기록 · 접속 기록 · 산출물을 볼 수 있어요 (읽기 전용).'))),
    q, body);
  let users = [];
  const render = () => {
    const s = q.value.trim().toLowerCase();
    const list = users.filter((u) => !s || [u.username, u.name, ...u.kids.map((k) => k.name)].some((t) => String(t).toLowerCase().includes(s)));
    const today = new Date().toLocaleDateString('sv');
    const kids = users.reduce((a, u) => a + u.kids.length, 0);
    const activeToday = users.filter((u) => u.lastActiveAt && new Date(u.lastActiveAt).toLocaleDateString('sv') === today).length;
    body.replaceChildren(...[
      h('div', { class: 'adm-stats' },
        stat('보호자 계정', users.filter((u) => u.role !== 'admin').length), stat('등록한 아이', kids), stat('오늘 접속한 계정', activeToday),
        stat('누적 놀이', users.reduce((a, u) => a + u.plays, 0)), stat('누적 산출물', users.reduce((a, u) => a + u.works, 0))),
      h('div', { class: 'adm-table-wrap' }, h('table', { class: 'adm-table' },
        h('thead', {}, h('tr', {}, ['아이디', '보호자', '아이', '가입일', '마지막 활동', '접속', '공부한 날', '놀이', '수업 완료', '산출물'].map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', {}, list.map((u) => h('tr', { class: 'adm-row', tabindex: 0, onclick: () => go(`#/admin/u/${u.id}`), onkeydown: (e) => { if (e.key === 'Enter') go(`#/admin/u/${u.id}`); } },
          h('td', {}, h('a', { href: `#/admin/u/${u.id}` }, u.username), u.role === 'admin' ? h('em', { class: 'acc-role' }, '관리자') : null),
          h('td', {}, u.name),
          h('td', {}, u.kids.length ? u.kids.map((k) => `${k.avatar} ${k.name}(${k.age})`).join(', ') : '-'),
          h('td', {}, fmt(u.createdAt, false)),
          h('td', {}, fmt(u.lastActiveAt)),
          h('td', { class: 'num' }, u.visits), h('td', { class: 'num' }, u.days), h('td', { class: 'num' }, u.plays),
          h('td', { class: 'num' }, u.courses), h('td', { class: 'num' }, u.works)))))),
      list.length ? null : h('p', { class: 'muted' }, '찾는 이용자가 없어요.')].filter(Boolean));
  };
  q.addEventListener('input', render);
  view.mount = () => sync.adminApi.users().then((u) => { users = u.sort((a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0)); render(); })
    .catch((e) => body.replaceChildren(h('p', { class: 'acc-error' }, `불러오지 못했어요: ${e.message}`)));
  return view;
}
const stat = (label, n) => h('div', { class: 'adm-stat' }, h('b', {}, n), h('span', {}, label));

/* ---------- 관리자: 이용자 한 명 ---------- */
const EVENT_NAME = {
  login: '로그인', logout: '로그아웃', 'login-fail': '로그인 실패', signup: '가입', open: '앱 열기',
  view: '화면', select: '아이 고르기', play: '놀이', course: '오늘의 할 일 완료', check: '확인 퀴즈', challenge: '챌린지 단계',
  work: '작품 저장', 'kid-add': '아이 등록', 'kid-remove': '아이 삭제', level: '난이도 바꿈', unit: '차시 바꿈',
};
const ACCESS = new Set(['login', 'logout', 'login-fail', 'signup', 'open']);
const SUBJECT_KO = { hangul: '한글', math: '수학', english: '영어' };

function describe(e, kidName) {
  const kid = e.kid ? `${kidName(e.kid)} · ` : '';
  switch (e.type) {
    case 'play': return `${kid}${e.title || GAMES[e.game]?.title || e.game} — 별 ${e.stars}개 (${e.score}/${e.total})${e.course ? ' · 오늘의 할 일' : ''}${e.unit ? ` · ${e.unit}` : ''}`;
    case 'course': return `${kid}${SUBJECT_KO[e.subject] || e.subject} ${e.unit || ''}`;
    case 'check': return `${kid}${e.score}/${e.total} ${e.pass ? '통과' : `· ${e.review}차시 복습`}`;
    case 'challenge': return `${kid}${CHALLENGES[e.kind]?.name || e.kind} ${e.stage}단계 ${e.score}/${e.total} ${e.pass ? '통과' : ''}`;
    case 'work': return `${kid}${FREE_ACTS[e.act]?.title || e.act} "${e.title || ''}"`;
    case 'view': return `${kid}${e.path}`;
    case 'select': case 'kid-add': case 'kid-remove': return `${e.name || ''}${e.age ? ` (${e.age}살)` : ''}${e.imported ? ' · 기기에서 가져옴' : ''}`;
    case 'unit': case 'level': return `${kid}${SUBJECT_KO[e.subject] || ''} ${e.unit || `Lv.${e.level}`}`;
    default: return [e.ip, deviceOf(e.ua)].filter((x) => x && x !== '-').join(' · ');
  }
}

export function viewAdminUser(uid) {
  const body = h('div', { class: 'adm-body' }, h('p', { class: 'muted' }, '불러오는 중…'));
  const view = h('main', { class: 'page adm' },
    h('div', { class: 'subject-head' },
      h('a', { class: 'icon-btn', href: '#/admin', 'aria-label': '이용자 목록으로' }, '←'),
      h('div', {}, h('h1', {}, '이용자 정보'))),
    body);
  view.mount = () => sync.adminApi.user(uid).then((d) => body.replaceChildren(...detail(d)))
    .catch((e) => body.replaceChildren(h('p', { class: 'acc-error' }, `불러오지 못했어요: ${e.message}`)));
  return view;
}

function detail({ user, summary, state, events, works }) {
  const kids = state?.profiles || [];
  const kidName = (id) => kids.find((k) => k.id === id)?.name || summary.kids.find((k) => k.id === id)?.name || '(삭제된 아이)';
  const access = events.filter((e) => ACCESS.has(e.type));
  const usage = events.filter((e) => !ACCESS.has(e.type));
  const kindSel = h('select', { class: 'text-input small' },
    h('option', { value: '' }, '모든 기록'), h('option', { value: 'noview' }, '화면 이동 빼고'),
    ...['play', 'course', 'check', 'challenge', 'work', 'view', 'select'].map((t) => h('option', { value: t }, EVENT_NAME[t])));
  const kidSel = h('select', { class: 'text-input small' }, h('option', { value: '' }, '모든 아이'), ...kids.map((k) => h('option', { value: k.id }, k.name)));
  const usageBody = h('tbody');
  const drawUsage = () => {
    const t = kindSel.value;
    const rows = usage.filter((e) => (!t || (t === 'noview' ? e.type !== 'view' : e.type === t)) && (!kidSel.value || e.kid === kidSel.value)).slice(0, 300);
    usageBody.replaceChildren(...rows.map((e) => h('tr', {}, h('td', {}, fmt(e.at || e.ts)), h('td', {}, EVENT_NAME[e.type] || e.type), h('td', {}, describe(e, kidName)))));
  };
  kindSel.value = 'noview';
  kindSel.addEventListener('change', drawUsage);
  kidSel.addEventListener('change', drawUsage);
  drawUsage();

  return [
    h('section', { class: 'panel adm-account' },
      h('h2', {}, `${user.name} `, h('small', {}, `(${user.username})`), user.role === 'admin' ? h('em', { class: 'acc-role' }, '관리자') : null),
      h('div', { class: 'adm-stats' },
        stat('가입일', fmt(user.createdAt, false)), stat('마지막 로그인', fmt(user.lastLoginAt)), stat('접속', summary.visits),
        stat('공부한 날', summary.days), stat('놀이', summary.plays), stat('산출물', summary.works))),
    h('section', { class: 'panel' },
      h('h2', {}, `👧 아이별 학습 현황 (${kids.length}명)`),
      kids.length ? h('div', { class: 'adm-kids' }, kids.map((k) => kidCard(k, user.id))) : h('p', { class: 'muted' }, '등록한 아이가 없어요.')),
    h('section', { class: 'panel' },
      h('div', { class: 'panel-head' }, h('h2', {}, '📋 이용 기록'), h('div', { class: 'adm-filters' }, kidSel, kindSel)),
      h('div', { class: 'adm-table-wrap' }, h('table', { class: 'adm-table' },
        h('thead', {}, h('tr', {}, h('th', {}, '시각'), h('th', {}, '종류'), h('th', {}, '내용'))), usageBody)),
      h('p', { class: 'muted small' }, '최근 500개 기록에서 보여 줘요.')),
    h('section', { class: 'panel' },
      h('h2', {}, '🔑 접속 기록'),
      access.length
        ? h('div', { class: 'adm-table-wrap' }, h('table', { class: 'adm-table' },
          h('thead', {}, h('tr', {}, h('th', {}, '시각'), h('th', {}, '종류'), h('th', {}, 'IP'), h('th', {}, '기기'))),
          h('tbody', {}, access.slice(0, 100).map((e) => h('tr', { class: e.type === 'login-fail' ? 'warn' : '' },
            h('td', {}, fmt(e.ts)), h('td', {}, EVENT_NAME[e.type]), h('td', {}, e.ip || '-'), h('td', {}, deviceOf(e.ua)))))))
        : h('p', { class: 'muted' }, '접속 기록이 없어요.')),
    h('section', { class: 'panel' },
      h('h2', {}, `🎨 산출물 (${works.length}점)`),
      works.length
        ? h('div', { class: 'adm-works' }, works.map((w) => h('figure', {},
          h('img', { src: `/api/admin/works/${user.id}/${w.id}.png`, alt: w.title || '작품', loading: 'lazy' }),
          h('figcaption', {}, h('b', {}, w.title || FREE_ACTS[w.act]?.title || '작품'), h('span', {}, `${kidName(w.profileId)} · ${fmt(w.createdAt)}`)))))
        : h('p', { class: 'muted' }, '저장한 작품이 없어요.')),
  ];
}

function kidCard(k, uid) {
  const step = HANGUL_STEPS[k.hangulStep];
  const unit = EN_UNITS[k.englishUnit];
  const top = Object.entries(k.played || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const check = (k.checks || [])[k.checks?.length - 1];
  const ch = Object.entries(k.challenges || {});
  return h('article', { class: 'adm-kid' },
    h('header', {}, h('span', { class: 'adm-kid-avatar', 'aria-hidden': 'true' }, k.avatar), h('div', {}, h('b', {}, k.name), h('span', {}, `${k.age}살 · 등록 ${k.createdAt || '-'}`)),
      h('a', { class: 'btn btn-ghost small adm-report', href: `#/admin/u/${uid}/r/${k.id}` }, '📊 리포트')),
    h('dl', {},
      row('한글', step ? `${step.id}차시 · ${step.stageTitle}` : '-'),
      row('영어', unit ? `Level ${unit.code} ${unit.no}차시 · ${unit.levelTitle}` : '-'),
      row('수학', MATH_UNITS[k.mathUnit] ? `${MATH_UNITS[k.mathUnit].id} · ${MATH_UNITS[k.mathUnit].title} (${(k.mathDay || 0) + 1}/${MATH_UNITS[k.mathUnit].days}일)` : '-'),
      row('공부한 날', `${k.stats?.days?.length ?? 0}일`),
      row('놀이 · 별', `${k.stats?.games ?? 0}번 · ⭐ ${k.stats?.stars ?? 0}`),
      row('오늘의 할 일 완료', `${k.stats?.courses ?? 0}번`),
      row('도토리 · 스티커', `🌰 ${k.acorns ?? 0} · 스티커 ${k.stickers?.length ?? 0}개`),
      row('확인 퀴즈', check ? `${check.date} ${check.score}/${check.total} ${check.pass ? '통과' : `· ${HANGUL_STEPS[check.review]?.id}차시 복습`}` : '-'),
      row('영어 챌린지', ch.length ? ch.map(([kind, c]) => `${CHALLENGES[kind]?.name || kind} ${c.stage}단계`).join(', ') : '-'),
      row('많이 한 놀이', top.length ? top.map(([key, n]) => `${GAMES[key]?.title || key} ${n}`).join(', ') : '-')));
}
const row = (dt, dd) => [h('dt', {}, dt), h('dd', {}, dd)];

/* ---------- 관리자: 아이 한 명의 학습 리포트 ---------- */
export function viewAdminReport(uid, kidId) {
  const view = h('main', { class: 'page' }, h('p', { class: 'muted' }, '불러오는 중…'));
  view.mount = async () => {
    try {
      const d = await sync.adminApi.user(uid);
      const kid = d.state?.profiles?.find((k) => k.id === kidId);
      if (!kid) { view.replaceChildren(h('p', { class: 'acc-error' }, '아이를 찾지 못했어요.')); return; }
      // 리포트가 보는 칸이 빠졌을 수 있어서 store와 같은 모양으로 맞춘다
      store.normalizeProfile(kid);
      const rp = viewReport(kid, {
        back: `#/admin/u/${uid}`,
        who: `${d.user.name}(${d.user.username}) · `,
        works: async () => d.works.filter((w) => w.profileId === kidId).map((w) => ({ ...w, url: `/api/admin/works/${uid}/${w.id}.png` })),
      });
      view.replaceWith(rp);
      rp.mount();
    } catch (e) {
      view.replaceChildren(h('p', { class: 'acc-error' }, `불러오지 못했어요: ${e.message}`));
    }
  };
  return view;
}
