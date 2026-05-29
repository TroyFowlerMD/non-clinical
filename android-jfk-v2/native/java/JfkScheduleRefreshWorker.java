package com.troyfowlermd.jfkmedstaffschedule;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.ExistingWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

public class JfkScheduleRefreshWorker extends Worker {
    private static final String UNIQUE_PERIODIC_WORK = "jfk_schedule_widget_periodic_refresh";
    private static final String UNIQUE_NOW_WORK = "jfk_schedule_widget_refresh_now";
    private static final String DRIVE_EXEC_URL = "https://script.google.com/macros/s/AKfycbyMi0090cG0OpaW8vijCrijox-R1Y_d-4uGBbeg2Jq8KAYmICqctoF3ctZlqheHyEWC/exec";

    public JfkScheduleRefreshWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        try {
            String raw = fetchScheduleJson();
            JSONObject json = new JSONObject(raw);
            if (json.has("error")) throw new IllegalStateException(json.optString("error"));
            JSONObject meta = new JSONObject();
            String asOf = JfkScheduleParser.scheduleTimestamp(json);
            meta.put("asOf", asOf.isEmpty() ? JfkScheduleParser.isoNow() : asOf);
            meta.put("label", "Google Sheet");
            JSONObject snapshot = JfkScheduleParser.buildSnapshot(json, meta, JfkScheduleWidgetStore.getDailyDate(context));
            JfkScheduleWidgetStore.saveRefreshed(context, raw, meta, snapshot);
            JfkScheduleWidgetProvider.updateAllWidgets(context);
            return Result.success();
        } catch (Exception e) {
            JfkScheduleWidgetStore.saveError(context, e);
            JfkScheduleWidgetProvider.updateAllWidgets(context);
            return Result.retry();
        }
    }

    static void schedule(Context context) {
        Constraints constraints = new Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build();
        PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(JfkScheduleRefreshWorker.class, 30, TimeUnit.MINUTES)
            .setConstraints(constraints)
            .build();
        WorkManager.getInstance(context.getApplicationContext()).enqueueUniquePeriodicWork(
            UNIQUE_PERIODIC_WORK,
            ExistingPeriodicWorkPolicy.UPDATE,
            request
        );
    }

    static void enqueueNow(Context context) {
        Constraints constraints = new Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build();
        OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(JfkScheduleRefreshWorker.class)
            .setConstraints(constraints)
            .build();
        WorkManager.getInstance(context.getApplicationContext()).enqueueUniqueWork(
            UNIQUE_NOW_WORK,
            ExistingWorkPolicy.REPLACE,
            request
        );
    }

    private static String fetchScheduleJson() throws Exception {
        URL url = new URL(DRIVE_EXEC_URL + (DRIVE_EXEC_URL.contains("?") ? "&" : "?") + "_cb=" + System.currentTimeMillis());
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setConnectTimeout(15000);
        connection.setReadTimeout(20000);
        connection.setRequestMethod("GET");
        int code = connection.getResponseCode();
        InputStream stream = code >= 200 && code < 300 ? connection.getInputStream() : connection.getErrorStream();
        BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) out.append(line);
        reader.close();
        if (code < 200 || code >= 300) throw new IllegalStateException("HTTP " + code);
        return out.toString();
    }
}
