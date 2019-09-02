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
import android.os.IBinder;

import android.net.NetworkInfo;
import android.content.ContextWrapper;
import android.app.Service; 
import android.widget.Toast;

public class ConnectionNotificationService extends Service {
    private static ConnectionStatusModuleManager mModuleManager;
    private CountDownTimer mServiceTimer = null;
    private CountDownTimer mMissingConnectionTimer = null;
    private ConnectivityManager connectivity;

    @Override
    public void onCreate() {
        connectivity = (ConnectivityManager) getBaseContext().getSystemService(Context.CONNECTIVITY_SERVICE);

        // set check timer onCreate service that check status for ten seconds each one
        // second
        // and restart if finish
        mServiceTimer = new CountDownTimer(10000, 1000) {
            public void onTick(long millisUntilFinished) {
                checkConnectionStatus();
            };

            public void onFinish() {
                mServiceTimer.start();
            }
        };
        mServiceTimer.start();
    }

    public void checkConnectionStatus() {
        // verify connection status and set
        boolean mConnected = false;
        String mName = null;
        if (connectivity != null && connectivity.getActiveNetworkInfo() != null) {
            NetworkInfo activeNetwork = connectivity.getActiveNetworkInfo();
            if (activeNetwork.getType() == ConnectivityManager.TYPE_MOBILE) {
                mName = activeNetwork.getTypeName();
                mConnected = true;
            } else if (activeNetwork.getType() == ConnectivityManager.TYPE_WIFI) {
                mName = activeNetwork.getTypeName();
                mConnected = true;
            }
            ;
            stopMissingConnectionTimer();
        } else {
            startMissingConnectionTimer();
        }
        if (mModuleManager != null) {
            mModuleManager.setModuleParams(mConnected, mName);
        }
    }

    private void startMissingConnectionTimer() {
        if (mMissingConnectionTimer == null) {
            mMissingConnectionTimer = new CountDownTimer(10000, 10000) {
                public void onTick(long millisUntilFinished) {
                };

                public void onFinish() {
                    Toast.makeText(getBaseContext(), "Llevas 10 segundos sin internet",Toast.LENGTH_LONG).show();
                    stopSelf(); // <- Finish the Service
                }
            };
            mMissingConnectionTimer.start();
        }

    }
    @Override
    public IBinder onBind(Intent arg0) {
        return null;
    }

    private void stopMissingConnectionTimer() {
        if (mMissingConnectionTimer != null) {
            mMissingConnectionTimer.cancel(); // <- Cancel Timer
            mMissingConnectionTimer = null; // <- Delete reference
        }
    }

    @Override
    public void onDestroy() {
        mServiceTimer.cancel();
        if (mModuleManager != null) {
            mModuleManager.removeServiceReference();
        }
        super.onDestroy();
    }

    // Let me get the module manager reference to pass information
    public static void setUpdateListener(ConnectionStatusModuleManager moduleManager) {
        mModuleManager = moduleManager;
    }

}