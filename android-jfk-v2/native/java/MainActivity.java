package com.troyfowlermd.jfkmedstaffschedule;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(JfkScheduleWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
