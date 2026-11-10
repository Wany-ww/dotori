# NAS에서 서버 돌리고 안드로이드 앱으로 접속하기

도토리숲 서버(`server.js`)를 집의 NAS에서 Docker로 돌리고, 밖에서는 안드로이드 앱(APK)으로 접속해요.

```
[휴대폰 · 태블릿 앱] ──https──▶ [공유기 443 → NAS 역방향 프록시(인증서)] ──▶ [도토리숲 컨테이너 :5173] ──▶ NAS의 data 폴더
```

- 서버는 앱이 쓰는 파일(`index.html` · `js/` · `css/` · `assets/`)과 API만 내보내요. 계정 · 학습 기록이 든 `data/`, 문서, 도구, `.git`은 밖에서 열 수 없어요.
- 그림 · 음성(약 160MB)은 기기에 7일 동안 저장해 두고, 코드는 바뀌었을 때만 다시 받아요. 처음 한 번만 오래 걸려요.
- **자동 업데이트**: GitHub `main`에 커밋이 푸시되면
  - 서버: NAS의 컨테이너가 5분마다 새 커밋을 확인해서 저절로 받아요(아래 1 참고).
  - 앱 화면(놀이 · 커리큘럼): 서버에서 늘 새로 받아서 바로 바뀌어요.
  - 앱 자체(`android/`가 바뀐 경우): GitHub Actions가 서명한 APK를 Releases에 올리고, 앱이 켜질 때 새 버전을 받을지 물어요(아래 3 참고).

## NAS별로 다른 점

| | 시놀로지 (DSM 7.2+) | 유그린 (UGOS Pro) |
|---|---|---|
| 서버(Docker) | Container Manager → 프로젝트 | Docker → 프로젝트 (같은 compose 내용을 붙여 넣기) |
| 쓰는 파일 | `docker-compose.yml` | `docker-compose.ugreen.yml` (서버 + HTTPS 입구) |
| 바깥 주소(DDNS) | Synology DDNS (`*.synology.me`, 무료) | UGOS의 DDNS에 DuckDNS · No-IP 등 외부 서비스 계정을 넣어요 |
| HTTPS 인증서 · 역방향 프록시 | DSM에 들어 있음 | 없어요 → Nginx Proxy Manager 컨테이너가 대신해요 |
| 자동 업데이트 | 같아요 | 같아요 |

두 곳 모두 compose 파일 하나만 있으면 돼요. 이미지를 직접 빌드하지 않고 `node:22-alpine`에 git을 깔아 저장소를 받는 방식이라, 프로젝트 화면이 빌드를 지원하지 않아도 돼요. 유그린은 아래 "유그린 NAS"로 바로 가세요.

## 1. NAS에 서버 올리기 (Docker) — 시놀로지

시놀로지(DSM 7.2 이상, Container Manager)를 기준으로 적었어요. QNAP은 Container Station에서 같은 `docker-compose.yml`로 "애플리케이션 만들기"를 하면 돼요.

1. 패키지 센터에서 **Container Manager**를 설치해요.
2. File Station에서 `docker/dotori` 폴더를 만들고, 저장소의 `docker-compose.yml` 하나만 올려요.
   - 앱 파일은 컨테이너가 켜질 때 GitHub에서 직접 받아요(1~2분). 그래서 NAS가 인터넷에 연결돼 있어야 해요.
   - `data/`는 처음 실행할 때 생겨요.
3. Container Manager → **프로젝트** → **생성**
   - 경로: `docker/dotori`
   - 소스: "기존 docker-compose.yml 사용"
   - 이름: `dotori`
4. 다 만들어지면 같은 와이파이의 컴퓨터에서 `http://<NAS 내부 IP>:5173`을 열어 봐요. 로그인 화면이 나오면 성공이에요.
   - 처음에는 저장소를 받느라 1~2분 걸려요. 컨테이너 **로그**에 `서버 시작 (커밋 …)`이 나오면 준비된 거예요.

### 관리자 계정 만들기

Container Manager → 컨테이너 → `dotori` → **터미널** → 만들기(`sh`)에서 아래를 입력해요. 아이디와 비밀번호는 직접 정해요.

```
node /app/src/tools/make-admin.js <아이디> <비밀번호> 관리자
```

SSH로 접속했다면:

```bash
sudo docker exec -it dotori node /app/src/tools/make-admin.js <아이디> <비밀번호> 관리자
```

### 자동 업데이트

컨테이너 안의 실행기(`tools/runner.js`)가 하는 일이에요.

- 5분마다 GitHub `main` 브랜치에 새 커밋이 있는지 확인해요.
- 새 커밋이 있으면 그 커밋으로 파일을 바꿔요.
  - 화면 파일(`js` · `css` · `assets`)만 바뀌었으면 서버를 끄지 않고 바로 새 파일을 내보내요.
  - 서버 코드(`server.js` · `tools/` · `package.json`)가 바뀌었으면 서버를 몇 초 동안 다시 켜요.
