// NAS(Docker)용 실행기: GitHub 저장소를 받아 서버를 돌리고, 몇 분마다 새 커밋이 있는지 보고 저절로 업데이트한다.
//   - 처음: APP_DIR이 비어 있으면 저장소를 받는다(git clone --depth 1)
//   - 그 뒤: UPDATE_MINUTES마다 git fetch → 새 커밋이면 그 커밋으로 맞춘다
//     화면 파일(js · css · assets)은 바로 새 파일이 나가고, 서버 코드(server.js · tools/ · package.json)가 바뀌었을 때만 서버를 다시 켠다
//   - 실행기 자신(tools/runner.js)이 바뀌면 컨테이너를 끝내서, Docker가 다시 켤 때 새 실행기로 돌게 한다 (restart: unless-stopped)
//   - 서버가 멈추면 3초 뒤 다시 켠다
// 환경 변수: REPO_URL · BRANCH(main) · APP_DIR(/app/src) · UPDATE_MINUTES(5) · AUTO_UPDATE(1, 0이면 끔) · PORT · DATA_DIR
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = process.env.REPO_URL || 'https://github.com/Wany-ww/dotori.git';
const BRANCH = process.env.BRANCH || 'main';
const DIR = path.resolve(process.env.APP_DIR || '/app/src');
const MINUTES = Math.max(1, Number(process.env.UPDATE_MINUTES) || 5);
const AUTO = process.env.AUTO_UPDATE !== '0';
const RESTART_ON = /^(server\.js|package\.json|tools\/)/;
const SELF = 'tools/runner.js';

const log = (...a) => console.log(new Date().toISOString(), '[runner]', ...a);
const git = (...args) => execFileSync('git', ['-C', DIR, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function prepare() {
  if (fs.existsSync(path.join(DIR, '.git'))) return;
  log(`저장소를 받는 중: ${REPO} (${BRANCH}) → ${DIR}`);
  fs.mkdirSync(path.dirname(DIR), { recursive: true });
  execFileSync('git', ['clone', '--depth', '1', '--branch', BRANCH, REPO, DIR], { stdio: 'inherit' });
}

let child = null;
let stopping = false;
let restarting = false;
function start() {
  log(`서버 시작 (커밋 ${git('rev-parse', '--short', 'HEAD')})`);
  child = spawn(process.execPath, ['server.js'], { cwd: DIR, stdio: 'inherit', env: process.env });
  child.on('exit', (code, signal) => {
    child = null;
    if (stopping) return;
    if (restarting) { restarting = false; start(); return; }
    log(`서버가 멈췄어요 (code ${code}, signal ${signal}). 3초 뒤 다시 켜요.`);
    setTimeout(start, 3000);
  });
}
function restart() {
  if (!child) return start();
  restarting = true;
  child.kill('SIGTERM');
}

function check() {
  try {
    git('fetch', '--depth', '1', 'origin', BRANCH);
    const now = git('rev-parse', 'HEAD');
    const next = git('rev-parse', 'FETCH_HEAD');
    if (now === next) return;
    let changed = [];
    try { changed = git('diff', '--name-only', now, next).split('\n').filter(Boolean); } catch { changed = ['server.js']; }
    git('reset', '--hard', next);
    git('clean', '-fd');
    log(`업데이트: ${now.slice(0, 7)} → ${next.slice(0, 7)} (파일 ${changed.length}개)`);
    if (changed.includes(SELF)) {
      log('실행기가 바뀌어서 컨테이너를 다시 켜요.');
      stopping = true;
      if (child) child.kill('SIGTERM');
      setTimeout(() => process.exit(0), 2000);
      return;
    }
    if (changed.some((f) => RESTART_ON.test(f))) restart();
  } catch (e) {
    log('업데이트 확인 실패 (다음에 다시 해요):', String(e.stderr || e.message).trim().split('\n')[0]);
  }
}

prepare();
start();
if (AUTO) {
  log(`${MINUTES}분마다 ${BRANCH} 브랜치의 새 커밋을 확인해요.`);
  setInterval(check, MINUTES * 60 * 1000);
}
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    stopping = true;
    if (child) child.kill(sig);
    setTimeout(() => process.exit(0), 3000).unref();
    if (!child) process.exit(0);
    else child.on('exit', () => process.exit(0));
  });
}
