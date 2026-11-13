import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.argv[2];
const url = (p) => 'file:///' + join(root, p).replace(/\\/g, '/');
const D = await import(url('js/data.js'));
const { LEXICON, RULE_SENTENCES, EASY_SENTENCES, isPicture } = await import(url('js/lexicon.js'));
const { lessonOf, lessonCount, parseSentence } = await import(url('js/lesson.js'));
const ko = new Set(); const en = new Set();
const add = (t) => { t = String(t).trim(); if (t && /[가-힣ㄱ-ㅣ]/.test(t)) ko.add(t); };
const addEn = (t) => { t = String(t).trim(); if (t && /[A-Za-z0-9]/.test(t)) en.add(t); };
// 낱말
LEXICON.forEach((it) => add(it.word));
// 글자: 모든 차시의 글자와 헷갈리는 글자
for (let i = 0; i < lessonCount; i++) {
  const L = lessonOf(i);
  for (let k = 0; k < 3; k++) {
    const syl = L.syllables(5000);
    syl.forEach((s) => { add(s); L.alike(s, 60).forEach(add); });
    L.jamo(60).forEach((j) => add(D.JAMO_NAME[j] || j));
  }
  L.words(500).forEach((w) => [...w.word].forEach(add));
}
LEXICON.forEach((it) => [...it.word].forEach(add));
[...D.QUIZ_SYLLABLES, ...D.QUIZ_BATCHIM].forEach(add);
D.QUIZ_SYLLABLES.forEach((s) => D.similarSyllables(s).forEach(add));
// 낱자 이름과 소리
Object.values(D.JAMO_NAME).forEach(add); Object.values(D.CHO_SOUND).forEach(add); Object.values(D.JUNG_SOUND).forEach(add); Object.values(D.JONG_SOUND).forEach(add);
['끄', '뜨', '쁘', '쓰', '쯔'].forEach(add);
// 말소리 정류장: '가로' '기역으로'
const ro = (s) => { const d = D.decompose(s.slice(-1)); return d && d.t && d.t !== 8 ? '으로' : '로'; };
const firsts = new Set([...D.STATION_WORDS.map((w) => w[0][0]), ...LEXICON.filter(isPicture).map((it) => it.word[0])]);
firsts.forEach((k) => add(`${k}${ro(k)}`));
D.CHO.forEach((c) => add(`${D.JAMO_NAME[c]}${ro(D.JAMO_NAME[c])}`));
// 문장
Object.values(RULE_SENTENCES).flat().forEach(([, s]) => { const p = parseSentence(s); add(p.text); p.words.forEach(add); });
EASY_SENTENCES.forEach(([, s]) => { add(s); s.split(' ').forEach(add); });
Object.entries(D.SENTENCES).forEach(([k, v]) => { if (k === 'extra') v.forEach(add); else v.forEach((x) => { add(x.words.join(' ')); x.words.forEach(add); }); });
D.STICKY.forEach((it) => add(it.parts.map((p) => (Array.isArray(p) ? p[0] : p)).join('')));
D.LETTER_GALAXY.forEach((it) => { add(it.w + it.after); add(it.w); });
D.TYPE_WORDS.flat().forEach(add); D.TYPE_SENTENCES.flat().forEach(add);
D.KICKER_NOUNS.forEach((n) => D.KICKER_TEMPLATES.forEach((t) => { const p = D.JOSA_PAIRS[t.pair]; add(`${n.w}${D.hasBatchim(n.w) ? p[0] : p[1]} ${t.rest}`); }));
D.EXPLAIN_RIDDLES.forEach((r) => { [r.w, ...r.yes, ...r.no].forEach(add); add(`알았다! ${r.w}${D.hasBatchim(r.w) ? '이지요' : '지요'}?`); });
D.POT_RECIPES.forEach((r) => { r.items.forEach(([w]) => add(w)); add(`짜잔! ${r.out[0]}${D.hasBatchim(r.out[0]) ? '이' : '가'} 나왔어요!`); });
Object.values(D.SYLLABLE_WORDS).flat().forEach(add);
[...D.FLASH_SETS, ...D.SEARCH_SETS].forEach((s) => s.words.forEach(([w]) => add(w)));
D.GALAXY_SEARCH_SETS.forEach((s) => s.words.forEach(add));
D.FRUIT_WORDS && Object.values(D.FRUIT_WORDS).flat().forEach(([w]) => add(w));
[...D.TOY_WORDS, ...D.TOY_WORDS2, ...D.TOY_ALIKE.flat()].forEach(([w]) => add(w));
D.STATION_WORDS.forEach(([w]) => add(w));
[...D.WORDS, ...D.WORDS2, ...D.PUZZLE_WORDS, ...D.PUZZLE_BATCHIM].forEach((w) => add(w.word));
// 강아지 먹이 주기 · 읽고 답해요 · 손글씨 도움말
D.STATION_WORDS.forEach(([w]) => [...w].forEach(add));
Object.values(D.DOG_FINAL_WORDS).flat().forEach(([w]) => add(w));
D.READ_PASSAGES.forEach((p) => { p.lines.forEach(add); add(p.lines.join(' ')); add(p.q); p.a.forEach(([w]) => add(w)); });
const { advice } = await import(url('js/handwriting.js'));
['count-few', 'count-many', 'order', 'direction', 'shape'].forEach((problem) => { for (let k = 0; k < 12; k++) add(advice({ problem, want: k })); });
// 수학: 수와 고유어 수
for (let i = 0; i <= 100; i++) add(String(i).replace(/./, (c) => c)) || ko.add(String(i));
for (let i = 200; i <= 1000; i += 100) ko.add(String(i)); // 세 자리 수는 백의 자리와 나머지를 나눠 읽는다 (자릿값 블록)
D.NATIVE_NUM.forEach(add);
D.COUNT_ITEMS.forEach((it) => add(it.q));
// 몇 개일까요: 창문 문장 (수 1~19)
D.STORY_WHO.forEach((w) => { for (let a = 1; a <= 15; a++) for (let b = 1; b <= 9; b++) ['+', '-'].forEach((op) => D.storyParts(op, w, a, b).forEach(add)); });
D.WINDOW_ITEMS.forEach(([w]) => { add(w); for (let a = 1; a <= 19; a++) for (let b = 1; b <= 10; b++) ['add1', 'add', 'sub', 'cmp'].forEach((k) => D.windowLines(k, w, a, b).forEach(add)); });
['수학', '영어'].forEach((n) => [2, 3, 4, 5].forEach((lv) => add(`우와, 레벨 업! 이제 ${n} ${lv}단계예요!`)));
// 소스 코드의 한국어 문자열 (말하는 문장과 화면 문구)
const files = [...readdirSync(join(root, 'js/games')).map((f) => join(root, 'js/games', f)), ...readdirSync(join(root, 'js/free')).map((f) => join(root, 'js/free', f)), join(root, 'js/main.js'), join(root, 'js/freeViews.js'), join(root, 'js/challengeMap.js')];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/'([^'\\\n]*[가-힣][^'\\\n]*)'/g)) if (m[1].length <= 70 && !m[1].includes('${')) add(m[1]);
}
// 영어
const E = D;
[...E.VOCAB, ...E.VOCAB2].forEach((v) => addEn(v.w));
Object.values(E.SPELL_WORDS).flat().forEach((v) => addEn(v.w));
[...E.PHONICS, ...E.END_WORDS].forEach((v) => addEn(v.w));
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c) => { addEn(c); addEn(c.toLowerCase()); });
// 강아지 파닉스 · 플래시 카드 · 몬스터 색칠공부
E.CVC_WORDS.forEach(addEn);
E.EN_FLASH_SETS.forEach((s) => s.words.forEach(([w]) => addEn(w)));
addEn("Let's look at the cards!");
const cap = (t) => t[0].toUpperCase() + t.slice(1);
E.EN_COLORS.forEach((c) => { addEn(c.w); addEn(`${cap(c.w)}!`); E.MONSTER_PARTS.forEach((p) => addEn(`${cap(c.w)} ${p}!`)); });
// 말하기 놀이 · 장난감 공장 · 목욕시간
[...E.EN_PHRASES, ...E.EN_SENTENCES].forEach(([t]) => addEn(t));
E.SAYHO_LINES.flat().forEach(addEn);
const plural = (w) => (w === 'fish' ? 'fish' : w === 'house' ? 'houses' : `${w}s`);
E.PAINT_THINGS.forEach(([w]) => { addEn(w); addEn(`two ${plural(w)}`); addEn(`three ${plural(w)}`); addEn(`a big ${w}`); addEn(`a small ${w}`); });
[...E.ALIEN_TALK, E.ALIEN_BYE].forEach((t) => { addEn(t.q); t.a.forEach(([a, , r]) => { addEn(a); addEn(r); }); });
[...E.EN_TOY_WORDS, ...E.EN_TOY_ALIKE.flat()].forEach(([w]) => addEn(w));
addEn('please!');
Object.entries(E.EN_LETTER_WORDS).forEach(([l, w]) => { const u = l.toUpperCase(); addEn(`${u}. ${u} is for ${w}.`); });
addEn("Oh no! Let's wash it!");
// 숫자 · 요일 · 달 · 매트릭스 (영어 숫자 놀이)
for (let i = 0; i <= 100; i++) addEn(E.numEn(i));
E.EN_COUNT_ITEMS.forEach((t) => { addEn(t.one); addEn(t.many); addEn(`How many ${t.many}?`); });
[...E.EN_DAYS, ...E.EN_MONTHS].forEach(addEn);
E.EN_MONTHS.forEach((m, i) => addEn(`${m} is the ${E.EN_ORDINALS[i]} month of the year!`));
Object.values(E.MATRIX_SETS).forEach((s) => { [...s.rows, ...s.cols].forEach(([w]) => addEn(w)); s.rows.forEach(([r]) => s.cols.forEach(([c]) => addEn(s.say(r, c)))); });
["Let's put the days of the week in order!", "Let's put the months in order!"].forEach(addEn);
// 단어 축구 · 젤리 붙이기 · 단어 매트릭스 · 우주 정비소 · 시계 기차 · 도형 · 패턴 (영어)
Object.values(E.EN_KICK).forEach((k) => k.items.forEach(([, b, a, af]) => addEn([b, a, af].filter(Boolean).join(' '))));
E.EN_JELLY.flat().forEach(([pre, stem, suf, post]) => addEn(`${pre} ${stem}${suf}${post === '.' ? '' : ' '}${post}`));
E.WORD_MATRIX.flat().forEach(([rows, cols]) => rows.forEach((r) => cols.forEach((c) => addEn(r + c))));
E.SPACE_SETS.forEach((s) => s.words.forEach(([w]) => addEn(w)));
for (let hh = 1; hh <= 12; hh++) for (let mm = 0; mm < 60; mm += 5) E.timeEn(hh, mm).forEach(addEn);
['All aboard!', 'What time does the train leave?', 'Find the shape with no straight sides!', 'A circle is round!', 'A star! Twinkle, twinkle!', 'What comes next?', 'Choo choo! You found the pattern!'].forEach(addEn);
['circle', 'triangle', 'square', 'pentagon', 'hexagon', 'star'].forEach((s) => { addEn(`Find the ${s}!`); });
[3, 4, 5, 6].forEach((k) => addEn(`Find the shape with ${E.numEn(k)} sides!`));
[['triangle', 3], ['square', 4], ['pentagon', 5], ['hexagon', 6]].forEach(([s, k]) => addEn(`A ${s} has ${E.numEn(k)} sides.`));
E.TRACE_SETS.shapes.items.forEach((it) => addEn(it.say));
// 영어 숫자 따라쓰기 5단계: 혼자 쓴 숫자를 판정한 도움말(영어)
const HW = await import(url('js/handwriting.js'));
['count-few', 'count-many', 'order', 'direction', 'shape'].forEach((problem) => [0, 1, 2].forEach((want) => addEn(HW.advice({ problem, want }, 'en'))));
// 영어 패턴 기차: 칸마다 읽어 주는 낱말
['apple', 'banana', 'grapes', 'lemon', 'dog', 'cat', 'pig', 'bear', 'triangle', 'square', 'star', 'circle', 'sun', 'moon', 'cloud', 'car', 'bus', 'bike', 'plane', 'hat', 'sock', 'shoe', 'cap'].forEach(addEn);
// ---- 자유 활동: 카드 받는 사람 · 카드 이름 · 글자 색칠 글자 ----
['엄마', '아빠', '할머니', '할아버지', '언니', '오빠', '누나', '형', '동생', '친구', '선생님'].forEach((t) => { add(`${t}에게`); add(`${t}에게 하고 싶은 말을 써요!`); });
['생일 축하해요', '고마워요', '사랑해요', '힘내요', '미안해요'].forEach(add);
[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', '가', '나', '다', '라', '마', '바', '사', '아', '자', '하', '엄', '빠', '꽃', '별'].forEach(add);
[2, 3, 4].forEach((k) => D.SENTENCES[k].forEach((x) => add(x.words.join(' '))));
// ---- 4차: 한글 · 영어 · 수학 새 놀이 ----
const C = await import(url('js/content.js'));
const KO_COUNT = ['한', '두', '세', '네', '다섯'];
C.LABEL_SCENES.forEach((s) => { addEn(s.en); s.things.forEach(([, k, e]) => { add(k); addEn(e); }); });
['What is the title?', 'Put the labels on the picture!', 'Three, two, one, blast off!', 'I want', 'please!', 'Thank you!', 'Find the words!', 'Match the pairs!'].forEach(addEn);
C.CATEGORIES.forEach((c) => {
  add(c.ko); addEn(c.en); add(`${c.ko} 낱말만 로켓에 실어요!`); addEn(`Load the ${c.en}!`);
  c.items.forEach(([, k, e]) => { add(k); addEn(e); });
  KO_COUNT.slice(0, 3).forEach((n) => add(`${c.ko} ${n} 개`));
  c.items.forEach(([, k]) => KO_COUNT.forEach((n) => add(`${k} ${n} 개`)));
});
const art = (w) => (/^[aeiou]/.test(w) ? 'an' : 'a');
C.EN_SHOP.forEach(([, one, many]) => { addEn(one); addEn(`${art(one)} ${one}`); [2, 3].forEach((n) => addEn(`${E.numEn(n)} ${many}`)); });
C.EN_SENT.forEach(([, s]) => { addEn(s.replace(/[{}]/g, '')); addEn(s.match(/\{(.+?)\}/)[1]); s.replace(/[{}.]/g, '').split(' ').forEach(addEn); });
C.EN_CHUNKS.forEach(([, b, a, af, traps]) => { addEn(`${b} ${a}${af === '.' ? '.' : ` ${af}`}`); [a, ...traps].forEach(addEn); });
C.EN_NOTES.forEach((t) => { addEn(t); t.split(' ').forEach((w) => addEn(w.replace(/[^a-zA-Z]/g, ''))); });
E.TRACE_SETS.linesEn.items.forEach((it) => addEn(it.say));
E.TRACE_SETS.lines.items.forEach((it) => add(it.ko));
E.TRACE_SETS.shapesKo.items.forEach((it) => add(it.ko));
// 한글 시계 기차: 한글 시각 (세 시 삼십 분)
for (let hh = 1; hh <= 12; hh++) for (let mm = 0; mm < 60; mm += 5) add(D.timeHangul(hh, mm));
['기차는', '에 떠나요', '기차 출발!'].forEach(add);
// 한글: 낱말의 글자 하나하나 · 한글표 글자 · 말소리 발표 글자
const { compose: comp, JAMO_NAME, CHO_SOUND, JUNG_SOUND, JONG_SOUND } = D;
[...D.WORDS, ...D.WORDS2].forEach((w) => [...w.word].forEach(add));
const CS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'];
const VS = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];
const TS = ['ㄱ', 'ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ'];
CS.forEach((c) => VS.forEach((v) => { add(comp(c, v)); if ('ㅏㅓㅗㅜㅡㅣ'.includes(v)) TS.forEach((t) => add(comp(c, v, t))); }));
CS.forEach((c) => add(`${JAMO_NAME[c]}, ${CHO_SOUND[c]}`));
['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'].forEach((v) => add(`${JAMO_NAME[v]}, ${JUNG_SOUND[v]}`));
TS.forEach((t) => add(`받침 ${JAMO_NAME[t]}, ${JONG_SOUND[t]}`));
// 달력 · 시계 (수학판)
const KO_MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
const KO_ORD = ['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'];
['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', ...KO_MONTHS].forEach(add);
KO_MONTHS.forEach((m, i) => { add(`${m}은 한 해의 ${KO_ORD[i]} 번째 달이에요!`); add(`${m} 달력의 빠진 날짜를 찾아요!`); });
for (let d = 1; d <= 31; d++) add(`${d}일`);
for (let hh = 1; hh <= 12; hh++) { add(`${hh}시`); add(`${hh}시 30분`); for (let mm = 5; mm < 60; mm += 5) add(`${hh}시 ${mm}분`); }
['기차는', '에 떠나요', '기차 출발!'].forEach(add);
// 수학: 돈 · 분수 · 개수 · 길이 · 조건
for (let v = 10; v <= 1000; v += 10) add(`${v}원`);
for (let d = 2; d <= 8; d++) for (let k = 1; k <= d; k++) ['만큼 주세요!', '만큼 채워요!', '!', '만큼 채웠어요!'].forEach((t) => add(`${d}분의 ${k}${t}`));
for (let n = 1; n <= 99; n++) { add(`${n}개`); add(`${n}개!`); }
for (let n = 1; n <= 6; n++) add(`${n}판`);
for (let n = 1; n <= 16; n++) add(`${n}센티미터`);
const FS_C = ['빨간', '파란', '노란', '초록'];
const FS_S = ['동그라미', '세모', '네모', '별'];
FS_S.forEach((s) => { add(`${s}만 잡아요!`); add(`${s}만 로켓에 실어요!`); });
FS_C.forEach((c) => { add(`${c}색 도형만 잡아요!`); add(`${c}색 도형만 로켓에 실어요!`); FS_S.forEach((s) => { add(`${c} ${s}만 잡아요!`); add(`${c} ${s}만 로켓에 실어요!`); ['큰', '작은'].forEach((z) => { add(`${z} ${c} ${s}만 잡아요!`); add(`${z} ${c} ${s}만 로켓에 실어요!`); }); }); });
['큰 도형만 로켓에 실어요!', '작은 도형만 로켓에 실어요!'].forEach(add);
['1 큰', '1 작은', '10 큰', '10 작은', '11 큰'].forEach((r) => add(`보다 ${r} 수는?`));
['문어', '게', '물고기', '거북', '오징어', '복어'].forEach((n) => add(`${n}는 몇 마리일까요?`));
['네모', '큰 세모', '긴 네모', '큰 네모', '아주 큰 세모', '집', '배', '로켓', '나무', '물고기'].forEach((n) => add(`${n} 완성!`));
const GSETS = [['사과', '바나나', '포도', '딸기'], ['강아지', '고양이', '토끼', '곰'], ['자동차', '버스', '자전거', '비행기'], ['꽃', '네잎클로버', '버섯', '해바라기']];
GSETS.forEach((g) => g.forEach((a) => g.forEach((b) => { if (a !== b) add(`${a}는 ${b}보다 몇 개 더 많을까요?`); })));
for (let k = 1; k <= 10; k++) add(`${k}단!`);
for (let k = 2; k <= 9; k++) add(`${k}개씩 선택하세요.`);
['더하기', '빼기', '곱하기', '나누기', '더하기 몇은', '곱하기 몇은', '만큼 칠해요!', '만큼 그어요!', '찾아서 불을 켜요!', '십의 자리', '일의 자리', '거스름돈', '고맙습니다!', '만들기!'].forEach(add);
for (const f of ['phonics.js', 'whatIsThis.js', 'spelling.js', 'missingLetter.js', 'readAlong.js', 'alphabetPuzzle.js', 'easyPuzzle.js', 'coloringMonster.js', 'dogPhonics.js', 'enFlashCard.js',
  'iSpy.js', 'sayAfter.js', 'paintWord.js', 'sayHo.js', 'alienChat.js', 'enCount.js', 'calendarPuzzle.js', 'matrix.js', 'numberPuzzle.js', 'numberTrace.js',
  'soundTrain.js', 'wordMachine.js', 'spaceRepair.js', 'jellyAffix.js', 'clockTrain.js', 'wordKicker.js', 'patterns.js', 'shapes.js',
  'labeling.js', 'sortRockets.js', 'grocery.js', 'wordCard.js', 'crossword.js', 'typing.js', 'wordTrace.js', 'sentenceKit.js', 'spellBalls.js', 'lineMatch.js', 'wordSearch.js']) {
  const src = readFileSync(join(root, 'js/games', f), 'utf8');
  for (const m of src.matchAll(/'([A-Z][^'\\\n]*[a-z][^'\\\n]*)'/g)) if (m[1].length <= 60 && !m[1].includes('${') && !/[가-힣]/.test(m[1])) addEn(m[1]);
}
// ---- 영어 24단계 커리큘럼: 단어장 · 차시 문장(정답 · 함정 말) · 대화 · 그림책 · 글자 소개 ----
const EC = await import(url('js/enContent.js'));
const { EN_UNITS } = await import(url('js/enCurriculum.js'));
const { enUnitOf, parseEn, article: enArt } = await import(url('js/enLesson.js'));
const tokens = (t) => t.split(' ').map((w) => w.replace(/[^A-Za-z'’-]/g, '')).filter(Boolean);
EC.EN_WORDS.forEach((x) => { addEn(x.w); addEn(`${x.w}!`); });
// 보석 캐기 ("f!" · "fish starts with f.") · 무엇일까요? ("It is a dog!"): 단어마다 만든다
const enArtWI = (w) => (/^[aeiou]/.test(w) ? 'an' : 'a');
[...EC.EN_WORDS, ...E.PHONICS, ...E.END_WORDS, ...E.VOCAB, ...E.VOCAB2].forEach((x) => {
  if (!/^[a-z]+$/.test(x.w)) return;
  addEn(`${x.w} starts with ${x.w[0]}.`);
  addEn(`${x.w} ends with ${x.w.slice(-1)}.`);
  addEn(`It is ${enArtWI(x.w)} ${x.w}!`);
});
'abcdefghijklmnopqrstuvwxyz'.split('').forEach((l) => addEn(`${l}!`));
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(addEn);
addEn('hmm?');
Object.values(EC.EN_BANK).flat().forEach((row) => {
  const q = parseEn(row);
  addEn(q.text); addEn(q.answer); q.wrong.forEach(addEn); tokens(q.text).forEach(addEn);
  addEn(q.text.toLowerCase().replace(/[’',]/g, ''));
});
Object.values(EC.EN_DIALOGS).flat().forEach((t) => { addEn(t.q); t.a.forEach(([a, , r]) => { addEn(a); addEn(r); }); });
Object.values(EC.EN_STORIES).forEach((b) => {
  addEn(b.title);
  b.pages.forEach((pg) => { addEn(pg.text); tokens(pg.text).forEach(addEn); });
  (b.quiz || []).forEach((q) => { addEn(q.q); q.a.forEach(addEn); });
});
EN_UNITS.forEach((u, i) => {
  const U = enUnitOf(i);
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((L) => { const line = U.sayFor(L); addEn(line); addEn(`${L}. ${line}`); addEn(line.replace(/\.$/, '!')); });
  for (let k = 0; k < 40; k++) U.book().pages.forEach((pg) => { addEn(pg.text); tokens(pg.text).forEach(addEn); });
  // A ~ C 단계는 차시 단어로 문장을 만든다 (It is a cat. · I see a dog. · A is for apple.)
  if (!U.sentenceUnit) for (let k = 0; k < 300; k++) U.sentences(6).forEach((q) => { addEn(q.text); addEn(q.answer); q.wrong.forEach(addEn); });
});
['Put the story in order!', 'Find the missing letters!', 'Find the words!'].forEach(addEn);
// 영어 챌린지: 제목 · 문제 안내 · 그래머 말(a cat · two cats · three big cats …) · 리스닝 문장(I see a cat.)
const { COUNT_NOUNS, grammarPhrase } = await import(url('js/enLesson.js'));
C.BRICK_FRAMES.forEach((f) => f.good.forEach((w) => addEn(f.frame.replace('___', w))));
['Word Challenge!', 'Phonics Challenge!', 'Listening Challenge!', 'Grammar Challenge!',
  'Catch the falling stars!',
  'Find all the words!', 'Find the missing words!', 'Which note fits best?', 'Pet Quiz!', 'Listen and choose the correct word.', 'Help the penguin!', "Let's fix the ship!", 'Put the labels on the picture!',
  'Ring ring!', 'Hello.', 'Nice to see you!', 'I have to go now. Bye!', 'Catch you later.', 'See you soon!', 'Hmm? Listen again.',
  ...['Alien', 'Robot', 'Fox', 'Panda', 'Penguin'].map((n) => `Hi, ${n}.`),
  'Game over!', 'You did it!', 'Read and choose the correct picture.',
 'Listen and choose the correct picture.', 'Listen and choose the missing letter.'].forEach(addEn);
COUNT_NOUNS.forEach((x) => {
  [[1, ''], [2, ''], [3, ''], [1, 'big'], [2, 'small'], [3, 'big']].forEach(([k, size]) => addEn(grammarPhrase(x.w, k, size)));
  [1, 2].forEach((k) => addEn(`I see ${grammarPhrase(x.w, k)}.`));
});
const ko2 = [...ko].filter((t) => !/^[ㄱ-ㅣ]$/.test(t)); // 낱자 글꼴 자체는 소리 내지 않는다 (이름으로 읽는다)
writeFileSync(process.argv[3], JSON.stringify({ ko: ko2.sort(), en: [...en].sort() }, null, 0));
console.log('ko', ko2.length, 'en', en.size);
