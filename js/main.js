import { h, pick, charFace, stickerPic } from './ui.js';
import { store } from './store.js';
import { sfx, speak, stopSpeech } from './audio.js';
import { SUBJECTS, GAMES, STICKERS, TREE, LEVELS, MAX_LEVEL, AVATARS, FREE_ACTS, hasBatchim } from './data.js';
import { HANGUL_STAGES, HANGUL_STEPS, startStepForAge, CHECK_EVERY, CHECK_PASS } from './curriculum.js';
import { lessonOf } from './lesson.js';
import { EN_LEVELS, EN_UNITS, startUnitForAge } from './enCurriculum.js';
import { enUnitOf } from './enLesson.js';
import { MATH_LEVELS, MATH_UNITS, mathTune, startMathUnitForAge } from './mathCurriculum.js';
import { viewFree, viewFreeAct, viewAlbum, viewWork } from './freeViews.js';
import { album } from './album.js';
import { sync } from './sync.js';
import { viewAccount, viewSignup, accountBar, viewAdmin, viewAdminUser, viewAdminReport, logout, versionLine } from './accountViews.js';
import { viewReport } from './report.js';
import { viewChallenge, viewChallenges, CHALLENGES, STAGES, kindOfGame, stageUnitIndex } from './challengeMap.js';
import * as trace from './games/trace.js';
import * as jamoPuzzle from './games/jamoPuzzle.js';
import * as completeWords from './games/completeWords.js';
import * as quiz from './games/quiz.js';
import * as countWrite from './games/countWrite.js';
import * as tallyBlocks from './games/tallyBlocks.js';
import * as tallyCatch from './games/tallyCatch.js';
import * as quickMath from './games/quickMath.js';
import * as patterns from './games/patterns.js';
import * as numberBlocks from './games/numberBlocks.js';
import * as phonics from './games/phonics.js';
import * as missingLetter from './games/missingLetter.js';
import * as whatIsThis from './games/whatIsThis.js';
import * as readAlong from './games/readAlong.js';
import * as memoryMatch from './games/memoryMatch.js';
import * as compare from './games/compare.js';
import * as shapes from './games/shapes.js';
import * as sentenceMaker from './games/sentenceMaker.js';
import * as spelling from './games/spelling.js';
import * as letterPicker from './games/letterPicker.js';
import * as wordKicker from './games/wordKicker.js';
import * as jewelMine from './games/jewelMine.js';
import * as lineMatch from './games/lineMatch.js';
import * as stickySentence from './games/stickySentence.js';
import * as wordSearch from './games/wordSearch.js';
import * as findPair from './games/findPair.js';
import * as flashCard from './games/flashCard.js';
import * as toyFactory from './games/toyFactory.js';
import * as sillyHat from './games/sillyHat.js';
import * as washLetters from './games/washLetters.js';
import * as iSpy from './games/iSpy.js';
import * as rhythmHangul from './games/rhythmHangul.js';
import * as chocolate from './games/chocolate.js';
import * as goUpStage from './games/goUpStage.js';
import * as phonicsStation from './games/phonicsStation.js';
import * as magicPot from './games/magicPot.js';
import * as fruitCatch from './games/fruitCatch.js';
import * as explainToMe from './games/explainToMe.js';
import * as starSound from './games/starSound.js';
import * as wordQuizGalaxy from './games/wordQuizGalaxy.js';
import * as letterGalaxy from './games/letterGalaxy.js';
import * as typeGalaxy from './games/typeGalaxy.js';
import * as alphabetPuzzle from './games/alphabetPuzzle.js';
import * as easyPuzzle from './games/easyPuzzle.js';
import * as coloringMonster from './games/coloringMonster.js';
import * as dogPhonics from './games/dogPhonics.js';
import * as enFlashCard from './games/enFlashCard.js';
import * as sayAfter from './games/sayAfter.js';
import * as lightUp from './games/lightUp.js';
import * as paintWord from './games/paintWord.js';
import * as sayHo from './games/sayHo.js';
import * as alienChat from './games/alienChat.js';
import * as handWrite from './games/handWrite.js';
import * as enCount from './games/enCount.js';
import * as calendarPuzzle from './games/calendarPuzzle.js';
import * as matrix from './games/matrix.js';
import * as numberPuzzle from './games/numberPuzzle.js';
import * as numberTrace from './games/numberTrace.js';
import * as soundTrain from './games/soundTrain.js';
import * as wordMachine from './games/wordMachine.js';
import * as spaceRepair from './games/spaceRepair.js';
import * as jellyAffix from './games/jellyAffix.js';
import * as clockTrain from './games/clockTrain.js';
import * as labeling from './games/labeling.js';
import * as sortRockets from './games/sortRockets.js';
import * as grocery from './games/grocery.js';
import * as wordCard from './games/wordCard.js';
import * as crossword from './games/crossword.js';
import * as typing from './games/typing.js';
import * as letterTunnel from './games/letterTunnel.js';
import * as findAll from './games/findAll.js';
import * as wordTrace from './games/wordTrace.js';
import * as sentenceKit from './games/sentenceKit.js';
import * as spellBalls from './games/spellBalls.js';
import * as mathQuiz from './games/mathQuiz.js';
import * as barnCount from './games/barnCount.js';
import * as ferrisWheel from './games/ferrisWheel.js';
import * as rocketFuel from './games/rocketFuel.js';
import * as numberTrain from './games/numberTrain.js';
import * as skipCount from './games/skipCount.js';
import * as fruitDrop from './games/fruitDrop.js';
import * as cookies from './games/cookies.js';
import * as blockMath from './games/blockMath.js';
import * as wordWindows from './games/wordWindows.js';
import * as lineLight from './games/lineLight.js';
import * as fishTank from './games/fishTank.js';
import * as fruitShop from './games/fruitShop.js';
import * as multiDigit from './games/multiDigit.js';
import * as frogPond from './games/frogPond.js';
import * as mulPuzzle from './games/mulPuzzle.js';
import * as bakery from './games/bakery.js';
import * as beadString from './games/beadString.js';
import * as hundred from './games/hundred.js';
import * as coinSum from './games/coinSum.js';
import * as shapePairs from './games/shapePairs.js';
import * as unitMeasure from './games/unitMeasure.js';
import * as drawShapes from './games/drawShapes.js';
import * as observeShapes from './games/observeShapes.js';
import * as studyLab from './games/studyLab.js';
import * as trackPath from './games/trackPath.js';
import * as cubeCount from './games/cubeCount.js';
import * as iceCream from './games/iceCream.js';
import * as paperCut from './games/paperCut.js';
import * as cuckooClock from './games/cuckooClock.js';
import * as flowerOrder from './games/flowerOrder.js';
import * as seaFriends from './games/seaFriends.js';
import * as guguMaster from './games/guguMaster.js';
import * as mathPractice from './games/mathPractice.js';
import * as clockCards from './games/clockCards.js';
import * as stacked from './games/stacked.js';
import * as partialSum from './games/partialSum.js';
import * as shareDivide from './games/shareDivide.js';
import * as fraction from './games/fraction.js';
import * as graph from './games/graph.js';
import * as eggs from './games/eggs.js';
import * as equation from './games/equation.js';
import * as fallingShapes from './games/fallingShapes.js';
import * as ruler from './games/ruler.js';
import * as symmetry from './games/symmetry.js';
import * as sudoku from './games/sudoku.js';
import * as gridLock from './games/gridLock.js';
import * as tangram from './games/tangram.js';
import * as checkTest from './games/checkTest.js';
import * as enChallenge from './games/enChallenge.js';
import * as towerDrop from './games/towerDrop.js';
import * as messenger from './games/messenger.js';
import * as starFall from './games/starFall.js';
import * as iceBuild from './games/iceBuild.js';
import * as missingWords from './games/missingWords.js';
import * as sentenceBricks from './games/sentenceBricks.js';
import * as stickyStory from './games/stickyStory.js';
import * as fixShip from './games/fixShip.js';
import * as bridgeType from './games/bridgeType.js';

const MODULES = {
  trace, jamoPuzzle, completeWords, quiz, countWrite, tallyBlocks, tallyCatch, quickMath, patterns, numberBlocks,
  phonics, missingLetter, whatIsThis, readAlong, memoryMatch, compare, shapes, sentenceMaker, spelling,
  letterPicker, wordKicker, jewelMine, lineMatch, stickySentence, wordSearch,
  findPair, flashCard, toyFactory, sillyHat, washLetters, iSpy, rhythmHangul, chocolate, goUpStage, phonicsStation, magicPot, fruitCatch, explainToMe, starSound, wordQuizGalaxy, letterGalaxy, typeGalaxy,
  alphabetPuzzle, easyPuzzle, coloringMonster, dogPhonics, enFlashCard,
  sayAfter, lightUp, paintWord, sayHo, alienChat, handWrite,
  enCount, calendarPuzzle, matrix, numberPuzzle, numberTrace,
  soundTrain, wordMachine, spaceRepair, jellyAffix, clockTrain,
  labeling, sortRockets, grocery, wordCard, crossword, typing, letterTunnel, findAll, wordTrace, sentenceKit, spellBalls,
  mathQuiz, barnCount, ferrisWheel, rocketFuel, numberTrain, skipCount, fruitDrop, cookies, blockMath, wordWindows, lineLight, fishTank, fruitShop, multiDigit, frogPond, mulPuzzle, bakery, beadString, hundred, coinSum, clockCards, shapePairs, unitMeasure, drawShapes, observeShapes, studyLab, trackPath, cubeCount, iceCream, paperCut, cuckooClock, flowerOrder, seaFriends, guguMaster, mathPractice, stacked, partialSum, shareDivide, fraction, graph, eggs, equation, fallingShapes, ruler, symmetry, sudoku, gridLock, tangram,
  checkTest, enChallenge, towerDrop, messenger, starFall,
  iceBuild, missingWords, sentenceBricks, stickyStory, fixShip, bridgeType,
};

