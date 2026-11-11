package com.lazywizardgames.checkedout;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.os.Vibrator;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Hosts the HTML5 game (assets/index.html) in a full-screen portrait WebView. */
public class MainActivity extends Activity {
    private WebView web;

    /** Exposed to the game as window.AndroidBridge. */
    public class Bridge {
        @JavascriptInterface
        public void vibrate(int ms) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && ms > 0) v.vibrate(Math.min(ms, 600));
            } catch (Throwable ignored) { }
        }

        @JavascriptInterface
        public void exit() {
            runOnUiThread(new Runnable() { public void run() { finish(); } });
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_FULLSCREEN);

        web = new WebView(this);
        web.setBackgroundColor(0xFF0E0A14);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        try { // API 17+: let WebAudio start without extra prompts
            WebSettings.class.getMethod("setMediaPlaybackRequiresUserGesture", boolean.class).invoke(s, false);
        } catch (Throwable ignored) { }

        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return !url.startsWith("file:");
            }
        });
        setContentView(web);
        hideSystemBars();
        web.loadUrl("file:///android_asset/index.html");
    }

    private void hideSystemBars() {
        // IMMERSIVE_STICKY | LAYOUT_STABLE | LAYOUT_HIDE_NAVIGATION | LAYOUT_FULLSCREEN | HIDE_NAVIGATION | FULLSCREEN
        web.setSystemUiVisibility(0x1000 | 0x100 | 0x200 | 0x400 | 0x2 | 0x4);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    public void onBackPressed() {
        web.loadUrl("javascript:window.androidBack&&window.androidBack()");
    }

    @Override
    protected void onPause() {
        web.loadUrl("javascript:window.appPause&&window.appPause()");
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        hideSystemBars();
        web.loadUrl("javascript:window.appResume&&window.appResume()");
    }
}
