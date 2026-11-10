# 도토리숲 서버 (NAS · Docker).
# 이미지에는 실행기(tools/runner.js)만 넣고, 앱은 컨테이너가 처음 켜질 때 GitHub 저장소에서 받아요.
# 그 뒤로는 몇 분마다 새 커밋을 확인해서 저절로 업데이트해요 (docs/nas.md).
FROM node:22-alpine
RUN apk add --no-cache git
WORKDIR /app
COPY tools/runner.js /app/runner.js
ENV NODE_ENV=production PORT=5173 DATA_DIR=/app/data APP_DIR=/app/src \
    REPO_URL=https://github.com/Wany-ww/dotori.git BRANCH=main UPDATE_MINUTES=5 AUTO_UPDATE=1
# 계정 · 학습 기록 · 작품은 이 폴더에 쌓여요. NAS 폴더에 연결해서 컨테이너를 다시 만들어도 남게 해요
VOLUME /app/data
EXPOSE 5173
# NAS 공유 폴더는 소유자가 제각각이라, data 폴더에 쓸 수 있도록 기본 사용자(root)로 실행해요
CMD ["node", "/app/runner.js"]
