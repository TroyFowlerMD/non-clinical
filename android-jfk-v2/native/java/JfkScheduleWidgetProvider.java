package com.troyfowlermd.jfkmedstaffschedule;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

public class JfkScheduleWidgetProvider extends AppWidgetProvider {
    static final String ACTION_REFRESH = "com.troyfowlermd.jfkmedstaffschedule.action.REFRESH";
    static final String ACTION_PREVIOUS_DAY = "com.troyfowlermd.jfkmedstaffschedule.action.PREVIOUS_DAY";
    static final String ACTION_NEXT_DAY = "com.troyfowlermd.jfkmedstaffschedule.action.NEXT_DAY";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateWidgets(context, appWidgetManager, appWidgetIds);
        JfkScheduleRefreshWorker.schedule(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent != null && ACTION_PREVIOUS_DAY.equals(intent.getAction())) {
            moveDay(context, -1);
            updateAllWidgets(context);
            return;
        }
        if (intent != null && ACTION_NEXT_DAY.equals(intent.getAction())) {
            moveDay(context, 1);
            updateAllWidgets(context);
            return;
        }
        if (intent != null && ACTION_REFRESH.equals(intent.getAction())) {
            JfkScheduleRefreshWorker.enqueueNow(context);
            updateAllWidgets(context);
            return;
        }
        super.onReceive(context, intent);
    }

    static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, JfkScheduleWidgetProvider.class);
        updateWidgets(context, manager, manager.getAppWidgetIds(component));
    }

    private static void updateWidgets(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            manager.updateAppWidget(appWidgetId, buildRemoteViews(context, appWidgetId));
        }
        manager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.widget_list);
    }

    private static RemoteViews buildRemoteViews(Context context, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.jfk_schedule_widget);
        JSONObject snapshot = ensureSnapshot(context);
        String title = "JFK Schedule";
        String asOf = "Open the app to load schedule data.";

        if (snapshot != null) {
            title = snapshot.optString("title", title);
            String asOfValue = snapshot.optString("asOf", "");
            String label = snapshot.optString("label", "");
            if (!asOfValue.isEmpty()) {
                asOf = "Schedule data as of " + asOfValue + (label.isEmpty() ? "" : " - " + label);
            }
        } else {
            String error = JfkScheduleWidgetStore.getLastError(context);
            if (error != null && !error.trim().isEmpty()) {
                asOf = "Refresh failed. Showing last available data when present.";
            }
        }

        views.setTextViewText(R.id.widget_title, title);
        views.setTextViewText(R.id.widget_footer, asOf);
        views.setViewVisibility(R.id.widget_empty, snapshot == null ? View.VISIBLE : View.GONE);

        Intent serviceIntent = new Intent(context, JfkScheduleWidgetService.class);
        serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
        views.setRemoteAdapter(R.id.widget_list, serviceIntent);
        views.setEmptyView(R.id.widget_list, R.id.widget_empty);

        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (launchIntent != null) {
            views.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(
                context,
                appWidgetId,
                launchIntent,
                pendingIntentFlags()
            ));
        }

        Intent refreshIntent = new Intent(context, JfkScheduleWidgetProvider.class);
        refreshIntent.setAction(ACTION_REFRESH);
        views.setOnClickPendingIntent(R.id.widget_refresh, PendingIntent.getBroadcast(
            context,
            appWidgetId + 10000,
            refreshIntent,
            pendingIntentFlags()
        ));

        Intent previousIntent = new Intent(context, JfkScheduleWidgetProvider.class);
        previousIntent.setAction(ACTION_PREVIOUS_DAY);
        views.setOnClickPendingIntent(R.id.widget_previous, PendingIntent.getBroadcast(
            context,
            appWidgetId + 20000,
            previousIntent,
            pendingIntentFlags()
        ));

        Intent nextIntent = new Intent(context, JfkScheduleWidgetProvider.class);
        nextIntent.setAction(ACTION_NEXT_DAY);
        views.setOnClickPendingIntent(R.id.widget_next, PendingIntent.getBroadcast(
            context,
            appWidgetId + 30000,
            nextIntent,
            pendingIntentFlags()
        ));

        return views;
    }

    private static void moveDay(Context context, int delta) {
        String raw = JfkScheduleWidgetStore.getRawJson(context);
        if (raw == null || raw.trim().isEmpty()) return;
        try {
            JSONObject current = ensureSnapshot(context);
            String baseDate = current != null ? current.optString("dailyDate", JfkScheduleWidgetStore.getDailyDate(context)) : JfkScheduleWidgetStore.getDailyDate(context);
            String targetDate = JfkScheduleParser.addDays(baseDate, delta);
            JSONObject meta = JfkScheduleWidgetStore.getMeta(context);
            JSONObject snapshot = JfkScheduleParser.buildSnapshot(new JSONObject(raw), meta, targetDate);
            JfkScheduleWidgetStore.saveFromApp(context, snapshot.toString(), raw, meta.toString(), snapshot.optString("dailyDate", targetDate));
        } catch (Exception e) {
            JfkScheduleWidgetStore.saveError(context, e);
        }
    }

    private static JSONObject ensureSnapshot(Context context) {
        JSONObject snapshot = JfkScheduleWidgetStore.getSnapshot(context);
        if (snapshot != null) return snapshot;
        String raw = JfkScheduleWidgetStore.getRawJson(context);
        if (raw == null || raw.trim().isEmpty()) return null;
        try {
            snapshot = JfkScheduleParser.buildSnapshot(new JSONObject(raw), JfkScheduleWidgetStore.getMeta(context), JfkScheduleWidgetStore.getDailyDate(context));
            JfkScheduleWidgetStore.saveFromApp(context, snapshot.toString(), raw, JfkScheduleWidgetStore.getMeta(context).toString(), snapshot.optString("dailyDate", ""));
            return snapshot;
        } catch (Exception e) {
            JfkScheduleWidgetStore.saveError(context, e);
            return null;
        }
    }

    private static int pendingIntentFlags() {
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        return flags;
    }
}
