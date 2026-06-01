package com.troyfowlermd.psychscheduler;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetDataBridge.class);
        super.onCreate(savedInstanceState);
    }
}
