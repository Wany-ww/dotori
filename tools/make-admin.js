// 관리자 계정 만들기 · 바꾸기: npm run make-admin -- <아이디> <비밀번호> [이름]
// 아이디가 이미 있으면 그 계정을 관리자로 바꾸고 비밀번호를 새로 정한다.
const path = require('path');
// 서버와 같은 데이터 폴더 (NAS에서는 DATA_DIR)
const db = require('./db.js')(path.resolve(process.env.DATA_DIR || path.join(__dirname, '..', 'data')));

const [username, password, name = '관리자'] = process.argv.slice(2);
if (!/^[a-z0-9_]{3,20}$/.test(username || '') || !password || password.length < 8) {
  console.log('사용법: npm run make-admin -- <아이디(영어 소문자 · 숫자 · _ 3~20자)> <비밀번호(8자 이상)> [이름]');
  process.exit(1);
}
const u = db.userByName(username);
if (u) {
  db.setRole(u.id, 'admin');
  db.setPassword(u.id, password);
  console.log(`${username} 계정을 관리자로 바꾸고 비밀번호를 새로 정했어요.`);
} else {
  db.createUser({ username, name, password, role: 'admin' });
  console.log(`관리자 계정 ${username}을(를) 만들었어요.`);
}
