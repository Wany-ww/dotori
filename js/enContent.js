// 영어 커리큘럼(Level A ~ Z)이 쓰는 학습 내용: 단어장 · 차시별 문장 · 대화 · 그림책

/* ---------- 단어장: 단어 | 그림 | 뜻 | 주제 꼬리표 ----------
   그림이 없는 단어(요일 · 달)는 그림 놀이에서 빠진다 */
const RAW_WORDS = `
apple|🍎|사과|fruit food
ant|🐜|개미|animal bug
alligator|🐊|악어|animal
arm|💪|팔|body
airplane|✈️|비행기|ride
ball|⚽|공|toy
bear|🐻|곰|animal
banana|🍌|바나나|fruit food
bus|🚌|버스|ride
bee|🐝|벌|animal bug
book|📖|책|school
bird|🐦|새|animal
boat|⛵|보트|ride
bed|🛏️|침대|house
bag|🎒|가방|school
bread|🍞|빵|food
bike|🚲|자전거|ride
bat|🦇|박쥐|animal
box|📦|상자|house
bug|🐛|벌레|animal bug
cat|🐱|고양이|animal
car|🚗|자동차|ride toy
cake|🎂|케이크|food
cup|☕|컵|house
cow|🐮|소|animal
carrot|🥕|당근|veg food
cookie|🍪|쿠키|food
corn|🌽|옥수수|veg food
cap|🧢|야구모자|clothes
coat|🧥|코트|clothes
can|🥫|깡통|house
cherry|🍒|체리|fruit food
cheese|🧀|치즈|food
chicken|🍗|닭고기|food
candy|🍬|사탕|food
clock|⏰|시계|house school time
cloud|☁️|구름|nature weather
chair|🪑|의자|house school
dog|🐶|개|animal
duck|🦆|오리|animal
doll|🪆|인형|toy
drum|🥁|북|toy
dinosaur|🦕|공룡|animal toy
door|🚪|문|house
donut|🍩|도넛|food
dress|👗|원피스|clothes
dad|👨|아빠|family
doctor|🧑‍⚕️|의사|job
dice|🎲|주사위|toy
egg|🥚|달걀|food
elephant|🐘|코끼리|animal
eye|👁️|눈|body
ear|👂|귀|body
fish|🐟|물고기|animal
frog|🐸|개구리|animal
fox|🦊|여우|animal
flower|🌸|꽃|nature
fork|🍴|포크|house
foot|🦶|발|body
farmer|🧑‍🌾|농부|job
firefighter|🧑‍🚒|소방관|job
five|5️⃣|다섯|number
four|4️⃣|넷|number
goat|🐐|염소|animal
grapes|🍇|포도|fruit food
gift|🎁|선물|toy
guitar|🎸|기타|toy
giraffe|🦒|기린|animal
gloves|🧤|장갑|clothes
grandma|👵|할머니|family
grandpa|👴|할아버지|family
green|🟢|초록색|color
game|🎮|게임|toy
hat|🎩|모자|clothes
horse|🐴|말|animal
house|🏠|집|house place
hen|🐔|암탉|animal
hand|✋|손|body
heart|❤️|하트|toy
hamburger|🍔|햄버거|food
hospital|🏥|병원|place
happy|😊|행복한|feeling
hungry|😋|배고픈|feeling
hot|🔥|뜨거운|weather
ice cream|🍦|아이스크림|food
insect|🐞|곤충|animal bug
iguana|🦎|이구아나|animal
juice|🧃|주스|drink food
jacket|🥼|재킷|clothes
jeans|👖|청바지|clothes
jam|🍯|잼|food
jet|🛩️|제트기|ride
kite|🪁|연|toy
key|🔑|열쇠|house
king|🤴|왕|family
kangaroo|🦘|캥거루|animal
koala|🐨|코알라|animal
kiwi|🥝|키위|fruit food
lion|🦁|사자|animal
lemon|🍋|레몬|fruit food
leaf|🍃|나뭇잎|nature
leg|🦵|다리|body
lollipop|🍭|막대사탕|food
library|📚|도서관|place
moon|🌙|달|nature
monkey|🐵|원숭이|animal
milk|🥛|우유|drink food
mouse|🐭|쥐|animal
map|🗺️|지도|school
mango|🥭|망고|fruit food
mushroom|🍄|버섯|veg
mom|👩|엄마|family
mouth|👄|입|body
mountain|⛰️|산|nature
nest|🪺|둥지|nature
nose|👃|코|body
nut|🥜|땅콩|food
net|🥅|그물|sport
notebook|📓|공책|school
nine|9️⃣|아홉|number
noodles|🍜|국수|food
octopus|🐙|문어|animal
orange|🍊|오렌지|fruit food
owl|🦉|부엉이|animal
ox|🐂|황소|animal
onion|🧅|양파|veg
one|1️⃣|하나|number
pig|🐷|돼지|animal
pen|🖊️|펜|school
panda|🐼|판다|animal
pizza|🍕|피자|food
pear|🍐|배|fruit food
penguin|🐧|펭귄|animal
pencil|✏️|연필|school
peach|🍑|복숭아|fruit food
pot|🍲|냄비|house
pin|📌|핀|school
pan|🍳|프라이팬|house
popcorn|🍿|팝콘|food
potato|🥔|감자|veg food
park|🏞️|공원|place
police officer|👮|경찰관|job
pilot|🧑‍✈️|조종사|job
queen|👸|여왕|family
question|❓|질문|school
quiet|🤫|조용한|feeling
quarter|🪙|동전|school
rabbit|🐰|토끼|animal
rainbow|🌈|무지개|nature weather
robot|🤖|로봇|toy
ring|💍|반지|clothes
rose|🌹|장미|nature
rocket|🚀|로켓|ride toy
rain|🌧️|비|weather nature
rice|🍚|밥|food
red|🔴|빨간색|color
ruler|📏|자|school
rat|🐀|들쥐|animal
run|🏃|달리다|verb sport
sun|☀️|해|nature weather
snake|🐍|뱀|animal
star|⭐|별|nature
socks|🧦|양말|clothes
sheep|🐑|양|animal
spoon|🥄|숟가락|house
strawberry|🍓|딸기|fruit food
shoes|👟|신발|clothes
shirt|👕|셔츠|clothes
scarf|🧣|목도리|clothes
snow|❄️|눈|weather nature
sandwich|🥪|샌드위치|food
soup|🥣|수프|food
sea|🌊|바다|nature
six|6️⃣|여섯|number
school|🏫|학교|place school
scissors|✂️|가위|school
ship|🚢|배|ride
sad|😢|슬픈|feeling
sleepy|😴|졸린|feeling
swim|🏊|수영하다|verb sport
sing|🎤|노래하다|verb
singer|🧑‍🎤|가수|job
soccer|⚽|축구|sport
store|🏪|가게|place
tiger|🐯|호랑이|animal
tree|🌳|나무|nature
train|🚂|기차|ride toy
turtle|🐢|거북|animal
tomato|🍅|토마토|veg food
tent|⛺|텐트|house
teeth|🦷|이|body
truck|🚚|트럭|ride
teddy bear|🧸|곰 인형|toy
taxi|🚕|택시|ride
tea|🍵|차|drink
teacher|🧑‍🏫|선생님|job school
ten|🔟|열|number
three|3️⃣|셋|number
two|2️⃣|둘|number
tennis|🎾|테니스|sport
umbrella|☂️|우산|weather
unicorn|🦄|유니콘|animal
up|⬆️|위로|verb
van|🚐|승합차|ride
violin|🎻|바이올린|toy
volcano|🌋|화산|nature
vest|🦺|조끼|clothes
vase|🏺|꽃병|house
whale|🐳|고래|animal
watch|⌚|손목시계|clothes time
water|💧|물|drink nature
window|🪟|창문|house
wolf|🐺|늑대|animal
web|🕸️|거미줄|animal
worm|🪱|지렁이|animal bug
watermelon|🍉|수박|fruit food
yo-yo|🪀|요요|toy
yarn|🧶|털실|toy
yellow|🟡|노란색|color
zebra|🦓|얼룩말|animal
zero|0️⃣|영|number
blue|🔵|파란색|color
pink|💗|분홍색|color
purple|🟣|보라색|color
brown|🟤|갈색|color
black|⚫|검은색|color
white|⚪|하얀색|color
seven|7️⃣|일곱|number
eight|8️⃣|여덟|number
baby|👶|아기|family
brother|👦|남자 형제|family
sister|👧|여자 형제|family
family|👪|가족|family
crayon|🖍️|크레파스|school
computer|💻|컴퓨터|school house
sofa|🛋️|소파|house
bathtub|🛁|욕조|house
toothbrush|🪥|칫솔|house
cucumber|🥒|오이|veg food
broccoli|🥦|브로콜리|veg food
melon|🍈|멜론|fruit food
salad|🥗|샐러드|food
pie|🥧|파이|food
hot dog|🌭|핫도그|food
soda|🥤|탄산음료|drink
sunny|🌞|맑은|weather
rainy|☔|비 오는|weather
snowy|☃️|눈 오는|weather
windy|💨|바람 부는|weather
cold|🥶|추운|weather feeling
angry|😠|화난|feeling
tired|😩|피곤한|feeling
scared|😨|무서운|feeling
excited|🤩|신나는|feeling
surprised|😲|놀란|feeling
bored|🥱|지루한|feeling
basketball|🏀|농구|sport
baseball|⚾|야구|sport
badminton|🏸|배드민턴|sport
skating|⛸️|스케이트|sport
jump|🤸|뛰다|verb sport
dance|💃|춤추다|verb
read|📖|읽다|verb
eat|🍽️|먹다|verb
sleep|🛌|자다|verb
walk|🚶|걷다|verb
fly|🕊️|날다|verb
draw|🎨|그리다|verb
cook|🧑‍🍳|요리사|job
write|✍️|쓰다|verb
climb|🧗|오르다|verb sport
cry|😭|울다|verb feeling
laugh|😂|웃다|verb feeling
wash|🧼|씻다|verb house
clap|👏|손뼉 치다|verb
morning|🌅|아침|time
afternoon|🌤️|오후|time
evening|🌆|저녁|time
night|🌃|밤|time
beach|🏖️|해변|place
farm|🚜|농장|place
restaurant|🍽️|식당|place
bank|🏦|은행|place
post office|🏤|우체국|place
museum|🏛️|박물관|place
station|🚉|역|place
bakery|🥐|빵집|place
helicopter|🚁|헬리콥터|ride
subway|🚇|지하철|ride
plate|🍽️|접시|house
lake|🏞️|호수|nature
bone|🦴|뼈다귀|animal
rope|🪢|밧줄|toy
globe|🌍|지구본|school
cube|🧊|정육면체 얼음|house
meat|🍖|고기|food
feet|👣|발(여럿)|body
Monday||월요일|day
Tuesday||화요일|day
Wednesday||수요일|day
Thursday||목요일|day
Friday||금요일|day
Saturday||토요일|day
Sunday||일요일|day
January||1월|month
February||2월|month
March||3월|month
April||4월|month
May||5월|month
June||6월|month
July||7월|month
August||8월|month
September||9월|month
October||10월|month
November||11월|month
December||12월|month
`;

export const EN_WORDS = RAW_WORDS.trim().split('\n').map((line) => {
  const [w, e, ko, tags] = line.split('|');
  return { w, e, ko, tags: tags.split(' ') };
});

/* ---------- 차시별 문장: [그림, '문장 {정답|함정|함정}', 우리말] ----------
   A ~ C는 차시 단어로 문장을 만든다 (enLesson.js). D부터는 차시 목표에 맞춘 문장 */
