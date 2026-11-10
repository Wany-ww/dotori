// 서버 계정과 학습 기록 맞추기.
// 서버(server.js)가 있으면 보호자 계정으로 로그인하고, 아이 프로필 · 학습 진행은 서버에 저장하며
// 접속 · 이용 기록을 모아 보낸다. 서버가 없으면(체험판 등) 예전처럼 이 기기에만 저장한다.
const SAVE_DELAY = 1200;
const FLUSH_DELAY = 3000;

let saveTimer = 0;
let flushTimer = 0;
let pendingState = null;
let queue = [];

async function call(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw Object.assign(new Error(data?.error || `HTTP ${res.status}`), { status: res.status });
  return data;
}

export const sync = {
  // 'server': 서버 계정 모드 · 'local': 이 기기에만 저장
  mode: 'local',
  user: null,

  // 시작할 때: 서버가 있는지, 로그인했는지 확인하고 계정의 학습 상태를 받아 온다
  async init() {
    try {
      const res = await fetch('/api/me', { credentials: 'same-origin' });
      if (res.status === 404 || !(res.headers.get('content-type') || '').includes('json')) return { state: null };
      this.mode = 'server';
      if (!res.ok) return { state: null };
      this.user = (await res.json()).user;
      const { state } = await call('/api/state');
      return { state };
    } catch {
      this.mode = 'local';
      return { state: null };
    }
  },
  get server() { return this.mode === 'server'; },
  get loggedIn() { return Boolean(this.user); },
  get admin() { return this.user?.role === 'admin'; },

  async signup(form) {
    const { user } = await call('/api/signup', { method: 'POST', body: form });
    this.user = user;
    return user;
  },
  async login(username, password) {
    const { user } = await call('/api/login', { method: 'POST', body: { username, password } });
    this.user = user;
    const { state } = await call('/api/state');
    return state;
  },
  async logout() {
    await this.flush();
    try { await call('/api/logout', { method: 'POST' }); } catch {}
    this.user = null;
  },

  // 학습 상태 저장: 자주 바뀌므로 잠깐 모았다가 한 번에
  saveState(state) {
    if (!this.user) return;
    pendingState = state;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => this.pushState(), SAVE_DELAY);
  },
  async pushState() {
    if (!pendingState || !this.user) return;
    const body = { state: pendingState };
    pendingState = null;
    try { await call('/api/state', { method: 'PUT', body }); } catch (e) { if (e.status !== 401) pendingState ||= body.state; }
  },

  // 이용 기록: { type, ... } 한 줄씩 모아 보낸다
  log(type, data = {}) {
    if (!this.user) return;
    queue.push({ type, at: Date.now(), ...data });
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => this.flush(), FLUSH_DELAY);
  },
  async flush() {
    clearTimeout(flushTimer);
    await this.pushState();
    if (!queue.length || !this.user) return;
    const events = queue;
    queue = [];
    try { await call('/api/events', { method: 'POST', body: { events } }); } catch { queue = [...events, ...queue].slice(-500); }
  },
  // 창을 닫을 때 남은 것을 보낸다
  flushOnLeave() {
    if (!this.user) return;
    if (pendingState) {
      fetch('/api/state', { method: 'PUT', keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: pendingState }) }).catch(() => {});
      pendingState = null;
    }
    if (queue.length) {
      fetch('/api/events', { method: 'POST', keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events: queue }) }).catch(() => {});
      queue = [];
    }
  },

  // 산출물
  works: {
    list: (profileId) => call(`/api/works?profile=${encodeURIComponent(profileId)}`).then((d) => d.works),
    get: (id) => call(`/api/works/${id}`).then((d) => d.work),
    image: (id) => fetch(`/api/works/${id}.png`, { credentials: 'same-origin' }).then((r) => (r.ok ? r.blob() : null)),
    save: (work) => call('/api/works', { method: 'POST', body: work }).then((d) => d.work),
    remove: (id) => call(`/api/works/${id}`, { method: 'DELETE' }),
  },

  // 관리자
  adminApi: {
    users: () => call('/api/admin/users').then((d) => d.users),
    user: (id) => call(`/api/admin/users/${id}`),
  },
};

addEventListener('pagehide', () => sync.flushOnLeave());
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sync.flushOnLeave(); });
