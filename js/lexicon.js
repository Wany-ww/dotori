// 낱말 사전: '낱말 그림 갈래[,갈래] [소리]' 한 줄에 하나.
// 그림이 없으면 '-'. 소리는 글자와 소리가 다른 낱말(9단계 이후)에만 적는다.
// 갈래: fruit veg food animal family clothes school thing nature ride body place verb
//       규칙(rule 차시): pf kf df tf sf jf sai slink hf hv ae oe ye g1 g2

const RAW = `
사과 🍎 fruit
배 🍐 fruit
포도 🍇 fruit
딸기 🍓 fruit
수박 🍉 fruit
바나나 🍌 fruit
귤 🍊 fruit
복숭아 🍑 fruit
참외 🍈 fruit,oe
레몬 🍋 fruit,ae
체리 🍒 fruit,ae
키위 🥝 fruit
멜론 🍈 fruit
자두 🍑 fruit
감 🟠 fruit
당근 🥕 veg
오이 🥒 veg
감자 🥔 veg
고구마 🍠 veg
가지 🍆 veg
양파 🧅 veg
마늘 🧄 veg
토마토 🍅 veg
고추 🌶️ veg
옥수수 🌽 veg
배추 🥬 veg
버섯 🍄 veg
호박 🎃 veg
콩 🫘 veg
브로콜리 🥦 veg
밥 🍚 food
빵 🍞 food
국수 🍜 food
라면 🍜 food
김밥 🍙 food
피자 🍕 food
햄버거 🍔 food
우유 🥛 food
계란 🥚 food,ye
치즈 🧀 food
떡 🍡 food
만두 🥟 food
주스 🧃 food
과자 🍪 food
사탕 🍬 food
케이크 🍰 food,ae
아이스크림 🍦 food
도넛 🍩 food
카레 🍛 food,ae
국 🍲 food
꿀 🍯 food
두부 ⬜ food
물 💧 food,nature
강아지 🐶 animal
고양이 🐱 animal
토끼 🐰 animal
곰 🐻 animal
사자 🦁 animal
호랑이 🐯 animal
코끼리 🐘 animal
기린 🦒 animal
하마 🦛 animal
원숭이 🐵 animal
돼지 🐷 animal,oe
소 🐮 animal
말 🐴 animal
양 🐑 animal
닭 🐔 animal,g1 [닥]
오리 🦆 animal
병아리 🐥 animal
여우 🦊 animal
판다 🐼 animal
거북이 🐢 animal
개구리 🐸 animal
뱀 🐍 animal
쥐 🐭 animal
다람쥐 🐿️ animal
고래 🐳 animal
상어 🦈 animal
문어 🐙 animal
나비 🦋 animal
벌 🐝 animal
개미 🐜 animal,ae
부엉이 🦉 animal
펭귄 🐧 animal
사슴 🦌 animal
악어 🐊 animal
낙타 🐫 animal
거미 🕷️ animal
오징어 🦑 animal
게 🦀 animal,ae
개 🐕 animal,ae
새 🐦 animal,ae
메뚜기 🦗 animal,ae
달팽이 🐌 animal
엄마 👩 family
아빠 👨 family
할머니 👵 family
할아버지 👴 family
아기 👶 family
언니 👧 family
오빠 👦 family
누나 👧 family
형 👦 family
동생 🧒 family
가족 👨‍👩‍👧 family
바지 👖 clothes
치마 👗 clothes
양말 🧦 clothes
모자 🧢 clothes
신발 👟 clothes
장갑 🧤 clothes
목도리 🧣 clothes
티셔츠 👕 clothes
외투 🧥 clothes,oe
안경 👓 clothes
구두 👞 clothes
잠옷 🛌 clothes
연필 ✏️ school
지우개 🧽 school
가위 ✂️ school
공책 📓 school
책 📕 school
자 📏 school
풀 🧴 school
크레파스 🖍️ school
물감 🎨 school
가방 🎒 school
필통 ✏️ school
시계 ⏰ thing,school,ye
기차 🚂 ride
버스 🚌 ride
비행기 ✈️ ride
자동차 🚗 ride
자전거 🚲 ride
택시 🚕 ride
트럭 🚚 ride
나무 🌳 nature
꽃 🌸 nature,jf [꼳]
해 ☀️ nature,ae
달 🌙 nature
별 ⭐ nature
구름 ☁️ nature
비 🌧️ nature
눈 ❄️ nature,body
산 ⛰️ nature
바다 🌊 nature
불 🔥 nature
무지개 🌈 nature
돌 🪨 nature
집 🏠 place
문 🚪 thing
의자 🪑 thing
공 ⚽ thing
북 🥁 thing
피아노 🎹 thing
로봇 🤖 thing
풍선 🎈 thing
인형 🧸 thing
거울 🪞 thing
비누 🧼 thing
우산 ☂️ thing
컵 🥤 thing
종 🔔 thing
선물 🎁 thing
가면 🎭 thing
기타 🎸 thing
나팔 🎺 thing
도토리 🌰 nature
손 ✋ body
발 🦶 body
귀 👂 body
코 👃 body
이 🦷 body
머리 🧑 body
다리 🦵 body
입 👄 body
두루미 🦢 animal
너구리 🦝 animal
노루 🦌 animal
그네 🪢 thing,ae
고기 🍖 food
도라지 🌿 veg
라디오 📻 thing
라마 🦙 animal
모기 🦟 animal
보리 🌾 veg
소라 🐚 animal
사다리 🪜 thing
수도 🚰 thing
머루 🫐 fruit
바구니 🧺 thing
주머니 👝 thing
지도 🗺️ thing
조개 🐚 animal,ae
하늘 🌤️ nature
후추 🧂 food
아이 🧒 family
어머니 👩 family
고리 ⭕ thing,abs
노래 🎵 thing,ae
라면 🍜 food
캐나다 🍁 place
코코아 ☕ food
카드 🃏 thing
타조 🦤 animal
토마토 🍅 veg
투구 🪖 thing
포크 🍴 thing
파도 🌊 nature
피리 🪈 thing
치즈 🧀 food
차 🚗 ride
추위 🥶 nature
초 🕯️ thing
꼬리 🐾 body
꼬마 🧒 family
도끼 🪓 thing
떡 🍡 food
뚜껑 🫙 thing
따오기 🦩 animal
빨대 🥤 thing
뿌리 🌱 nature
뼈 🦴 body
찌개 🍲 food,ae
쪽지 📝 thing
쌀 🍚 food
씨앗 🌱 nature
쓰레기 🗑️ thing
꽈배기 🥨 food
과일 🧺 fruit
화가 🧑‍🎨 family
와플 🧇 food
원 ⭕ thing,abs
위 ⬆️ thing,abs
바위 🪨 nature
의사 🧑‍⚕️ family
의자 🪑 thing
야구 ⚾ thing
여우 🦊 animal
요리 🍳 thing
우유 🥛 food
유리 🪟 thing
겨울 ❄️ nature
여름 🌞 nature
교실 🏫 place
휴지 🧻 thing
벼 🌾 nature
물고기 🐟 animal
표 🎫 thing
열쇠 🔑 thing,oe
괴물 👾 thing,oe
교회 ⛪ place,oe
회색 🩶 thing,oe,abs
외계인 👽 thing,oe
최고 👍 thing,oe,abs
왜가리 🐦 animal,oe
횃불 🔥 thing,oe
세모 🔺 thing,ae
네모 ⬛ thing,ae
베개 🛏️ thing,ae
가게 🏪 place,ae
모래 🏖️ nature,ae
제비 🐦 animal,ae
대나무 🎋 nature,ae
채소 🥬 veg,ae
냉장고 🧊 thing,ae
카메라 📷 thing,ae
헤엄 🏊 verb,ae
세수 🧼 verb,ae
재채기 🤧 body,ae
계단 🪜 place,ye
계절 🍂 nature,ye
예절 🙇 thing,ye,abs
차례 🔢 thing,ye,abs
휴게소 🚏 place,ye
지혜 💡 thing,ye,abs
은혜 🙏 thing,ye,abs
앞 ⬅️ thing,pf,abs [압]
옆 ↔️ thing,pf,abs [엽]
숲 🌲 nature,pf [숩]
잎 🍃 nature,pf [입]
무릎 🦵 body,pf [무릅]
늪 🪷 nature,pf [늡]
짚 🌾 nature,pf [집]
헝겊 🧵 thing,pf [헝겁]
앞치마 🧑‍🍳 clothes,pf [압치마]
숲속 🌲 nature,pf [숩쏙]
앞발 🐾 body,pf [압빨]
높다 🗼 verb,pf [놉따]
깊다 🌊 verb,pf [깁따]
덮개 🛏️ thing,pf [덥깨]
부엌 🍳 place,kf [부억]
밖 🚪 place,kf,abs [박]
낚시 🎣 thing,kf [낙씨]
볶음밥 🍛 food,kf [보끔밥]
동녘 🌅 nature,kf [동녁]
들녘 🌾 nature,kf [들력]
깎다 ✂️ verb,kf [깍따]
닦다 🧽 verb,kf [닥따]
섞다 🥣 verb,kf [석따]
묶다 🎀 verb,kf [묵따]
꺾다 🌷 verb,kf [꺽따]
키읔 ㅋ thing,kf,abs [키윽]
곧 ⏱️ thing,df,abs [곧]
걷다 🚶 verb,df [걷따]
닫다 🚪 verb,df [닫따]
받다 🎁 verb,df [받따]
믿다 🤝 verb,df [믿따]
묻다 ❓ verb,df [묻따]
쏟다 🫗 verb,df [쏟따]
돋보기 🔍 thing,df [돋뽀기]
얻다 🙌 verb,df [얻따]
뜯다 📦 verb,df [뜯따]
밭 🌾 place,tf [받]
끝 🏁 thing,tf,abs [끋]
솥 🍲 thing,tf [솓]
팥 🫘 food,tf [팓]
겉 🧥 thing,tf,abs [걷]
햇볕 ☀️ nature,tf,sai [해뼏]
낱말 🔤 thing,tf,abs [난말]
밑 ⬇️ thing,tf,abs [믿]
꽃밭 🌷 place,tf [꼳빧]
같다 🟰 verb,tf [갇따]
맡다 👃 verb,tf [맏따]
뱉다 💦 verb,tf [밷따]
옷 👕 clothes,sf [옫]
빗 🪮 thing,sf [빋]
맛 😋 thing,sf,abs [맏]
붓 🖌️ school,sf [붇]
못 🔨 thing,sf [몯]
엿 🍬 food,sf,abs [엳]
젓가락 🥢 thing,sf [젇까락]
깃발 🚩 thing,sf [긷빨]
다섯 5️⃣ thing,sf [다섣]
그릇 🥣 thing,sf [그륻]
웃다 😄 verb,sf [욷따]
씻다 🧼 verb,sf [씯따]
벗다 👟 verb,sf [벋따]
솟다 ⛲ verb,sf [솓따]
낮 ☀️ nature,jf [낟]
젖 🍼 food,jf [젇]
빚 💸 thing,jf,abs [빋]
곶감 🍡 food,jf [곧깜]
짖다 🐕 verb,jf [짇따]
찾다 🔎 verb,jf [찯따]
늦다 ⏰ verb,jf [늗따]
꽂다 💐 verb,jf [꼳따]
잊다 🤔 verb,jf [읻따]
빛 ✨ nature,jf [빋]
숯 ⚫ thing,jf [숟]
윷 🎲 thing,jf [윧]
닻 ⚓ thing,jf [닫]
돛 ⛵ thing,jf [돋]
몇 ❔ thing,jf,abs [멷]
쫓다 🏃 verb,jf [쫃따]
나뭇잎 🍃 nature,sai [나문닙]
촛불 🕯️ thing,sai [초뿔]
바닷가 🏖️ place,sai [바다까]
햇빛 ☀️ nature,sai [해삗]
깻잎 🌿 veg,sai [깬닙]
콧물 🤧 body,sai [콘물]
빗물 🌧️ nature,sai [빈물]
바닷물 🌊 nature,sai [바단물]
햇살 🌞 nature,sai [해쌀]
혓바닥 👅 body,sai [혀빠닥]
뒷문 🚪 place,sai [뒨문]
잇몸 🦷 body,sai [인몸]
콧노래 🎶 thing,sai [콘노래]
귓속말 🤫 thing,sai [귀쏭말]
냇가 🏞️ place,sai [내까]
웃어요 😄 verb,slink [우서요]
씻어요 🧼 verb,slink [씨서요]
벗어요 👟 verb,slink [버서요]
옷이 👕 thing,slink,abs [오시]
빗으로 🪮 thing,slink,abs [비스로]
그릇에 🥣 thing,slink,abs [그르세]
맛있어요 😋 verb,slink [마시써요]
솟아요 ⛲ verb,slink [소사요]
붓으로 🖌️ thing,slink,abs [부스로]
좋다 👍 verb,hf [조타]
놓다 🥤 verb,hf [노타]
넣다 📦 verb,hf [너타]
닿다 🤏 verb,hf [다타]
낳다 🥚 verb,hf [나타]
쌓다 🧱 verb,hf [싸타]
빨갛다 🔴 verb,hf [빨가타]
노랗다 🟡 verb,hf [노라타]
파랗다 🔵 verb,hf [파라타]
하얗다 ⚪ verb,hf [하야타]
까맣다 ⚫ verb,hf [까마타]
좋고 👍 verb,hf,abs [조코]
좋아요 👍 verb,hv [조아요]
놓아요 🥤 verb,hv [노아요]
넣어요 📦 verb,hv [너어요]
낳아요 🥚 verb,hv [나아요]
쌓아요 🧱 verb,hv [싸아요]
닿아요 🤏 verb,hv [다아요]
좋은 👍 verb,hv,abs [조은]
앉다 🪑 verb,g1 [안따]
얹다 🫴 verb,g1 [언따]
넓다 🏞️ verb,g1 [널따]
짧다 📏 verb,g1 [짤따]
여덟 8️⃣ thing,g1 [여덜]
밟다 👣 verb,g1 [밥따]
얇다 📄 verb,g1 [얄따]
흙 🪴 nature,g1 [흑]
읽다 📖 verb,g1 [익따]
맑다 ☀️ verb,g1 [막따]
밝다 💡 verb,g1 [박따]
굵다 🪵 verb,g1 [국따]
삶 🌱 thing,g1,abs [삼]
닮다 👯 verb,g1 [담따]
젊다 🧑 verb,g1 [점따]
많다 🍬 verb,g2 [만타]
않다 🙅 verb,g2 [안타]
끊다 ✂️ verb,g2 [끈타]
괜찮다 🙆 verb,g2,oe [괜찬타]
싫다 🙅 verb,g2 [실타]
끓다 🍲 verb,g2 [끌타]
잃다 🧤 verb,g2 [일타]
뚫다 🕳️ verb,g2 [뚤타]
옳다 ⭕ verb,g2 [올타]
핥다 👅 verb,g2 [할따]
훑다 🔍 verb,g2 [훌따]
값 💰 thing,g2 [갑]
없다 🫙 verb,g2 [업따]
`;