const app = document.getElementById('app');
const header = document.getElementById('appHeader');
let teardown = null;

const acornImg = (size) => h('img', { src: 'assets/acorn.svg', alt: '', width: size, height: size });
const glyphClass = (sub, extra = '') => `glyph${extra}${sub.latin ? ' latin' : sub.glyph.length > 2 ? ' wide' : ''}`;
const callName = (name) => `${name}${hasBatchim(name) ? '아' : '야'}`;
const lvInfo = (lv) => LEVELS[lv - 1];
const lvBadge = (lv, extra = '') => h('span', { class: `lv-badge${extra}` }, `${lvInfo(lv).e} Lv.${lv}`);
const go = (hash) => { location.hash = hash; };
// 레벨 대신 커리큘럼 차시 (한글 3-2 · 영어 Level C 2차시 · 수학 Level A의 A-1)
const stepOf = (p) => HANGUL_STEPS[p.hangulStep];
const unitOf = (p) => EN_UNITS[p.englishUnit];
const mathOf = (p) => MATH_UNITS[p.mathUnit];
const stepBadge = (step, extra = '') => h('span', { class: `lv-badge step-badge${extra}` }, `${step.stage}단계 ${step.no}차시`);
const unitBadge = (unit, extra = '') => h('span', { class: `lv-badge step-badge en-badge${extra}` }, `Level ${unit.code} · ${unit.no}차시`);
// 수학 상세 단계는 며칠씩 하므로 몇째 날인지(day, 0부터)도 붙인다
const mathBadge = (unit, extra = '', day = null) => h('span', { class: `lv-badge step-badge math-badge${extra}` }, `Level ${unit.code} · ${unit.id}${day == null ? '' : ` · ${day + 1}/${unit.days}일`}`);
const subjectBadge = (sub, p, extra = '') => (sub.id === 'hangul' ? stepBadge(stepOf(p), extra) : sub.id === 'english' ? unitBadge(unitOf(p), extra) : mathBadge(mathOf(p), extra, p.mathDay));
const subjectLevelText = (sub, p) => (sub.id === 'hangul' ? `한글 ${stepOf(p).id}` : sub.id === 'english' ? `영어 ${unitOf(p).id}` : `수학 ${mathOf(p).id}`);
const unitShort = (id, p) => (id === 'hangul' ? stepOf(p).id : id === 'english' ? unitOf(p).id : mathOf(p).id);
const curriculum = (id) => id === 'hangul' || id === 'english' || id === 'math';

function renderHeader() {
  const p = store.profile;
  const sound = h('button', {
    class: 'icon-btn',
    'aria-label': store.state.sound ? '소리 끄기' : '소리 켜기',
    onclick: () => { store.toggleSound(); if (!store.state.sound) stopSpeech(); renderHeader(); },
  }, store.state.sound ? '🔊' : '🔇');
  const brand = h('a', { class: 'brand', href: '#/', 'aria-label': '도토리숲 처음 화면' },
    acornImg(46),
    h('span', { class: 'brand-text' },
      h('span', { class: 'brand-name' }, '도토리숲'),
      h('span', { class: 'brand-sub' }, '한글 · 수학 · 영어 놀이 학습')));
  const adminLink = sync.admin ? h('a', { class: 'icon-btn', href: '#/admin', 'aria-label': '관리자 화면' }, '🛠️') : null;
  if (!p) {
    header.replaceChildren(...[brand, adminLink, sound].filter(Boolean));
    return;
  }
  header.replaceChildren(
    brand,
    h('a', { class: 'kid-chip', href: '#/profile', 'aria-label': `${p.name} 프로필` },
      h('span', { class: 'kid-avatar', 'aria-hidden': 'true' }, p.avatar), h('span', { class: 'kid-name' }, p.name)),
    h('a', { class: 'acorn-pill', href: '#/stickers', 'aria-label': `모은 도토리 ${p.acorns}개` }, acornImg(30), String(p.acorns)),
    h('a', { class: 'icon-btn sticker-link', href: '#/stickers', 'aria-label': '스티커북' }, '📒'),
    h('a', { class: 'icon-btn free-link', href: '#/free', 'aria-label': '자유 활동' }, '🎨'),
    h('a', { class: 'icon-btn report-link', href: '#/report', 'aria-label': '학습 리포트' }, '📊'),
    ...[adminLink, sound].filter(Boolean),
  );
}

const courseDone = (id) => store.profile.progress[id] >= store.getCourse(id).length;
const doneToday = () => Object.keys(SUBJECTS).filter(courseDone).length;

/* ---------- 로그인 · 등록 ---------- */
function viewLogin() {
  const profiles = store.state.profiles;
  return h('main', { class: 'page narrow' },
    accountBar(),
    h('section', { class: 'login-hero' },
      h('div', { class: 'mascot', 'aria-hidden': 'true' }, charFace('tori', '🐿️')),
      h('h1', {}, profiles.length ? '누가 공부할까요?' : '도토리숲에 온 걸 환영해요!'),
      h('p', { class: 'muted' }, profiles.length ? '내 얼굴을 눌러서 들어가요.' : '먼저 공부할 친구를 등록해 주세요.')),
    h('section', { class: 'profile-grid' },
      profiles.map((p) => h('button', {
        class: 'profile-card',
        type: 'button',
        onclick: () => { store.select(p.id); sfx.pop(); speak(`안녕, ${callName(p.name)}!`); go('#/'); },
      },
        h('span', { class: 'profile-avatar', 'aria-hidden': 'true' }, p.avatar),
        h('span', { class: 'profile-name' }, p.name),
        h('span', { class: 'profile-age' }, `${p.age}살`),
        h('span', { class: 'profile-levels' },
          Object.values(SUBJECTS).map((s) => h('span', {}, subjectLevelText(s, p)))))),
      h('a', { class: 'profile-card add', href: '#/join' },
        h('span', { class: 'profile-avatar', 'aria-hidden': 'true' }, '➕'),
        h('span', { class: 'profile-name' }, '새 친구 등록'))),
    h('p', { class: 'privacy-note' }, sync.user
      ? '🔒 아이 정보와 학습 기록은 보호자 계정에 저장돼요. 다른 기기에서 로그인해도 이어서 할 수 있어요.'
      : '🔒 아이 정보와 학습 기록은 이 기기의 브라우저에만 저장되고 서버로 보내지 않아요.'),
    versionLine());
}

function viewJoin(edit) {
  const p = edit ? store.profile : null;
  let age = p?.age ?? 5;
  let avatar = p?.avatar ?? AVATARS[0];
  const nameInput = h('input', {
    id: 'kidName', class: 'text-input', type: 'text', maxlength: 10, autocomplete: 'off',
    placeholder: '예) 하늘', value: p?.name ?? '', 'aria-describedby': 'nameError',
  });
  const nameError = h('p', { id: 'nameError', class: 'field-error', role: 'alert' });
  const preview = h('div', { class: 'level-preview' });
  const renderPreview = () => {
    preview.replaceChildren(
      h('span', { class: 'muted' }, '추천 시작 난이도'),
      ...Object.values(SUBJECTS).map((s) => h('span', { class: 'chip', 'data-subject': s.id },
        s.id === 'hangul' ? `한글 ${HANGUL_STEPS[startStepForAge(age)].stage}단계부터`
          : s.id === 'english' ? `영어 Level ${EN_UNITS[startUnitForAge(age)].code}부터` : `수학 Level ${MATH_UNITS[startMathUnitForAge(age)].code}부터`)));
  };
  const radioGroup = (name, values, current, label, onPick) => h('div', { class: 'chip-radios', role: 'radiogroup', 'aria-label': name },
    values.map((v) => h('label', { class: 'radio-chip' },
      h('input', { type: 'radio', name, value: v, checked: v === current, onchange: () => onPick(v) }),
      h('span', {}, label(v)))));

  const form = h('form', {
    class: 'panel join-form',
    novalidate: true,
    onsubmit: (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) {
        nameError.textContent = '이름을 적어 주세요.';
        nameInput.focus();
        return;
      }
      if (edit) {
        store.updateProfile({ name, age, avatar });
        go('#/profile');
      } else {
        store.addProfile({ name, age, avatar });
        sfx.win();
        speak(`반가워, ${callName(name)}! 같이 도토리를 모으자!`);
        go('#/');
      }
    },
  },
    h('label', { class: 'field-label', for: 'kidName' }, '이름 (별명도 좋아요)'),
    nameInput,
    nameError,
    h('p', { class: 'field-label' }, '나이'),
    radioGroup('age', [3, 4, 5, 6, 7, 8], age, (v) => (v === 8 ? '8살 이상' : `${v}살`), (v) => { age = v; renderPreview(); }),
    h('p', { class: 'field-label' }, '내 캐릭터'),
    radioGroup('avatar', AVATARS, avatar, (v) => h('span', { class: 'avatar-opt' }, v), (v) => { avatar = v; }),
    edit ? h('p', { class: 'muted' }, '난이도는 아래 프로필 화면의 "난이도 관리"에서 바꿀 수 있어요.') : preview,
    h('div', { class: 'form-actions' },
      h('button', { class: 'btn', type: 'submit' }, edit ? '저장하기' : '시작하기! 🌱'),
      h('a', { class: 'btn btn-ghost', href: edit ? '#/profile' : '#/login' }, '취소')));
  if (!edit) renderPreview();
  return h('main', { class: 'page narrow' },
    h('div', { class: 'subject-head' },
      h('a', { class: 'icon-btn', href: edit ? '#/profile' : '#/login', 'aria-label': '뒤로' }, '←'),
      h('div', {}, h('h1', { class: 'brand-title' }, edit ? '내 정보 고치기' : '새 친구 등록'),
        h('p', { class: 'muted' }, edit ? '' : '나이에 맞춰 시작 난이도를 정해 드려요.'))),
    form);
}

