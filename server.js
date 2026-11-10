// 도토리숲 서버: 정적 파일 + 계정 · 학습 기록 API.
// 데이터는 data/ 폴더에 파일로 저장한다 (외부 라이브러리 없음).
//   data/users.json          계정 (비밀번호는 scrypt 해시만)
//   data/sessions.json       로그인 세션 (쿠키 sid)
//   data/state/<uid>.json    계정의 앱 상태 (아이 프로필 · 차시 · 별 · 도토리 …)
//   data/events/<uid>.jsonl  접속 기록과 이용 기록 (한 줄에 하나씩 쌓인다)
//   data/works/<uid>/<id>.json · .png   자유 활동 산출물
// 관리자 계정은 `npm run make-admin -- <아이디> <비밀번호> [이름]`으로 만든다.
// NAS(Docker)에서는 PORT · DATA_DIR 환경 변수로 포트와 데이터 폴더를 바꾼다 (docs/nas.md).
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = __dirname;
const port = Number(process.env.PORT) || 5173;
const DATA = path.resolve(process.env.DATA_DIR || path.join(root, 'data'));
const SESSION_DAYS = 30;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
};

/* ---------- 파일 저장소 ---------- */
const db = require('./tools/db.js')(DATA);

/* ---------- 도움 함수 ---------- */
function send(res, status, body, headers = {}) {
  const json = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, { 'Content-Type': json ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(json ? JSON.stringify(body) : body);
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error('too big'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(Object.assign(new Error('bad json'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}
const cookies = (req) => Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((p) => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
const clientIp = (req) => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
// HTTPS로 들어온 요청(NAS 역방향 프록시 뒤 포함)이면 쿠키에 Secure를 붙인다
const secure = (req) => req.socket.encrypted || String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
const sessionCookie = (req, token, maxAge) => `sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure(req) ? '; Secure' : ''}`;
// 지금 내보내는 화면 파일의 커밋 (실행기가 서버를 끄지 않고 파일만 바꿀 때도 있어서, 1분마다 다시 본다)
let versionCache = { at: 0, value: null };
function version() {
  if (Date.now() - versionCache.at < 60000) return versionCache.value;
  let value = null;
  try {
    const [commit, date] = require('child_process').execFileSync('git', ['-C', root, 'log', '-1', '--format=%h %cI'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000 }).trim().split(' ');
    value = { commit, date };
  } catch {}
  versionCache = { at: Date.now(), value };
  return value;
}
const publicUser = (u) => u && { id: u.id, username: u.username, name: u.name, role: u.role, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt };

// 로그인 실패가 잦은 IP는 잠깐 막는다 (10분에 10번)
const fails = new Map();
function tooMany(ip) {
  const f = fails.get(ip);
  return f && f.n >= 10 && Date.now() - f.t < 10 * 60 * 1000;
}
function failed(ip) {
  const f = fails.get(ip);
  if (!f || Date.now() - f.t > 10 * 60 * 1000) fails.set(ip, { n: 1, t: Date.now() });
  else f.n++;
}

/* ---------- API ---------- */
const USERNAME = /^[a-z0-9_]{3,20}$/;
const ID = /^[a-z0-9]{6,40}$/;
const EVENT_TYPES = new Set(['open', 'view', 'select', 'play', 'course', 'check', 'challenge', 'work', 'kid-add', 'kid-remove', 'level', 'unit']);

async function api(req, res, url) {
  const p = url.pathname;
  const m = req.method;
  const me = db.userBySession(cookies(req).sid);
  const ip = clientIp(req);
  const ua = String(req.headers['user-agent'] || '').slice(0, 200);

  if (p === '/api/signup' && m === 'POST') {
    const b = await readBody(req, 10e3);
    const username = String(b.username || '').trim().toLowerCase();
    const name = String(b.name || '').trim().slice(0, 20);
    const password = String(b.password || '');
    if (!USERNAME.test(username)) return send(res, 400, { error: '아이디는 영어 소문자 · 숫자 · _ 로 3~20자예요.' });
    if (password.length < 8) return send(res, 400, { error: '비밀번호는 8자 이상이에요.' });
    if (!name) return send(res, 400, { error: '보호자 이름을 적어 주세요.' });
    if (!b.agree) return send(res, 400, { error: '학습 기록 저장에 동의해 주세요.' });
    if (db.userByName(username)) return send(res, 409, { error: '이미 쓰고 있는 아이디예요.' });
    const u = db.createUser({ username, name, password, role: 'parent' });
    const token = db.createSession(u.id, SESSION_DAYS);
    db.log(u.id, { type: 'signup', ip, ua });
    db.log(u.id, { type: 'login', ip, ua });
    return send(res, 200, { user: publicUser(u) }, { 'Set-Cookie': sessionCookie(req, token, SESSION_DAYS * 86400) });
  }

  if (p === '/api/login' && m === 'POST') {
    if (tooMany(ip)) return send(res, 429, { error: '로그인을 너무 많이 틀렸어요. 10분 뒤에 다시 해 주세요.' });
    const b = await readBody(req, 10e3);
    const u = db.userByName(String(b.username || '').trim().toLowerCase());
    if (!u || !db.checkPassword(u, String(b.password || ''))) {
      failed(ip);
      if (u) db.log(u.id, { type: 'login-fail', ip, ua });
      return send(res, 401, { error: '아이디나 비밀번호가 맞지 않아요.' });
    }
    const token = db.createSession(u.id, SESSION_DAYS);
    db.touchLogin(u.id);
    db.log(u.id, { type: 'login', ip, ua });
    return send(res, 200, { user: publicUser(db.userById(u.id)) }, { 'Set-Cookie': sessionCookie(req, token, SESSION_DAYS * 86400) });
  }

  if (p === '/api/logout' && m === 'POST') {
    if (me) db.log(me.id, { type: 'logout', ip, ua });
    db.deleteSession(cookies(req).sid);
    return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, '', 0) });
  }

  // 앱(APK)이 서버 주소를 확인할 때 쓴다
  if (p === '/api/ping' && m === 'GET') return send(res, 200, { app: 'dotori', ok: true, version: version() });

  if (p === '/api/me' && m === 'GET') return me ? send(res, 200, { user: publicUser(me) }) : send(res, 401, { error: 'login' });

  // 여기부터는 로그인한 사람만
  if (!me) return send(res, 401, { error: 'login' });

  if (p === '/api/state' && m === 'GET') return send(res, 200, { state: db.getState(me.id) });
  if (p === '/api/state' && m === 'PUT') {
    const b = await readBody(req, 2e6);
    if (!b.state || !Array.isArray(b.state.profiles)) return send(res, 400, { error: 'bad state' });
    db.putState(me.id, b.state);
    return send(res, 200, { ok: true });
  }

  if (p === '/api/events' && m === 'POST') {
    const b = await readBody(req, 200e3);
    const list = (Array.isArray(b.events) ? b.events : []).slice(0, 200);
    list.forEach((e) => {
      if (!e || !EVENT_TYPES.has(e.type)) return;
      // 기록에 남길 칸만 (긴 글은 자른다)
      const clean = {};
      Object.entries(e).forEach(([k, v]) => { if (/^[a-zA-Z]{1,16}$/.test(k) && ['string', 'number', 'boolean'].includes(typeof v)) clean[k] = typeof v === 'string' ? v.slice(0, 120) : v; });
      db.log(me.id, { ...clean, ts: Date.now(), at: Number(e.at) || undefined, ip: e.type === 'open' ? ip : undefined, ua: e.type === 'open' ? ua : undefined });
    });
    return send(res, 200, { ok: true });
  }

  // 산출물 (자유 활동 작품)
  if (p === '/api/works' && m === 'GET') return send(res, 200, { works: db.listWorks(me.id, url.searchParams.get('profile')) });
  if (p === '/api/works' && m === 'POST') {
    const b = await readBody(req, 12e6);
    const w = db.saveWork(me.id, b);
    if (!w) return send(res, 400, { error: 'bad work' });
    return send(res, 200, { work: w });
  }
  let mm = p.match(/^\/api\/works\/([a-z0-9]+)(\.png)?$/);
  if (mm && ID.test(mm[1])) {
    if (m === 'DELETE' && !mm[2]) { db.removeWork(me.id, mm[1]); return send(res, 200, { ok: true }); }
    if (m === 'GET' && mm[2]) { const png = db.workImage(me.id, mm[1]); return png ? send(res, 200, png, { 'Content-Type': 'image/png' }) : send(res, 404, 'Not found'); }
    if (m === 'GET') { const w = db.getWork(me.id, mm[1]); return w ? send(res, 200, { work: w }) : send(res, 404, { error: 'not found' }); }
  }

  // 관리자: 이용자 정보 열람 (읽기만)
  if (p.startsWith('/api/admin/')) {
    if (me.role !== 'admin') return send(res, 403, { error: 'admin only' });
    if (p === '/api/admin/users' && m === 'GET') return send(res, 200, { users: db.allUsers().map((u) => ({ ...publicUser(u), ...db.summary(u.id) })) });
    mm = p.match(/^\/api\/admin\/users\/([a-z0-9]+)$/);
    if (mm && m === 'GET') {
      const u = db.userById(mm[1]);
      if (!u) return send(res, 404, { error: 'not found' });
      return send(res, 200, { user: publicUser(u), summary: db.summary(u.id), state: db.getState(u.id), events: db.events(u.id, 500), works: db.listWorks(u.id) });
    }
    mm = p.match(/^\/api\/admin\/works\/([a-z0-9]+)\/([a-z0-9]+)\.png$/);
    if (mm && m === 'GET' && ID.test(mm[1]) && ID.test(mm[2])) {
      const png = db.workImage(mm[1], mm[2]);
      return png ? send(res, 200, png, { 'Content-Type': 'image/png' }) : send(res, 404, 'Not found');
    }
  }
  return send(res, 404, { error: 'not found' });
}

/* ---------- 정적 파일 ----------
   앱이 쓰는 파일만 내보낸다 (데이터 · 문서 · 도구 · .git은 내보내지 않음).
   그림 · 음성은 7일 동안 기기에 두고, 코드는 바뀌었는지(ETag)만 확인해서 바깥 네트워크에서도 빠르게 열린다. */
const PUBLIC_FILES = new Set(['/index.html', '/favicon.ico']);
const PUBLIC_DIRS = ['/js/', '/css/', '/assets/'];
const isPublic = (p) => !/\/\./.test(p) && (PUBLIC_FILES.has(p) || PUBLIC_DIRS.some((d) => p.startsWith(d)));
const ZIP = new Set(['.html', '.js', '.mjs', '.css', '.svg', '.json']);
const zipped = new Map();

function serveStatic(req, res, url) {
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Bad request'); }
  if (pathname === '/') pathname = '/index.html';
  const file = path.join(root, pathname);
  if (!isPublic(pathname) || !file.startsWith(root + path.sep)) return send(res, 404, 'Not found');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Not found');
    const ext = path.extname(file);
    const etag = `"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
    const headers = {
      'Content-Type': types[ext] || 'application/octet-stream',
      ETag: etag,
      'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=604800' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); return res.end(); }
    const gzip = ZIP.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    fs.readFile(file, (e2, data) => {
      if (e2) return send(res, 404, 'Not found');
      if (!gzip) { res.writeHead(200, headers); return res.end(req.method === 'HEAD' ? undefined : data); }
      // 같은 파일은 한 번만 압축해 둔다
      let z = zipped.get(file);
      if (!z || z.etag !== etag) { z = { etag, body: zlib.gzipSync(data) }; zipped.set(file, z); }
      res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
      res.end(req.method === 'HEAD' ? undefined : z.body);
    });
  });
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/api/')) return serveStatic(req, res, url);
    try {
      await api(req, res, url);
    } catch (e) {
      if (!res.headersSent) send(res, e.status || 500, { error: e.status ? e.message : 'server error' });
      if (!e.status) console.error(e);
    }
  })
  .listen(port, () => console.log(`도토리숲 running at http://localhost:${port} (data: ${DATA})`));
