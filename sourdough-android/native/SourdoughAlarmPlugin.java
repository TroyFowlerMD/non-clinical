package com.troyfowlermd.sourdoughworkbench;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SourdoughAlarm")
public class SourdoughAlarmPlugin extends Plugin {
  private PendingIntent pendingIntent(int requestCode, int fold, boolean test) {
    Intent intent = new Intent(getContext(), SourdoughAlarmReceiver.class);
    intent.putExtra("foldNumber", fold);
    intent.putExtra("test", test);
    return PendingIntent.getBroadcast(getContext(), requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }

  private AlarmManager alarms() {
    return (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
  }

  private boolean canSchedule(PluginCall call) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarms().canScheduleExactAlarms()) {
      call.reject("Allow Alarms & reminders for Sourdough Workbench, then try again.");
      return false;
    }
    return true;
  }

  @PluginMethod public void schedule(PluginCall call) {
    Long triggerAt = call.getLong("triggerAt");
    if (triggerAt == null) { call.reject("triggerAt is required"); return; }
    if (!canSchedule(call)) return;
    SourdoughAlarmReceiver.ensureChannel(getContext());
    try {
      alarms().setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent(4100, call.getInt("foldNumber", 1), false));
      call.resolve();
    } catch (SecurityException exception) {
      call.reject("Android could not schedule the alarm. Allow Alarms & reminders, then try again.");
    }
  }

  @PluginMethod public void test(PluginCall call) {
    if (!canSchedule(call)) return;
    SourdoughAlarmReceiver.ensureChannel(getContext());
    try {
      alarms().setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + 15000, pendingIntent(4101, 0, true));
      call.resolve();
    } catch (SecurityException exception) {
      call.reject("Android could not schedule the test alert. Allow Alarms & reminders, then try again.");
    }
  }

  @PluginMethod public void cancel(PluginCall call) {
    alarms().cancel(pendingIntent(4100, 1, false));
    call.resolve();
  }
}