const seen = new Set();
export const LEXICON = RAW.trim().split('\n').map((line) => {
  const m = line.trim().match(/^(\S+)\s+(\S+)\s+(\S+)(?:\s+\[(.+)\])?$/);
  if (!m) return null;
  const [, w, e, tags, pron] = m;
  return { word: w, emoji: e === '-' ? '' : e, tags: tags.split(','), pron: pron || '' };
}).filter((x) => x && !seen.has(x.word) && seen.add(x.word));

// 그림 낱말로 보여 주기 어려운 것(동사·형용사, 뜻이 추상적인 abs, 기호 그림)은 그림 짝 놀이에서 빼고, 읽기·쓰기 놀이에만 쓴다
const SYMBOLIC = /^(?:[⬅↔⬆⬇⏱🔢❔❓👉🟰🔤🩶🟠⬜⭕🔴🟡🔵⚪⚫ㅋ]|5️⃣|8️⃣)/u;
export const isPicture = (it) => Boolean(it.emoji) && !it.tags.includes('verb') && !it.tags.includes('abs') && !SYMBOLIC.test(it.emoji);

// 규칙 차시의 문장: {바른 글자|틀리기 쉬운 글자|…}가 빈칸이 된다
export const RULE_SENTENCES = {
  pf: [
    ['🏠🌳', '집 {앞|압|앖}에 나무가 있어요.'],
    ['🌲🐦', '{숲|숩|숫}에서 새가 노래해요.'],
    ['🧒🧒', '내 {옆|엽|엿}에 친구가 앉아요.'],
    ['🦵🩹', '{무릎|무릅|무릇}을 다쳤어요.'],
    ['🍃', '{잎|입|잇}이 초록색이에요.'],
  ],
  kf: [
    ['🍳', '{부엌|부억|부엇}에서 밥을 해요.'],
    ['❄️', '{밖|박|밗}에 눈이 와요.'],
    ['🎣', '아빠와 {낚시|낙시|낫시}를 해요.'],
    ['🪥', '이를 깨끗이 {닦아요|닥아요|다까요}.'],
    ['✏️', '연필을 {깎아요|깍아요|까까요}.'],
  ],
  df: [
    ['🌧️', '{곧|곳|곶} 비가 올 거예요.'],
    ['🚪', '문을 {닫아요|다다요|닷아요}.'],
    ['🎁', '선물을 {받아요|바다요|밧아요}.'],
    ['🎵', '노래를 {듣고|듯고|드꼬} 있어요.'],
    ['🔍🐜', '{돋보기|돗보기|돝보기}로 개미를 봐요.'],
  ],
  tf: [
    ['🥔', '{밭|밧|받}에서 감자를 캐요.'],
    ['📖', '이야기의 {끝|끗|끋}이에요.'],
    ['🍚', '{솥|솟|솓}에 밥을 지어요.'],
    ['🫘🍞', '{팥|팟|팓}으로 빵을 만들어요.'],
    ['☀️', '{햇볕|햇볏|햇볃}이 따뜻해요.'],
  ],
  sf: [
    ['👕', '{옷|옫|옻}을 입어요.'],
    ['🪮', '{빗|빋|빛}으로 머리를 빗어요.'],
    ['🥢', '{젓가락|젇가락|저까락}으로 먹어요.'],
    ['🖌️', '{붓|붇|붖}으로 그림을 그려요.'],
    ['🍎', '사과 {다섯|다섣|다섰} 개가 있어요.'],
  ],
  jf: [
    ['☀️', '{낮|낟|낫}에는 해가 떠요.'],
    ['🌸', '{꽃|꼳|꽂}이 활짝 피었어요.'],
    ['✨', '별{빛|빋|빗}이 반짝여요.'],
    ['🐕', '강아지가 멍멍 {짖어요|지저요|짓어요}.'],
    ['⚽', '잃어버린 공을 {찾았어요|차자써요|찻았어요}.'],
  ],
  sai: [
    ['🍂', '{나뭇잎|나무잎|나문잎}이 떨어져요.'],
    ['🎂', '생일 케이크에 {촛불|초불|촛뿔}을 켜요.'],
    ['🏖️', '{바닷가|바다가|바닷까}에서 모래성을 쌓아요.'],
    ['☀️', '{햇빛|해빛|햇삧}이 눈부셔요.'],
    ['🤧', '감기에 걸려 {콧물|코물|콘물}이 나요.'],
  ],
  slink: [
    ['😄', '친구가 활짝 {웃어요|우서요|욷어요}.'],
    ['🧼', '손을 깨끗이 {씻어요|씨서요|씯어요}.'],
    ['👗', '{옷이|오시|옫이} 예뻐요.'],
    ['👟', '신발을 {벗어요|버서요|벚어요}.'],
    ['🍚', '{그릇에|그르세|그릇세} 밥을 담아요.'],
  ],
  hf: [
    ['😊', '기분이 {좋고|조코|좋코} 신나요.'],
    ['🥤', '컵을 책상에 {놓고|노코|녹고} 와요.'],
    ['🎒', '가방에 책을 {넣고|너코|넉고} 가요.'],
    ['🍎', '사과가 {빨갛게|빨가케|빨갓게} 익었어요.'],
    ['🌤️', '하늘이 정말 {파랗다|파라타|파랏다}.'],
  ],
  hv: [
    ['🍎', '나는 사과가 {좋아요|조아요|좋와요}.'],
    ['🧱', '블록을 높이 {쌓아요|싸아요|쌓와요}.'],
    ['🐔🥚', '닭이 알을 {낳아요|나아요|낳와요}.'],
    ['📦', '상자에 공을 {넣어요|너어요|넣허요}.'],
    ['🥤', '컵을 살짝 {놓아요|노아요|놓와요}.'],
  ],
  ae: [
    ['🦀', '{게|개|계}가 옆으로 걸어요.'],
    ['🐕', '{개|게|걔}가 멍멍 짖어요.'],
    ['🐦', '{새|세|쇄}가 하늘을 날아요.'],
    ['🔺', '{세모|새모|쇄모} 모양 블록이에요.'],
    ['🏪', '엄마와 {가게|가개|가계}에 가요.'],
    ['🛏️', '{베개|배개|베게}를 베고 자요.'],
  ],
  oe: [
    ['🔑', '{열쇠|열쐐|열새}로 문을 열어요.'],
    ['🐷', '{돼지|되지|대지}가 꿀꿀 울어요.'],
    ['🧥', '{외투|왜투|웨투}를 입고 나가요.'],
    ['🍈', '{참외|참왜|참웨}가 달아요.'],
  ],
  ye: [
    ['⏰', '{시계|시게|시개}가 똑딱똑딱 가요.'],
    ['🪜', '{계단|게단|개단}을 올라가요.'],
    ['🥚', '{계란|게란|개란}으로 요리해요.'],
  ],
  g1: [
    ['🪑', '의자에 {앉아요|안자요|안저요}.'],
    ['🐔', '{닭|닥|달}이 꼬끼오 울어요.'],
    ['📖', '책을 소리 내어 {읽어요|일거요|익어요}.'],
    ['🪴', '{흙|흑|흘}으로 화분을 채워요.'],
    ['🏠', '방이 아주 {넓어요|널버요|넙어요}.'],
    ['🍎', '사과가 {여덟|여덜|여덥} 개 있어요.'],
  ],
  g2: [
    ['🍬', '사탕이 아주 {많아요|마나요|만아요}.'],
    ['🍲', '물이 보글보글 {끓어요|끄러요|끌어요}.'],
    ['🐱', '고양이가 털을 {핥아요|할타요|할아요}.'],
    ['💰', '이 장난감 {값|갑|갓}이 얼마예요?'],
    ['🧤', '장갑을 {잃어버렸어요|이러버렸어요|일어버렸어요}.'],
    ['✏️', '연필이 {없어요|업서요|업어요}.'],
  ],
};

// 받침을 배우기 전(3~4단계)에 읽는 받침 없는 문장
export const EASY_SENTENCES = [
  ['🦆', '오리가 가요.'], ['🥛', '우유 주세요.'], ['🐯', '호랑이가 커요.'], ['👶', '아기가 자요.'],
  ['🍅', '토마토가 아주 커요.'], ['🚌', '버스가 가요.'], ['🍠', '고구마 두 개 주세요.'], ['👒', '모자 사 주세요.'],
  ['🦋', '나비가 나무 위로 가요.'], ['🐢', '거북이가 느려요.'],
];