export const EN_BANK = {
  'D-1': [
    ['🐱', 'I see a {cat|dog|pig}.', '고양이가 보여요.'],
    ['🐶', 'I see a {dog|cat|duck}.', '개가 보여요.'],
    ['🐷', 'It is a {pig|bear|fox}.', '돼지예요.'],
    ['🐻', 'It is a {bear|pig|cow}.', '곰이에요.'],
    ['🦆', 'I see a {duck|dog|fox}.', '오리가 보여요.'],
    ['🦊', 'It is a {fox|frog|fish}.', '여우예요.'],
    ['🐮', 'It is a {cow|cat|hen}.', '소예요.'],
    ['🐸', 'I see a {frog|fox|fish}.', '개구리가 보여요.'],
  ],
  'D-2': [
    ['🍎', 'I eat an {apple|egg|orange}.', '사과를 먹어요.'],
    ['🍌', 'I eat a {banana|cake|pizza}.', '바나나를 먹어요.'],
    ['🍕', 'I eat {pizza|bread|rice}.', '피자를 먹어요.'],
    ['🥛', 'I drink {milk|juice|water}.', '우유를 마셔요.'],
    ['🍇', 'I like {grapes|lemons|peaches}.', '나는 포도를 좋아해요.'],
    ['🥕', 'I like {carrots|cookies|cherries}.', '나는 당근을 좋아해요.'],
    ['🍪', 'It is a {cookie|cake|donut}.', '쿠키예요.'],
    ['🍞', 'I eat {bread|rice|soup}.', '빵을 먹어요.'],
  ],
  'D-3': [
    ['🔴', 'It is {red|blue|green}.', '빨간색이에요.'],
    ['🔵', 'It is {blue|red|yellow}.', '파란색이에요.'],
    ['🟡', 'It is {yellow|green|pink}.', '노란색이에요.'],
    ['🐸', 'The frog is {green|red|blue}.', '개구리는 초록색이에요.'],
    ['🍎🍎', 'I see {two|one|three} apples.', '사과 두 개가 보여요.'],
    ['⭐⭐⭐', 'I see {three|two|five} stars.', '별 세 개가 보여요.'],
    ['🐶', 'I have {one|two|four} dog.', '나는 개 한 마리가 있어요.'],
    ['🎈🎈🎈🎈', 'I have {four|three|six} balloons.', '나는 풍선 네 개가 있어요.'],
  ],
  'D-4': [
    ['✋', 'This is my {hand|foot|nose}.', '이것은 내 손이에요.'],
    ['👃', 'This is my {nose|ear|eye}.', '이것은 내 코예요.'],
    ['👂', 'This is my {ear|arm|leg}.', '이것은 내 귀예요.'],
    ['🦶', 'This is my {foot|hand|mouth}.', '이것은 내 발이에요.'],
    ['🧢', 'I wear a {cap|coat|dress}.', '나는 모자를 써요.'],
    ['🧦', 'I wear {socks|gloves|shoes}.', '나는 양말을 신어요.'],
    ['👗', 'I wear a {dress|scarf|hat}.', '나는 원피스를 입어요.'],
    ['🧤', 'I wear {gloves|socks|jeans}.', '나는 장갑을 껴요.'],
  ],
  'F-1': [
    ['🐱', 'I see a {cat|cats|hat}.', '고양이 한 마리가 보여요.'],
    ['🐱🐱', 'I see two {cats|cat|hats}.', '고양이 두 마리가 보여요.'],
    ['🎩', 'It is a {hat|hats|bat}.', '모자예요.'],
    ['🎩🎩🎩', 'I have three {hats|hat|maps}.', '나는 모자가 세 개 있어요.'],
    ['🗺️', 'I have a {map|maps|cap}.', '나는 지도가 있어요.'],
    ['🧢🧢', 'I see two {caps|cap|cats}.', '모자 두 개가 보여요.'],
    ['🦇', 'The {bat|bats|rat} can fly.', '박쥐는 날 수 있어요.'],
    ['🚐🚐', 'I see two {vans|van|cans}.', '승합차 두 대가 보여요.'],
  ],
  'F-2': [
    ['🐷', 'I {see|the|is} a pig.', '돼지가 보여요.'],
    ['🐷', 'The pig {is|see|can} big.', '돼지는 커요.'],
    ['🦊', 'I can see {the|is|can} fox.', '나는 그 여우를 볼 수 있어요.'],
    ['📦', 'It is a {box|fox|pot}.', '상자예요.'],
    ['🍲', 'I see {a|is|can} pot.', '냄비가 보여요.'],
    ['🐸', 'A frog {can|is|the} hop.', '개구리는 뛸 수 있어요.'],
    ['📌', 'It is a {pin|pig|pot}.', '핀이에요.'],
    ['🔥', 'It is {hot|hop|hat}.', '뜨거워요.'],
    ['6️⃣', 'I see {six|sit|sip} dots.', '점 여섯 개가 보여요.'],
  ],
  'F-3': [
    ['🙋', '{I|He|They} am happy.', '나는 행복해요.'],
    ['👦', '{He|She|They} is my brother.', '그 아이는 내 남자 형제예요.'],
    ['👧', '{She|He|We} is my sister.', '그 아이는 내 여자 형제예요.'],
    ['👫', '{They|He|She} are my friends.', '그들은 내 친구예요.'],
    ['🐶', '{It|She|They} is my dog.', '그것은 내 개예요.'],
    ['👨', '{He|She|It} is my dad.', '그분은 우리 아빠예요.'],
    ['👩', '{She|He|They} is my mom.', '그분은 우리 엄마예요.'],
    ['👪', '{We|It|She} are a family.', '우리는 가족이에요.'],
    ['👉', '{You|He|It} are my friend.', '너는 내 친구야.'],
  ],
  'F-4': [
    ['🐔', 'I see a {hen|hens|pen}.', '암탉 한 마리가 보여요.'],
    ['📦📦', 'I have two {boxes|box|boxs}.', '나는 상자가 두 개 있어요.'],
    ['🦊🦊', 'I see two {foxes|fox|foxs}.', '여우 두 마리가 보여요.'],
    ['🚌🚌', 'I see two {buses|bus|buss}.', '버스 두 대가 보여요.'],
    ['☀️', 'The {sun|run|bun} is hot.', '해가 뜨거워요.'],
    ['🐛', 'It is a {bug|bus|hug}.', '벌레예요.'],
    ['☕☕', 'I have two {cups|cup|cupes}.', '나는 컵이 두 개 있어요.'],
    ['🔟', 'I can count to {ten|hen|net}.', '나는 10까지 셀 수 있어요.'],
    ['🛏️', 'It is my {bed|red|web}.', '내 침대예요.'],
  ],
  'G-1': [
    ['😊', 'I {am|is|are} happy.', '나는 행복해요.'],
    ['😢', 'I {am|is|are} sad.', '나는 슬퍼요.'],
    ['😋', 'I {am|is|are} hungry.', '나는 배고파요.'],
    ['😴', 'I {am|is|are} sleepy.', '나는 졸려요.'],
    ['🧒', 'I {am|are|is} seven.', '나는 일곱 살이에요.'],
    ['😠', 'I {am|is|are} angry.', '나는 화가 나요.'],
    ['🤩', '{I|He|They} am excited.', '나는 신나요.'],
    ['🎒', 'I am a {student|happy|run}.', '나는 학생이에요.'],
  ],
  'G-2': [
    ['🧑‍⚕️', 'She {is|am|are} a doctor.', '그녀는 의사예요.'],
    ['🧑‍🍳', 'He {is|am|are} a cook.', '그는 요리사예요.'],
    ['🧑‍🌾', 'He {is|are|am} a farmer.', '그는 농부예요.'],
    ['👮', 'She {is|am|are} a police officer.', '그녀는 경찰관이에요.'],
    ['🐘', 'It {is|am|are} big.', '그것은 커요.'],
    ['🐭', 'It {is|are|am} small.', '그것은 작아요.'],
    ['🧑‍🏫', '{She|I|They} is a teacher.', '그녀는 선생님이에요.'],
    ['🧑‍🚒', 'He is a {firefighter|big|happy}.', '그는 소방관이에요.'],
  ],
  'G-3': [
    ['🐱🐱', 'They {are|is|am} cats.', '그것들은 고양이예요.'],
    ['👫', 'We {are|is|am} friends.', '우리는 친구예요.'],
    ['🐶🐶', 'They {are|is|am} dogs.', '그것들은 개예요.'],
    ['👉', 'You {are|is|am} kind.', '너는 친절해.'],
    ['🐧🐧', 'The penguins {are|is|am} cute.', '펭귄들은 귀여워요.'],
    ['🍎🍎', 'The apples {are|is|am} red.', '사과들은 빨개요.'],
    ['👦👧', '{They|He|It} are students.', '그들은 학생이에요.'],
    ['🐰🐰', '{We|It|He} are rabbits.', '우리는 토끼예요.'],
  ],
  'G-4': [
    ['🐻', 'The bear {is|am|are} brown.', '곰은 갈색이에요.'],
    ['🐰🐰', 'The rabbits {are|is|am} white.', '토끼들은 하얀색이에요.'],
    ['🙋', 'I {am|is|are} tall.', '나는 키가 커요.'],
    ['👧', 'My sister {is|are|am} five.', '내 여동생은 다섯 살이에요.'],
    ['🐸', 'The frog {is|are|am} green.', '개구리는 초록색이에요.'],
    ['👪', 'We {are|is|am} a happy family.', '우리는 행복한 가족이에요.'],
    ['🍦', 'The ice cream {is|are|am} cold.', '아이스크림은 차가워요.'],
    ['🐯', 'The tiger {is|are|am} fast.', '호랑이는 빨라요.'],
  ],
  'I-1': [
    ['🐱', '{Is|Are|Am} it a cat? Yes, it is.', '그것은 고양이인가요? 네, 맞아요.'],
    ['🐶', "Is it a dog? Yes, it {is|isn't|are}.", '그것은 개인가요? 네, 맞아요.'],
    ['🐷', "Is it a cat? No, it {isn't|is|aren't}. It is a pig.", '그것은 고양이인가요? 아니요. 돼지예요.'],
    ['⚽', 'Is it a ball? {Yes|No|Is}, it is.', '그것은 공인가요? 네, 맞아요.'],
    ['🪁', 'Is it a kite? Yes, {it|he|they} is.', '그것은 연인가요? 네, 맞아요.'],
    ['🤖', "Is it a doll? {No|Yes|Is}, it isn't. It is a robot.", '그것은 인형인가요? 아니요. 로봇이에요.'],
    ['🧸', '{Is|Does|Are} it a teddy bear? Yes, it is.', '그것은 곰 인형인가요? 네, 맞아요.'],
  ],
  'I-2': [
    ['📖', '{What|Who|Where} is it? It is a book.', '그것은 무엇인가요? 책이에요.'],
    ['✏️', 'What is it? It is a {pencil|book|bag}.', '그것은 무엇인가요? 연필이에요.'],
    ['🎒', 'What is it? {It|He|She} is a bag.', '그것은 무엇인가요? 가방이에요.'],
    ['📏', 'What is it? It is a {ruler|crayon|clock}.', '그것은 무엇인가요? 자예요.'],
    ['⏰', 'What {is|are|am} it? It is a clock.', '그것은 무엇인가요? 시계예요.'],
    ['🖍️', 'What is it? It is a {crayon|ruler|pencil}.', '그것은 무엇인가요? 크레파스예요.'],
    ['🚗', 'What is it? It is {a|an|is} car.', '그것은 무엇인가요? 자동차예요.'],
    ['🍊', 'What is it? It is {an|a|is} orange.', '그것은 무엇인가요? 오렌지예요.'],
  ],
  'I-3': [
    ['😋', '{Are|Is|Am} you hungry? Yes, I am.', '너 배고프니? 응, 배고파.'],
    ['😴', 'Are you sleepy? Yes, I {am|is|are}.', '너 졸리니? 응, 졸려.'],
    ['😊', "Are you sad? No, I'm {not|am|is}. I am happy.", '너 슬프니? 아니. 나는 행복해.'],
    ['🥶', 'Are you cold? {Yes|No|Are}, I am.', '너 춥니? 응, 추워.'],
    ['😨', 'Are you scared? Yes, {I|you|it} am.', '너 무섭니? 응, 무서워.'],
    ['🤩', '{Are|Do|Is} you excited? Yes, I am!', '너 신나니? 응, 신나!'],
    ['🙂', "Are you tired? No, I'm not. I am {fine|tired|sleepy}.", '너 피곤하니? 아니, 괜찮아.'],
  ],
  'I-4': [
    ['👧', '{Who|What|Where} is she? She is my sister.', '그 아이는 누구니? 내 여동생이야.'],
    ['👴', 'Who is he? He is my {grandpa|grandma|sister}.', '그분은 누구니? 우리 할아버지야.'],
    ['👵', 'Who is she? {She|He|It} is my grandma.', '그분은 누구니? 우리 할머니야.'],
    ['👶', 'Who is he? He is my baby {brother|sister|dad}.', '그 아기는 누구니? 내 남동생이야.'],
    ['👨', 'Who {is|are|am} he? He is my dad.', '그분은 누구니? 우리 아빠야.'],
    ['👩', 'Who is she? She is my {mom|dad|grandpa}.', '그분은 누구니? 우리 엄마야.'],
    ['🧑‍🏫', 'Who is she? She is my {teacher|sister|baby}.', '그분은 누구니? 우리 선생님이야.'],
  ],
  'J-1': [
    ['😊', 'I {feel|feels|feeling} happy.', '나는 기분이 좋아요.'],
    ['😢', 'I feel sad {because|but|so} I lost my toy.', '장난감을 잃어버려서 슬퍼요.'],
    ['🤩', 'I feel {excited|sad|tired} today. It is my birthday!', '오늘 신나요. 내 생일이에요!'],
    ['😨', 'I feel {scared|happy|hungry} in the dark.', '어두운 데서 무서워요.'],
    ['😠', 'I feel angry {because|and|or} my brother took my ball.', '동생이 내 공을 가져가서 화가 나요.'],
    ['😴', 'I feel {sleepy|excited|happy}. I want to go to bed.', '졸려요. 자고 싶어요.'],
    ['😋', 'I feel hungry. I want to {eat|sleep|run}.', '배고파요. 먹고 싶어요.'],
  ],
  'J-2': [
    ['🎂', 'I like {cake|cat|cap}.', '나는 케이크를 좋아해요.'],
    ['🐍', 'I see a {snake|snack|sack}.', '뱀이 보여요.'],
    ['🎮', "Let's play a {game|gam|gem}.", '게임 하자.'],
    ['🐳', 'A {whale|wall|well} is in the sea.', '바다에 고래가 있어요.'],
    ['🧢', 'My {cap|cape|cop} is blue.', '내 모자는 파란색이에요.'],
    ['🍽️', 'Put the cake on the {plate|plat|pleat}.', '케이크를 접시에 올려요.'],
    ['🏞️', 'We swim in the {lake|lack|lick}.', '우리는 호수에서 수영해요.'],
    ['🎩', 'The {hat|hate|hut} is big.', '모자가 커요.'],
  ],
  'J-3': [
    ['🪁', 'I fly a {kite|kit|cut}.', '나는 연을 날려요.'],
    ['🚲', 'I ride my {bike|bik|back}.', '나는 자전거를 타요.'],
    ['🦴', 'The dog has a {bone|bon|ban}.', '개가 뼈다귀를 가지고 있어요.'],
    ['🌹', 'I like this {rose|ros|rise}.', '나는 이 장미가 좋아요.'],
    ['5️⃣', 'I am {five|fiv|fin} years old.', '나는 다섯 살이에요.'],
    ['🐷', 'The {pig|pine|pipe} is pink.', '돼지는 분홍색이에요.'],
    ['🔥', 'The soup is {hot|hote|hit}.', '수프가 뜨거워요.'],
    ['🏠', 'I go {home|hom|hum} at five.', '나는 다섯 시에 집에 가요.'],
    ['🪢', 'Jump over the {rope|rop|ripe}.', '줄을 넘어요.'],
  ],
  'J-4': [
    ['🚲', 'I {want|wants|wanting} a new bike.', '나는 새 자전거를 갖고 싶어요.'],
    ['⚽', 'I think soccer {is|are|am} fun.', '나는 축구가 재미있다고 생각해요.'],
    ['🌳', 'I {think|thinks|thank} the tree is tall.', '나는 그 나무가 크다고 생각해요.'],
    ['🐝', 'I see a {bee|be|bed} on the flower.', '꽃 위에 벌이 보여요.'],
    ['🧊', 'The ice {cube|cub|cup} is cold.', '얼음 조각이 차가워요.'],
    ['🐑', 'I want to see the {sheep|ship|shop}.', '나는 양을 보고 싶어요.'],
    ['🦷', 'I brush my {teeth|tooth|teath} every day.', '나는 매일 이를 닦아요.'],
    ['🍦', 'I want {some|a|an} ice cream.', '아이스크림을 좀 먹고 싶어요.'],
  ],
  'K-1': [
    ['🐻', 'The bear sleeps all winter in a warm {cave|cake|cap}.', '곰은 따뜻한 동굴에서 겨울 내내 자요.'],
    ['🐿️', 'The squirrel hides {nuts|cars|shoes} for the winter.', '다람쥐는 겨울을 위해 도토리를 숨겨요.'],
    ['🐢', 'The turtle is very {slow|fast|loud}. It takes a long time to walk home.', '거북은 아주 느려요. 집에 가는 데 오래 걸려요.'],
    ['🦒', 'The giraffe has a long {neck|tail|nose} to eat leaves from tall trees.', '기린은 높은 나무의 잎을 먹으려고 목이 길어요.'],
    ['🐟', 'A fish uses its {fins|feet|hands} to swim.', '물고기는 지느러미로 헤엄쳐요.'],
    ['🦉', 'The owl is awake at {night|noon|lunch}. It sleeps in the day.', '부엉이는 밤에 깨어 있어요. 낮에는 자요.'],
  ],
  'K-2': [
    ['🌧️', 'It is raining, so I take my {umbrella|sunglasses|kite}.', '비가 와서 우산을 챙겨요.'],
    ['❄️', 'It is snowy and {cold|hot|warm}, so I wear my mittens.', '눈이 오고 추워서 벙어리장갑을 껴요.'],
    ['☀️', 'It is sunny and hot. I need some cold {water|soup|tea}.', '맑고 더워요. 차가운 물이 필요해요.'],
    ['💨', 'It is so {windy|sunny|quiet} that my hat flies away!', '바람이 너무 많이 불어서 모자가 날아가요!'],
    ['🍂', 'In the fall, the leaves turn red and {fall|fly|swim} to the ground.', '가을에는 잎이 빨갛게 물들어 땅에 떨어져요.'],
    ['🌸', 'In the {spring|winter|night}, flowers bloom and birds sing.', '봄에는 꽃이 피고 새가 노래해요.'],
  ],
  'K-3': [
    ['📚', 'We borrow books from the {library|kitchen|farm}.', '우리는 도서관에서 책을 빌려요.'],
    ['🔔', 'When the bell rings, we go out for {recess|bed|dinner}.', '종이 울리면 쉬는 시간이라 밖에 나가요.'],
    ['✏️', 'I write my name with a {pencil|spoon|ball}.', '나는 연필로 이름을 써요.'],
    ['🧑‍🏫', 'Our teacher writes on the {board|floor|sky}.', '선생님이 칠판에 글씨를 써요.'],
    ['🍱', 'At noon, we eat {lunch|breakfast|dinner} together.', '점심때 우리는 함께 점심을 먹어요.'],
    ['🎒', 'I put my books in my {backpack|bathtub|oven}.', '나는 책을 책가방에 넣어요.'],
  ],
  'K-4': [
    ['🐄', 'The farmer milks the {cow|hen|dog} every morning.', '농부는 매일 아침 소의 젖을 짜요.'],
    ['🐔', 'The hen lays {eggs|apples|socks} in the barn.', '암탉이 헛간에서 알을 낳아요.'],
    ['🚜', 'The farmer drives a big {tractor|boat|rocket} in the field.', '농부는 밭에서 커다란 트랙터를 몰아요.'],
    ['🌽', 'We pick {corn|cake|candy} in the field.', '우리는 밭에서 옥수수를 따요.'],
    ['🐑', 'The sheep have soft {wool|wings|wheels}.', '양은 털이 부드러워요.'],
    ['🐷', 'The pigs roll in the {mud|milk|moon} to keep cool.', '돼지는 시원하려고 진흙에서 뒹굴어요.'],
  ],
  'L-1': [
    ['🥚', '{First|Last|Next}, the bird lays an egg.', '먼저 새가 알을 낳아요.'],
    ['🐣', '{Next|First|Finally}, the egg cracks.', '다음에 알이 깨져요.'],
    ['🐥', '{Then|First|Before}, a baby bird comes out.', '그다음에 아기 새가 나와요.'],
    ['🐦', '{Last|First|Next}, the bird flies away.', '마지막으로 새가 날아가요.'],
    ['🌱', 'First, I plant a {seed|cake|shoe}.', '먼저 씨앗을 심어요.'],
    ['🌻', 'Last, the seed grows into a {flower|fish|car}.', '마지막에 씨앗이 꽃으로 자라요.'],
  ],
  'L-2': [
    ['🐰', '{Who|What|Where} lost the carrot? The rabbit lost it.', '누가 당근을 잃어버렸나요? 토끼가 잃어버렸어요.'],
    ['🐻', '{What|Who|When} does the bear want? It wants honey.', '곰은 무엇을 원하나요? 꿀을 원해요.'],
    ['👧', 'Who found the cat? {Mia|The cat|The tree} found it.', '누가 고양이를 찾았나요? 미아가 찾았어요.'],
    ['🎁', 'What is in the box? A {puppy|pizza|planet} is in the box.', '상자 안에 무엇이 있나요? 강아지가 있어요.'],
    ['🐶', 'Who is barking? The {dog|cat|fish} is barking.', '누가 짖고 있나요? 개가 짖고 있어요.'],
    ['🍰', 'What did Tom make? He made a {cake|kite|car}.', '톰은 무엇을 만들었나요? 케이크를 만들었어요.'],
  ],
  'L-3': [
    ['🏖️', '{Where|Who|What} is Sam? He is at the beach.', '샘은 어디에 있나요? 해변에 있어요.'],
    ['🌙', '{When|Where|Who} does the owl wake up? At night.', '부엉이는 언제 깨어나나요? 밤에요.'],
    ['🐱', 'Where is the cat? It is in the {tree|sky|cup}.', '고양이는 어디에 있나요? 나무 위에 있어요.'],
    ['🎂', 'When is the party? It is {on|in|at} Sunday.', '파티는 언제인가요? 일요일이에요.'],
    ['🏫', 'Where do you study with friends? At {school|the sea|the moon}.', '친구들과 어디에서 공부하나요? 학교에서요.'],
    ['🌅', 'When do you eat breakfast? In the {morning|night|moon}.', '아침은 언제 먹나요? 아침에요.'],
  ],
  'L-4': [
    ['🐿️', 'Tori {finds|find|finding} a big acorn.', '토리가 큰 도토리를 찾아요.'],
    ['😣', 'The acorn is too {heavy|happy|hungry}.', '도토리가 너무 무거워요.'],
    ['🐻', 'Bear helps Tori {carry|eat|sleep} the acorn.', '곰이 토리가 도토리를 옮기는 것을 도와요.'],
    ['🏠', 'They take the acorn {home|school|sky}.', '그들은 도토리를 집으로 가져가요.'],
    ['😊', 'Tori says, "Thank you, {Bear|Tree|Acorn}!"', '토리가 "고마워, 곰아!" 하고 말해요.'],
    ['🎉', '{In the end|First|Before}, they share the acorn.', '마지막에 그들은 도토리를 나눠 먹어요.'],
  ],
  'M-1': [
    ['🍎', 'I {like|likes|liking} apples.', '나는 사과를 좋아해요.'],
    ['🍌', 'I like {bananas|banana|bananaes}.', '나는 바나나를 좋아해요.'],
    ['🍕', '{I|Me|My} like pizza.', '나는 피자를 좋아해요.'],
    ['🍓', 'I like {strawberries|strawberry|strawberrys}.', '나는 딸기를 좋아해요.'],
    ['🍇', 'My sister {likes|like|liking} grapes.', '내 여동생은 포도를 좋아해요.'],
    ['🥕', 'I like carrots {and|but|or} peas.', '나는 당근과 완두콩을 좋아해요.'],
    ['🍉', 'We {like|likes|liking} watermelon.', '우리는 수박을 좋아해요.'],
  ],
  'M-2': [
    ['🐍', "I {don't|doesn't|not} like snakes.", '나는 뱀을 좋아하지 않아요.'],
    ['🧅', "I don't like {onions|onion|onionz}.", '나는 양파를 좋아하지 않아요.'],
    ['🕸️', "I don't {like|likes|liking} spiders.", '나는 거미를 좋아하지 않아요.'],
    ['🥦', "He {doesn't|don't|not} like broccoli.", '그는 브로콜리를 좋아하지 않아요.'],
    ['🌧️', "I don't like rainy {days|day|dayes}.", '나는 비 오는 날을 좋아하지 않아요.'],
    ['🐭', "My cat likes mice, {but|and|so} I don't.", '우리 고양이는 쥐를 좋아하지만 나는 아니에요.'],
  ],
  'M-3': [
    ['⚽', '{Do|Does|Are} you like soccer? Yes, I do.', '너 축구 좋아하니? 응, 좋아해.'],
    ['🏀', "Do you like basketball? No, I {don't|do|am}.", '너 농구 좋아하니? 아니, 안 좋아해.'],
    ['🍦', "Do you like ice cream? Yes, I {do|don't|am}.", '너 아이스크림 좋아하니? 응, 좋아해.'],
    ['🎾', 'Do you like tennis? {Yes|No|Do}, I do.', '너 테니스 좋아하니? 응, 좋아해.'],
    ['🏊', 'Do you {like|likes|liking} swimming? Yes, I do.', '너 수영 좋아하니? 응, 좋아해.'],
    ['🙅', "Do you like spiders? {No|Yes|Do}, I don't.", '너 거미 좋아하니? 아니, 안 좋아해.'],
  ],
  'M-4': [
    ['🎵', '{What|Who|Where} do you like? I like music.', '너는 무엇을 좋아하니? 나는 음악을 좋아해.'],
    ['🧸', 'What do you like? I like {teddy bears|happy|run}.', '너는 무엇을 좋아하니? 나는 곰 인형을 좋아해.'],
    ['⚾', 'What sport do you like? I like {baseball|bananas|blue}.', '너는 어떤 운동을 좋아하니? 나는 야구를 좋아해.'],
    ['🎨', 'What do you like to do? I like to {draw|draws|drawing}.', '너는 무엇을 하는 걸 좋아하니? 나는 그림 그리기를 좋아해.'],
    ['🍩', 'What food do you {like|likes|liking}? I like donuts.', '너는 어떤 음식을 좋아하니? 나는 도넛을 좋아해.'],
    ['🐶', 'What animal do you like? I {like|likes|am} dogs.', '너는 어떤 동물을 좋아하니? 나는 개를 좋아해.'],
  ],
  'N-1': [
    ['🏊', 'I {can|cans|canned} swim.', '나는 수영할 수 있어요.'],
    ['🐧', "A penguin can't {fly|flies|flying}.", '펭귄은 날 수 없어요.'],
    ['🚲', '{Can|Do|Is} you ride a bike? Yes, I can.', '너 자전거 탈 수 있니? 응, 탈 수 있어.'],
    ['🎸', "Can you play the guitar? No, I {can't|can|don't}.", '너 기타 칠 수 있니? 아니, 못 쳐.'],
    ['🐦', 'A bird can {fly|flies|flying}.', '새는 날 수 있어요.'],
    ['🐟', "Fish {can|can't|is} swim, but they can't walk.", '물고기는 헤엄칠 수 있지만 걸을 수는 없어요.'],
  ],
  'N-2': [
    ['🚪', '{May|Must|Am} I come in?', '들어가도 될까요?'],
    ['💧', 'Can I {have|has|having} some water, please?', '물 좀 마셔도 될까요?'],
    ['🚽', 'May I go to the {restroom|moon|zoo}?', '화장실에 가도 될까요?'],
    ['🍪', 'May I have a cookie? Yes, you {may|must|are}.', '쿠키 하나 먹어도 될까요? 응, 먹어도 돼.'],
    ['📺', "Can I watch TV? No, you {can't|can|may}. It is bedtime.", 'TV 봐도 돼요? 아니, 안 돼. 잘 시간이야.'],
    ['✏️', '{May|Do|Is} I borrow your pencil?', '연필 좀 빌려도 될까?'],
  ],
  'N-3': [
    ['🧥', 'It is cold. You {should|shouldn\'t|must not} wear a coat.', '추워요. 코트를 입는 게 좋겠어요.'],
    ['🚦', "We {must|may|can't} stop at the red light.", '빨간불에서는 꼭 멈춰야 해요.'],
    ['🦷', 'You should {brush|brushes|brushing} your teeth.', '이를 닦아야 해요.'],
    ['🔥', 'You {must not|must|should} touch the fire.', '불을 만지면 절대 안 돼요.'],
    ['😴', 'You look tired. You should {sleep|eat|run} early.', '피곤해 보여. 일찍 자는 게 좋겠어.'],
    ['📚', 'We must be {quiet|loud|noisy} in the library.', '도서관에서는 조용히 해야 해요.'],
  ],
  'N-4': [
    ['👨‍🏫', 'Good morning, {Mr.|Mrs.|Ms.} Brown!', '안녕하세요, 브라운 선생님(남자)!'],
    ['👩‍⚕️', 'Thank you, {Dr.|Mr.|Grandpa} Lee. I feel better now.', '고맙습니다, 이 박사님(의사). 이제 나았어요.'],
    ['👵', 'I love you, {Grandma|Grandpa|Mr.}!', '할머니, 사랑해요!'],
    ['👩‍🏫', 'Excuse me, {Ms.|Mr.|Grandpa} Park. May I ask a question?', '실례합니다, 박 선생님(여자). 질문해도 될까요?'],
    ['👴', 'Here is your hat, {Grandpa|Grandma|Ms.}.', '할아버지, 모자 여기 있어요.'],
    ['👨', 'Can I help you, {sir|ma\'am|baby}?', '도와드릴까요, 손님(남자분)?'],
    ['👩', "Can I help you, {ma'am|sir|Mr.}?", '도와드릴까요, 손님(여자분)?'],
  ],
  'O-1': [
    ['🐱', '{Does|Do|Is} the cat like milk?', '고양이는 우유를 좋아하나요?'],
    ['👫', '{Do|Does|Is} they play soccer?', '그들은 축구를 하나요?'],
    ['👧', 'Does she {read|reads|reading} books?', '그 아이는 책을 읽나요?'],
    ['🐟', '{Do|Does|Are} fish sleep?', '물고기는 잠을 자나요?'],
    ['👦', '{Does|Do|Are} he walk to school?', '그 아이는 걸어서 학교에 가나요?'],
    ['🙋', '{Do|Does|Is} you like music?', '너는 음악을 좋아하니?'],
  ],
  'O-2': [
    ['👧', 'Does she like cats? Yes, she {does|do|is}.', '그 아이는 고양이를 좋아하나요? 네, 좋아해요.'],
    ['👫', "Do they swim? No, they {don't|doesn't|aren't}.", '그들은 수영하나요? 아니요, 안 해요.'],
    ['🐶', 'Does the dog run fast? Yes, it {does|do|is}.', '그 개는 빨리 달리나요? 네, 그래요.'],
    ['👦', "Does he eat carrots? No, he {doesn't|don't|isn't}.", '그 아이는 당근을 먹나요? 아니요, 안 먹어요.'],
    ['🐦', '{Does|Do|Is} the bird sing? Yes, it does.', '새는 노래하나요? 네, 그래요.'],
    ['🙋', 'Do you like pizza? Yes, {I|you|he} do.', '너 피자 좋아하니? 응, 좋아해.'],
  ],
  'O-3': [
    ['🐕', 'I have a {big|bigly|bigs} brown dog.', '나는 크고 갈색인 개가 있어요.'],
    ['⚽', 'It is a {red|reds|redly} ball.', '빨간 공이에요.'],
    ['🏠', 'We live in a small {white|whitely|whites} house.', '우리는 작고 하얀 집에 살아요.'],
    ['👧', 'She has long {black|blackly|blacks} hair.', '그 아이는 길고 검은 머리를 가졌어요.'],
    ['🌳', 'There is a {tall|tallly|talls} green tree in the park.', '공원에 키가 큰 초록 나무가 있어요.'],
    ['🐱', 'The cat is {soft|softly|softs} and fluffy.', '고양이는 부드럽고 폭신해요.'],
  ],
  'O-4': [
    ['🐢', 'The turtle walks {slowly|slow|slows}.', '거북은 천천히 걸어요.'],
    ['🐇', 'The rabbit runs {quickly|quick|quicks}.', '토끼는 빨리 달려요.'],
    ['🦁', 'The lion roars {loudly|loud|louds}.', '사자는 크게 으르렁거려요.'],
    ['👶', 'The baby sleeps {quietly|quiet|quiets}.', '아기는 조용히 자요.'],
    ['🎤', 'She sings {beautifully|beautiful|beauty}.', '그녀는 아름답게 노래해요.'],
    ['🐶', 'The dog plays {happily|happy|happys}.', '개는 신나게 놀아요.'],
  ],
  'P-1': [
    ['🎒', '{This|These|Those} is my bag.', '이것은 내 가방이에요.'],
    ['🐦', '{That|Those|These} is a bird.', '저것은 새예요.'],
    ['✏️', 'This {is|are|am} my pencil.', '이것은 내 연필이에요.'],
    ['🌙', 'Look! {That|These|Those} is the moon.', '봐! 저것은 달이야.'],
    ['📕', 'Is {this|these|those} your book?', '이것은 네 책이니?'],
    ['⛰️', '{That|These|Those} is a big mountain.', '저것은 큰 산이에요.'],
  ],
  'P-2': [
    ['👟', '{These|This|That} are my shoes.', '이것들은 내 신발이에요.'],
    ['🐦🐦', '{Those|That|This} are birds.', '저것들은 새예요.'],
    ['🍎🍎', 'These {are|is|am} apples.', '이것들은 사과예요.'],
    ['⭐⭐', 'Look at {those|that|this} stars!', '저 별들을 봐!'],
    ['🧦', 'Are {these|this|that} your socks?', '이것들은 네 양말이니?'],
    ['🍐🍐', '{These|This|That} pears are sweet.', '이 배들은 달아요.'],
  ],
  'P-3': [
    ['🧸', 'Is this yours? Yes, it is {mine|my|me}.', '이거 네 거니? 응, 내 거야.'],
    ['🎒', '{This|These|Those} is mine.', '이것은 내 것이에요.'],
    ['⚽', "Is that your ball? No, {that|those|these} is Tom's.", '저거 네 공이니? 아니, 저건 톰 거야.'],
    ['🖍️', 'I like {these|this|that}. They are pretty.', '나는 이것들이 좋아요. 예뻐요.'],
    ['📕', 'What is {that|those|these}? It is a book.', '저것은 무엇이니? 책이야.'],
    ['🍪', 'Can I have {this|these|those}? It looks yummy.', '이거 먹어도 돼? 맛있어 보여.'],
  ],
  'P-4': [
    ['🍎', '{This|These|Those} apple is red.', '이 사과는 빨개요.'],
    ['🐦🐦', '{Those|That|This} birds are small.', '저 새들은 작아요.'],
    ['🌸', '{That|Those|These} flower is pretty.', '저 꽃은 예뻐요.'],
    ['🍌🍌', 'These bananas {are|is|am} yellow.', '이 바나나들은 노래요.'],
    ['🐶', 'This dog {is|are|am} friendly.', '이 개는 다정해요.'],
    ['👟👟', '{Those|That|This} shoes are too big.', '저 신발은 너무 커요.'],
  ],
  'Q-1': [
    ['🐟', 'The fish is {in|on|under} the water.', '물고기는 물속에 있어요.'],
    ['🎩', 'The hat is {on|in|under} my head.', '모자는 내 머리 위에 있어요.'],
    ['🥛', 'The milk is {in|on|under} the fridge.', '우유는 냉장고 안에 있어요.'],
    ['🖼️', 'The picture is {on|in|under} the wall.', '그림은 벽에 걸려 있어요.'],
    ['☂️', 'We stand {under|on|in} the umbrella.', '우리는 우산 아래에 서 있어요.'],
    ['🍪', 'The cookies are {in|on|under} the jar.', '쿠키는 병 안에 있어요.'],
    ['🐦', 'The bird is {on|in|under} the roof.', '새가 지붕 위에 있어요.'],
  ],
  'Q-2': [
    ['🧒', 'I sit {next to|behind|under} my best friend.', '나는 가장 친한 친구 옆에 앉아요.'],
    ['🐱', "The cat hides {behind|between|in front of} the door. I can't see it.", '고양이가 문 뒤에 숨어요. 안 보여요.'],
    ['🥪', 'The cheese is {between|behind|next to} the two pieces of bread.', '치즈는 빵 두 조각 사이에 있어요.'],
    ['📸', 'We stand {in front of|behind|between} the camera to take a photo.', '사진을 찍으려고 카메라 앞에 서요.'],
    ['🏫', 'The park is {next to|between|behind} the school. They are side by side.', '공원은 학교 옆에 있어요. 나란히 있어요.'],
    ['🔤', 'B is {between|behind|in front of} A and C.', 'B는 A와 C 사이에 있어요.'],
  ],
  'Q-3': [
    ['👦', 'Tom is my friend. I like {him|he|his}.', '톰은 내 친구예요. 나는 그 아이가 좋아요.'],
    ['👧', "Where is Mia? I can't find {her|she|hers}.", '미아는 어디 있어? 그 아이를 찾을 수 없어.'],
    ['🐱🐱', 'I have two cats. I love {them|they|their}.', '고양이가 두 마리 있어요. 나는 그 고양이들을 사랑해요.'],
    ['🙋', 'Can you help {me|I|my}?', '나 좀 도와줄래?'],
    ['⚽', 'This is my ball. I kick {it|its|they} hard.', '이건 내 공이야. 나는 공을 세게 차요.'],
    ['👫', 'Mom calls {us|we|our} for dinner.', '엄마가 저녁 먹으라고 우리를 불러요.'],
  ],
  'Q-4': [
    ['🪑', '{Sit|Sits|Sitting} down, please.', '앉아 주세요.'],
    ['❓', '{Where|What|Who} is my hat?', '내 모자는 어디 있지?'],
    ['😲', '{What|How|Who} a big cake!', '정말 큰 케이크다!'],
    ['🧹', '{Clean|Cleans|Cleaning} your room, please.', '방을 치워 주세요.'],
    ['🐶', 'I have a dog{.|?|!}', '나는 개가 있어요.'],
    ['❔', 'Is it your bag{?|.|!}', '그거 네 가방이니?'],
  ],
  'R-1': [
    ['🕖', "What time is it? It is seven {o'clock|clock|time}.", '몇 시야? 7시야.'],
    ['🕗', "I go to school {at|on|in} eight o'clock.", '나는 8시에 학교에 가요.'],
    ['🕒', "{What|When|Where} time is it? It is three o'clock.", '몇 시야? 3시야.'],
    ['🕤', 'It is nine {thirty|three|thirteen}.', '9시 30분이에요.'],
    ['🕛', 'We eat lunch {at|on|in} twelve.', '우리는 12시에 점심을 먹어요.'],
    ['🕘', "It is {nine|five|six} o'clock. Time for bed!", '9시야. 잘 시간이야!'],
  ],
  'R-2': [
    ['📅', 'Today is {Monday|Monkey|Money}.', '오늘은 월요일이에요.'],
    ['🏊', 'I go swimming {on|in|at} Tuesday.', '나는 화요일에 수영하러 가요.'],
    ['🎨', 'We have art class {on|at|in} Friday.', '우리는 금요일에 미술 수업이 있어요.'],
    ['🛌', 'I sleep late {on|in|at} Sunday.', '나는 일요일에 늦잠을 자요.'],
    ['📆', 'There are {seven|five|ten} days in a week.', '일주일은 7일이에요.'],
    ['🎵', 'I have a piano lesson on {Wednesday|Wendy|Window}.', '나는 수요일에 피아노 수업이 있어요.'],
  ],
  'R-3': [
    ['🎂', 'When is your birthday? It is {in|on|at} May.', '네 생일은 언제야? 5월이야.'],
    ['🎄', 'Christmas is in {December|Monday|morning}.', '크리스마스는 12월에 있어요.'],
    ['❄️', 'It snows {in|on|at} January.', '1월에는 눈이 와요.'],
    ['🌸', '{When|What|Who} do flowers bloom? In April.', '꽃은 언제 피나요? 4월에요.'],
    ['📅', 'There are {twelve|seven|ten} months in a year.', '1년은 12달이에요.'],
    ['🏖️', 'We go to the beach {in|on|at} August.', '우리는 8월에 해변에 가요.'],
  ],
  'R-4': [
    ['⏰', 'I {get|gets|getting} up at seven.', '나는 7시에 일어나요.'],
    ['🪥', 'I brush my teeth {at|on|in} seven ten.', '나는 7시 10분에 이를 닦아요.'],
    ['🏫', "I go to school at eight {o'clock|clock|time}.", '나는 8시에 학교에 가요.'],
    ['🍽️', 'I eat dinner {at|on|in} six thirty.', '나는 6시 30분에 저녁을 먹어요.'],
    ['🛁', 'I take a bath {in|on|at} the evening.', '나는 저녁에 목욕을 해요.'],
    ['🛌', 'I go to {bed|bad|bat} at nine.', '나는 9시에 자요.'],
  ],
  'S-1': [
    ['🏦', 'Where is the bank? It is {across from|between|under} the park.', '은행은 어디에 있어요? 공원 건너편에 있어요.'],
    ['🏥', 'The hospital is {near|next|nearly} my house. I can walk there.', '병원은 우리 집 가까이에 있어요. 걸어갈 수 있어요.'],
    ['📚', 'The library is {next to|next|near to} the school.', '도서관은 학교 옆에 있어요.'],
    ['🏪', '{Where|What|Who} is the store? It is on Main Street.', '가게는 어디에 있나요? 메인 거리에 있어요.'],
    ['🏞️', "The park is far {from|to|at} here. Let's take a bus.", '공원은 여기서 멀어요. 버스를 타자.'],
    ['🏤', 'The post office is {between|across|behind of} the bank and the bakery.', '우체국은 은행과 빵집 사이에 있어요.'],
  ],
  'S-2': [
    ['⬆️', 'Go {straight|straightly|strait} for two blocks.', '두 블록 곧장 가세요.'],
    ['⬅️', 'Turn {left|right|up} at the corner.', '모퉁이에서 왼쪽으로 도세요.'],
    ['➡️', 'Turn {right|left|down} at the bank.', '은행에서 오른쪽으로 도세요.'],
    ['🗺️', 'Excuse me. {How|What|Who} can I get to the zoo?', '실례합니다. 동물원에 어떻게 가나요?'],
    ['👈', 'It is {on|in|at} your left.', '왼쪽에 있어요.'],
    ['🚦', 'Cross the street at the {light|night|lake}.', '신호등에서 길을 건너세요.'],
  ],
  'S-3': [
    ['🪥✅✅✅✅✅', 'I {always|never|sometimes} brush my teeth before bed.', '나는 자기 전에 항상 이를 닦아요.'],
    ['🥦❌❌❌❌❌', 'I {never|always|usually} eat broccoli.', '나는 브로콜리를 절대 안 먹어요.'],
    ['🚲✅❌✅❌❌', 'I {sometimes|always|never} ride my bike.', '나는 가끔 자전거를 타요.'],
    ['🚌✅✅✅✅❌', 'I {usually|never|sometimes} take the bus to school.', '나는 보통 버스를 타고 학교에 가요.'],
    ['📖✅✅✅❌❌', 'She {often|never|always} reads books.', '그 아이는 자주 책을 읽어요.'],
    ['🐶✅✅✅✅✅', 'My dog is {always|never|sometimes} happy to see me.', '우리 개는 나를 보면 항상 기뻐해요.'],
  ],
  'S-4': [
    ['📖', 'I {usually read|read usually|usually reads} a book before bed.', '나는 보통 자기 전에 책을 읽어요.'],
    ['🥛', 'I {always drink|drink always|always drinks} milk in the morning.', '나는 아침에 항상 우유를 마셔요.'],
    ['🎮', 'He {sometimes plays|plays sometimes|sometimes play} games after school.', '그는 방과 후에 가끔 게임을 해요.'],
    ['⏰', 'I {am never|never am|never is} late for school.', '나는 학교에 절대 늦지 않아요.'],
    ['🐱', 'My cat {often sleeps|sleeps often|often sleep} on my bed.', '우리 고양이는 자주 내 침대에서 자요.'],
    ['🧹', 'How often do you clean your room? I clean it {once a week|one a week|once week}.', '얼마나 자주 방을 치우니? 일주일에 한 번 치워.'],
  ],
  'T-1': [
    ['🥚', 'I need {an|a|some} egg.', '나는 달걀 한 개가 필요해요.'],
    ['🥚🥚🥚', 'I need three {eggs|egg|egges}.', '나는 달걀 세 개가 필요해요.'],
    ['🍊', 'I have {an|a|two} orange.', '나는 오렌지 한 개가 있어요.'],
    ['🍅🍅', 'I have two {tomatoes|tomatos|tomato}.', '나는 토마토 두 개가 있어요.'],
    ['🍓🍓🍓', 'There are many {strawberries|strawberrys|strawberry}.', '딸기가 많이 있어요.'],
    ['🥕🥕', 'The rabbit wants two {carrots|carrot|carrotes}.', '토끼는 당근 두 개를 원해요.'],
  ],
  'T-2': [
    ['🥛', 'I want {some|a|two} milk.', '나는 우유를 좀 원해요.'],
    ['💧', 'Can I have a glass of {water|waters|a water}?', '물 한 잔 마실 수 있을까요?'],
    ['🍞', 'I eat {some|an|two} bread for breakfast.', '나는 아침으로 빵을 좀 먹어요.'],
    ['🧀', 'There is {some|a|many} cheese on the pizza.', '피자 위에 치즈가 좀 있어요.'],
    ['🍚', 'We eat {rice|rices|a rice} every day.', '우리는 매일 밥을 먹어요.'],
    ['🧃', 'I drink a box of {juice|juices|a juice}.', '나는 주스 한 팩을 마셔요.'],
  ],
  'T-3': [
    ['🍎🍎🍎', 'How {many|much|lot} apples do you have? I have three.', '사과 몇 개 있어? 세 개 있어.'],
    ['🥛', 'How {much|many|lot} milk do you want? Just a little.', '우유 얼마나 줄까? 조금만.'],
    ['🐶🐶', 'How many dogs {are|is|am} there? There are two.', '개가 몇 마리 있어? 두 마리 있어.'],
    ['💧', 'How much water {is|are|am} in the cup?', '컵에 물이 얼마나 있어?'],
    ['🍪🍪🍪🍪', 'How {many|much|lot} cookies can I eat? You can eat four.', '쿠키 몇 개 먹어도 돼? 네 개 먹어도 돼.'],
    ['🪙', 'How {much|many|lot} is it? It is two dollars.', '이거 얼마예요? 2달러예요.'],
  ],
  'T-4': [
    ['🍔', 'Can I {have|has|having} a hamburger, please?', '햄버거 하나 주시겠어요?'],
    ['🧃', "I'd like {some|a|many} juice, please.", '주스 좀 주세요.'],
    ['🍕', "What would you like? I'd like a slice of {pizza|pizzas|a pizza}.", '무엇을 드릴까요? 피자 한 조각 주세요.'],
    ['🍟', 'Do you want fries {with|and|for} that?', '그거랑 감자튀김도 드릴까요?'],
    ['💵', 'Here {is|are|am} your change.', '거스름돈 여기 있어요.'],
    ['😋', 'It looks {delicious|delicioused|deliciously}! Thank you.', '맛있어 보여요! 감사합니다.'],
  ],
  'U-1': [
    ['🐘🐶', 'An elephant is {bigger|big|biggest} than a dog.', '코끼리는 개보다 커요.'],
    ['🐭🐱', 'A mouse is {smaller|small|smallest} than a cat.', '쥐는 고양이보다 작아요.'],
    ['🐆🐢', 'A cheetah is {faster|fast|fastest} than a turtle.', '치타는 거북보다 빨라요.'],
    ['🦒🐴', 'A giraffe is taller {than|then|that} a horse.', '기린은 말보다 키가 커요.'],
    ['🧊☕', 'Ice is {colder|cold|coldest} than tea.', '얼음은 차보다 차가워요.'],
    ['👦👶', 'My brother is {older|old|oldest} than me.', '우리 형은 나보다 나이가 많아요.'],
  ],
  'U-2': [
    ['🦒', 'The giraffe is the {tallest|taller|tall} animal.', '기린은 가장 키가 큰 동물이에요.'],
    ['🐳', 'The blue whale is the {biggest|bigger|big} animal in the sea.', '대왕고래는 바다에서 가장 큰 동물이에요.'],
    ['🐆', 'The cheetah is the {fastest|faster|fast} runner.', '치타는 가장 빠른 달리기 선수예요.'],
    ['⛰️', 'It is the {highest|higher|high} mountain in Korea.', '그것은 한국에서 가장 높은 산이에요.'],
    ['🐜', 'The ant is the {smallest|smaller|small} of all.', '개미가 모두 중에서 가장 작아요.'],
    ['🏆', 'She is the {best|good|better} player on the team.', '그녀는 팀에서 가장 잘하는 선수예요.'],
  ],
  'U-3': [
    ['🌹', 'This rose is {more|most|much} beautiful than that one.', '이 장미가 저것보다 더 아름다워요.'],
    ['🎡', 'This is the {most|more|very} exciting ride in the park.', '이것이 공원에서 가장 신나는 놀이기구예요.'],
    ['🌋', 'The volcano is {very|more|most} hot.', '화산은 아주 뜨거워요.'],
    ['🍰', 'This cake is {really|more|most} sweet.', '이 케이크는 정말 달아요.'],
    ['🌍', 'Is the sun {bigger|more big|biggest} than the earth?', '해는 지구보다 더 크나요?'],
    ['📚', 'Which book is {more|most|much} interesting?', '어떤 책이 더 재미있어?'],
  ],
  'U-4': [
    ['🍕', 'I think pizza is the {best|good|better} food.', '나는 피자가 최고의 음식이라고 생각해.'],
    ['🤝', 'I {agree|agrees|agreeing} with you.', '네 말에 동의해.'],
    ['🙅', "I don't {think|thinks|thought} so. I like soup better.", '나는 그렇게 생각하지 않아. 나는 수프가 더 좋아.'],
    ['🌞', 'It is a fact that the sun is {hot|cold|small}.', '해가 뜨겁다는 것은 사실이에요.'],
    ['⚽', 'You like soccer, {but|so|because} I like basketball.', '너는 축구를 좋아하지만 나는 농구를 좋아해.'],
    ['😊', "Let's play both games. {That|This|These} sounds fair!", '둘 다 하자. 그게 공평하겠다!'],
  ],
  'V-1': [
    ['😴', 'I {was|were|am} sleepy yesterday.', '나는 어제 졸렸어요.'],
    ['☀️', 'It {was|were|is} sunny last Sunday.', '지난 일요일에는 맑았어요.'],
    ['🐶', 'My dog {was|were|is} small last year.', '우리 개는 작년에 작았어요.'],
    ['🥶', 'The water {was|were|are} very cold.', '물이 아주 차가웠어요.'],
    ['🎂', 'Yesterday {was|were|is} my birthday.', '어제는 내 생일이었어요.'],
    ['🏫', 'She {was|were|is} at school this morning.', '그녀는 오늘 아침에 학교에 있었어요.'],
  ],
  'V-2': [
    ['🏞️', 'We {were|was|are} at the park yesterday.', '우리는 어제 공원에 있었어요.'],
    ['😊', 'They {were|was|is} happy at the party.', '그들은 파티에서 행복했어요.'],
    ['🍪', 'The cookies {were|was|is} delicious.', '쿠키가 맛있었어요.'],
    ['👫', 'You {were|was|is} my best friend in kindergarten.', '너는 유치원 때 내 가장 친한 친구였어.'],
    ['🐱🐱', 'The kittens {were|was|is} very tiny.', '새끼 고양이들은 아주 작았어요.'],
    ['🌧️', 'The streets {were|was|is} wet after the rain.', '비가 온 뒤 거리가 젖어 있었어요.'],
  ],
  'V-3': [
    ['❓', '{Where|Was|Were} were you yesterday? I was at home.', '어제 어디에 있었니? 집에 있었어.'],
    ['🎪', '{Was|Were|Is} it fun yesterday? Yes, it was.', '어제 재미있었어? 응, 재미있었어.'],
    ['🏖️', 'Were you at the beach? Yes, I {was|were|am}.', '너 해변에 있었니? 응, 있었어.'],
    ['🌧️', 'It is sunny now, but it {was|is|were} rainy yesterday.', '지금은 맑지만 어제는 비가 왔어요.'],
    ['😊', 'I am happy {now|yesterday|last week}.', '나는 지금 행복해요.'],
    ['🏫', 'We were at school {yesterday|tomorrow|now}.', '우리는 어제 학교에 있었어요.'],
  ],
  'V-4': [
    ['👶', 'When I was a baby, I {was|am|were} very small.', '내가 아기였을 때 나는 아주 작았어요.'],
    ['🧸', 'My favorite toy {was|were|is} a teddy bear when I was three.', '세 살 때 가장 좋아한 장난감은 곰 인형이었어요.'],
    ['🍼', 'When I was little, I {was|were|am} afraid of the dark.', '어렸을 때 나는 어둠을 무서워했어요.'],
    ['👵', 'My grandma {was|were|is} a teacher a long time ago.', '우리 할머니는 오래전에 선생님이셨어요.'],
    ['📷', 'In this photo, I was {two|tomorrow|next} years old.', '이 사진에서 나는 두 살이었어요.'],
    ['🎒', 'Now I {am|was|were} a student.', '이제 나는 학생이에요.'],
  ],
  'W-1': [
    ['⚽', 'I {played|play|playing} soccer yesterday.', '나는 어제 축구를 했어요.'],
    ['🐸', 'The frog {jumped|jump|jumps} into the pond last night.', '개구리가 어젯밤 연못으로 뛰어들었어요.'],
    ['🧼', 'She {washed|wash|washes} the dishes last night.', '그녀는 어젯밤 설거지를 했어요.'],
    ['🚶', 'We {walked|walk|walks} to the park yesterday.', '우리는 어제 공원까지 걸어갔어요.'],
    ['🎨', 'He {painted|paint|paints} a picture last week.', '그는 지난주에 그림을 그렸어요.'],
    ['📞', 'Mom {called|call|calls} me an hour ago.', '엄마가 한 시간 전에 나에게 전화했어요.'],
  ],
  'W-2': [
    ['🏫', 'I {went|goed|go} to school yesterday.', '나는 어제 학교에 갔어요.'],
    ['🍎', 'She {ate|eated|eat} an apple this morning.', '그녀는 오늘 아침에 사과를 먹었어요.'],
    ['🦁', 'We {saw|seed|see} a lion at the zoo.', '우리는 동물원에서 사자를 봤어요.'],
    ['🎁', 'I {had|haved|have} a great birthday party last year.', '나는 작년에 멋진 생일 파티를 했어요.'],
    ['✏️', 'He {wrote|writed|write} a letter to his grandma.', '그는 할머니께 편지를 썼어요.'],
    ['🏃', 'The dog {ran|runned|run} after the ball.', '개가 공을 쫓아 달렸어요.'],
  ],
  'W-3': [
    ['📅', 'I visited my aunt {last|next|this} week.', '나는 지난주에 이모를 방문했어요.'],
    ['⏳', 'We moved here two years {ago|before|last}.', '우리는 2년 전에 여기로 이사 왔어요.'],
    ['🌙', 'I watched a movie {last night|tomorrow|next week}.', '나는 어젯밤에 영화를 봤어요.'],
    ['☀️', '{Yesterday|Tomorrow|Next week}, we went to the beach.', '어제 우리는 해변에 갔어요.'],
    ['🍰', 'She baked a cake {yesterday|tomorrow|now} afternoon.', '그녀는 어제 오후에 케이크를 구웠어요.'],
    ['🎈', 'The party {was|is|will} last Saturday.', '파티는 지난 토요일이었어요.'],
  ],
  'W-4': [
    ['🎒', "{Whose|Who|Who's} bag is this?", '이건 누구의 가방이니?'],
    ['🧢', "Is this cap yours? Yes, it's {mine|my|me}.", '이 모자 네 거니? 응, 내 거야.'],
    ['👟', "Whose shoes are these? They are {Tom's|Tom|Toms's}.", '이건 누구 신발이야? 톰 거야.'],
    ['📕', 'Is this book {yours|your|you}?', '이 책 네 거니?'],
    ['🧸', 'That teddy bear is {hers|her|she}.', '저 곰 인형은 그 아이 거야.'],
    ['⚽', "Whose ball is that? It's {his|he|him}.", '저건 누구 공이야? 그 아이 거야.'],
  ],
  'X-1': [
    ['🍳', "I {didn't|don't|not} eat breakfast this morning.", '나는 오늘 아침에 아침을 안 먹었어요.'],
    ['📺', "We didn't {watch|watched|watches} TV last night.", '우리는 어젯밤 TV를 보지 않았어요.'],
    ['☔', "She didn't {bring|brought|brings} her umbrella.", '그녀는 우산을 가져오지 않았어요.'],
    ['🛌', "He {didn't|doesn't|wasn't} sleep well last night.", '그는 어젯밤 잠을 잘 자지 못했어요.'],
    ['🐶', "The dog didn't {bark|barked|barks} at all.", '개가 전혀 짖지 않았어요.'],
    ['📝', "I didn't {finish|finished|finishes} my homework yesterday.", '나는 어제 숙제를 끝내지 못했어요.'],
  ],
  'X-2': [
    ['🎬', '{Did|Do|Were} you see the movie? Yes, I did.', '너 그 영화 봤니? 응, 봤어.'],
    ['🍰', "Did you eat the cake? No, I {didn't|don't|wasn't}.", '너 케이크 먹었니? 아니, 안 먹었어.'],
    ['⚽', 'Did they {win|won|wins} the game?', '그들이 경기에서 이겼니?'],
    ['🎁', 'Did she {like|liked|likes} the present? Yes, she did.', '그녀가 선물을 좋아했니? 응, 좋아했어.'],
    ['🏊', "{Did|Was|Do} he swim yesterday? No, he didn't.", '그는 어제 수영했니? 아니, 안 했어.'],
    ['📚', 'What did you {read|readed|reads} last night?', '어젯밤에 무엇을 읽었니?'],
  ],
  'X-3': [
    ['🧼', 'I washed my hands {before|after|when} I ate lunch.', '나는 점심을 먹기 전에 손을 씻었어요.'],
    ['🛁', 'I took a bath {after|before|while} I played in the mud.', '나는 진흙에서 논 후에 목욕을 했어요.'],
    ['🪥', 'I brushed my teeth {after|before|until} I ate dinner.', '나는 저녁을 먹은 후에 이를 닦았어요.'],
    ['🧥', 'Put on your coat {before|after|while} you go out.', '나가기 전에 코트를 입어요.'],
    ['🏠', '{After|Before|Until} the movie ended, we went home.', '영화가 끝난 후에 우리는 집에 갔어요.'],
    ['🍪', 'We had cookies after we {finished|finish|finishing} the puzzle.', '퍼즐을 다 맞춘 후에 쿠키를 먹었어요.'],
  ],
  'X-4': [
    ['🌧️', '{When|While|Because} I got home, it was raining.', '내가 집에 왔을 때 비가 오고 있었어요.'],
    ['📞', 'The phone rang {while|after|before} I was taking a shower.', '내가 샤워하는 동안 전화가 울렸어요.'],
    ['😲', 'When I opened the door, I {saw|see|seeing} a puppy.', '문을 열었을 때 강아지가 보였어요.'],
    ['🎵', 'She sang while she {was|were|is} cooking.', '그녀는 요리하는 동안 노래를 불렀어요.'],
    ['🐶', 'The dog barked {when|while|until} the mailman came.', '우체부가 왔을 때 개가 짖었어요.'],
    ['🌈', 'When the rain {stopped|stop|stops}, we saw a rainbow.', '비가 그쳤을 때 무지개를 봤어요.'],
  ],
  'Y-1': [
    ['🌧️', 'It {will|wills|is} rain tomorrow.', '내일 비가 올 거예요.'],
    ['🤝', 'I will {help|helps|helped} you.', '내가 도와줄게.'],
    ['🎂', 'She will {be|is|being} eight next year.', '그녀는 내년에 여덟 살이 될 거예요.'],
    ['📞', 'I {will|wills|willing} call you later.', '나중에 전화할게.'],
    ['🚀', 'Someday, I will {fly|flew|flying} to the moon.', '언젠가 나는 달에 갈 거예요.'],
    ['⏰', "I won't {be|am|was} late again.", '다시는 늦지 않을게요.'],
  ],
  'Y-2': [
    ['👵', 'I am going {to|for|at} visit my grandma.', '나는 할머니 댁에 갈 거예요.'],
    ['🍳', 'Dad is going to {cook|cooks|cooked} dinner.', '아빠가 저녁을 요리할 거예요.'],
    ['🏕️', 'We {are|is|am} going to go camping.', '우리는 캠핑을 갈 거예요.'],
    ['⚽', 'They are {going|go|goes} to play soccer after school.', '그들은 방과 후에 축구를 할 거예요.'],
    ['🎨', 'I am going to {paint|painted|paints} my room blue.', '나는 내 방을 파란색으로 칠할 거예요.'],
    ['☁️', 'Look at the clouds! It is going to {rain|rains|rained}.', '구름 좀 봐! 비가 올 것 같아.'],
  ],
  'Y-3': [
    ['🗓️', 'What {will|did|do} you do this weekend?', '이번 주말에 뭐 할 거야?'],
    ['🏊', 'I will go swimming {next|last|ago} Saturday.', '나는 다음 주 토요일에 수영하러 갈 거야.'],
    ['🎡', 'We are going to visit the fair {tomorrow|yesterday|last week}.', '우리는 내일 축제에 갈 거예요.'],
    ['📚', 'Next week, I {will|was|did} read three books.', '다음 주에 나는 책 세 권을 읽을 거예요.'],
    ['✈️', '{Where|What|Who} are you going to go this summer?', '이번 여름에 어디 갈 거야?'],
    ['🎂', 'My birthday party will be {next|last|ago} Sunday.', '내 생일 파티는 다음 주 일요일이에요.'],
  ],
  'Y-4': [
    ['😢', "I lost my dog. Oh no! I'm {sorry|happy|glad} to hear that.", '강아지를 잃어버렸어. 저런! 정말 안됐다.'],
    ['🎉', 'I won the race! {Congratulations|Sorry|Too bad}!', '달리기 시합에서 이겼어! 축하해!'],
    ['🤒', "I have a cold. That's too {bad|good|great}. Get well soon!", '감기에 걸렸어. 안됐다. 빨리 나아!'],
    ['🏖️', 'We are going to the beach. That {sounds|sound|sounding} great!', '우리 해변에 갈 거야. 정말 좋겠다!'],
    ['😟', "Don't {worry|worried|worries}. I will help you.", '걱정하지 마. 내가 도와줄게.'],
    ['🤗', 'I know how you {feel|feels|feeling}.', '네 마음 알아.'],
  ],
  'Z-1': [
    ['🚌', 'How do you go to school? {By|On|With} bus.', '학교에 어떻게 가니? 버스로 가.'],
    ['🚶', 'How does she go to the park? She goes {on|by|with} foot.', '그녀는 공원에 어떻게 가니? 걸어서 가.'],
    ['☁️', '{How|What|Why} is the weather today? It is cloudy.', '오늘 날씨는 어때? 흐려.'],
    ['😊', 'How {are|is|am} you? I am great, thanks.', '어떻게 지내? 잘 지내, 고마워.'],
    ['🚲', 'How do you get to the library? I ride my {bike|bikes|biking}.', '도서관에 어떻게 가니? 자전거를 타고 가.'],
    ['🧊', 'How {is|are|am} the water? It is cold.', '물은 어때? 차가워.'],
  ],
  'Z-2': [
    ['😢', '{Why|How|Where} are you sad? Because I lost my cap.', '왜 슬프니? 모자를 잃어버렸거든.'],
    ['😋', 'I am eating {because|so|but} I am hungry.', '배고파서 먹고 있어요.'],
    ['🧥', 'I wear a coat because it is {cold|hot|sunny}.', '추워서 코트를 입어요.'],
    ['😴', 'Why are you tired? {Because|So|But} I went to bed late.', '왜 피곤하니? 늦게 잤거든.'],
    ['☂️', 'It is raining, {so|because|but} I take an umbrella.', '비가 와서 우산을 챙겨요.'],
    ['🏃', 'Why did you run? Because I was {late|early|sleepy}.', '왜 뛰었어? 늦었거든.'],
  ],
  'Z-3': [
    ['🥞', '{First|Finally|Last}, crack the eggs into a bowl.', '먼저 그릇에 달걀을 깨요.'],
    ['🥛', '{Then|First|Finally}, add some milk.', '그다음에 우유를 조금 넣어요.'],
    ['🥄', '{Next|First|Last}, mix them well.', '다음으로 잘 섞어요.'],
    ['🍳', '{Finally|First|Next}, cook it in a pan.', '마지막으로 팬에 익혀요.'],
    ['🌱', 'First, plant the seed. Then, {water|watered|waters} it every day.', '먼저 씨앗을 심어요. 그다음에 매일 물을 줘요.'],
    ['🌻', 'Finally, the {flower|seed|water} grows tall.', '마지막에 꽃이 키 크게 자라요.'],
  ],
  'Z-4': [
    ['🐶', 'I have a dog, {and|but|because} his name is Max.', '나는 개가 있고, 이름은 맥스예요.'],
    ['🌧️', 'We wanted to play outside, {but|and|so} it rained.', '우리는 밖에서 놀고 싶었지만 비가 왔어요.'],
    ['🧩', 'So we did a puzzle {inside|outside|upside}.', '그래서 우리는 안에서 퍼즐을 했어요.'],
    ['🌈', '{When|Because|But} the rain stopped, we saw a rainbow.', '비가 그쳤을 때 무지개를 봤어요.'],
    ['😊', 'We were happy {because|but|so} the rainbow was beautiful.', '무지개가 아름다워서 우리는 행복했어요.'],
    ['🏃', 'We ran outside, {and|but|because} Max ran with us.', '우리는 밖으로 달려 나갔고, 맥스도 함께 달렸어요.'],
  ],
};

