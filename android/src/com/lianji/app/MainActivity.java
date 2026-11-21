package com.lianji.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final String APP_HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://appassets.androidplatform.net/assets/www/index.html";
    private static final String FILE_FALLBACK_URL = "file:///android_asset/www/index.html";
    private static final String FALLBACK_PAPER = "#f5f5f7";
    private static final int REQUEST_SELECT_FILE = 1001;
    private static final int REQUEST_CREATE_BACKUP = 1002;
    private WebView webView;
    private boolean usingFileFallback = false;
    private ValueCallback<Uri[]> filePathCallback;
    private String pendingBackupContent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        getWindow().setStatusBarColor(Color.parseColor(FALLBACK_PAPER));
        getWindow().setNavigationBarColor(Color.parseColor(FALLBACK_PAPER));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor(FALLBACK_PAPER));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setDefaultTextEncodingName("utf-8");
        if (Build.VERSION.SDK_INT >= 29) {
            settings.setForceDark(WebSettings.FORCE_DARK_OFF);
        }
        if (Build.VERSION.SDK_INT >= 33) {
            settings.setAlgorithmicDarkeningAllowed(false);
        }

        webView.addJavascriptInterface(new SystemBarBridge(), "LianjiAndroid");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri == null) return true;
                if (usingFileFallback && "file".equals(uri.getScheme())) return false;
                if (!APP_HOST.equals(uri.getHost())) {
                    openExternalUrl(uri);
                    return true;
                }
                return false;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri uri = Uri.parse(url);
                if (usingFileFallback && "file".equals(uri.getScheme())) return false;
                if (!APP_HOST.equals(uri.getHost())) {
                    openExternalUrl(uri);
                    return true;
                }
                return false;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame() && !usingFileFallback) {
                    usingFileFallback = true;
                    view.loadUrl(FILE_FALLBACK_URL);
                }
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri == null || !APP_HOST.equals(uri.getHost())) {
                    return super.shouldInterceptRequest(view, request);
                }
                String path = uri.getPath();
                if (path == null || !path.startsWith("/assets/") || path.contains("..")) {
                    return notFound();
                }
                String assetPath = path.substring("/assets/".length());
                try {
                    InputStream stream = getAssets().open(assetPath);
                    return new WebResourceResponse(mimeType(assetPath), "UTF-8", stream);
                } catch (IOException error) {
                    return notFound();
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                String[] acceptTypes = params.getAcceptTypes();
                String type = "*/*";
                if (acceptTypes != null && acceptTypes.length > 0 && acceptTypes[0] != null) {
                    String first = acceptTypes[0].split(",")[0].trim();
                    if (first.contains("/")) type = first;
                }
                intent.setType(type);
                if (acceptTypes != null && acceptTypes.length > 1) {
                    intent.putExtra(Intent.EXTRA_MIME_TYPES, acceptTypes);
                }
                if (params.getMode() == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) {
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                }
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try {
                    startActivityForResult(Intent.createChooser(intent, "选择文件"), REQUEST_SELECT_FILE);
                    return true;
                } catch (Exception error) {
                    filePathCallback = null;
                    callback.onReceiveValue(null);
                    return false;
                }
            }
        });

        setContentView(webView);
        webView.loadUrl(START_URL);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_CREATE_BACKUP) {
            String content = pendingBackupContent;
            pendingBackupContent = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null && content != null) {
                try (OutputStream stream = getContentResolver().openOutputStream(data.getData())) {
                    if (stream == null) throw new IOException("no stream");
                    stream.write(content.getBytes(StandardCharsets.UTF_8));
                    Toast.makeText(this, "备份已保存", Toast.LENGTH_SHORT).show();
                } catch (Exception error) {
                    Toast.makeText(this, "备份保存失败", Toast.LENGTH_LONG).show();
                }
            } else {
                Toast.makeText(this, "已取消备份", Toast.LENGTH_SHORT).show();
            }
            return;
        }
        if (requestCode == REQUEST_SELECT_FILE) {
            if (filePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }
                } else if (data.getData() != null) {
                    results = new Uri[]{data.getData()};
                }
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    private String mimeType(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".js")) return "application/javascript";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".webmanifest")) return "application/manifest+json";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
        if (path.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    private WebResourceResponse notFound() {
        byte[] body = "Not found".getBytes(StandardCharsets.UTF_8);
        WebResourceResponse response = new WebResourceResponse(
            "text/plain", "UTF-8", new ByteArrayInputStream(body));
        response.setStatusCodeAndReasonPhrase(404, "Not Found");
        return response;
    }

    @SuppressWarnings("deprecation")
    private void applySystemBars(String accentColor, String backgroundColor, boolean dark) {
        int background = parseColor(backgroundColor, Color.parseColor(FALLBACK_PAPER));
        getWindow().setStatusBarColor(background);
        getWindow().setNavigationBarColor(background);
        if (webView != null) {
            webView.setBackgroundColor(background);
        }

        View decor = getWindow().getDecorView();
        int flags = decor.getSystemUiVisibility();
        if (Build.VERSION.SDK_INT >= 23) {
            if (dark) flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            else flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        }
        if (Build.VERSION.SDK_INT >= 26) {
            if (dark) flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            else flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        decor.setSystemUiVisibility(flags);
    }

    private int parseColor(String value, int fallback) {
        if (value == null) return fallback;
        try {
            return Color.parseColor(value);
        } catch (IllegalArgumentException error) {
            return fallback;
        }
    }

    private void openExternalUrl(Uri uri) {
        if (uri == null) return;
        String scheme = uri.getScheme();
        if (!"http".equals(scheme) && !"https".equals(scheme)) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (Exception error) {
            Toast.makeText(this, "无法打开链接", Toast.LENGTH_SHORT).show();
        }
    }

    private class SystemBarBridge {
        @JavascriptInterface
        public void setSystemBars(final String accent, final String background, final boolean dark) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    applySystemBars(accent, background, dark);
                }
            });
        }

        @JavascriptInterface
        public void saveBackup(final String filename, final String content) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    pendingBackupContent = content;
                    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("application/json");
                    intent.putExtra(Intent.EXTRA_TITLE, filename);
                    try {
                        startActivityForResult(intent, REQUEST_CREATE_BACKUP);
                    } catch (Exception error) {
                        pendingBackupContent = null;
                        Toast.makeText(MainActivity.this, "无法打开保存窗口", Toast.LENGTH_LONG).show();
                    }
                }
            });
        }
        @JavascriptInterface
        public void openExternal(final String url) {
            if (url == null) return;
            Uri uri = Uri.parse(url);
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    openExternalUrl(uri);
                }
            });
        }

    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }

        InputMethodManager inputMethodManager = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        if (inputMethodManager != null && inputMethodManager.isAcceptingText()) {
            inputMethodManager.hideSoftInputFromWindow(webView.getWindowToken(), 0);
            return;
        }

        webView.evaluateJavascript(
            "(function(){try{return window.__lianjiBack?window.__lianjiBack():false;}catch(e){return false;}})()",
            value -> {
                if (!"true".equals(value)) {
                    finish();
                }
            }
        );
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (filePathCallback != null) {
            filePathCallback.onReceiveValue(null);
            filePathCallback = null;
        }
        if (webView != null) {
            webView.removeJavascriptInterface("LianjiAndroid");
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
