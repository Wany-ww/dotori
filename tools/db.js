// 도토리숲 파일 저장소 (server.js · tools/make-admin.js가 함께 쓴다).
// 작은 서비스용: JSON 파일과 줄 단위 기록 파일(jsonl)로 저장한다.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports = function store(DATA) {
  const dir = (...p) => path.join(DATA, ...p);
  ['', 'state', 'events', 'works'].forEach((d) => fs.mkdirSync(dir(d), { recursive: true }));
  const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
  // 쓰다가 꺼져도 파일이 깨지지 않게: 임시 파일에 쓰고 바꿔 끼운다
  const writeJson = (file, v) => { fs.writeFileSync(`${file}.tmp`, JSON.stringify(v)); fs.renameSync(`${file}.tmp`, file); };
  const newId = () => crypto.randomBytes(8).toString('hex');
  const safe = (id) => /^[a-z0-9]{6,40}$/.test(String(id || ''));

  // 계정 목록: 서버가 켜져 있는 동안 make-admin 같은 다른 프로그램이 파일을 바꿀 수 있어서, 바뀌었으면 다시 읽는다
  let users = [];
  let usersMtime = -1;
  const mtime = (file) => { try { return fs.statSync(file).mtimeMs; } catch { return 0; } };
  const fresh = () => {
    const m = mtime(dir('users.json'));
    if (m !== usersMtime) { users = readJson(dir('users.json'), []); usersMtime = m; }
    return users;
  };
  fresh();
  let sessions = readJson(dir('sessions.json'), {});
  const saveUsers = () => { writeJson(dir('users.json'), users); usersMtime = mtime(dir('users.json')); };
  const saveSessions = () => writeJson(dir('sessions.json'), sessions);

  const hash = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex');

  const api = {
    /* 계정 */
    createUser({ username, name, password, role = 'parent' }) {
      const salt = crypto.randomBytes(16).toString('hex');
      const u = { id: newId(), username, name, role, salt, hash: hash(password, salt), createdAt: Date.now(), lastLoginAt: Date.now() };
      fresh().push(u);
      saveUsers();
      return u;
    },
    setPassword(id, password) {
      const u = api.userById(id);
      u.salt = crypto.randomBytes(16).toString('hex');
      u.hash = hash(password, u.salt);
      saveUsers();
    },
    setRole(id, role) { api.userById(id).role = role; saveUsers(); },
    userByName: (username) => fresh().find((u) => u.username === username) || null,
    userById: (id) => fresh().find((u) => u.id === id) || null,
    allUsers: () => fresh(),
    checkPassword(u, password) {
      const a = Buffer.from(hash(password, u.salt), 'hex');
      const b = Buffer.from(u.hash, 'hex');
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    },
    touchLogin(id) { api.userById(id).lastLoginAt = Date.now(); saveUsers(); },

    /* 세션 */
    createSession(uid, days) {
      const token = crypto.randomBytes(32).toString('hex');
      const now = Date.now();
      Object.keys(sessions).forEach((k) => { if (sessions[k].exp < now) delete sessions[k]; });
      sessions[token] = { uid, exp: now + days * 86400e3 };
      saveSessions();
      return token;
    },
    userBySession(token) {
      const s = token && sessions[token];
      if (!s || s.exp < Date.now()) return null;
      return api.userById(s.uid);
    },
    deleteSession(token) { if (token && sessions[token]) { delete sessions[token]; saveSessions(); } },

    /* 앱 상태 (아이 프로필과 학습 진행) */
    getState: (uid) => readJson(dir('state', `${uid}.json`), null),
    putState(uid, state) { writeJson(dir('state', `${uid}.json`), { ...state, savedAt: Date.now() }); },

    /* 접속 · 이용 기록 */
    log(uid, e) {
      const row = Object.fromEntries(Object.entries({ ts: Date.now(), ...e }).filter(([, v]) => v !== undefined && v !== ''));
      fs.appendFileSync(dir('events', `${uid}.jsonl`), `${JSON.stringify(row)}\n`);
    },
    allEvents(uid) {
      let text = '';
      try { text = fs.readFileSync(dir('events', `${uid}.jsonl`), 'utf8'); } catch { return []; }
      return text.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    },
    // 최근 것부터 n개
    events: (uid, n) => api.allEvents(uid).slice(-n).reverse(),

    /* 산출물 */
    saveWork(uid, b) {
      const m = String(b.image || '').match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
      if (!m) return null;
      fs.mkdirSync(dir('works', uid), { recursive: true });
      const meta = {
        id: newId(), profileId: String(b.profileId || '').slice(0, 40), act: String(b.act || '').slice(0, 30), title: String(b.title || '').slice(0, 60),
        createdAt: Number(b.createdAt) || Date.now(), size: Array.isArray(b.size) ? b.size.slice(0, 2).map(Number) : null, replay: b.replay ?? null,
      };
      fs.writeFileSync(dir('works', uid, `${meta.id}.png`), Buffer.from(m[1], 'base64'));
      writeJson(dir('works', uid, `${meta.id}.json`), meta);
      return meta;
    },
    listWorks(uid, profileId) {
      let files = [];
      try { files = fs.readdirSync(dir('works', uid)).filter((f) => f.endsWith('.json')); } catch { return []; }
      return files.map((f) => readJson(dir('works', uid, f), null)).filter((w) => w && (!profileId || w.profileId === profileId))
        .map(({ replay, ...w }) => w).sort((a, b) => b.createdAt - a.createdAt);
    },
    getWork: (uid, id) => (safe(uid) && safe(id) ? readJson(dir('works', uid, `${id}.json`), null) : null),
    workImage(uid, id) {
      if (!safe(uid) || !safe(id)) return null;
      try { return fs.readFileSync(dir('works', uid, `${id}.png`)); } catch { return null; }
    },
    removeWork(uid, id) {
      if (!safe(uid) || !safe(id)) return;
      [`${id}.png`, `${id}.json`].forEach((f) => { try { fs.unlinkSync(dir('works', uid, f)); } catch {} });
    },

    /* 관리자 요약: 아이 · 접속 · 놀이 · 산출물 수 */
    summary(uid) {
      const st = api.getState(uid);
      const ev = api.allEvents(uid);
      const kids = (st?.profiles || []).map((p) => ({ id: p.id, name: p.name, age: p.age, avatar: p.avatar }));
      const logins = ev.filter((e) => e.type === 'login');
      const opens = ev.filter((e) => e.type === 'open' || e.type === 'login');
      const last = ev.length ? ev[ev.length - 1].ts : null;
      return {
        kids,
        logins: logins.length,
        visits: opens.length,
        plays: ev.filter((e) => e.type === 'play').length,
        courses: ev.filter((e) => e.type === 'course').length,
        works: api.listWorks(uid).length,
        lastActiveAt: last,
        days: new Set(ev.map((e) => new Date(e.ts).toLocaleDateString('sv'))).size,
      };
    },
  };
  return api;
};
