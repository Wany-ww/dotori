// 차시(lesson)에 맞는 놀이 내용을 골라 주는 곳.
// 게임은 ctx.lesson의 함수로 글자·낱말·문장을 받아서, 같은 놀이라도 차시마다 다른 내용으로 놀게 된다.
import { HANGUL_STEPS, RULE_NAME } from './curriculum.js';
import { LEXICON, isPicture, RULE_SENTENCES, EASY_SENTENCES } from './lexicon.js';
import { CHO, JUNG, JONG, compose, decompose } from './data.js';
import { shuffle, pick } from './util.js';

const BASIC_CONS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const BASIC_VOWS = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];
const EASY_CONS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'];
const MAIN_FINALS = ['ㅁ', 'ㅇ', 'ㄴ', 'ㄹ', 'ㅂ', 'ㄱ'];

// 받침에서 같은 소리가 나는 글자 묶음 (받침 바르게 쓰기 함정에 쓴다)
const SAME_FINAL = [['ㅂ', 'ㅍ'], ['ㄱ', 'ㅋ', 'ㄲ'], ['ㄷ', 'ㅌ', 'ㅅ', 'ㅈ', 'ㅊ', 'ㅆ']];
// 규칙마다 빈칸이 되는 받침
const RULE_FINALS = {
  pf: ['ㅍ'], kf: ['ㅋ', 'ㄲ'], df: ['ㄷ'], tf: ['ㅌ'], sf: ['ㅅ'], jf: ['ㅈ', 'ㅊ'], hf: ['ㅎ'], hv: ['ㅎ'],
  g1: ['ㄵ', 'ㄼ', 'ㄺ', 'ㄻ'], g2: ['ㄶ', 'ㅀ', 'ㄾ', 'ㅄ'],
};
// 같은 소리가 나는 모음 (ㅔ/ㅐ, ㅚ/ㅙ/ㅞ, ㅖ/ㅔ)
const SAME_VOWEL = [['ㅔ', 'ㅐ'], ['ㅚ', 'ㅙ', 'ㅞ'], ['ㅖ', 'ㅔ', 'ㅐ']];