/* ---------- 외계인 챗: 단계별 질문과 대답 [대답, 그림, 지브의 맞장구] ---------- */
export const EN_DIALOGS = {
  G: [
    { q: 'How are you today?', a: [['I am happy.', '😊', 'Happy! Me too!'], ['I am tired.', '😩', 'Tired? Get some rest!'], ['I am hungry.', '😋', "Hungry? Let's eat!"]] },
    { q: 'Are you a student?', a: [['Yes, I am.', '🎒', 'Great! I am a student too!'], ['No, I am not.', '🙅', 'Okay! You are my friend!']] },
    { q: 'Who is your friend?', a: [['She is Mia.', '👧', 'Hi, Mia!'], ['He is Tom.', '👦', 'Hello, Tom!']] },
  ],
  I: [
    { q: 'Look! Is it a cat?', a: [['Yes, it is.', '🐱', 'A cute cat!'], ["No, it isn't.", '🐶', 'Oh, it is a dog!']] },
    { q: 'What is it?', a: [['It is a ball.', '⚽', "Let's play ball!"], ['It is a book.', '📖', 'I love books!']] },
    { q: 'Are you hungry?', a: [['Yes, I am.', '😋', "Let's eat a snack!"], ["No, I'm not.", '🙂', 'Okay! Maybe later.']] },
    { q: 'Who is she?', a: [['She is my mom.', '👩', 'Hello, Mom!'], ['She is my sister.', '👧', 'Hi, sister!']] },
  ],
  J: [
    { q: 'How do you feel today?', a: [['I feel happy.', '😊', 'Yay! I feel happy too!'], ['I feel sleepy.', '😴', 'Take a little nap!'], ['I feel excited.', '🤩', 'Wow! What is fun today?']] },
    { q: 'What do you want?', a: [['I want a cake.', '🎂', 'Yum! A big cake!'], ['I want a new kite.', '🪁', "Let's fly it together!"]] },
    { q: 'What do you think of my spaceship?', a: [['I think it is cool.', '🛸', 'Thank you!'], ['I think it is big.', '🚀', 'Yes, it is very big!']] },
  ],
  K: [
    { q: 'What is your favorite season?', a: [['I like spring.', '🌸', 'Flowers are pretty!'], ['I like winter.', '❄️', "Let's make a snowman!"]] },
    { q: 'What do you do at school?', a: [['I read books.', '📚', 'Smart!'], ['I play with friends.', '🧒', 'Fun!']] },
    { q: 'What animals live on a farm?', a: [['Cows and pigs.', '🐄', 'Moo! Oink!'], ['Hens and sheep.', '🐔', 'Cluck! Baa!']] },
  ],
  L: [
    { q: 'What is your favorite story?', a: [['I like animal stories.', '🐻', 'Me too!'], ['I like funny stories.', '😂', 'Ha ha!']] },
    { q: 'Who is in your story?', a: [['A brave rabbit.', '🐰', 'So brave!'], ['A little dragon.', '🐉', 'Wow!']] },
    { q: 'Where does the story happen?', a: [['In a forest.', '🌲', 'Green and quiet!'], ['In a castle.', '🏰', 'A royal story!']] },
  ],
  M: [
    { q: 'Do you like apples?', a: [['Yes, I do.', '🍎', 'Me too! Apples are sweet.'], ["No, I don't.", '🙅', 'Okay! Maybe bananas?']] },
    { q: 'What do you like?', a: [['I like music.', '🎵', "Let's sing together!"], ['I like soccer.', '⚽', "Let's play soccer!"], ['I like books.', '📚', 'Reading is fun!']] },
    { q: "What don't you like?", a: [["I don't like snakes.", '🐍', 'Snakes are scary!'], ["I don't like onions.", '🧅', 'Onions make me cry!']] },
  ],
  N: [
    { q: 'Can you swim?', a: [['Yes, I can.', '🏊', 'Wow! You are a good swimmer!'], ["No, I can't.", '🙅', 'I can teach you!']] },
    { q: 'May I come in?', a: [['Yes, you may.', '🚪', 'Thank you!'], ['Sure, come in!', '😊', 'Thank you, friend!']] },
    { q: 'It is cold outside. What should I do?', a: [['You should wear a coat.', '🧥', 'Good idea!'], ['You should drink hot tea.', '🍵', 'Mmm, warm tea!']] },
  ],
  O: [
    { q: 'Does your mom like flowers?', a: [['Yes, she does.', '🌸', "Let's give her flowers!"], ["No, she doesn't.", '🙂', 'Maybe she likes cake!']] },
    { q: 'Do your friends play soccer?', a: [['Yes, they do.', '⚽', 'Soccer is fun!'], ["No, they don't.", '🙅', 'Maybe they play tag!']] },
    { q: 'How does a turtle walk?', a: [['It walks slowly.', '🐢', 'Slow and steady!'], ['It walks very slowly.', '🐢', 'Yes, very slowly!']] },
  ],
  P: [
    { q: 'What is this?', a: [['This is my bag.', '🎒', 'What a nice bag!'], ['This is my pencil.', '✏️', 'A yellow pencil!']] },
    { q: 'What are those?', a: [['Those are stars.', '⭐', 'So many stars!'], ['Those are birds.', '🐦', 'They fly so high!']] },
    { q: 'Is this yours?', a: [['Yes, it is mine.', '🙋', 'Here you are!'], ['No, it is not mine.', '🙅', 'Whose is it?']] },
  ],
  Q: [
    { q: 'Where is my cat?', a: [['It is under the table.', '🐱', 'I found it!'], ['It is on the bed.', '🛏️', 'It is sleeping!']] },
    { q: 'Where do you sit in class?', a: [['I sit next to Mia.', '👧', 'Mia is nice!'], ['I sit behind Tom.', '👦', 'Hello, Tom!']] },
    { q: 'Do you like your teacher?', a: [['Yes, I like her.', '👩‍🏫', 'She is kind!'], ['Yes, I like him.', '👨‍🏫', 'He is kind!']] },
  ],
  R: [
    { q: 'What time do you get up?', a: [['I get up at seven.', '⏰', 'Early bird!'], ['I get up at eight.', '🕗', 'Good morning!']] },
    { q: 'When is your birthday?', a: [['It is in May.', '🎂', 'Happy birthday in May!'], ['It is in December.', '🎄', 'A winter birthday!']] },
    { q: 'What do you do on Saturday?', a: [['I play with my friends.', '🧒', 'Sounds fun!'], ['I go swimming.', '🏊', 'Splash!']] },
  ],
  S: [
    { q: 'Where is the library?', a: [['It is next to the school.', '📚', 'Thank you!'], ['It is across from the park.', '🏞️', 'I will find it!']] },
    { q: 'How do I get to the park?', a: [['Go straight and turn left.', '⬅️', 'Thanks for the help!'], ['Turn right at the bank.', '➡️', 'Thank you!']] },
    { q: 'How often do you read books?', a: [['I always read books.', '📚', 'Wow, you love books!'], ['I sometimes read books.', '📖', 'Reading is fun!']] },
  ],
  T: [
    { q: 'What would you like?', a: [["I'd like a hamburger, please.", '🍔', 'Here you are!'], ["I'd like some juice, please.", '🧃', 'Here is your juice!']] },
    { q: 'How many apples do you want?', a: [['Two apples, please.', '🍎', 'Here are two apples!'], ['Just one, please.', '☝️', 'One apple for you!']] },
    { q: 'How much milk do you drink?', a: [['A glass of milk.', '🥛', 'Milk makes you strong!'], ['A lot of milk!', '🥛', 'Wow, a lot!']] },
  ],
  U: [
    { q: 'Which is bigger, a cat or an elephant?', a: [['An elephant is bigger.', '🐘', 'Yes! Elephants are huge!'], ['A cat is smaller.', '🐱', 'That is right!']] },
    { q: 'What is the fastest animal?', a: [['The cheetah is the fastest.', '🐆', 'Zoom zoom!'], ['I think it is the horse.', '🐴', 'Horses are fast too!']] },
    { q: 'I think pizza is the best food. What do you think?', a: [['I agree!', '🤝', 'Yay! Pizza party!'], ["I don't think so. I like rice.", '🍚', 'Rice is good too!']] },
  ],
  V: [
    { q: 'Where were you yesterday?', a: [['I was at home.', '🏠', 'Home is cozy!'], ['I was at the park.', '🏞️', 'The park is fun!']] },
    { q: 'How was the weather yesterday?', a: [['It was sunny.', '☀️', 'Nice and warm!'], ['It was rainy.', '🌧️', 'Did you have an umbrella?']] },
    { q: 'What were you like as a baby?', a: [['I was very small.', '👶', 'So cute!'], ['I was always hungry.', '🍼', 'Babies eat a lot!']] },
  ],
  W: [
    { q: 'What did you do yesterday?', a: [['I played soccer.', '⚽', 'Did you score a goal?'], ['I watched TV.', '📺', 'What did you watch?'], ['I went to the zoo.', '🦁', 'I love the zoo!']] },
    { q: 'What did you eat for lunch?', a: [['I ate noodles.', '🍜', 'Slurp! Yummy!'], ['I ate a sandwich.', '🥪', 'Yum!']] },
    { q: 'Whose cap is this?', a: [["It's mine.", '🧢', 'Here you are!'], ["It's my brother's.", '👦', 'I will give it to him!']] },
  ],
  X: [
    { q: 'Did you do your homework?', a: [['Yes, I did.', '📝', 'Good job!'], ["No, I didn't.", '🙈', "Let's do it now!"]] },
    { q: 'Did you eat breakfast?', a: [['Yes, I did.', '🍳', 'Breakfast is important!'], ["No, I didn't. I was late.", '⏰', 'Oh no! Eat a snack!']] },
    { q: 'What did you do after school?', a: [['I played after I finished my homework.', '🎮', 'Smart plan!'], ['I read a book before dinner.', '📖', 'Nice!']] },
  ],
  Y: [
    { q: 'What will you do this weekend?', a: [['I will visit my grandma.', '👵', 'She will be happy!'], ['I am going to play soccer.', '⚽', 'Have fun!']] },
    { q: 'Oh no. I lost my spaceship key.', a: [["I'm sorry to hear that.", '😢', 'Thank you, friend.'], ["Don't worry. I will help you.", '🤝', 'You are so kind!']] },
    { q: 'I am going to the moon tomorrow!', a: [['That sounds great!', '🌙', 'Thank you! I am excited!'], ['Have a nice trip!', '🚀', 'Thanks! Bye-bye!']] },
  ],
  Z: [
    { q: 'How do you go to school?', a: [['By bus.', '🚌', 'Beep beep!'], ['On foot.', '🚶', 'Walking is good!'], ['By car.', '🚗', 'Vroom!']] },
    { q: 'Why do you like summer?', a: [['Because I can swim.', '🏊', 'Splash!'], ['Because I like ice cream.', '🍦', 'Yum!']] },
    { q: 'What do you do first in the morning?', a: [['First, I wash my face.', '🧼', 'Fresh and clean!'], ['First, I eat breakfast.', '🍳', 'Yummy!']] },
  ],
};

