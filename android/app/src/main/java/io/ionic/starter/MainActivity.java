package org.elevate.mentoring;

import com.getcapacitor.BridgeActivity;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    public void onResume() {
    super.onResume();
    WebSettings settings = bridge.getWebView().getSettings();
    settings.setTextZoom(100);
    settings.setSupportZoom(false);
    }


}