/* ---------- 프로필 · 난이도 관리 ---------- */
function viewProfile() {
  const p = store.profile;
  const avg = p.stats.games ? (p.stats.stars / p.stats.games).toFixed(1) : '-';
  const stat = (icon, label, value) => h('div', { class: 'stat' }, h('span', { class: 'stat-icon', 'aria-hidden': 'true' }, icon), h('b', {}, value), h('span', {}, label));
  return h('main', { class: 'page narrow' },
    h('section', { class: 'panel profile-head' },
      h('span', { class: 'profile-avatar big', 'aria-hidden': 'true' }, p.avatar),
      h('div', { class: 'profile-head-text' }, h('h1', {}, p.name), h('p', { class: 'muted' }, `${p.age}살 · ${p.createdAt}부터 함께해요`)),
      h('div', { class: 'profile-actions' },
        h('a', { class: 'btn btn-ghost', href: '#/profile/edit' }, '✏️ 정보 수정'),
        h('a', { class: 'btn btn-ghost', href: '#/report' }, '📊 학습 리포트'),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { store.logout(); go('#/login'); } }, '👋 친구 바꾸기'))),
    h('section', { class: 'panel' },
      h('h2', {}, '학습 기록'),
      h('div', { class: 'stat-grid' },
        stat('📅', '학습한 날', `${p.stats.days.length}일`),
        stat('🎮', '해낸 놀이', `${p.stats.games}개`),
        stat('⭐', '평균 별', avg),
        stat('🗺️', '끝낸 수업', `${p.stats.courses}번`),
        stat('⬆️', '레벨 업', `${p.stats.levelUps}번`),
        stat('📒', '스티커', `${p.stickers.length}개`))),
    h('section', { class: 'panel' },
      h('div', { class: 'panel-head' }, h('h2', {}, '난이도 관리'), h('span', { class: 'chip' }, '부모님용')),
      h('p', { class: 'muted' }, '한글은 14단계, 영어는 24단계(Level A ~ Z) 커리큘럼을 하루에 한 차시씩, 수학은 8단계(Level A ~ H)의 상세 단계를 2 ~ 4일씩 따라가요. 여기서 직접 바꿀 수도 있어요.'),
      h('div', { class: 'level-rows' }, Object.values(SUBJECTS).map((s) => levelRow(s)))),
    // 안드로이드 앱에서만: 연결할 서버(NAS) 주소 바꾸기, 앱 업데이트 확인 (1.8부터)
    window.DotoriNative ? h('section', { class: 'panel' },
      h('div', { class: 'panel-head' }, h('h2', {}, '앱 설정'), h('span', { class: 'chip' }, '부모님용')),
      h('p', { class: 'muted' }, `지금 연결한 서버: ${window.DotoriNative.getServer()}`),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => window.DotoriNative.changeServer() }, '🔌 서버 주소 바꾸기'),
      typeof window.DotoriNative.checkUpdate === 'function'
        ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => window.DotoriNative.checkUpdate() }, '🔄 앱 업데이트 확인')
        : null) : null,
    // 서버 계정 모드: 보호자 계정 · 로그아웃
    sync.user ? h('section', { class: 'panel' },
      h('div', { class: 'panel-head' }, h('h2', {}, '보호자 계정'), h('span', { class: 'chip' }, '부모님용')),
      h('p', { class: 'muted' }, `👤 ${sync.user.name} (${sync.user.username})로 로그인했어요.`),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: logout }, '🚪 로그아웃')) : null,
    h('section', { class: 'panel danger-zone' },
      h('h2', {}, '프로필 삭제'),
      h('p', { class: 'muted' }, '이 친구의 학습 기록, 도토리, 스티커, 앨범 작품이 모두 지워지고 되돌릴 수 없어요.'),
      h('button', {
        class: 'btn btn-danger',
        type: 'button',
        onclick: () => {
          if (!window.confirm(`${p.name} 프로필을 삭제할까요? 학습 기록과 앨범 작품이 모두 사라져요.`)) return;
          album.removeProfile(p.id).catch(() => {});
          store.removeProfile(p.id);
          go('#/login');
        },
      }, `${p.name} 프로필 삭제`)),
    versionLine());
}

// 한글: 단계·차시를 직접 고른다 (하루에 한 차시씩 저절로 나아간다)
function stepRow(sub) {
  const p = store.profile;
  const step = stepOf(p);
  const select = h('select', {
    id: 'hangulStep', class: 'step-select', 'aria-label': '한글 차시 고르기',
    onchange: (e) => { store.setHangulStep(Number(e.target.value)); sfx.pop(); route(); },
  }, HANGUL_STAGES.map((st) => h('optgroup', { label: `${st.n}단계 · ${st.title}` },
    HANGUL_STEPS.map((s, i) => [s, i]).filter(([s]) => s.stage === st.n)
      .map(([s, i]) => h('option', { value: i, selected: i === p.hangulStep }, `${s.id}  ${s.goal.slice(0, 28)}…`)))));
  return h('div', { class: 'level-row', 'data-subject': sub.id },
    h('div', { class: glyphClass(sub, ' tiny'), 'aria-hidden': 'true' }, sub.glyph),
    h('div', { class: 'level-row-text' },
      h('b', {}, sub.name, ' ', stepBadge(step)),
      h('span', { class: 'muted' }, `${step.stageTitle} · 오늘의 할 일을 모두 마치면 다음 날 다음 차시로 넘어가요.`)),
    select);
}

// 영어: 단계(Level A ~ Z)와 차시를 직접 고른다 (하루에 한 차시씩 저절로 나아간다)
function unitRow(sub) {
  const p = store.profile;
  const unit = unitOf(p);
  const select = h('select', {
    id: 'englishUnit', class: 'step-select', 'aria-label': '영어 단계와 차시 고르기',
    onchange: (e) => { store.setUnit('english', Number(e.target.value)); sfx.pop(); route(); },
  }, EN_LEVELS.map((lv) => h('optgroup', { label: `Level ${lv.code} · ${lv.title}` },
    EN_UNITS.map((u, i) => [u, i]).filter(([u]) => u.code === lv.code)
      .map(([u, i]) => h('option', { value: i, selected: i === p.englishUnit }, `${u.id}  ${u.goal.slice(0, 28)}…`)))));
  return h('div', { class: 'level-row', 'data-subject': sub.id },
    h('div', { class: glyphClass(sub, ' tiny'), 'aria-hidden': 'true' }, sub.glyph),
    h('div', { class: 'level-row-text' },
      h('b', {}, sub.name, ' ', unitBadge(unit)),
      h('span', { class: 'muted' }, `${unit.levelTitle} · 오늘의 할 일을 모두 마치면 다음 날 다음 차시로 넘어가요.`)),
    select);
}

// 수학: 단계(Level A ~ H)와 상세 단계를 직접 고른다 (하루에 하나씩 저절로 나아간다)
function mathRow(sub) {
  const p = store.profile;
  const unit = mathOf(p);
  const select = h('select', {
    id: 'mathUnit', class: 'step-select', 'aria-label': '수학 단계 고르기',
    onchange: (e) => { store.setUnit('math', Number(e.target.value)); sfx.pop(); route(); },
  }, MATH_LEVELS.map((lv) => h('optgroup', { label: `Level ${lv.code} · ${lv.title}` },
    MATH_UNITS.map((u, i) => [u, i]).filter(([u]) => u.code === lv.code)
      .map(([u, i]) => h('option', { value: i, selected: i === p.mathUnit }, `${u.id}  ${u.title} (${u.days}일)`)))));
  return h('div', { class: 'level-row', 'data-subject': sub.id },
    h('div', { class: glyphClass(sub, ' tiny'), 'aria-hidden': 'true' }, sub.glyph),
    h('div', { class: 'level-row-text' },
      h('b', {}, sub.name, ' ', mathBadge(unit, '', p.mathDay)),
      h('span', { class: 'muted' }, `${unit.title} · 상세 단계마다 ${unit.days}일쯤, 오늘의 할 일을 마칠 때마다 하루씩 나아가요.`)),
    select);
}

