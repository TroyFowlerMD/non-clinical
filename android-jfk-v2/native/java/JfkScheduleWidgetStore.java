package com.troyfowlermd.jfkmedstaffschedule;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

final class JfkScheduleWidgetStore {
    private static final String PREFS = "jfk_schedule_widget";
    private static final String KEY_SNAPSHOT = "snapshot_json";
    private static final String KEY_RAW = "raw_json";
    private static final String KEY_META = "meta_json";
    private static final String KEY_DAILY_DATE = "daily_date";
    private static final String KEY_LAST_ERROR = "last_error";
    private static final String KEY_UPDATED_AT = "updated_at";

    private JfkScheduleWidgetStore() {}

    static void saveFromApp(Context context, String snapshot, String rawJson, String metaJson, String dailyDate) {
        SharedPreferences.Editor editor = prefs(context).edit();
        if (snapshot != null && !snapshot.trim().isEmpty()) editor.putString(KEY_SNAPSHOT, snapshot);
        if (rawJson != null && !rawJson.trim().isEmpty()) editor.putString(KEY_RAW, rawJson);
        if (metaJson != null && !metaJson.trim().isEmpty()) editor.putString(KEY_META, metaJson);
        if (dailyDate != null && !dailyDate.trim().isEmpty()) editor.putString(KEY_DAILY_DATE, dailyDate);
        editor.putLong(KEY_UPDATED_AT, System.currentTimeMillis());
        editor.remove(KEY_LAST_ERROR);
        editor.apply();
    }

    static void saveRefreshed(Context context, String rawJson, JSONObject meta, JSONObject snapshot) {
        SharedPreferences.Editor editor = prefs(context).edit();
        editor.putString(KEY_RAW, rawJson);
        editor.putString(KEY_META, meta.toString());
        editor.putString(KEY_SNAPSHOT, snapshot.toString());
        editor.putString(KEY_DAILY_DATE, snapshot.optString("dailyDate", getDailyDate(context)));
        editor.putLong(KEY_UPDATED_AT, System.currentTimeMillis());
        editor.remove(KEY_LAST_ERROR);
        editor.apply();
    }

    static JSONObject getSnapshot(Context context) {
        String raw = prefs(context).getString(KEY_SNAPSHOT, "");
        if (raw == null || raw.trim().isEmpty()) return null;
        try {
            return new JSONObject(raw);
        } catch (Exception e) {
            return null;
        }
    }

    static String getRawJson(Context context) {
        return prefs(context).getString(KEY_RAW, "");
    }

    static JSONObject getMeta(Context context) {
        String raw = prefs(context).getString(KEY_META, "");
        if (raw == null || raw.trim().isEmpty()) return new JSONObject();
        try {
            return new JSONObject(raw);
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    static String getDailyDate(Context context) {
        return prefs(context).getString(KEY_DAILY_DATE, "");
    }

    static String getLastError(Context context) {
        return prefs(context).getString(KEY_LAST_ERROR, "");
    }

    static void saveError(Context context, Exception error) {
        prefs(context).edit()
            .putString(KEY_LAST_ERROR, error.getMessage() == null ? error.toString() : error.getMessage())
            .putLong(KEY_UPDATED_AT, System.currentTimeMillis())
            .apply();
    }

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
