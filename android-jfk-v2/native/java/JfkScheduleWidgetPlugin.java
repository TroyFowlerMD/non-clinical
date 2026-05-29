package com.troyfowlermd.jfkmedstaffschedule;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "JfkScheduleWidget")
public class JfkScheduleWidgetPlugin extends Plugin {
    @PluginMethod
    public void saveSnapshot(PluginCall call) {
        String snapshot = call.getString("snapshot");
        if (snapshot == null || snapshot.trim().isEmpty()) {
            call.reject("Missing widget snapshot");
            return;
        }

        String rawJson = call.getString("rawJson");
        String metaJson = call.getString("metaJson");
        String dailyDate = call.getString("dailyDate");

        JfkScheduleWidgetStore.saveFromApp(getContext(), snapshot, rawJson, metaJson, dailyDate);
        JfkScheduleWidgetProvider.updateAllWidgets(getContext());
        JfkScheduleRefreshWorker.schedule(getContext());
        call.resolve();
    }
}
