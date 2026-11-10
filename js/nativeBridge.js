/* ---------- 안드로이드 앱(APK) 연결 ----------
   앱의 웹뷰에는 음성인식(SpeechRecognition)과 음성 합성(speechSynthesis)이 없어서,
   앱이 넣어 주는 window.DotoriNative(안드로이드 음성인식 · TTS)로 같은 모양의 기능을 만들어 둔다.
   그래서 speech.js · audio.js는 브라우저와 똑같이 쓴다. 결과는 앱이 window.__dotoriNative로 돌려준다.
   보통 브라우저에서는 DotoriNative가 없으니 아무 일도 하지 않는다. (모듈보다 먼저 읽어야 해서 일반 스크립트) */
(() => {
  const N = window.DotoriNative;
  if (!N) return;
  let seq = 0;
  const spoken = new Map();
  const recs = new Map();
  window.__dotoriNative = {
    spoken(id) {
      const f = spoken.get(id);
      spoken.delete(id);
      if (f) f();
    },
    sr(id, type, data) {
      const r = recs.get(id);
      if (r) r._event(type, data);
    },
  };

  // 음성인식: 들은 말 후보(최대 maxAlternatives개)를 말하는 도중(partial)과 끝(final)에 받는다
  class NativeRecognition {
    constructor() {
      this.lang = 'ko-KR';
      this.interimResults = false;
      this.maxAlternatives = 1;
      this.continuous = false;
      this.id = 0;
      this.finals = [];
    }
    start() {
      this.id = ++seq;
      this.finals = [];
      recs.set(this.id, this);
      N.listenStart(this.id, String(this.lang), Number(this.maxAlternatives) || 1, Boolean(this.interimResults));
    }
    stop() { if (this.id) N.listenStop(this.id); }
    abort() { this.stop(); }
    _event(type, data) {
      if (type === 'sound') {
        if (this.onsoundstart) this.onsoundstart({});
        if (this.onspeechstart) this.onspeechstart({});
      } else if (type === 'soundend') {
        if (this.onsoundend) this.onsoundend({});
      } else if (type === 'partial' || type === 'final') {
        let alts = [];
        try { alts = JSON.parse(data || '[]'); } catch {}
        const res = Object.assign(alts.map((t) => ({ transcript: String(t), confidence: 0 })), { isFinal: type === 'final' });
        if (type === 'final') this.finals.push(res);
        const results = type === 'final' ? [...this.finals] : [...this.finals, res];
        if (this.onresult) this.onresult({ resultIndex: results.length - 1, results });
      } else if (type === 'error') {
        if (this.onerror) this.onerror({ error: data });
      } else if (type === 'end') {
        recs.delete(this.id);
        if (this.onend) this.onend({});
      }
    }
  }
  window.SpeechRecognition = NativeRecognition;
  window.webkitSpeechRecognition = NativeRecognition;

  // 음성 합성: 녹음이 없는 말을 안드로이드 TTS로 읽는다
  window.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = 'ko-KR';
      this.rate = 1;
      this.pitch = 1;
      this.voice = null;
    }
  };
  window.speechSynthesis = {
    speak(u) {
      const id = ++seq;
      spoken.set(id, () => { if (u.onend) u.onend({}); });
      N.speak(id, String(u.text || ''), String(u.lang || 'ko-KR'), Number(u.rate) || 1, Number(u.pitch) || 1);
    },
    cancel() {
      N.stopSpeak();
      const waiting = [...spoken.values()];
      spoken.clear();
      waiting.forEach((f) => f());
    },
    getVoices: () => [],
    addEventListener() {},
  };
})();