- 서버가 멈추면 3초 뒤 다시 켜요.
- `data/`(아이 · 보호자 기록)는 건드리지 않아요.
- 컨테이너 **로그**에 `업데이트: 4a14fd9 → 220015d`처럼 남아요.

`docker-compose.yml`의 환경 변수로 바꿀 수 있어요.

| 변수 | 기본값 | 뜻 |
|---|---|---|
| `UPDATE_MINUTES` | `5` | 새 커밋 확인 간격(분) |
| `AUTO_UPDATE` | `1` | `0`이면 자동 업데이트를 꺼요(컨테이너를 다시 만들 때만 새로 받아요) |
| `BRANCH` | `main` | 따라갈 브랜치 |
| `REPO_URL` | 이 저장소 | 받을 저장소 주소 |

실행기(`tools/runner.js`)가 바뀐 커밋을 받으면 실행기가 컨테이너를 끝내고, Docker가 컨테이너를 다시 켜면서 새 실행기로 돌아요(`restart: unless-stopped`). compose 파일 자체를 바꿨을 때만 프로젝트를 다시 만들어(또는 `docker compose up -d`) 주세요. 저장소가 비공개로 바뀌면 받을 수 없으니 공개로 두어야 해요.

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

## 유그린 NAS (UGOS Pro)

UGOS Pro는 Docker와 DDNS가 있지만, 시놀로지의 역방향 프록시 · Let's Encrypt 자동 발급에 해당하는 기능이 없어요(2026년 11월 1.21.x 기준). 그래서 `docker-compose.ugreen.yml`에 **Nginx Proxy Manager**(HTTPS 입구, 인증서 자동 발급 · 갱신)를 함께 넣었어요.

```
밖(https 443) ─공유기─▶ NAS 8443 ─▶ dotori-proxy(인증서) ─▶ dotori:5173
밖(http 80)   ─공유기─▶ NAS 8080 ─▶ dotori-proxy (인증서 발급 · https로 넘기기)
집 와이파이   ──────────▶ NAS 5173 ─▶ dotori (http)
```

### 0. 확인할 것

- **Docker를 쓸 수 있는 모델**이어야 해요(앱 센터에 Docker가 보여야 해요). DXP 시리즈는 되고, DH 시리즈 중 일부(DH2300 등)는 Docker가 없어요.
- 집 인터넷에 **공인 IP**가 있어야 밖에서 들어올 수 있어요. 공유기 관리 화면의 WAN(외부) IP가 `100.64.x.x` ~ `100.127.x.x`나 `10.x.x.x` · `192.168.x.x`이면 공인 IP가 아니에요. 이때는 통신사에 공인 IP를 요청하거나, Tailscale 같은 VPN으로 접속해야 해요.
- UGREENlink(유그린 원격 접속)는 NAS 관리 화면 · 유그린 앱용이라, 도토리숲 같은 직접 띄운 컨테이너를 밖에 여는 데는 쓸 수 없어요.

### 1. 서버 올리기

1. 앱 센터에서 **Docker**를 설치해요.
2. **Docker → 프로젝트 → 생성**
   - 프로젝트 이름: `dotori`
   - 저장 위치: 원하는 공유 폴더(예: `docker/dotori`). 이 폴더 아래에 `data/`(기록) · `proxy/`(인증서)가 생겨요.
   - Compose 설정: 저장소의 `docker-compose.ugreen.yml` 내용을 통째로 붙여 넣어요.
3. **배포(Deploy)**를 누르면 `dotori` · `dotori-proxy` 두 컨테이너가 켜져요. 처음에는 저장소를 받느라 1~2분 걸려요.
4. 같은 와이파이의 컴퓨터에서 `http://<NAS 내부 IP>:5173`을 열어 로그인 화면이 나오면 성공이에요.

관리자 계정은 **Docker → 컨테이너 → dotori → 터미널**에서 만들어요.

```
node /app/src/tools/make-admin.js <아이디> <비밀번호> 관리자
```

### 2. 바깥 주소(DDNS) 만들기

1. https://www.duckdns.org 에서 로그인하고 하위 도메인을 하나 만들어요(예: `dotori-home` → `dotori-home.duckdns.org`). 화면의 **token**을 적어 둬요.
2. UGOS Pro **설정 → 원격 접속(장치 연결) → DDNS**에서 추가 → 서비스 공급자 **DuckDNS** → 도메인과 token을 넣어요. 집 IP가 바뀌면 UGOS가 알아서 고쳐 줘요.
   - No-IP 등 UGOS가 지원하는 다른 서비스여도 돼요.

### 3. 공유기 포트 포워딩

| 바깥 포트 | NAS 내부 IP의 포트 | 쓰임 |
|---|---|---|
| 443 | 8443 | https 접속 |
| 80 | 8080 | 인증서 발급 · 갱신, http → https |

- 5173(도토리숲), 8181(프록시 관리 화면), 9999 · 9443(UGOS 관리 화면)은 **열지 않아요**.

### 4. HTTPS 연결 (Nginx Proxy Manager)