function levelRow(sub) {
  if (sub.id === 'hangul') return stepRow(sub);
  if (sub.id === 'english') return unitRow(sub);
  return mathRow(sub);
}

/* ---------- 홈 ---------- */
function viewHome() {
  const p = store.profile;
  const greeting = `안녕, ${callName(p.name)}! 나는 다람쥐 토리야. 오늘도 같이 도토리를 모으러 가 볼까?`;
  const grown = doneToday();
  const tree = TREE[grown];
  return h('main', { class: 'page' },
    h('section', { class: 'hero' },
      h('button', { class: 'mascot', 'aria-label': '토리 인사 듣기', onclick: (e) => { sfx.tap(); speak(greeting); e.currentTarget.classList.remove('pop'); void e.currentTarget.offsetWidth; e.currentTarget.classList.add('pop'); } }, charFace('tori', '🐿️')),
      h('div', { class: 'bubble' },
        h('p', { class: 'bubble-name' }, '다람쥐 토리'),
        h('p', { class: 'bubble-text' }, greeting)),
      h('div', { class: 'tree-card' },
        h('div', { class: 'tree-emoji', 'aria-hidden': 'true' }, tree.e),
        h('div', {},
          h('p', { class: 'tree-title' }, '오늘의 도토리나무'),
          h('p', { class: 'tree-stage' }, tree.label),
          h('div', { class: 'tree-dots', 'aria-label': `오늘 수업 ${grown}/3 완료` },
            [0, 1, 2].map((i) => h('span', { class: i < grown ? 'on' : '' })))))),
    h('h2', { class: 'section-title' }, '오늘은 무엇을 배워 볼까?'),
    h('section', { class: 'subject-grid' }, Object.values(SUBJECTS).map(subjectCard)),
    h('section', { class: 'free-banner' },
      h('div', { class: 'free-banner-text' },
        h('h2', {}, '🎨 자유 활동'),
        h('p', { class: 'muted' }, '그리기 · 색칠하기 · 쓰기 · 카드 만들기. 점수도 보상도 없이 마음껏 하고, 작품은 앨범에 모아요.')),
      h('div', { class: 'free-banner-actions' },
        h('a', { class: 'btn', href: '#/free' }, '🎨 자유 활동'),
        h('a', { class: 'btn btn-ghost', href: '#/album' }, '🖼️ 내 앨범'))),
    h('section', { class: 'panel' },
      h('h2', {}, '부모님께'),
      h('div', { class: 'parent-note' },
        noteItem('🗓️', '한글 14단계 커리큘럼', '하루에 한 차시씩, 그날 배울 글자와 낱말에 맞춘 6개 놀이로 오늘의 할 일이 짜여요.'),
        noteItem('📝', '한글 확인 퀴즈', `오늘의 할 일을 ${CHECK_EVERY}번 하면 최근 차시를 10문제로 확인해요. ${Math.round(CHECK_PASS * 100)}%를 넘지 못하면 다음 날 가장 어려워한 차시를 다시 해요.`),
        noteItem('🔤', '영어 24단계(Level A ~ Z)', '알파벳 → 파닉스 → 문장 규칙 → 독해 · 회화 순서로, 단계 목표에 맞춘 6개 놀이가 하루 한 차시씩 짜여요.'),
        noteItem('🔢', '수학 8단계(Level A ~ H)', '10까지 수부터 나눗셈 · 분수까지 36개 상세 단계를 2 ~ 4일씩, 그 단계 목표에 맞춘 6개 놀이로 날마다 다르게 따라가요.'),
        noteItem('🙆', '틀려도 괜찮아요', '벌점이 없어요. 2번 틀리면 정답이 반짝이고, 3번이면 손가락이 알려 줘요.'))));
}

function noteItem(icon, title, text) {
  return h('div', { class: 'note-item' }, h('span', { class: 'note-icon', 'aria-hidden': 'true' }, icon), h('p', { class: 'muted' }, h('b', {}, title), text));
}

function subjectCard(sub) {
  const p = store.profile;
  const len = store.getCourse(sub.id).length;
  const prog = Math.min(p.progress[sub.id], len);
  const cta = prog >= len ? '오늘 수업 완료! 🎉' : prog > 0 ? '수업 이어서 하기 ▶' : '오늘의 수업 ▶';
  const hangul = sub.id === 'hangul';
  const english = sub.id === 'english';
  return h('article', { class: 'subject-card', 'data-subject': sub.id },
    h('div', { class: 'subject-top' },
      h('div', { class: glyphClass(sub), 'aria-hidden': 'true' }, sub.glyph),
      h('div', {},
        h('h3', {}, sub.name),
        h('p', { class: 'course-name' }, `${sub.courseName} · ${sub.minutes}`),
        subjectBadge(sub, p, ' on-card'))),
    h('p', { class: 'tagline' }, hangul ? `${stepOf(p).stageTitle} · ${stepOf(p).goal}`
      : english ? `${unitOf(p).levelTitle} · ${unitOf(p).goal}` : `${mathOf(p).id} ${mathOf(p).title} · ${mathOf(p).goal}`),
    h('div', { class: 'progress-row' },
      h('div', { class: 'progress', role: 'progressbar', 'aria-label': '오늘 수업 진행', 'aria-valuemin': 0, 'aria-valuemax': len, 'aria-valuenow': prog },
        h('i', { style: { width: `${(prog / len) * 100}%` } })),
      h('span', {}, `${prog}/${len}`)),
    h('div', { class: 'card-actions' },
      h('a', { class: 'btn', href: `#/s/${sub.id}` }, cta),
      h('a', { class: 'btn btn-ghost', href: `#/extra/${sub.id}` }, '🎮 추가 학습')));
}

/* ---------- 과목: 오늘의 수업 ---------- */
function viewSubject(id) {
  const sub = SUBJECTS[id];
  const p = store.profile;
  const course = store.getCourse(id);
  const prog = p.progress[id];
  return h('main', { class: 'page', 'data-subject': id },
    h('div', { class: 'subject-head' },
      h('a', { class: 'icon-btn', href: '#/', 'aria-label': '처음 화면으로' }, '←'),
      h('div', { class: glyphClass(sub, ' small'), 'aria-hidden': 'true' }, sub.glyph),
      h('div', {}, h('h1', {}, sub.name), h('p', { class: 'muted' }, sub.tagline))),
    id === 'hangul' ? lessonPanel() : id === 'english' ? enLessonPanel() : mathLessonPanel(),
    h('section', { class: 'panel' },
      h('div', { class: 'panel-head' },
        h('h2', {}, `오늘의 ${sub.courseName}`),
        h('span', { class: 'chip' }, `⏱ ${sub.minutes}`)),
      h('p', { class: 'muted' }, sub.courseDesc),
      courseMap(id, course, prog),
      prog >= course.length
        ? h('div', { class: 'course-done' }, '🎉 오늘 수업 완료! 내일은 새로운 놀이로 만나요.', h('a', { class: 'btn btn-ghost', href: `#/extra/${id}` }, '🎮 추가 학습 하러 가기'))
        : null),
    id === 'english' ? challengeBanner() : null,
    h('a', { class: 'extra-banner', href: `#/extra/${id}` },
      h('span', { class: 'extra-banner-icon', 'aria-hidden': 'true' }, '🎮'),
      h('span', {}, h('b', {}, '추가 학습'), id === 'hangul' ? `한글 미니게임 ${sub.games.length}개를 ${stepOf(p).id}차시 내용으로 골라서 해요`
        : id === 'english' ? `영어 미니게임 ${sub.games.length}개를 Level ${unitOf(p).code} ${unitOf(p).no}차시 내용으로 골라서 해요` : `수학 미니게임 ${sub.games.length}개를 ${mathOf(p).id} 단계에 맞춰 골라서 해요`),
      h('span', { class: 'step-cta' }, '▶')));
}

