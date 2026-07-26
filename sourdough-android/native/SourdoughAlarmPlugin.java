package com.troyfowlermd.sourdoughworkbench;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;

@CapacitorPlugin(name = "SourdoughAlarm")
public class SourdoughAlarmPlugin extends Plugin {
  private PendingIntent pendingIntent() {
    Intent intent = new Intent(getContext(), SourdoughAlarmReceiver.class);
    return PendingIntent.getBroadcast(getContext(), 4100, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }

  @PluginMethod public void schedule(PluginCall call) {
    Long triggerAt = call.getLong("triggerAt");
    if (triggerAt == null) { call.reject("triggerAt is required"); return; }
    AlarmManager alarms = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarms.canScheduleExactAlarms()) {
      call.reject("Allow Alarms & reminders for Sourdough Workbench, then start the timer again.");
      return;
    }
    Intent intent = new Intent(getContext(), SourdoughAlarmReceiver.class);
    intent.putExtra("foldNumber", call.getInt("foldNumber", 1));
    PendingIntent pending = PendingIntent.getBroadcast(getContext(), 4100, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    try {
      alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending);
      call.resolve();
    } catch (SecurityException exception) {
      call.reject("Android could not schedule the alarm. Allow Alarms & reminders, then start the timer again.", exception);
    }
  }

  @PluginMethod public void cancel(PluginCall call) {
    AlarmManager alarms = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
    alarms.cancel(pendingIntent());
    call.resolve();
  }
}