/* ---------- 그림책: 문맥 읽기(K) · 이야기 흐름과 독해(L) · 대화책(N) · 짧은 이야기(Z-4) ----------
   quiz: 다 읽고 답하는 질문 (보기의 첫 번째가 정답) · order: 다 읽고 장면을 순서대로 다시 놓는다 */
const BG = ['#FFF3CF', '#E2F3E2', '#E2F0FF', '#FFE8E3', '#EFE8FF', '#E8EEF5'];
const book = (title, pages, extra = {}) => ({ title, pages: pages.map(([art, text, ko], i) => ({ art, text, ko, bg: BG[i % BG.length] })), ...extra });

export const EN_STORIES = {
  'K-1': book('The Sleepy Bear', [
    ['🍂🐻', 'In the fall, Bear eats lots of berries and fish.', '가을에 곰은 열매와 물고기를 많이 먹어요.'],
    ['🐻💤', 'Soon Bear feels very sleepy. He yawns and yawns.', '곧 곰은 아주 졸려요. 하품을 하고 또 해요.'],
    ['⛰️🕳️', 'Bear finds a dark cave in the hill. It is warm and quiet.', '곰은 언덕에서 어두운 동굴을 찾아요. 따뜻하고 조용해요.'],
    ['❄️🐻', 'Bear hibernates all winter. He sleeps for a very long time.', '곰은 겨울 내내 겨울잠을 자요. 아주 오랫동안 자요.'],
    ['🌸🐻', 'In the spring, Bear wakes up. He is very hungry!', '봄이 되면 곰이 깨어나요. 아주 배가 고파요!'],
  ], { quiz: [
    { q: 'What does "hibernate" mean?', a: ['to sleep all winter', 'to eat fish', 'to run fast'] },
    { q: 'Where does Bear sleep?', a: ['in a cave', 'in a tree', 'in the sea'] },
    { q: 'How does Bear feel in the spring?', a: ['hungry', 'sleepy', 'cold'] },
  ] }),
  'K-2': book('A Windy Day', [
    ['☀️👧', 'Mia goes outside with her red kite.', '미아가 빨간 연을 들고 밖으로 나가요.'],
    ['💨🌳', 'The wind is strong. The trees sway left and right.', '바람이 세요. 나무가 왼쪽 오른쪽으로 흔들려요.'],
    ['🪁☁️', 'Her kite soars high, up into the clouds.', '연이 구름까지 높이 날아올라요.'],
    ['🌧️', 'Then dark clouds come. Drops of rain begin to fall.', '그때 먹구름이 와요. 빗방울이 떨어지기 시작해요.'],
    ['🏠☕', 'Mia runs home and drinks warm cocoa.', '미아는 집으로 뛰어가 따뜻한 코코아를 마셔요.'],
  ], { quiz: [
    { q: 'What does "sway" mean?', a: ['to move from side to side', 'to fall asleep', 'to eat fast'] },
    { q: 'What does "soars" mean?', a: ['flies high', 'swims deep', 'sleeps long'] },
    { q: 'Why does Mia run home?', a: ['It starts to rain.', 'She is hungry.', 'Her kite is lost.'] },
  ] }),
  'K-3': book("Sam's First Day", [
    ['🎒👦', "It is Sam's first day at a new school. He feels nervous.", '오늘은 샘이 새 학교에 가는 첫날이에요. 샘은 떨려요.'],
    ['🧑‍🏫', 'Ms. Lee smiles and says, "Welcome, Sam!"', '이 선생님이 웃으며 "어서 와, 샘!" 하고 말해요.'],
    ['📚🦈', 'In the library, Sam borrows a book about sharks.', '도서관에서 샘은 상어에 관한 책을 빌려요.'],
    ['🔔⚽', 'At recess, a boy asks, "Do you want to play?"', '쉬는 시간에 한 아이가 "같이 놀래?" 하고 물어요.'],
    ['😊', 'Sam is not nervous anymore. He has a new friend!', '샘은 이제 떨리지 않아요. 새 친구가 생겼어요!'],
  ], { quiz: [
    { q: 'What does "nervous" mean?', a: ['a little scared', 'very happy', 'very tired'] },
    { q: 'What does Sam borrow?', a: ['a book about sharks', 'a ball', 'a pencil'] },
    { q: 'What is "recess"?', a: ['a time to play at school', 'a kind of food', 'a big test'] },
  ] }),
  'K-4': book('A Day on the Farm', [
    ['🚜', 'Grandpa drives his tractor in the field every morning.', '할아버지는 매일 아침 밭에서 트랙터를 몰아요.'],
    ['🐔🥚', 'I gather the eggs from the hens and put them in a basket.', '나는 암탉들이 낳은 달걀을 모아 바구니에 담아요.'],
    ['🐄🥛', 'The cow gives us fresh milk.', '소가 우리에게 신선한 우유를 줘요.'],
    ['🐷', 'The pigs roll in the mud to stay cool on hot days.', '돼지들은 더운 날 시원하려고 진흙에서 뒹굴어요.'],
    ['🌽🧺', 'In the evening, we pick corn for dinner.', '저녁에는 저녁거리로 옥수수를 따요.'],
  ], { quiz: [
    { q: 'What does "gather" mean?', a: ['to pick up and collect', 'to throw away', 'to cook'] },
    { q: 'Why do pigs roll in the mud?', a: ['to stay cool', 'to get warm', 'to find food'] },
    { q: 'What do they pick for dinner?', a: ['corn', 'apples', 'eggs'] },
  ] }),
  'L-1': book('The Little Seed', [
    ['🌰', 'First, Lily plants a little seed in the garden.', '먼저 릴리가 정원에 작은 씨앗을 심어요.'],
    ['💧', 'Next, she waters the seed every day.', '다음에 릴리는 매일 씨앗에 물을 줘요.'],
    ['🌱', 'Then, a tiny green sprout comes up.', '그러자 작은 초록 싹이 올라와요.'],
    ['🌿', 'After that, the plant grows taller and taller.', '그 후에 식물은 점점 더 크게 자라요.'],
    ['🌻', 'Last, a big yellow sunflower blooms!', '마지막으로 커다란 노란 해바라기가 피어요!'],
  ], { order: true, quiz: [{ q: 'What does Lily do first?', a: ['She plants a seed.', 'She picks a flower.', 'She waters the sprout.'] }] }),
  'L-2': book('Who Took the Cookies?', [
    ['🍪🍪', 'Mom made cookies and put them on the table.', '엄마가 쿠키를 만들어 식탁 위에 두었어요.'],
    ['❓', 'Later, the cookies were gone! "Who took them?" asked Mom.', '나중에 쿠키가 없어졌어요! "누가 가져갔니?" 엄마가 물었어요.'],
    ['🐱', 'The cat said, "Not me. I drink milk."', '고양이가 "나 아니야. 나는 우유를 마셔." 했어요.'],
    ['👦📖', 'Ben said, "Not me. I was reading a book."', '벤이 "나 아니야. 나는 책을 읽고 있었어." 했어요.'],
    ['🐶🍪', "Then they saw crumbs on the dog's nose. It was the dog!", '그때 개 코에 묻은 과자 부스러기를 봤어요. 범인은 개였어요!'],
  ], { quiz: [
    { q: 'What did Mom make?', a: ['cookies', 'a cake', 'pizza'] },
    { q: 'Who took the cookies?', a: ['the dog', 'the cat', 'Ben'] },
    { q: 'What was Ben doing?', a: ['reading a book', 'eating cookies', 'sleeping'] },
  ] }),
  'L-3': book('The Lost Kitten', [
    ['🌅🐱', 'On Saturday morning, Kim could not find her kitten, Coco.', '토요일 아침, 킴은 새끼 고양이 코코를 찾을 수 없었어요.'],
    ['🛏️', 'She looked under her bed. Coco was not there.', '침대 밑을 봤어요. 코코는 거기 없었어요.'],
    ['🌳', 'She looked in the garden. Coco was not there.', '정원을 봤어요. 코코는 거기도 없었어요.'],
    ['🧺', 'At noon, Kim heard a tiny "meow" in the laundry basket.', '정오에 킴은 빨래 바구니에서 작은 "야옹" 소리를 들었어요.'],
    ['😊🐱', 'Coco was sleeping in the warm clothes!', '코코는 따뜻한 옷 속에서 자고 있었어요!'],
  ], { quiz: [
    { q: 'When did Kim lose Coco?', a: ['on Saturday morning', 'on Monday night', 'on Sunday afternoon'] },
    { q: 'Where did Kim look first?', a: ['under her bed', 'in the garden', 'in the kitchen'] },
    { q: 'Where was Coco?', a: ['in the laundry basket', 'in the garden', 'under the bed'] },
  ] }),
  'L-4': book("Tori's Big Acorn", [
    ['🐿️🌰', 'Tori finds a big acorn under the old oak tree.', '토리는 오래된 참나무 아래에서 커다란 도토리를 찾아요.'],
    ['😣', 'The acorn is too heavy. Tori cannot carry it.', '도토리가 너무 무거워요. 토리는 옮길 수 없어요.'],
    ['🐻', 'Bear comes and helps Tori carry the acorn.', '곰이 와서 토리가 도토리를 옮기는 걸 도와줘요.'],
    ['🏠', "They take the acorn to Tori's home together.", '둘은 함께 도토리를 토리의 집으로 가져가요.'],
    ['🎉', 'In the end, Tori shares the acorn with Bear.', '마지막에 토리는 곰과 도토리를 나눠 먹어요.'],
  ], { order: true, quiz: [
    { q: 'Where does Tori find the acorn?', a: ['under the old oak tree', 'in the river', 'on the roof'] },
    { q: 'Who helps Tori?', a: ['Bear', 'Fox', 'Owl'] },
    { q: 'What happens at the end?', a: ['Tori shares the acorn.', 'Tori loses the acorn.', 'Bear eats the acorn alone.'] },
  ] }),
  'N-1': book('Can You Swim?', [
    ['🐧🐟', 'Penguin: "Can you swim, Fish?"', '펭귄: "물고기야, 너 수영할 수 있니?"'],
    ['🐟', 'Fish: "Yes, I can! I can swim very fast."', '물고기: "응, 할 수 있어! 아주 빨리 헤엄칠 수 있어."'],
    ['🐟🐧', 'Fish: "Can you fly, Penguin?"', '물고기: "펭귄아, 너 날 수 있니?"'],
    ['🐧🧊', 'Penguin: "No, I can\'t. But I can slide on the ice!"', '펭귄: "아니, 못 날아. 하지만 얼음 위에서 미끄럼을 탈 수 있어!"'],
    ['🐧🐟😊', 'Fish: "Wow! We can all do something special."', '물고기: "와! 우리는 모두 특별한 걸 할 수 있구나."'],
  ], { quiz: [
    { q: 'What can Fish do?', a: ['swim fast', 'fly', 'slide on the ice'] },
    { q: 'Can Penguin fly?', a: ["No, it can't.", 'Yes, it can.', 'Yes, it does.'] },
  ] }),
  'N-2': book('May I Come In?', [
    ['🚪🐰', 'Rabbit: "Knock, knock! May I come in, Mrs. Owl?"', '토끼: "똑똑! 부엉이 아주머니, 들어가도 될까요?"'],
    ['🦉', 'Mrs. Owl: "Of course, you may. Come in!"', '부엉이 아주머니: "물론이지, 들어오렴!"'],
    ['🐰💧', 'Rabbit: "Can I have some water, please? I am thirsty."', '토끼: "물 좀 마셔도 될까요? 목이 말라요."'],
    ['🦉🍪', 'Mrs. Owl: "Here you are. Would you like a cookie, too?"', '부엉이 아주머니: "여기 있단다. 쿠키도 먹을래?"'],
    ['🐰😊', 'Rabbit: "Yes, please! Thank you, Mrs. Owl."', '토끼: "네, 주세요! 고맙습니다, 부엉이 아주머니."'],
  ], { quiz: [
    { q: 'Who is Rabbit visiting?', a: ['Mrs. Owl', 'Mr. Bear', 'Dr. Fox'] },
    { q: 'What does Rabbit ask for first?', a: ['some water', 'a cookie', 'a book'] },
  ] }),
  'N-3': book('You Should Wear a Coat', [
    ['❄️👦', 'Dad: "It is snowing. You should wear a coat, Max."', '아빠: "눈이 오는구나. 코트를 입는 게 좋겠다, 맥스."'],
    ['👦', 'Max: "But I want to go out right now!"', '맥스: "하지만 지금 당장 나가고 싶어요!"'],
    ['👨🧤', 'Dad: "You must wear a hat and gloves, too. It is very cold."', '아빠: "모자랑 장갑도 꼭 써야 해. 아주 춥단다."'],
    ['🧥😊', 'Max: "Okay, Dad. Now I am warm."', '맥스: "알겠어요, 아빠. 이제 따뜻해요."'],
    ['⛄', 'Dad: "Great! Now we can build a snowman."', '아빠: "좋아! 이제 눈사람을 만들 수 있겠다."'],
  ], { quiz: [
    { q: 'What should Max wear?', a: ['a coat', 'a swimsuit', 'sunglasses'] },
    { q: 'Why must Max wear gloves?', a: ['It is very cold.', 'It is very hot.', 'It is raining.'] },
  ] }),
  'N-4': book('Thank You, Dr. Kim', [
    ['🤒👧', 'Mom: "Good morning, Dr. Kim. My daughter has a cold."', '엄마: "안녕하세요, 김 선생님. 우리 딸이 감기에 걸렸어요."'],
    ['🧑‍⚕️', 'Dr. Kim: "Hello, Amy. Can you open your mouth, please?"', '김 선생님: "안녕, 에이미. 입을 벌려 줄래?"'],
    ['👧', 'Amy: "Aah. Will I be okay, Dr. Kim?"', '에이미: "아~. 저 괜찮아질까요, 김 선생님?"'],
    ['🧑‍⚕️💧', 'Dr. Kim: "Yes. You should rest and drink lots of water."', '김 선생님: "그럼. 푹 쉬고 물을 많이 마시렴."'],
    ['😊', 'Amy: "Thank you, Dr. Kim!" Mom: "Thank you, Doctor."', '에이미: "고맙습니다, 김 선생님!" 엄마: "고맙습니다, 선생님."'],
  ], { quiz: [
    { q: 'Who is Dr. Kim?', a: ['a doctor', 'a teacher', 'a cook'] },
    { q: 'What should Amy do?', a: ['rest and drink water', 'go to school', 'eat candy'] },
  ] }),
  'Z-4': book('Max and the Rainy Day', [
    ['🐶👦', 'Leo has a dog, and his name is Max.', '레오는 개를 키우고, 그 개의 이름은 맥스예요.'],
    ['🌧️', 'They wanted to play outside, but it was raining.', '둘은 밖에서 놀고 싶었지만 비가 오고 있었어요.'],
    ['🧩', 'So they did a puzzle inside.', '그래서 그들은 안에서 퍼즐을 했어요.'],
    ['🌈', 'When the rain stopped, they saw a rainbow.', '비가 그쳤을 때 그들은 무지개를 봤어요.'],
    ['🏃🐶', 'They ran outside because the sun was shining.', '해가 비쳐서 그들은 밖으로 달려 나갔어요.'],
  ], { order: true, quiz: [{ q: 'Why did they do a puzzle?', a: ['because it was raining', 'because it was sunny', 'because Max was sleepy'] }] }),
};
export const storyBook = book;