// 한글 커리큘럼: 지금 단계의 차시들, 오늘 배울 낱자, 14단계 길
function lessonPanel() {
  const p = store.profile;
  const step = stepOf(p);
  const lesson = lessonOf(p.hangulStep);
  const stage = HANGUL_STAGES[step.stage - 1];
  const focusView = lesson.kind === 'rule'
    ? h('span', { class: 'lesson-rule' }, lesson.ruleName)
    : lesson.focus.length
      ? lesson.focus.map((c, i) => h('span', { class: 'lesson-glyph', style: { animationDelay: `${i * 0.12}s` } }, c))
      : h('span', { class: 'lesson-rule' }, { vocab: '그림 낱말', jamoShape: 'ㄱ ~ ㅎ · ㅏ ~ ㅣ', theme: '통글자 낱말', cv: '자음 + 모음', finals: '여러 받침', mix: '모두 모아 읽기' }[lesson.kind]);
  return h('section', { class: 'panel lesson-panel' },
    h('div', { class: 'lesson-head' },
      h('div', {},
        h('p', { class: 'lesson-kicker' }, `${stage.n}단계 · ${stage.title}`),
        h('h2', { class: 'lesson-title' }, `${step.no}차시 오늘의 목표`),
        h('p', { class: 'lesson-goal' }, step.goal)),
      h('div', { class: 'lesson-focus', 'aria-label': '오늘 배우는 것' }, focusView)),
    h('ol', { class: 'lesson-steps', 'aria-label': `${stage.n}단계 차시` },
      stage.steps.map((s, i) => {
        const idx = HANGUL_STEPS.findIndex((x) => x.stage === stage.n && x.no === i + 1);
        const state = idx < p.hangulStep ? 'done' : idx === p.hangulStep ? 'now' : '';
        return h('li', { class: state }, h('b', {}, `${stage.n}-${i + 1}`), state === 'done' ? '✓' : state === 'now' ? '오늘' : '');
      })),
    h('div', { class: 'stage-track', 'aria-label': `14단계 중 ${stage.n}단계` },
      HANGUL_STAGES.map((st) => h('span', { class: st.n < stage.n ? 'done' : st.n === stage.n ? 'now' : '', title: `${st.n}단계 ${st.title}` },
        h('img', { class: 'stage-badge', src: `assets/ui/stage-${String(st.n).padStart(2, '0')}.webp`, alt: '', onerror: (e) => e.currentTarget.remove() }), h('i', {}, st.n)))),
    checkRow(p),
    h('p', { class: 'hint-text' }, '오늘의 할 일을 모두 마치면 내일은 다음 차시로 넘어가요. 차시는 프로필 화면에서 바꿀 수 있어요.'));
}

// 확인 퀴즈까지 남은 날과 지난 결과
function checkRow(p) {
  const done = p.hangulRecent.length;
  const last = p.checks[p.checks.length - 1];
  const today = done >= CHECK_EVERY - 1;
  return h('div', { class: 'check-row' },
    h('span', { class: 'check-days', 'aria-label': `확인 퀴즈까지 오늘의 할 일 ${CHECK_EVERY}번 중 ${done + 1}번째` },
      Array.from({ length: CHECK_EVERY }, (_, i) => h('i', { class: i < done ? 'on' : i === done ? 'now' : '' }, i === CHECK_EVERY - 1 ? '📝' : ''))),
    h('span', {}, today ? '오늘은 할 일을 마치면 📝 확인 퀴즈를 봐요!' : `오늘의 할 일을 ${CHECK_EVERY - done}번 더 하면 📝 확인 퀴즈를 봐요.`,
      last ? h('small', {}, ` 지난 퀴즈 ${last.score}/${last.total}${last.pass ? ' 통과' : ` · ${HANGUL_STEPS[last.review].id}차시 복습`}`) : null));
}

// 영어 커리큘럼: 오늘 차시의 목표와 배우는 것, 단계 학습 목표, 단계의 4차시, 24단계 길
function enLessonPanel() {
  const p = store.profile;
  const unit = unitOf(p);
  const lesson = enUnitOf(p.englishUnit);
  const level = EN_LEVELS[unit.levelIndex];
  const glyphs = unit.letters?.length && unit.letters.length <= 5;
  const focusView = glyphs
    ? unit.letters.map((L, i) => h('span', { class: 'lesson-glyph latin', style: { animationDelay: `${i * 0.12}s` } }, `${L}${L.toLowerCase()}`))
    : h('span', { class: 'lesson-rule latin' }, lesson.show || level.title);
  return h('section', { class: 'panel lesson-panel en' },
    h('div', { class: 'lesson-head' },
      h('div', {},
        h('p', { class: 'lesson-kicker' }, `Level ${level.code} · ${level.title}`),
        h('h2', { class: 'lesson-title' }, `${unit.no}차시 오늘의 목표`),
        h('p', { class: 'lesson-goal' }, unit.goal)),
      h('div', { class: 'lesson-focus', 'aria-label': '오늘 배우는 것' }, focusView)),
    h('details', { class: 'level-goal' },
      h('summary', {}, `Level ${level.code} 학습 목표`),
      h('p', {}, level.goal)),
    h('ol', { class: 'lesson-steps', 'aria-label': `Level ${level.code} 차시` },
      level.units.map((u, i) => {
        const idx = EN_UNITS.findIndex((x) => x.code === level.code && x.no === i + 1);
        const state = idx < p.englishUnit ? 'done' : idx === p.englishUnit ? 'now' : '';
        return h('li', { class: state }, h('b', {}, `${level.code}-${i + 1}`), state === 'done' ? '✓' : state === 'now' ? '오늘' : '');
      })),
    h('div', { class: 'stage-track latin', 'aria-label': `24단계 중 Level ${level.code}` },
      EN_LEVELS.map((lv, i) => h('span', { class: i < unit.levelIndex ? 'done' : i === unit.levelIndex ? 'now' : '', title: `Level ${lv.code} ${lv.title}` }, lv.code))),
    h('p', { class: 'hint-text' }, '오늘의 할 일을 모두 마치면 내일은 다음 차시로 넘어가요. 단계와 차시는 프로필 화면에서 바꿀 수 있어요.'));
}

// 수학 커리큘럼: 오늘 상세 단계의 목표, 단계의 상세 단계들, 8단계 길
function mathLessonPanel() {
  const p = store.profile;
  const unit = mathOf(p);
  const level = MATH_LEVELS[unit.levelIndex];
  return h('section', { class: 'panel lesson-panel math' },
    h('div', { class: 'lesson-head' },
      h('div', {},
        h('p', { class: 'lesson-kicker' }, `Level ${level.code} · ${level.title}`),
        h('h2', { class: 'lesson-title' }, `${unit.id} ${unit.title}`),
        h('p', { class: 'lesson-goal' }, unit.goal),
        h('p', { class: 'math-days', 'aria-label': `${unit.days}일 중 ${p.mathDay + 1}일째` },
          Array.from({ length: unit.days }, (_, d) => h('i', { class: d < p.mathDay ? 'done' : d === p.mathDay ? 'now' : '' })),
          h('span', {}, `${unit.days}일 중 ${p.mathDay + 1}일째`))),
      h('div', { class: 'lesson-focus', 'aria-label': '오늘 배우는 것' }, h('span', { class: 'lesson-rule' }, unit.show))),
    h('ol', { class: 'lesson-steps', 'aria-label': `Level ${level.code} 상세 단계` },
      level.units.map((u, i) => {
        const idx = MATH_UNITS.findIndex((x) => x.code === level.code && x.no === i + 1);
        const state = idx < p.mathUnit ? 'done' : idx === p.mathUnit ? 'now' : '';
        return h('li', { class: state, title: `${u.title} (${u.days}일)` }, h('b', {}, `${level.code}-${i + 1}`), state === 'done' ? '✓' : state === 'now' ? `${p.mathDay + 1}/${u.days}일` : '');
      })),
    h('div', { class: 'stage-track latin', 'aria-label': `8단계 중 Level ${level.code}` },
      MATH_LEVELS.map((lv, i) => h('span', { class: i < unit.levelIndex ? 'done' : i === unit.levelIndex ? 'now' : '', title: `Level ${lv.code} ${lv.title}` }, lv.code))),
    h('p', { class: 'hint-text' }, '상세 단계 하나를 며칠 동안 해요. 날마다 다른 놀이가 나오고, 마지막 날까지 마치면 다음 단계로 넘어가요. 단계는 프로필 화면에서 바꿀 수 있어요.'));
}

/* ---------- 수업 지도 ----------
   넓은 화면은 ㄹ자 두 줄, 좁은 화면은 지그재그 한 줄로 단계 자리를 놓는다 (좌표는 지도 크기의 %) */
const MAP_DECOR = {
  hangul: ['🌳', '🍄', '🌼', '🌲', '🐞', '🌷', '🍀', '🌳'],
  math: ['🌵', '⛺', '🌴', '🍭', '🦎', '🌵', '☀️', '🏜️'],
  english: ['🏝️', '🐚', '⛵', '🐠', '🌴', '🦀', '🐳', '🌊'],
};

function mapPoints(n, wide) {
  if (!wide) return Array.from({ length: n }, (_, i) => [i % 2 ? 73 : 27, 10 + (81 * i) / Math.max(1, n - 1)]);
  const top = Math.ceil(n / 2);
  const bottom = n - top;
  const xs = (k) => Array.from({ length: k }, (_, i) => (k === 1 ? 50 : 12 + (76 * i) / (k - 1)));
  return [
    ...xs(top).map((x, i) => [x, i % 2 ? 24 : 30]),
    ...xs(bottom).reverse().map((x, i) => [x, i % 2 ? 76 : 70]),
  ];
}