1. 같은 와이파이에서 `http://<NAS 내부 IP>:8181`을 열어요. 처음 들어가면 관리자 이메일 · 비밀번호를 새로 정하라고 나와요.
2. **Hosts → Proxy Hosts → Add Proxy Host**
   - Domain Names: `dotori-home.duckdns.org`
   - Scheme `http`, Forward Hostname `dotori`, Forward Port `5173`
   - **Block Common Exploits** 켜기
3. **SSL** 탭: **Request a new SSL Certificate** → **Force SSL** · **HTTP/2 Support** 켜기 → 이메일 넣고 약관 동의 → Save
   - 인증서는 Let's Encrypt에서 받고, 만료 전에 저절로 갱신돼요(3번의 80 → 8080 포워딩이 필요해요).
4. 휴대폰 데이터로 `https://dotori-home.duckdns.org`를 열어 로그인 화면이 나오면 끝이에요. 앱(APK)에는 이 주소를 넣어요.

Nginx Proxy Manager는 `X-Forwarded-Proto` · `X-Forwarded-For`를 붙여 주므로, 서버가 https 접속으로 알아보고 로그인 쿠키를 보호해요.

### 업데이트 · 백업

- 서버는 시놀로지와 똑같이 5분마다 GitHub를 확인해서 저절로 업데이트해요.
- 기록은 프로젝트 저장 위치의 `data/`, 인증서는 `proxy/`에 있어요. 두 폴더를 백업해 주세요.

## 3. 안드로이드 앱 (APK)

### 처음 한 번: 서명 키 넣기

앱을 자동으로 업데이트하려면 모든 APK를 같은 키로 서명해야 해요. 키는 만들어 두었어요(`android/release.keystore`, 저장소에는 올리지 않아요).

1. `android/signing.local.txt`를 열어요(이 컴퓨터에만 있어요).
2. GitHub 저장소 → **Settings → Secrets and variables → Actions → New repository secret**에서 파일에 적힌 4개(`ANDROID_KEY_ALIAS` · `ANDROID_KEYSTORE_PASSWORD` · `ANDROID_KEY_PASSWORD` · `ANDROID_KEYSTORE_BASE64`)를 이름과 값 그대로 넣어요.
3. GitHub **Actions → Android APK → Run workflow**를 한 번 눌러요. 끝나면 **Releases**에 `도토리숲 앱 1.<번호>`가 생겨요.
4. `release.keystore`와 `signing.local.txt`는 잃어버리면 같은 앱으로 업데이트할 수 없어요. USB나 비밀번호 관리 앱 등 저장소 밖에 따로 보관해 주세요.

Secrets가 없으면 Actions는 디버그 APK만 만들어 실행 결과(Artifacts)에 올리고, Releases에는 올리지 않아요.

### 설치

- GitHub 저장소의 **Releases**에서 가장 최근 `도토리숲 앱 1.<번호>`의 `dotori-1.<번호>.apk`를 휴대폰으로 받아 열어요. "출처를 알 수 없는 앱 설치"를 허용하면 설치돼요.
  - 전에 Actions Artifacts의 디버그 APK를 설치했다면 서명이 달라서 위에 덮어 설치할 수 없어요. 그 앱을 한 번 지우고 설치해요.
- 처음 켜면 **서버 주소**를 물어요. `https://dotori-home.synology.me`처럼 2번에서 만든 주소를 적어요.
  - 집 와이파이 안에서만 쓸 때는 `http://192.168.0.10:5173`처럼 NAS 내부 주소도 돼요.
  - 앱이 `/api/ping`으로 도토리숲 서버인지 확인한 뒤 저장해요. 다음부터는 바로 열려요.
- 주소를 바꾸려면 앱의 **프로필 → 앱 설정 → 서버 주소 바꾸기**를 눌러요. 서버에 연결하지 못하면 다시 시도하거나 주소를 고치는 화면이 나와요.

### 앱 자동 업데이트

1. `android/`가 바뀐 커밋이 `main`에 푸시되면 GitHub Actions가 버전 번호를 하나 올려 서명한 APK를 만들고, Releases에 `app-<번호>`로 올려요.
2. 설치된 앱은 켜질 때(6시간에 한 번) 최신 릴리스를 확인해요. 지금보다 새 버전이면 "새 버전이 있어요"라고 물어요.
3. **업데이트**를 누르면 APK를 받고 안드로이드 설치 화면을 열어요. 처음 한 번은 "이 출처의 앱 설치 허용"을 켜 달라고 해요.

놀이 화면이나 커리큘럼만 바뀐 커밋은 앱을 다시 설치할 필요가 없어요. 서버가 업데이트되면 앱 화면도 바로 바뀌어요.

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

- 직접 빌드한 디버그 앱은 새 버전을 묻지 않아요. 서명된 릴리스는 `signing.local.txt`의 값을 환경 변수(`ANDROID_KEYSTORE_PASSWORD` · `ANDROID_KEY_PASSWORD` · `ANDROID_KEY_ALIAS`)로 넣고 `./gradlew assembleRelease`로 만들어요.
- 앱 이름은 "도토리숲", 패키지는 `kr.dotori.forest`예요.
