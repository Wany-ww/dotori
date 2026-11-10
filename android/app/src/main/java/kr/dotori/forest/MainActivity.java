package kr.dotori.forest;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Environment;
import android.widget.Toast;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Locale;

/**
 * 도토리숲 앱: NAS에서 돌아가는 도토리숲 서버를 웹뷰로 연다.
 * - 처음 켜면 서버 주소를 묻고(assets/setup.html), /api/ping으로 도토리숲 서버인지 확인한 뒤 저장한다.
 * - 웹뷰에 없는 음성인식 · 음성 합성은 안드로이드 기능으로 대신하고, 웹 쪽(js/nativeBridge.js)에 DotoriNative로 넘겨준다.
 * - 서버 밖의 주소는 웹뷰에서 열지 않고 브라우저로 넘긴다.
 * - 앱 자체의 새 버전은 GitHub Releases(app-<번호>)에서 확인해서, 받으면 설치 화면을 연다. 놀이 화면은 서버가 늘 새로 준다.
 */
public class MainActivity extends Activity {
    private static final String PREFS = "dotori";
    private static final String KEY_SERVER = "server";
    private static final String SETUP = "file:///android_asset/setup.html";
    private static final int ASK_MIC = 1;
    private static final String APK = "application/vnd.android.package-archive";
    private static final long UPDATE_EVERY = 6 * 3600 * 1000L;