// 점들을 부드럽게 지나는 곡선 (Catmull-Rom → 베지어)
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function mapSvg(pts, prog, cls) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', `map-svg ${cls}`);
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const path = (d, c) => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    p.setAttribute('class', c);
    p.setAttribute('vector-effect', 'non-scaling-stroke');
    return p;
  };
  const all = smoothPath(pts);
  svg.append(path(all, 'road-edge'), path(all, 'road'), path(all, 'road-dash'));
  if (prog > 0) svg.append(path(smoothPath(pts.slice(0, Math.min(prog, pts.length - 1) + 1)), 'road-done'));
  return svg;
}

function courseMap(id, course, prog) {
  const n = course.length;
  const wide = mapPoints(n, true);
  const narrow = mapPoints(n, false);
  const decorWide = [[25, 50], [50, 47], [75, 53], [4, 7], [96, 8], [50, 96], [96, 93], [4, 92]];
  const decorNarrow = narrow.map(([x, y]) => [x < 50 ? 82 : 18, y]);
  const done = prog >= n;
  return h('ol', { class: 'course-map', 'data-subject': id, 'aria-label': `오늘의 수업 지도, ${n}단계 중 ${Math.min(prog, n)}단계 완료` },
    mapSvg(wide, prog, 'wide'),
    mapSvg(narrow, prog, 'narrow'),
    MAP_DECOR[id].map((e, i) => [
      h('span', { class: 'map-decor wide', 'aria-hidden': 'true', style: { left: `${decorWide[i][0]}%`, top: `${decorWide[i][1]}%` } }, e),
      decorNarrow[i] ? h('span', { class: 'map-decor narrow', 'aria-hidden': 'true', style: { left: `${decorNarrow[i][0]}%`, top: `${decorNarrow[i][1]}%` } }, e) : null,
    ]),
    course.map((st, i) => {
      const g = GAMES[st.key];
      const state = i < prog ? 'done' : i === prog ? 'current' : 'locked';
      const here = state === 'current' || (done && i === n - 1);
      const inner = [
        h('span', { class: 'map-node', 'aria-hidden': 'true' },
          h('span', { class: 'map-icon' }, g.icon),
          h('span', { class: 'map-num' }, i + 1),
          i === n - 1 ? h('span', { class: 'map-goal' }, '🏆') : null,
          here ? h('span', { class: 'map-tori' }, charFace('tori-point', '🐿️')) : null),
        h('span', { class: 'map-label' }, h('small', {}, st.stage), h('b', {}, st.opts?.title || g.title)),
      ];
      const label = `${i + 1}단계 ${st.stage}: ${st.opts?.title || g.title}, ${state === 'done' ? '완료, 다시 하기' : state === 'current' ? '지금 할 차례' : '아직 잠겨 있어요'}`;
      return h('li', {
        class: `map-stop ${state}`,
        style: { '--x': `${wide[i][0]}%`, '--y': `${wide[i][1]}%`, '--nx': `${narrow[i][0]}%`, '--ny': `${narrow[i][1]}%` },
      }, state === 'locked'
        ? h('div', { class: 'map-link', 'aria-disabled': 'true', 'aria-label': label }, inner)
        : h('a', { class: 'map-link', href: `#/play/${st.key}?step=${i}`, 'aria-label': label }, inner));
    }));
}

/* ---------- 추가 학습 ---------- */
function viewExtra(id) {
  const sub = SUBJECTS[id];
  const p = store.profile;
  return h('main', { class: 'page', 'data-subject': id },
    h('div', { class: 'subject-head' },
      h('a', { class: 'icon-btn', href: '#/', 'aria-label': '처음 화면으로' }, '←'),
      h('div', {}, h('h1', {}, '🎮 추가 학습'), h('p', { class: 'muted' }, '하고 싶은 과목과 미니게임을 마음대로 골라요.'))),
    h('nav', { class: 'subject-tabs', 'aria-label': '과목 선택' },
      Object.values(SUBJECTS).map((s) => h('a', {
        class: `subject-tab${s.id === id ? ' active' : ''}`,
        href: `#/extra/${s.id}`,
        'data-subject': s.id,
        'aria-current': s.id === id ? 'page' : null,
      }, h('span', { class: glyphClass(s, ' tiny'), 'aria-hidden': 'true' }, s.glyph), s.name, ' ', h('small', {}, unitShort(s.id, p))))),
    h('section', { class: 'panel' },
      h('div', { class: 'panel-head' },
        h('h2', {}, `${sub.name} 미니게임 ${sub.games.length}개`),
        subjectBadge(sub, p)),
      h('p', { class: 'muted' }, id === 'hangul'
        ? `지금 배우는 ${stepOf(p).id}차시(${stepOf(p).stageTitle})의 글자와 낱말로 놀아요.`
        : id === 'english' ? `지금 배우는 Level ${unitOf(p).code} ${unitOf(p).no}차시(${unitOf(p).levelTitle})의 글자 · 단어 · 문장으로 놀아요.`
          : `지금 배우는 ${mathOf(p).id} ${mathOf(p).title}에 맞춘 수와 난이도로 놀아요.`),
      h('div', { class: 'game-grid' }, sub.games.map((key) => {
        const g = GAMES[key];
        const count = p.played[key] || 0;
        return h('a', { class: 'game-card', href: `#/play/${key}`, title: g.uKey },
          h('span', { class: 'gi', 'aria-hidden': 'true' }, g.icon),
          h('span', { class: 'gt' }, g.title),
          h('span', { class: 'gd' }, g.desc),
          h('span', { class: 'gp' }, count ? `${count}번 했어요` : 'NEW'));
      }))),
    id === 'english' ? challengeBanner() : null,
    h('a', { class: 'extra-banner', href: `#/s/${id}` },
      h('span', { class: 'extra-banner-icon', 'aria-hidden': 'true' }, '🗺️'),
      h('span', {}, h('b', {}, `오늘의 ${sub.courseName}`), `${p.progress[id]}/${store.getCourse(id).length} 진행 중`),
      h('span', { class: 'step-cta' }, '▶')));
}

// 영어 챌린지 지도로 가는 띠
function challengeBanner() {
  return h('a', { class: 'extra-banner challenge-banner', href: '#/challenges' },
    h('span', { class: 'extra-banner-icon', 'aria-hidden': 'true' }, '🏕️'),
    h('span', {}, h('b', {}, '영어 챌린지 지도'), `워드 · 파닉스 · 리스닝 · 그래머 챌린지를 ${STAGES}단계씩 올라가요`),
    h('span', { class: 'step-cta' }, '▶'));
}

/* ---------- 스티커북 ---------- */
function viewStickers() {
  const p = store.profile;
  return h('main', { class: 'page' },
    h('div', { class: 'subject-head' },
      h('a', { class: 'icon-btn', href: '#/', 'aria-label': '처음 화면으로' }, '←'),
      h('div', {}, h('h1', { class: 'brand-title' }, '📒 숲속 친구 스티커북'),
        h('p', { class: 'muted' }, '과목별 일일 수업을 끝까지 마치면 스티커와 도토리 10개를 받아요.'))),
    h('section', { class: 'panel' },
      h('div', { class: 'panel-head' },
        h('h2', {}, `${p.name}의 스티커 ${p.stickers.length} / ${STICKERS.length}`),
        h('span', { class: 'reward-acorns' }, acornImg(30), `${p.acorns}`)),
      h('div', { class: 'sticker-grid' },
        STICKERS.map((s, i) => p.stickers.includes(s)
          ? h('div', { class: 'sticker got', style: { animationDelay: `${i * 0.03}s` } }, stickerPic(s))
          : h('div', { class: 'sticker locked', 'aria-label': '아직 못 받은 스티커' }, '?')))));
}