// 함정 글자로 써도 어색하지 않은 받침 글자 (낱말 사전의 글자 + 자주 쓰는 글자)
const COMMON_CVC = '각간갈감갑강객건걸검겁격견결경곡곤골곰곱공관광국군굴굽궁권균극근글금급긴길김깃깊깎깔깜깡꺾껌꼭꼴꽃꽉꿀꿈끈끌끓끝낙난날남납낫낭낮낯낼냄냉넉널넓넘넣녁년녕녹논놀놈농높놓눈눌늑는늘늙능늦닉닌닐님닥닦단닫달닭닮담답당닻댁덕던덜덤덥덮독돈돌돔돕동둑둔둘둥득든듣들듬등딩딱딴딸땀땅떡떤떨똑똥뚫뜯뜰뜻락란람랑랭럭런럴럼렁력련렬렴령록론롤롬롱룩룬룰룸룽륙률륭륵른를름릉릭린릴림립링막만많말맑맘맛망맞맡맥맨맴맹먹먼멀멈멋멍멸명몇목몫몰몸못몽묵묶문묻물뭇뭉민믿밀밉밑박밖반받발밝밟밤밥방밭백밴뱀뱃벅번벌범법벗벙벽변별볍병볕복볶본볼봄봉북분불붉붐붓붕붙빈빌빔빗빙빚빛빨빵뿔삭산살삶삼삽상색샘생석섞선설섬섭성섯셋속손솔솜솟송솥숙순술숨숫숭숲쉽슬슴습승식신실싫심십싱싹쌀쌈쌍쌓썩쏟쑥쓴씩씬씻악안앉않알앓암압앗앙앞액앵약얀얄얇양얕억언얹얻얼엄업없엇엉엌엔역연열엷염엽엿영옆옥온올옮옳옷옹완왕왼욕용욱운울움웃웅원월윗육윤율융윷은을음읍응익인일읽잃임입잇있잊잎작잔잘잠잡잣장쟁적전절젊점접젓정젖족존졸좀좁종좋죽준줄줌중즉즐즘증직진질짐집짓징짖짙짚짝짧쨍쪽쫓쭉찍찜착찬찰참찹창찾책척천철첨첩청촉촌촛총축춘출춤충측층칙친칠침칫칭칼캄컵켠콕콘콜콤콧콩큰클큼킨킬탁탄탈탐탑탓탕택탱턱턴털텅텐톡톤톨톱통툭툰툴퉁특튼틀틈틱팀팍판팔팜팝팡팥팬펄펑펜편평폭폰폴폼푹푼풀품풋풍픈플픽핀필핏핑학한할함합항핵햄햇행향헌헐험헝혁현혈협형혹혼홀홈홉홍확환활황획횡훈훌훔훨흉흑흔흘흙흠흡흥흰힘';
// 받침 없는 글자 중 ㅑ ㅕ ㅛ ㅠ ㅘ ㅝ ㅟ ㅢ ㅚ ㅙ가 들어간 자연스러운 글자
const COMMON_CV = '야여요유겨교규녀뇨뉴려료류며묘뮤벼뷰셔쇼슈져죠쥬쳐츄켜큐튜펴표퓨혀효휴뼈와워위의외왜과귀괴뇌뒤되돼뭐봐쇠쉬좌줘쥐죄최취퇴튀화회휘희꽈뀌뛰쐬';
// 예사소리·거센소리·된소리 묶음 (7단계 함정 글자)
const TENSE_GROUPS = [['ㄱ', 'ㅋ', 'ㄲ'], ['ㄷ', 'ㅌ', 'ㄸ'], ['ㅂ', 'ㅍ', 'ㅃ'], ['ㅈ', 'ㅊ', 'ㅉ'], ['ㅅ', 'ㅆ']];
const COMMON = new Set([...COMMON_CVC, ...COMMON_CV, ...LEXICON.flatMap((it) => [...it.word])]);
// 받침 없는 글자: 기본 모음과 ㅐ·ㅔ는 어떤 자음과도 괜찮고, 나머지 모음은 자주 쓰는 글자만
const OPEN_OK = new Set(['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ']);
// 1~2단계에서 만나는 친숙한 그림 낱말
const CORE = new Set(['사과', '바나나', '포도', '딸기', '수박', '우유', '빵', '피자', '강아지', '고양이', '토끼', '곰', '사자', '호랑이',
  '코끼리', '기린', '오리', '나비', '기차', '버스', '비행기', '자동차', '자전거', '나무', '꽃', '달', '별', '구름', '공', '풍선', '모자',
  '신발', '가방', '연필', '우산', '시계', '의자', '집', '고래', '돼지', '병아리', '원숭이', '거북이', '개구리', '토마토', '당근', '오이',
  '감자', '아기', '엄마', '아빠', '하마', '여우', '양말', '책', '거울', '로봇', '인형', '아이스크림', '케이크', '사탕', '물고기', '문어', '무지개']);
const RULE_TAGS = new Set(['pf', 'kf', 'df', 'tf', 'sf', 'jf', 'sai', 'slink', 'hf', 'hv', 'g1', 'g2', 'abs']);
const natural = (s) => {
  const d = decompose(s);
  if (!d) return false;
  if (!d.t && OPEN_OK.has(JUNG[d.j])) return true;
  return COMMON.has(s) || (!d.t && CHO[d.c] === 'ㅇ');
};

const parts = (s) => {
  const d = decompose(s);
  return d ? { c: CHO[d.c], j: JUNG[d.j], t: d.t ? JONG[d.t] : '' } : null;
};
const sylsOf = (w) => [...w].map(parts).filter(Boolean);