    private final Handler main = new Handler(Looper.getMainLooper());
    private WebView web;
    private TextToSpeech tts;
    private boolean ttsReady;
    private SpeechRecognizer recognizer;
    private int listening;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " DotoriApp/1.0");
        CookieManager.getInstance().setAcceptCookie(true);
        WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0);

        web.addJavascriptInterface(new Bridge(), "DotoriNative");
        web.setWebViewClient(new Client());
        web.setWebChromeClient(new WebChromeClient() {
            // 마이크 소리 크기로만 듣는 방식(getUserMedia)도 앱 권한이 있으면 허락한다
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                if (hasMic()) request.grant(request.getResources());
                else request.deny();
            }
        });

        tts = new TextToSpeech(this, status -> ttsReady = status == TextToSpeech.SUCCESS);
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) {}
            @Override public void onDone(String id) { js("window.__dotoriNative&&__dotoriNative.spoken(" + id + ")"); }
            @Override public void onError(String id) { onDone(id); }
        });

        if (!hasMic()) requestPermissions(new String[] { Manifest.permission.RECORD_AUDIO }, ASK_MIC);
        if (saved != null) web.restoreState(saved);
        else open();
        checkUpdate();
    }

    private SharedPreferences prefs() { return getSharedPreferences(PREFS, MODE_PRIVATE); }
    private String server() { return prefs().getString(KEY_SERVER, null); }
    private boolean hasMic() { return checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED; }

    private void open() {
        String server = server();
        web.loadUrl(server == null ? SETUP : server + "/");
    }

    private void showSetup(String error) {
        String server = server();
        String q = "?server=" + Uri.encode(server == null ? "" : server) + (error == null ? "" : "&error=" + Uri.encode(error));
        web.loadUrl(SETUP + q);
    }

    private void js(String code) {
        main.post(() -> { if (web != null) web.evaluateJavascript(code, null); });
    }

    // 주소 다듬기: 앞뒤 공백 · 끝의 / 를 지우고, http(s)://가 없으면 https://를 붙인다
    static String normalize(String raw) {
        String u = raw == null ? "" : raw.trim();
        while (u.endsWith("/")) u = u.substring(0, u.length() - 1);
        if (u.isEmpty()) return u;
        if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
        return u;
    }

    private boolean inServer(Uri uri) {
        String server = server();
        if (server == null) return false;
        Uri s = Uri.parse(server);
        return s.getScheme() != null && s.getScheme().equals(uri.getScheme())
            && s.getHost() != null && s.getHost().equalsIgnoreCase(uri.getHost())
            && s.getPort() == uri.getPort();
    }

    private class Client extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (uri.toString().startsWith("file:///android_asset/") || inServer(uri)) return false;
            try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
            return true;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame() && inServer(request.getUrl())) showSetup("offline");
        }
    }

    /** 웹(js/nativeBridge.js · assets/setup.html)에서 부르는 기능. 웹뷰의 별도 스레드에서 불린다. */
    private class Bridge {
        @JavascriptInterface
        public String getServer() {
            String s = server();
            return s == null ? "" : s;
        }

        // 서버 주소 확인: /api/ping이 도토리숲 서버면 저장하고 연다. 결과는 setup.html의 onCheck(ok, 주소, 이유)로
        @JavascriptInterface
        public void checkServer(String raw) {
            String url = normalize(raw);
            new Thread(() -> {
                String why = null;
                try {
                    HttpURLConnection c = (HttpURLConnection) new URL(url + "/api/ping").openConnection();
                    c.setConnectTimeout(8000);
                    c.setReadTimeout(8000);
                    int code = c.getResponseCode();
                    StringBuilder body = new StringBuilder();
                    if (code == 200) {
                        java.io.InputStream in = c.getInputStream();
                        byte[] buf = new byte[512];
                        int n;
                        while ((n = in.read(buf)) > 0 && body.length() < 2000) body.append(new String(buf, 0, n, "UTF-8"));
                        in.close();
                    }
                    c.disconnect();
                    if (code != 200 || !body.toString().contains("\"dotori\"")) why = "notdotori";
                } catch (javax.net.ssl.SSLException e) {
                    why = "ssl";
                } catch (Exception e) {
                    why = "offline";
                }
                final String reason = why;
                main.post(() -> {
                    if (reason == null) {
                        prefs().edit().putString(KEY_SERVER, url).apply();
                        open();
                    } else {
                        js("window.onCheck&&onCheck(false," + JSONObject.quote(url) + "," + JSONObject.quote(reason) + ")");
                    }
                });
            }).start();
        }

        @JavascriptInterface
        public void retry() { main.post(MainActivity.this::open); }

        @JavascriptInterface
        public void changeServer() { main.post(() -> showSetup(null)); }

        // 음성 합성 (녹음이 없는 말)
        @JavascriptInterface
        public void speak(int id, String text, String lang, float rate, float pitch) {
            main.post(() -> {
                if (!ttsReady) { js("window.__dotoriNative&&__dotoriNative.spoken(" + id + ")"); return; }
                tts.setLanguage(Locale.forLanguageTag(lang));
                tts.setSpeechRate(rate);
                tts.setPitch(pitch);
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, String.valueOf(id));
            });
        }

        @JavascriptInterface
        public void stopSpeak() { main.post(() -> { if (tts != null) tts.stop(); }); }

        // 음성인식: 말하는 도중(partial) · 끝(final) 후보, 소리 시작 · 끝, 오류, 끝남을 sr(id, 종류, 값)으로 돌려준다
        @JavascriptInterface
        public void listenStart(int id, String lang, int maxAlternatives, boolean partial) {
            main.post(() -> startListening(id, lang, maxAlternatives, partial));
        }

        @JavascriptInterface
        public void listenStop(int id) {
            main.post(() -> { if (recognizer != null && listening == id) recognizer.stopListening(); });
        }
    }

    private void sr(int id, String type, String data) {
        js("window.__dotoriNative&&__dotoriNative.sr(" + id + "," + JSONObject.quote(type) + "," + (data == null ? "null" : JSONObject.quote(data)) + ")");
    }

    private void startListening(int id, String lang, int maxAlternatives, boolean partial) {
        if (!hasMic()) {
            requestPermissions(new String[] { Manifest.permission.RECORD_AUDIO }, ASK_MIC);
            sr(id, "error", "not-allowed");
            sr(id, "end", null);
            return;
        }
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            sr(id, "error", "service-not-allowed");
            sr(id, "end", null);
            return;
        }
        if (tts != null) tts.stop();
        if (recognizer != null) recognizer.destroy();
        recognizer = SpeechRecognizer.createSpeechRecognizer(this);
        listening = id;
        recognizer.setRecognitionListener(new RecognitionListener() {
            private boolean ended;
            private void end() {
                if (ended) return;
                ended = true;
                sr(id, "end", null);
            }
            @Override public void onReadyForSpeech(Bundle params) {}
            @Override public void onBeginningOfSpeech() { sr(id, "sound", null); }
            @Override public void onRmsChanged(float rmsdB) {}
            @Override public void onBufferReceived(byte[] buffer) {}
            @Override public void onEndOfSpeech() { sr(id, "soundend", null); }
            @Override public void onEvent(int eventType, Bundle params) {}
            @Override public void onPartialResults(Bundle b) {
                ArrayList<String> list = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (list != null && !list.isEmpty()) sr(id, "partial", new JSONArray(list).toString());
            }
            @Override public void onResults(Bundle b) {
                ArrayList<String> list = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (list != null && !list.isEmpty()) sr(id, "final", new JSONArray(list).toString());
                end();
            }
            @Override public void onError(int code) {
                String e;
                switch (code) {
                    case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: e = "not-allowed"; break;
                    case SpeechRecognizer.ERROR_NO_MATCH:
                    case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: e = "no-speech"; break;
                    case SpeechRecognizer.ERROR_NETWORK:
                    case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: e = "network"; break;
                    case SpeechRecognizer.ERROR_AUDIO: e = "audio-capture"; break;
                    default: e = "aborted";
                }
                sr(id, "error", e);
                end();
            }
        });
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, Math.max(1, maxAlternatives));
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, partial);
        intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());
        recognizer.startListening(intent);
    }

    /* ---------- 앱 업데이트 ---------- */
    // 6시간에 한 번: 최신 릴리스(app-<번호>)가 지금 앱보다 새것이면 받을지 묻는다 (직접 빌드한 디버그 앱은 묻지 않음)
    private void checkUpdate() {
        if (BuildConfig.DEBUG) return;
        if (System.currentTimeMillis() - prefs().getLong("updateCheckedAt", 0) < UPDATE_EVERY) return;
        new Thread(() -> {
            try {
                HttpURLConnection c = (HttpURLConnection) new URL("https://api.github.com/repos/" + BuildConfig.UPDATE_REPO + "/releases/latest").openConnection();
                c.setRequestProperty("Accept", "application/vnd.github+json");
                c.setRequestProperty("User-Agent", "DotoriApp");
                c.setConnectTimeout(8000);
                c.setReadTimeout(8000);
                if (c.getResponseCode() != 200) return;
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
                java.io.InputStream in = c.getInputStream();
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                in.close();
                c.disconnect();
                JSONObject release = new JSONObject(out.toString("UTF-8"));
                prefs().edit().putLong("updateCheckedAt", System.currentTimeMillis()).apply();
                String tag = release.optString("tag_name");
                if (!tag.startsWith("app-")) return;
                int code = Integer.parseInt(tag.substring(4));
                JSONArray assets = release.optJSONArray("assets");
                String url = null;
                for (int i = 0; assets != null && i < assets.length(); i++) {
                    JSONObject a = assets.getJSONObject(i);
                    if (a.optString("name").endsWith(".apk")) url = a.optString("browser_download_url");
                }
                if (code > BuildConfig.VERSION_CODE && url != null) {
                    final String apkUrl = url;
                    main.post(() -> askUpdate(code, apkUrl));
                }
            } catch (Exception ignored) {
            }
        }).start();
    }

    private void askUpdate(int code, String url) {
        if (isFinishing()) return;
        new AlertDialog.Builder(this)
            .setTitle("새 버전이 있어요")
            .setMessage("도토리숲 앱 1." + code + " 버전을 받아서 설치할까요?\n(놀이 화면은 서버에서 늘 새로 받아요. 이 업데이트는 앱 자체를 고쳐요.)")
            .setPositiveButton("업데이트", (d, w) -> download(code, url))
            .setNegativeButton("나중에", null)
            .show();
    }

    // 내려받기가 끝나면 안드로이드 설치 화면을 연다 (처음 한 번은 "이 출처의 앱 설치 허용"을 물어요)
    private void download(int code, String url) {
        DownloadManager dm = getSystemService(DownloadManager.class);
        if (dm == null) return;
        String name = "dotori-" + code + ".apk";
        java.io.File old = new java.io.File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), name);
        if (old.exists()) old.delete();
        DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url))
            .setTitle("도토리숲 1." + code)
            .setMimeType(APK)
            .setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, name)
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        long id = dm.enqueue(req);
        Toast.makeText(this, "새 버전을 받고 있어요…", Toast.LENGTH_SHORT).show();
        BroadcastReceiver done = new BroadcastReceiver() {
            @Override
            public void onReceive(Context ctx, Intent intent) {
                if (intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1) != id) return;
                unregisterReceiver(this);
                Uri apk = dm.getUriForDownloadedFile(id);
                if (apk == null) {
                    Toast.makeText(MainActivity.this, "새 버전을 받지 못했어요. 나중에 다시 해 볼게요.", Toast.LENGTH_LONG).show();
                    return;
                }
                Intent install = new Intent(Intent.ACTION_VIEW)
                    .setDataAndType(apk, APK)
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                try { startActivity(install); } catch (Exception ignored) {}
            }
        };
        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(done, filter, Context.RECEIVER_EXPORTED);
        else registerReceiver(done, filter);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (tts != null) tts.stop();
        if (recognizer != null) recognizer.cancel();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        if (recognizer != null) recognizer.destroy();
        web.destroy();
        web = null;
        super.onDestroy();
    }
}
