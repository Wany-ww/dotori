# 도토리숲 서버 (NAS · Docker). 외부 라이브러리가 없어서 node 이미지만 있으면 돼요.
FROM node:22-alpine
WORKDIR /app
COPY package.json server.js index.html ./
COPY js ./js
COPY css ./css
COPY assets ./assets
COPY tools/db.js tools/make-admin.js ./tools/
ENV NODE_ENV=production PORT=5173 DATA_DIR=/app/data
# 계정 · 학습 기록 · 작품은 이 폴더에 쌓여요. NAS 폴더에 연결해서 컨테이너를 다시 만들어도 남게 해요
VOLUME /app/data
EXPOSE 5173
# NAS 공유 폴더는 소유자가 제각각이라, data 폴더에 쓸 수 있도록 기본 사용자(root)로 실행해요
CMD ["node", "server.js"]