/* ---------- 게임 플레이어 ---------- */
function viewPlay(key, params) {
  const g = GAMES[key];
  const sub = SUBJECTS[g.subject];
  const p = store.profile;
  const course = store.getCourse(g.subject);
  const stepParam = params.get('step');
  const step = stepParam === null ? -1 : Number(stepParam);
  const inCourse = course[step]?.key === key;
  const lvParam = Number(params.get('lv'));
  // 커리큘럼 과목은 지금 차시의 내용(lesson · unit · 수학 상세 단계)으로 논다. 놀이 손놀림 난이도도 차시가 정한다
  const hangul = g.subject === 'hangul';
  const english = g.subject === 'english';
  const math = g.subject === 'math';
  const lesson = hangul ? lessonOf(p.hangulStep) : null;
  // 챌린지 지도에서 고른 단계는 그 단계에 정해 둔 차시 내용으로 논다
  const ckind = kindOfGame(key);
  const cstage = ckind && !inCourse ? Number(params.get('stage')) || 0 : 0;
  const chal = cstage >= 1 && cstage <= STAGES ? { kind: ckind, stage: cstage } : null;
  const unit = english ? enUnitOf(chal ? stageUnitIndex(chal.kind, chal.stage) : p.englishUnit) : null;
  // 수학: 오늘의 할 일 칸은 그 칸에 정해 둔 난이도 · 내용, 추가 학습은 지금 상세 단계에서 이 놀이의 설정 (mu=상세 단계로 바꿔 볼 수 있다)
  const mUnit = math ? (MATH_UNITS.find((u) => u.id === params.get('mu')) || mathOf(p)) : null;
  const tune = math ? (inCourse ? course[step] : mathTune(mUnit, key, Number(params.get('k')) || 0)) : null;
  const fixed = lesson || unit || tune;
  const level = lvParam >= 1 && lvParam <= MAX_LEVEL ? lvParam : fixed ? (tune ? tune.lv : fixed.level) : p.levels[g.subject];
  const challenge = !fixed && !inCourse && params.get('ch') === '1' && level > p.levels[g.subject];
  const opts = { ...(g.opts || {}), ...(tune?.opts || {}), ...(tune?.cfg ? { cfg: tune.cfg } : {}) };
  const title = opts.title || g.title;
  const mode = { inCourse, step, challenge, level, chal, startedAt: Date.now() };

  const dots = h('div', { class: 'dots', 'aria-hidden': 'true' });
  const promptText = h('p', { class: 'prompt-text', 'aria-live': 'polite' });
  const stage = h('div', { class: 'stage' });
  let replay = () => {};
  const chipText = inCourse ? `${sub.courseName} ${step + 1}/${course.length} · ${course[step].stage}` : chal ? `🗺️ ${chal.stage}단계` : challenge ? '⬆ 도전 모드' : '추가 학습';
  const root = h('div', { class: 'player', 'data-subject': g.subject, 'data-scene': g.scene },
    h('header', { class: 'player-bar' },
      h('a', { class: 'icon-btn', href: inCourse ? `#/s/${g.subject}` : chal ? `#/challenge/${chal.kind}` : `#/extra/${g.subject}`, 'aria-label': '그만하고 나가기' }, '✕'),
      h('div', { class: 'player-title' },
        h('span', { class: 'player-icon', 'aria-hidden': 'true' }, g.icon),
        h('span', {}, title),
        h('span', { class: `chip${challenge ? ' chip-challenge' : ''}` }, chipText),
        hangul ? stepBadge(stepOf(p)) : english ? unitBadge(chal ? EN_UNITS[unit.index] : unitOf(p)) : math ? mathBadge(mUnit, '', mUnit === mathOf(p) ? p.mathDay : null) : lvBadge(level)),
      dots),
    h('div', { class: 'prompt-row' },
      h('button', { class: 'speaker-btn', 'aria-label': '다시 듣기', onclick: () => { sfx.tap(); replay(); } }, '🔊'),
      promptText),
    stage);

  const timers = new Set();
  const cleanups = [];
  let alive = true;
  let finished = false;
  const ctx = {
    subject: g.subject,
    opts,
    level,
    lesson,
    unit,
    mathUnit: mUnit,
    // 확인 퀴즈가 묻는 차시: 지난 확인 퀴즈 뒤로 마친 차시들과 오늘 차시
    checkSteps: hangul ? [...p.hangulRecent, p.hangulStep] : null,
    lang: g.subject === 'english' ? 'en' : 'ko',
    get alive() { return alive; },
    prompt(text, say, { auto = true } = {}) {
      promptText.textContent = text;
      promptText.classList.remove('enter');
      void promptText.offsetWidth;
      promptText.classList.add('enter');
      replay = say || (() => {});
      if (auto) ctx.later(() => replay(), 300);
    },
    progress(i, n) {
      dots.replaceChildren(...Array.from({ length: n }, (_, k) => h('i', { class: k < i ? 'on' : k === i ? 'now' : '' })));
    },
    later(fn, ms) {
      const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
      timers.add(id);
      return id;
    },
    onCleanup(fn) { cleanups.push(fn); },
    finish(result) {
      if (finished || !alive) return;
      finished = true;
      dots.querySelectorAll('i').forEach((d) => { d.className = 'on'; });
      showReward(root, key, result, mode);
    },
  };
  teardown = () => {
    alive = false;
    timers.forEach(clearTimeout);
    cleanups.forEach((fn) => { try { fn(); } catch {} });
  };
  root.mount = () => MODULES[g.module].mount(stage, ctx);
  return root;
}

