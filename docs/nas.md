# NAS에서 서버 돌리고 안드로이드 앱으로 접속하기

도토리숲 서버(`server.js`)를 집의 NAS에서 Docker로 돌리고, 밖에서는 안드로이드 앱(APK)으로 접속해요.

```
[휴대폰 · 태블릿 앱] ──https──▶ [공유기 443 → NAS 역방향 프록시(인증서)] ──▶ [도토리숲 컨테이너 :5173] ──▶ NAS의 data 폴더
```

- 서버는 앱이 쓰는 파일(`index.html` · `js/` · `css/` · `assets/`)과 API만 내보내요. 계정 · 학습 기록이 든 `data/`, 문서, 도구, `.git`은 밖에서 열 수 없어요.
- 그림 · 음성(약 160MB)은 기기에 7일 동안 저장해 두고, 코드는 바뀌었을 때만 다시 받아요. 처음 한 번만 오래 걸려요.

## 1. NAS에 서버 올리기 (Docker)

시놀로지(DSM 7.2 이상, Container Manager)를 기준으로 적었어요. QNAP은 Container Station에서 같은 `docker-compose.yml`로 "애플리케이션 만들기"를 하면 돼요.

1. 패키지 센터에서 **Container Manager**를 설치해요.
2. File Station에서 `docker/dotori` 폴더를 만들고, 이 저장소를 통째로 올려요.
   - Git Server 패키지나 SSH가 있으면 `git clone https://github.com/Wany-ww/dotori.git`으로 받아도 돼요.
   - `asset-src/`, `data/`는 올리지 않아도 돼요. `data/`는 처음 실행할 때 생겨요.
3. Container Manager → **프로젝트** → **생성**
   - 경로: `docker/dotori`
   - 소스: "기존 docker-compose.yml 사용"
   - 이름: `dotori`
4. 다 만들어지면 같은 와이파이의 컴퓨터에서 `http://<NAS 내부 IP>:5173`을 열어 봐요. 로그인 화면이 나오면 성공이에요.

### 관리자 계정 만들기

Container Manager → 컨테이너 → `dotori` → **터미널** → 만들기(`sh`)에서 아래를 입력해요. 아이디와 비밀번호는 직접 정해요.

```
node tools/make-admin.js <아이디> <비밀번호> 관리자
```

SSH로 접속했다면:

```bash
sudo docker exec -it dotori node tools/make-admin.js <아이디> <비밀번호> 관리자
```

### 업데이트

새 버전을 받으면 `docker/dotori` 폴더의 파일을 바꾸고, 프로젝트에서 **작업 → 빌드**(또는 `docker compose up -d --build`)를 해요. `data/`는 그대로 남아요.

### 백업

아이 · 보호자 기록은 모두 `docker/dotori/data`에 있어요. Hyper Backup 등으로 이 폴더를 백업해 주세요.

## 2. 밖에서 접속할 주소 만들기 (HTTPS)

밖에서 쓰려면 주소와 인증서가 필요해요. 비밀번호가 오가므로 **반드시 https**로 열어 주세요.

1. **DDNS**: 제어판 → 외부 액세스 → DDNS → 추가
   - 서비스 공급자: Synology
   - 호스트 이름: 예) `dotori-home.synology.me`
2. **인증서**: 제어판 → 보안 → 인증서 → 추가 → "Let's Encrypt에서 인증서 받기"
   - 도메인 이름: 위의 DDNS 주소
3. **역방향 프록시**: 제어판 → 로그인 포털 → 고급 → 역방향 프록시 → 생성
   - 소스: 프로토콜 HTTPS, 호스트 이름 `dotori-home.synology.me`, 포트 443
   - 대상: 프로토콜 HTTP, 호스트 이름 `localhost`, 포트 5173
   - 서버는 `X-Forwarded-Proto`(https인지)와 `X-Forwarded-For`(접속 IP) 머리글을 봐요. 시놀로지 역방향 프록시는 보통 둘 다 붙여 줘요. 다른 프록시를 쓰면 이 두 머리글을 넣어 주세요(사용자 지정 머리글).
4. 인증서 화면의 **설정**에서 이 역방향 프록시 항목에 2번 인증서를 골라요.
5. **공유기 포트 포워딩**: 외부 443 → NAS 내부 IP 443 (Let's Encrypt 갱신용으로 80 → 80도 열어 둬요).
   - 5173 포트는 공유기에서 열지 않아요. 밖에서는 443(https)으로만 들어오게 해요.
6. 휴대폰 데이터로 `https://dotori-home.synology.me`를 열어 로그인 화면이 나오는지 확인해요.

서버는 `X-Forwarded-Proto: https`를 보고 로그인 쿠키에 `Secure`를 붙여요. 로그인 실패가 잦은 IP는 10분 동안 막아요.

## 3. 안드로이드 앱 (APK)

### 설치

- APK 파일: GitHub 저장소의 **Actions → Android APK → 가장 최근 실행 → Artifacts**에서 `dotori-debug-apk`를 내려받아 압축을 풀어요. `android/`가 바뀌어 `main`에 올라가면 저절로 빌드돼요(직접 돌리려면 Actions에서 "Run workflow").
  - 직접 빌드했다면 `android/app/build/outputs/apk/debug/app-debug.apk`에 생겨요.
- 휴대폰으로 옮겨 열고, "출처를 알 수 없는 앱 설치"를 허용하면 설치돼요.
- 처음 켜면 **서버 주소**를 물어요. `https://dotori-home.synology.me`처럼 2번에서 만든 주소를 적어요.
  - 집 와이파이 안에서만 쓸 때는 `http://192.168.0.10:5173`처럼 NAS 내부 주소도 돼요.
  - 앱이 `/api/ping`으로 도토리숲 서버인지 확인한 뒤 저장해요. 다음부터는 바로 열려요.
- 주소를 바꾸려면 앱의 **프로필 → 앱 설정 → 서버 주소 바꾸기**를 눌러요. 서버에 연결하지 못하면 다시 시도하거나 주소를 고치는 화면이 나와요.

### 앱이 하는 일

- 서버의 도토리숲 화면을 그대로 열어요. 앱을 다시 설치하지 않아도 NAS를 업데이트하면 앱 화면도 바뀌어요.
- 웹뷰에는 음성인식 · 음성 합성이 없어서, 안드로이드 음성인식(말하기 놀이)과 TTS(녹음이 없는 말 읽어 주기)로 대신해요(`js/nativeBridge.js`).
  - 처음 켤 때 마이크 권한을 물어요. 녹음은 저장하지 않아요.
  - 음성인식은 휴대폰의 Google 음성 서비스를 써요. 기기 설정에 따라 말소리가 Google 서버로 가요.
- 서버가 아닌 주소(바깥 링크)는 휴대폰 브라우저로 열어요.

### 직접 빌드하기

Android Studio가 설치된 컴퓨터에서:

```bash
cd android
./gradlew assembleDebug
```

- JDK 17 ~ 21이 필요해요(Android Studio에 들어 있는 JDK 25로는 Gradle 8.7이 돌지 않아요).
- `android/local.properties`에 `sdk.dir=<Android SDK 경로>`를 적어 둬요(저장소에는 올리지 않아요).

### 알아 둘 것

- 지금 APK는 **디버그 서명**이에요. 직접 설치해서 쓰기에는 문제가 없지만, Play 스토어에 올리려면 릴리스 서명 키를 만들어 `assembleRelease`로 빌드해야 해요. 서명 키는 저장소에 올리지 않아요.
- 앱 이름은 "도토리숲", 패키지는 `kr.dotori.forest`예요.
