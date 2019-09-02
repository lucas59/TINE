package com.tine;

import com.facebook.react.bridge.ReactContextBaseJavaModule;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.content.Intent;
import android.content.Context;
import android.app.NotificationManager;
import android.net.ConnectivityManager;
import android.os.CountDownTimer;
import android.net.NetworkInfo;
import android.content.ContextWrapper;
import com.facebook.react.bridge.Callback;
import android.content.ComponentCallbacks;

public class ConnectionStatusModuleManager extends ReactContextBaseJavaModule {
    public Context mContext;
    private Intent mService;
    private boolean mConnected = false;
    private String mName = null;

    public ConnectionStatusModuleManager(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        ConnectionNotificationService.setUpdateListener(this);
    }

    public void setModuleParams(boolean connected, String name) {
        mConnected = connected;
        mName = name;
    }

    public void removeServiceReference() {
        mService = null;
    }

    @Override
    public String getName() {
        return "ConnectionStatusModule";
    }

    @ReactMethod
    public void checkConnectionStatus(Callback callback) {
        if (mService == null) {
            mService = new Intent(mContext, ConnectionNotificationService.class);
            mContext.startService(mService);
        }
        callback.invoke(mConnected,mName);
    }

}