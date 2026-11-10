// 자유 활동 앨범: 아이가 저장한 작품을 브라우저 데이터베이스(IndexedDB)에 아이별로 모아 둔다.
// 작품 = { id, profileId, act(활동 종류), title, createdAt, image(PNG Blob), size: [w, h], replay(다시 그리기용 기록) }
// 보호자 계정으로 로그인했으면(서버 모드) 작품을 서버에 저장한다 (계정의 산출물로 남는다)
import { sync } from './sync.js';
const DB = 'dotori-forest';
const STORE = 'works';
let opening = null;

function open() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('no-idb'));
  opening ||= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const st = req.result.createObjectStore(STORE, { keyPath: 'id' });
      st.createIndex('profile', 'profileId');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { opening = null; reject(req.error); };
  });
  return opening;
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const st = t.objectStore(STORE);
    let out;
    Promise.resolve(fn(st)).then((v) => { out = v; });
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}
const done = (req) => new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });

const toDataUrl = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(r.error);
  r.readAsDataURL(blob);
});
// 서버에 둔 작품: 정보와 그림(PNG)을 따로 받아 하나로
const withImage = async (w) => (w ? { ...w, image: await sync.works.image(w.id) } : w);
const remote = {
  async save(work) {
    const { image, ...rest } = work;
    const w = await sync.works.save({ ...rest, image: await toDataUrl(image) });
    sync.log('work', { kid: work.profileId, act: work.act, title: work.title, work: w.id });
    return { ...w, image };
  },
  async list(profileId) { return Promise.all((await sync.works.list(profileId)).map(withImage)); },
  async get(id) { return withImage(await sync.works.get(id).catch(() => null)); },
  async remove(id) { await sync.works.remove(id); },
  async removeProfile(profileId) {
    const ws = await sync.works.list(profileId);
    await Promise.all(ws.map((w) => sync.works.remove(w.id)));
  },
};

const local = {
  async save(work) {
    const w = { id: `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now(), ...work };
    await tx('readwrite', (st) => st.put(w));
    return w;
  },
  // 최근 것부터
  async list(profileId) {
    const rows = await tx('readonly', (st) => done(st.index('profile').getAll(profileId)));
    return (rows || []).sort((a, b) => b.createdAt - a.createdAt);
  },
  async get(id) {
    return tx('readonly', (st) => done(st.get(id)));
  },
  async remove(id) {
    await tx('readwrite', (st) => st.delete(id));
  },
  async removeProfile(profileId) {
    const rows = await this.list(profileId);
    await tx('readwrite', (st) => rows.forEach((r) => st.delete(r.id)));
  },
};

// 서버 계정 모드면 서버에, 아니면 이 기기에
export const album = new Proxy({}, { get: (_, k) => (sync.user ? remote[k] || local[k] : local[k]) });