function showReward(root, key, res, { inCourse, step, challenge, level, chal, startedAt }) {
  const g = GAMES[key];
  const sub = SUBJECTS[g.subject];
  const p = store.profile;
  const ratio = res.total ? res.firstTry / res.total : 1;
  const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
  let acorns = (inCourse ? 3 : 1) + stars + (res.bonus || 0) + (challenge ? 2 : 0);
  store.markPlayed(key);
  // 이용 기록 · 리포트: 어떤 놀이를 어느 차시로 해서 몇 개 맞혔는지, 얼마나 걸렸는지
  const unitText = g.subject === 'english' && chal ? `${CHALLENGES[chal.kind].name} ${chal.stage}단계` : unitShort(g.subject, p);
  store.recordPlay({ key, subject: g.subject, stars, correct: res.firstTry, total: res.total, unit: unitText, ms: Date.now() - startedAt });
  sync.log('play', {
    kid: p.id, game: key, title: g.title, subject: g.subject, stars, score: res.firstTry, total: res.total, course: inCourse, unit: unitText,
  });
  const { levelUp } = store.recordResult(g.subject, stars, { level, challenge });
  if (levelUp) acorns += 5;
  // 확인 퀴즈: 70%를 넘으면 그대로 나아가고, 아니면 내일 가장 약한 차시를 다시 한다
  const check = inCourse && res.check ? { ...res.check, ...store.recordCheck(res.check) } : null;

  let sticker = null;
  let courseFinished = false;
  if (inCourse && store.completeStep(g.subject, step) && p.progress[g.subject] >= store.getCourse(g.subject).length) {
    courseFinished = true;
    acorns += 10;
    sticker = store.awardSticker(STICKERS);
  }
  // 챌린지 지도 단계: 5문제 중 3문제 이상이면 통과 → 다음 단계가 열리고, 선물 단계는 처음 통과할 때 스티커
  const stage = chal ? store.recordChallenge(chal.kind, chal.stage, { score: res.firstTry, total: res.total, stars, last: STAGES }) : null;
  if (stage?.gift) {
    acorns += 5;
    sticker = store.awardSticker(STICKERS) || sticker;
  }
  store.addAcorns(acorns);

  const course = store.getCourse(g.subject);
  const nextIdx = p.progress[g.subject];
  const hasNext = inCourse && nextIdx < course.length;
  const curLv = p.levels[g.subject];
  const title = check ? (check.pass ? '확인 퀴즈 통과!' : '확인 퀴즈 끝!') : stage ? (stage.pass ? `${chal.stage}단계 통과!` : '조금만 더 해 볼까요?') : levelUp ? '레벨 업!' : courseFinished ? `${sub.courseName} 완료!` : stars === 3 ? '참 잘했어요!' : stars === 2 ? '멋지게 해냈어요!' : '끝까지 해냈어요!';

  const actions = [];
  if (stage) actions.push(h('a', { class: 'btn', href: `#/challenge/${chal.kind}` }, stage.opened ? `🗺️ ${chal.stage + 1}단계로 가기` : '🗺️ 지도로 돌아가기'));
  else if (hasNext) actions.push(h('a', { class: 'btn', href: `#/play/${course[nextIdx].key}?step=${nextIdx}` }, `다음 활동 ▶ (${nextIdx + 1}/${course.length})`));
  else if (inCourse) actions.push(h('a', { class: 'btn', href: `#/extra/${g.subject}` }, '🎮 추가 학습 하러 가기'));
  else if (challenge && !levelUp) actions.push(h('a', { class: 'btn btn-sun', href: `#/play/${key}?lv=${level}&ch=1&again=${Date.now()}` }, '🔁 다시 도전'));
  else actions.push(h('a', { class: 'btn', href: `#/play/${key}?again=${Date.now()}` }, '🔁 한 번 더!'));
  if (!curriculum(g.subject) && !inCourse && !challenge && curLv < MAX_LEVEL) {
    actions.push(h('a', { class: 'btn btn-sun', href: `#/play/${key}?lv=${curLv + 1}&ch=1` }, `⬆ Lv.${curLv + 1} 도전`));
  }
  if (!stage) actions.push(h('a', { class: 'btn btn-ghost', href: inCourse ? `#/s/${g.subject}` : `#/extra/${g.subject}` }, inCourse ? '수업 지도' : '목록으로'));

  const overlay = h('div', { class: 'reward', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'reward-card' },
      h('div', { class: 'stars', 'aria-label': `별 ${stars}개` },
        [1, 2, 3].map((i) => h('span', { class: i <= stars ? 'on' : '', style: { animationDelay: `${i * 0.18}s` } }, '⭐'))),
      courseFinished ? h('div', { class: 'reward-tori', 'aria-hidden': 'true' }, charFace('tori-hug', '🐿️')) : null,
      h('h2', { class: 'reward-title' }, title),
      levelUp
        ? h('div', { class: 'levelup' },
          h('span', { class: 'levelup-emoji', 'aria-hidden': 'true' }, lvInfo(levelUp).e),
          h('b', {}, `${sub.name} Lv.${levelUp} ${lvInfo(levelUp).name}`),
          h('span', {}, `이제 "${sub.levelDesc[levelUp - 1]}" 단계예요!`))
        : null,
      challenge && !levelUp ? h('p', { class: 'muted' }, `도전 놀이에서 별 3개를 받으면 Lv.${level}로 올라가요. 조금만 더 해 볼까요?`) : null,
      check
        ? h('div', { class: `check-result${check.pass ? ' pass' : ''}` },
          h('b', {}, `${check.total}문제 중 ${check.score}개 맞혔어요`),
          h('span', {}, check.pass
            ? `${Math.round(CHECK_PASS * 100)}%를 넘었어요! 배운 것을 잘 기억하고 있어요.`
            : `${Math.round(CHECK_PASS * 100)}%가 안 됐어요. ${HANGUL_STEPS[check.review].id}차시를 가장 어려워했어요.`))
        : null,
      stage
        ? h('div', { class: `check-result${stage.pass ? ' pass' : ''}` },
          h('b', {}, `${res.total}문제 중 ${res.firstTry}개 맞혔어요`),
          h('span', {}, stage.pass
            ? (stage.opened ? `${chal.stage + 1}단계가 열렸어요!` : chal.stage >= STAGES ? '마지막 단계까지 모두 해냈어요!' : '다시 해도 별을 더 모을 수 있어요.')
            : '5문제 중 3문제 이상 맞히면 다음 단계가 열려요.'),
          stage.gift ? h('span', {}, `🎁 ${chal.stage}단계 선물! 친구가 스티커를 줬어요.`) : null)
        : null,
      h('div', { class: 'reward-acorns' }, acornImg(34), '+', h('b', { class: 'acorn-count' }, '0')),
      sticker ? h('div', { class: 'reward-sticker' }, h('span', { class: 'sticker-big' }, stickerPic(sticker)), '새 스티커를 받았어요!') : null,
      courseFinished ? h('p', { class: 'muted' }, '오늘의 도토리나무가 한 뼘 자랐어요 🌱') : null,
      courseFinished && g.subject === 'hangul' && p.hangulReview != null
        ? h('p', { class: 'next-lesson' }, `내일은 ${HANGUL_STEPS[p.hangulReview].id}차시를 복습해요!`)
        : courseFinished && g.subject === 'hangul' && p.hangulStep < HANGUL_STEPS.length - 1
          ? h('p', { class: 'next-lesson' }, `내일은 ${HANGUL_STEPS[p.hangulStep + 1].id}차시를 배워요!`) : null,
      courseFinished && g.subject === 'math' && p.mathDay + 1 < mathOf(p).days
        ? h('p', { class: 'next-lesson' }, `내일은 ${mathOf(p).id} ${mathOf(p).title} ${p.mathDay + 2}일째를 해요!`)
        : courseFinished && g.subject === 'math' && p.mathUnit < MATH_UNITS.length - 1
        ? h('p', { class: 'next-lesson' }, MATH_UNITS[p.mathUnit + 1].code !== mathOf(p).code
          ? `내일부터 Level ${MATH_UNITS[p.mathUnit + 1].code}! ${MATH_UNITS[p.mathUnit + 1].title}을(를) 배워요.`
          : `내일은 ${MATH_UNITS[p.mathUnit + 1].id} ${MATH_UNITS[p.mathUnit + 1].title}을(를) 배워요!`) : null,
      courseFinished && g.subject === 'english' && p.englishUnit < EN_UNITS.length - 1
        ? h('p', { class: 'next-lesson' }, EN_UNITS[p.englishUnit + 1].code !== unitOf(p).code
          ? `내일부터 Level ${EN_UNITS[p.englishUnit + 1].code}! ${EN_UNITS[p.englishUnit + 1].levelTitle}을(를) 배워요.`
          : `내일은 Level ${unitOf(p).code} ${unitOf(p).no + 1}차시를 배워요!`) : null,
      h('div', { class: 'reward-actions' }, actions)));
  root.append(overlay);
  actions[0].focus();
  sfx.win();
  // 색종이가 쏟아지고, 받은 도토리 수가 하나씩 올라간다
  const COLORS = ['#EE6C5F', '#F6C343', '#4FA36B', '#3D8FD9', '#8668D7', '#D97A33'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    overlay.append(...Array.from({ length: stars * 14 }, () => h('i', {
      class: 'confetti', 'aria-hidden': 'true',
      style: {
        left: `${Math.random() * 100}vw`, background: pick(COLORS),
        '--d': `${Math.random() * 0.6}s`, '--t': `${2 + Math.random() * 1.6}s`,
        '--x': `${Math.random() * 160 - 80}px`, '--r': `${360 + Math.random() * 720}deg`,
      },
    })));
  }
  const counter = overlay.querySelector('.acorn-count');
  for (let i = 1; i <= acorns; i++) setTimeout(() => { counter.textContent = String(i); if (i === acorns) counter.parentElement.classList.add('pop'); }, reduce ? 0 : 500 + i * 70);
  speak(check
    ? (check.pass ? '확인 퀴즈 통과! 정말 잘 기억하고 있어요!' : '확인 퀴즈를 끝까지 풀었어요! 내일 한 번 더 연습해 봐요.')
    : levelUp ? `우와, 레벨 업! 이제 ${sub.name} ${levelUp}단계예요!`
    : courseFinished ? '오늘 수업을 모두 마쳤어요! 정말 대단해요!' : title);
}

/* ---------- 라우터 ---------- */
const PUBLIC = new Set(['login', 'join']);
// 서버 계정 모드에서 로그인 없이 볼 수 있는 화면
const ACCOUNT_PUBLIC = new Set(['account', 'signup']);

function route() {
  teardown?.();
  teardown = null;
  stopSpeech();
  document.querySelectorAll('.cheer, .burst').forEach((e) => e.remove());
  store.ensureToday();

  const [path, qs = ''] = (location.hash.slice(1) || '/').split('?');
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(qs);

  // 서버 계정 모드: 보호자 로그인부터. 관리자 화면은 관리자만
  if (sync.server && !sync.user && !ACCOUNT_PUBLIC.has(parts[0])) {
    location.replace('#/account');
    return;
  }
  if (ACCOUNT_PUBLIC.has(parts[0]) && (!sync.server || sync.user)) {
    location.replace('#/login');
    return;
  }
  const admin = parts[0] === 'admin';
  if (admin && !sync.admin) {
    location.replace('#/login');
    return;
  }
  if (!store.profile && !PUBLIC.has(parts[0]) && !ACCOUNT_PUBLIC.has(parts[0]) && !admin) {
    location.replace('#/login');
    return;
  }
  sync.log('view', { kid: store.profile?.id, path });

  const playing = parts[0] === 'play' && GAMES[parts[1]];
  const freeAct = parts[0] === 'free' && FREE_ACTS[parts[1]];
  document.body.classList.toggle('playing', Boolean(playing || freeAct));
  renderHeader();

  let view;
  if (parts[0] === 'account') view = viewAccount();
  else if (parts[0] === 'signup') view = viewSignup();
  else if (admin) view = parts[1] === 'u' && parts[2] ? (parts[3] === 'r' && parts[4] ? viewAdminReport(parts[2], parts[4]) : viewAdminUser(parts[2])) : viewAdmin();
  else if (parts[0] === 'report') view = viewReport(store.profile, { back: '#/', works: async () => (await album.list(store.profile.id)).map((w) => ({ ...w, url: w.image ? URL.createObjectURL(w.image) : '' })) });
  else if (parts[0] === 'login') view = viewLogin();
  else if (parts[0] === 'join') view = viewJoin(false);
  else if (parts[0] === 'profile') view = parts[1] === 'edit' ? viewJoin(true) : viewProfile();
  else if (parts[0] === 's' && SUBJECTS[parts[1]]) view = viewSubject(parts[1]);
  else if (parts[0] === 'extra') view = viewExtra(SUBJECTS[parts[1]] ? parts[1] : 'hangul');
  else if (playing) view = viewPlay(parts[1], params);
  else if (parts[0] === 'stickers') view = viewStickers();
  else if (parts[0] === 'challenges') view = viewChallenges();
  else if (parts[0] === 'challenge' && CHALLENGES[parts[1]]) view = viewChallenge(parts[1]);
  else if (freeAct) view = viewFreeAct(parts[1]);
  else if (parts[0] === 'free') view = viewFree();
  else if (parts[0] === 'album') view = parts[1] ? viewWork(parts[1]) : viewAlbum();
  else view = viewHome();

  if (view.teardown) teardown = view.teardown;
  app.replaceChildren(view);
  window.scrollTo(0, 0);
  view.mount?.();
}

// 시작: 서버가 있으면 보호자 계정의 학습 기록을 받아 온다 (서버가 없으면 이 기기에만 저장)
const boot = await sync.init();
if (sync.server) store.replaceState(boot.state);
if (sync.user) sync.log('open', {});
window.addEventListener('hashchange', route);
route();
