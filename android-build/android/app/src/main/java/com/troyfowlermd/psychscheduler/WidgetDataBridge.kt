package com.troyfowlermd.psychscheduler

import android.content.Context
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "WidgetDataBridge")
class WidgetDataBridge : Plugin() {

    @PluginMethod
    fun updateWidgetCache(call: PluginCall) {
        val schedule = call.getString("psychScheduleCache")
        val backup = call.getString("psychScheduleCache_backup")
        val calendar = call.getString("psychScheduleCache_calendar")
        val scheduleTime = call.getString("psychScheduleCacheTime")
        val backupTime = call.getString("psychScheduleCacheTime_backup")
        val calendarTime = call.getString("psychScheduleCacheTime_calendar")
        val widgetSnapshotJson = call.getString("widgetSnapshotJson")

        val prefs = context.getSharedPreferences(PsychSchedulerWidget.PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            if (schedule != null) putString("psychScheduleCache", schedule)
            if (backup != null) putString("psychScheduleCache_backup", backup)
            if (calendar != null) putString("psychScheduleCache_calendar", calendar)
            if (scheduleTime != null) putString("psychScheduleCacheTime", scheduleTime)
            if (backupTime != null) putString("psychScheduleCacheTime_backup", backupTime)
            if (calendarTime != null) putString("psychScheduleCacheTime_calendar", calendarTime)
            if (widgetSnapshotJson != null) putString(PsychSchedulerWidget.PREF_WIDGET_SNAPSHOT_JSON, widgetSnapshotJson)
        }.apply()

        PsychSchedulerWidget.requestWidgetUpdate(context)

        val result = JSObject()
        result.put("ok", true)
        call.resolve(result)
    }

    @PluginMethod
    fun consumeWidgetRefreshRequest(call: PluginCall) {
        val prefs = context.getSharedPreferences(PsychSchedulerWidget.PREFS_NAME, Context.MODE_PRIVATE)
        val requested = prefs.getBoolean(PsychSchedulerWidget.PREF_FORCE_REFRESH, false)
        if (requested) {
            prefs.edit().putBoolean(PsychSchedulerWidget.PREF_FORCE_REFRESH, false).apply()
        }

        val result = JSObject()
        result.put("refreshRequested", requested)
        call.resolve(result)
    }
}