/* ---------- 차시마다 배운 낱자 모으기 ---------- */
// 3단계 이전에도 'ㅇ'(소리 없는 첫소리)는 아는 것으로 본다
function knownAt(index) {
  const cons = new Set(['ㅇ']);
  const vows = new Set();
  const fins = new Set();
  HANGUL_STEPS.slice(0, index + 1).forEach((s) => {
    const f = s.focus || [];
    if (s.kind === 'vowel' || s.kind === 'diph') f.forEach((x) => vows.add(x));
    if (s.kind === 'cons') f.forEach((x) => cons.add(x));
    if (s.kind === 'final') f.forEach((x) => fins.add(x));
    if (s.kind === 'cv') BASIC_CONS.slice(0, 10).forEach((x) => cons.add(x));
    if (s.kind === 'finals') MAIN_FINALS.forEach((x) => fins.add(x));
    if (s.kind === 'rule') f.flatMap((r) => RULE_FINALS[r] || []).forEach((x) => fins.add(x));
    if (s.kind === 'rule' && f.includes('ye')) vows.add('ㅖ');
  });
  return { cons, vows, fins };
}

/* ---------- 차시 ---------- */
export function lessonOf(index) {
  const i = Math.max(0, Math.min(HANGUL_STEPS.length - 1, index));
  const step = HANGUL_STEPS[i];
  const { cons, vows, fins } = knownAt(i);
  const kind = step.kind;
  const focus = step.focus || [];
  const slot = { vowel: 'jung', diph: 'jung', cons: 'cho', final: 'jong' }[kind] || null;
  // 놀이의 손놀림 난이도(보기 수·속도 등)는 단계를 따라 1~5로 올라간다
  const level = [1, 1, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5][step.stage - 1] + (step.stage === 2 && step.no >= 3 ? 1 : 0);
  const early = step.stage <= 2;
  const ruleTags = kind === 'rule' ? focus : [];

  // 낱말이 이 차시에 얼마나 맞는지: 배우는 낱자가 들어 있고(+), 아직 안 배운 낱자가 없을수록(+)
  const TENSE = ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅊ'];
  const hasFocus = (w) => {
    if (kind === 'rule') return LEXICON.some((it) => it.word === w && it.tags.some((t) => ruleTags.includes(t)));
    if (kind === 'finals') return sylsOf(w).some((p) => MAIN_FINALS.includes(p.t));
    if (kind === 'mix') return sylsOf(w).some((p) => p.t || TENSE.includes(p.c) || !BASIC_VOWS.includes(p.j));
    if (!slot) return true;
    return sylsOf(w).some((p) => focus.includes(p[{ cho: 'c', jung: 'j', jong: 't' }[slot]]));
  };
  // 아직 안 배운 낱자 수 (모음과 받침은 낱말을 읽는 데 더 중요해서 무겁게 센다)
  const unknown = (w) => sylsOf(w).reduce((a, p) => a
    + (cons.has(p.c) ? 0 : 1) + (vows.has(p.j) ? 0 : 3) + (p.t && !fins.has(p.t) ? 3 : 0), 0);
  const plainWord = (w) => sylsOf(w).every((p) => !p.t);

  function wordPool({ pic = false, maxLen = 4, minLen = 1 } = {}) {
    const okLen = (it) => [...it.word].length >= minLen && [...it.word].length <= maxLen;
    const base = LEXICON.filter((it) => okLen(it) && (!pic || isPicture(it)));
    if (kind === 'vocab' || kind === 'jamoShape') return base.filter((it) => CORE.has(it.word));
    if (kind === 'theme') return base.filter((it) => it.tags.some((t) => step.themes.includes(t)) && !it.tags.some((t) => RULE_TAGS.has(t)));
    if (kind === 'rule') return base.filter((it) => it.tags.some((t) => ruleTags.includes(t)));
    // 받침을 배우기 전에는 받침 없는 낱말만
    const noFinalsYet = !fins.size;
    return base.filter((it) => !noFinalsYet || plainWord(it.word));
  }

  // n개의 낱말: 이 차시에 딱 맞는 것부터, 모자라면 조금 덜 맞는 것으로 채운다
  function words(n, opts = {}) {
    const pool = shuffle(wordPool(opts));
    // 통글자 단계(1~2단계)는 글자를 따지지 않고 고루, 그 뒤로는 배운 글자로 된 낱말부터. 한 글자 낱말은 조금 뒤로
    const score = (it) => {
      const single = [...it.word].length === 1 && kind !== 'final' && kind !== 'rule' ? 1.5 : 0;
      if (early) return Math.random() * 3 + single;
      return (hasFocus(it.word) ? 0 : 10) + Math.min(unknown(it.word), 6) * (step.wide ? 1 : 2) + Math.random() * 1.5 + single;
    };
    const scored = pool.map((it) => ({ it, s: score(it) }));
    scored.sort((a, b) => a.s - b.s);
    let out = scored.map((x) => x.it);
    if (out.length < n) {
      // 낱말이 모자라면(그림 낱말이 적은 규칙 차시 등) 다른 규칙 낱말 → 배운 글자로 된 낱말 순서로 채운다
      const fits = (it) => !out.includes(it) && (!opts.pic || isPicture(it))
        && [...it.word].length <= (opts.maxLen || 4) && [...it.word].length >= (opts.minLen || 1);
      const ruleMore = kind === 'rule' ? shuffle(LEXICON.filter((it) => fits(it) && it.tags.some((t) => RULE_TAGS.has(t) && t !== 'abs'))) : [];
      const more = shuffle(LEXICON.filter((it) => fits(it) && !ruleMore.includes(it) && unknown(it.word) <= 2))
        .sort((a, b) => unknown(a.word) - unknown(b.word));
      out = [...out, ...ruleMore, ...more];
    }
    return out.slice(0, n).map((it) => ({ word: it.word, emoji: it.emoji, pron: it.pron }));
  }

  // 이 차시의 글자(음절): 배우는 낱자가 들어간 글자
  function syllables(n) {
    let pool = [];
    if (kind === 'vowel' || kind === 'diph') {
      const cs = kind === 'vowel' && step.stage === 3 && step.no <= 2 ? ['ㅇ', 'ㄱ', 'ㄴ', 'ㄷ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅈ', 'ㅎ'] : [...cons].filter((c) => BASIC_CONS.includes(c) || c === 'ㅇ');
      pool = focus.flatMap((v) => cs.map((c) => compose(c, v)));
    } else if (kind === 'cons') {
      const vs = [...vows].filter((v) => BASIC_VOWS.includes(v));
      pool = focus.flatMap((c) => (vs.length ? vs : ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ']).map((v) => compose(c, v)));
    } else if (kind === 'final' || kind === 'finals') {
      const fs = kind === 'final' ? focus : MAIN_FINALS;
      const cs = [...cons].filter((c) => EASY_CONS.includes(c) || c === 'ㅇ');
      const vs = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅡ'];
      pool = fs.flatMap((t) => cs.flatMap((c) => vs.map((v) => compose(c, v, t))));
    } else if (kind === 'rule') {
      // 규칙이 일어나는 글자: 받침 규칙은 그 받침 글자, 모음 규칙은 그 모음 글자, 사이시옷 등은 받침 글자
      const ws = wordPool().map((w) => w.word);
      const rf = ruleFinals();
      const vowelRule = ['ae', 'oe', 'ye'].some((r) => focus.includes(r));
      pool = ws.flatMap((w) => [...w]).filter((s) => {
        const p = parts(s);
        if (!p) return false;
        if (rf.size) return rf.has(p.t);
        return vowelRule ? SAME_VOWEL.flat().includes(p.j) : Boolean(p.t);
      });
      if (pool.length < 4) pool = ws.flatMap((w) => [...w]);
    } else if (kind === 'mix') {
      pool = [...cons].flatMap((c) => [...vows].map((v) => compose(c, v, Math.random() < 0.4 ? pick(MAIN_FINALS) : 0)));
    } else {
      // vocab · jamoShape · theme · cv: 배운 자음과 기본 모음의 글자
      const cs = kind === 'cv' ? [...cons] : EASY_CONS;
      pool = cs.flatMap((c) => ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'].map((v) => compose(c, v)));
    }
    pool = [...new Set(pool)].filter(natural);
    // 받침 차시는 낱말에서 실제로 쓰이는 글자를 먼저
    const used = new Set(LEXICON.flatMap((it) => [...it.word]));
    const ranked = [...shuffle(pool.filter((s) => used.has(s))), ...shuffle(pool.filter((s) => !used.has(s)))];
    const head = kind === 'final' || kind === 'finals' ? ranked : shuffle(pool);
    return head.slice(0, n);
  }
  const ruleFinals = () => new Set(focus.flatMap((r) => RULE_FINALS[r] || []));

  // 낱자(겹치지 않게): 배우는 낱자를 먼저, 그다음 복습할 낱자, 모자라면 같은 갈래의 기본 낱자
  function jamo(n) {
    let main = focus;
    let review = [];
    if (kind === 'vocab' || kind === 'jamoShape' || kind === 'theme') {
      main = [...BASIC_CONS, ...['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ']];
    } else if (kind === 'rule' || kind === 'mix' || kind === 'cv' || kind === 'finals') {
      main = [...cons, ...vows].filter((x) => x !== 'ㅇ');
    } else if (kind === 'final') {
      review = [...fins].filter((x) => !focus.includes(x));
    } else {
      review = [...(slot === 'jung' ? vows : cons)].filter((x) => !focus.includes(x) && x !== 'ㅇ');
    }
    const extra = slot === 'jung' ? BASIC_VOWS : slot === 'jong' ? MAIN_FINALS : BASIC_CONS;
    return [...new Set([...shuffle(main), ...shuffle(review), ...shuffle(extra)])].slice(0, n);
  }

  // 헷갈리기 쉬운 글자: 이 차시에서 배우는 자리를 먼저 바꿔 본다 (배운 낱자 안에서만)
  function alike(s, n) {
    const p = parts(s);
    if (!p) return [];
    const cs = [...cons].filter((c) => c !== p.c);
    const vs = [...vows].filter((v) => v !== p.j);
    const ts = p.t ? [...fins, ...MAIN_FINALS].filter((t) => t !== p.t) : [];
    const make = {
      cho: () => cs.map((c) => compose(c, p.j, p.t || 0)),
      jung: () => (vs.length ? vs : ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ']).map((v) => compose(p.c, v, p.t || 0)),
      jong: () => ts.map((t) => compose(p.c, p.j, t)),
    };
    const order = slot === 'jong' || p.t ? ['jong', 'jung', 'cho'] : slot === 'cho' ? ['cho', 'jung'] : ['jung', 'cho'];
    let out = [];
    // 거센소리·된소리 차시는 가/카/까처럼 같은 묶음의 글자를 먼저
    const tg = step.tense && TENSE_GROUPS.find((g) => g.includes(p.c));
    if (tg) out.push(...shuffle(tg.filter((c) => c !== p.c).map((c) => compose(c, p.j, p.t || 0))));
    order.forEach((k) => { out.push(...shuffle(make[k]().filter(natural))); });
    if (kind === 'rule') out = [...respell(s, 3).filter((x) => x !== s), ...out];
    return [...new Set(out)].filter((x) => x !== s).slice(0, n);
  }

  // 소리는 같은데 글자가 다른 철자 (받침 바르게 쓰기 함정): 앞 → 압, 꽃 → 꼳
  function respell(word, n = 2) {
    const syls = [...word];
    const out = new Set();
    syls.forEach((s, i) => {
      const p = parts(s);
      if (!p) return;
      const group = SAME_FINAL.find((g) => g.includes(p.t));
      if (group) group.filter((t) => t !== p.t).forEach((t) => out.add([...syls.slice(0, i), compose(p.c, p.j, t), ...syls.slice(i + 1)].join('')));
      const vg = SAME_VOWEL.find((g) => g.includes(p.j));
      if (vg) vg.filter((v) => v !== p.j).forEach((v) => out.add([...syls.slice(0, i), compose(p.c, v, p.t || 0), ...syls.slice(i + 1)].join('')));
      // 겹받침은 소리 나는 받침 하나만 쓴 철자로
      const double = { ㄵ: 'ㄴ', ㄼ: 'ㄹ', ㄺ: 'ㄱ', ㄻ: 'ㅁ', ㄶ: 'ㄴ', ㅀ: 'ㄹ', ㄾ: 'ㄹ', ㅄ: 'ㅂ' }[p.t];
      if (double) out.add([...syls.slice(0, i), compose(p.c, p.j, double), ...syls.slice(i + 1)].join(''));
    });
    // 사이시옷은 빼고 쓴 철자로
    const it = LEXICON.find((x) => x.word === word);
    if (it?.tags.includes('sai')) {
      out.add(syls.map((s, i) => { const p = parts(s); return i < syls.length - 1 && p?.t === 'ㅅ' ? compose(p.c, p.j) : s; }).join(''));
    }
    if (it?.pron && it.pron !== word && [...it.pron].length === syls.length) out.add(it.pron);
    out.delete(word);
    // 처음 보는 이상한 모양의 글자(뜼 등)보다 실제로 헷갈리는 철자를 먼저
    const looksReal = (w) => [...w].every((s) => natural(s) || [...word].includes(s)) || w === it?.pron;
    const all = shuffle([...out]);
    const real = all.filter(looksReal);
    return (real.length ? real : all.slice(0, 1)).slice(0, n);
  }

  // 그림 낱말 수 (그림 짝 놀이를 넣어도 되는지)
  const picCount = wordPool({ pic: true }).filter((it) => hasFocus(it.word)).length;

  // 문장: 규칙 차시는 빈칸이 있는 문장, 그 전에는 쉬운 문장
  function sentences(n) {
    if (kind === 'rule') {
      const list = focus.flatMap((r) => RULE_SENTENCES[r] || []);
      return shuffle(list).slice(0, n).map(([e, s]) => ({ e, ...parseSentence(s) }));
    }
    const list = fins.size ? null : EASY_SENTENCES;
    return list ? shuffle(list).slice(0, n).map(([e, s]) => ({ e, ...parseSentence(s) })) : [];
  }

  return {
    index: i,
    id: step.id,
    stage: step.stage,
    no: step.no,
    title: step.stageTitle,
    goal: step.goal,
    stageGoal: step.stageGoal,
    kind,
    focus,
    themes: step.themes || [],
    slot,
    level,
    early,
    sound: Boolean(step.sound),
    sentence: Boolean(step.sentence),
    tense: Boolean(step.tense),
    find: Boolean(step.find),
    wide: Boolean(step.wide),
    known: { cons: [...cons], vows: [...vows], fins: [...fins] },
    ruleName: focus.map((r) => RULE_NAME[r]).filter(Boolean).join(' · '),
    picCount,
    words, syllables, jamo, alike, respell, sentences, hasFocus,
    // 이 차시의 글자가 받침이 있는 글자여야 하는지
    batchim: fins.size > 0,
  };
}

// '{바른|틀린|틀린} 나머지' 문장 → 바른 문장, 빈칸, 낱말 조각
export function parseSentence(s) {
  const m = s.match(/\{([^}]+)\}/);
  const text = s.replace(/\{([^|}]+)[^}]*\}/g, '$1');
  if (!m) return { text, words: text.split(' '), blank: null };
  const [answer, ...wrong] = m[1].split('|');
  const before = s.slice(0, m.index);
  const after = s.slice(m.index + m[0].length);
  return { text, words: text.split(' '), blank: { answer, wrong, before, after } };
}

export const lessonCount = HANGUL_STEPS.length;
