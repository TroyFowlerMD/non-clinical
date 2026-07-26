package com.troyfowlermd.sourdoughworkbench;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;

public class SourdoughAlarmReceiver extends BroadcastReceiver {
  public static final String CHANNEL_ID = "sourdough-fold-alarm-v2";

  public static void ensureChannel(Context context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
    NotificationManager manager = context.getSystemService(NotificationManager.class);
    Uri alarmTone = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
    AudioAttributes audio = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build();
    NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Sourdough locked-phone alarms", NotificationManager.IMPORTANCE_HIGH);
    channel.setDescription("Time-sensitive fold alerts that work while the phone is locked.");
    channel.setSound(alarmTone, audio);
    channel.enableVibration(true);
    channel.setVibrationPattern(new long[]{0, 500, 250, 500});
    channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
    manager.createNotificationChannel(channel);
  }

  @Override public void onReceive(Context context, Intent intent) {
    ensureChannel(context);
    int fold = intent.getIntExtra("foldNumber", 1);
    boolean test = intent.getBooleanExtra("test", false);
    Notification.Builder notification = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
      ? new Notification.Builder(context, CHANNEL_ID)
      : new Notification.Builder(context);
    notification
      .setSmallIcon(android.R.drawable.ic_popup_reminder)
      .setContentTitle(test ? "Sourdough locked-phone alert test" : "Sourdough: fold set " + fold + " is ready")
      .setContentText(test ? "If you received this while locked, the alarm is working." : "Return to Sourdough Workbench to complete the fold.")
      .setCategory(Notification.CATEGORY_ALARM)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setPriority(Notification.PRIORITY_HIGH)
      .setAutoCancel(true)
      .setDefaults(Notification.DEFAULT_ALL);
    context.getSystemService(NotificationManager.class).notify(test ? 4101 : 4100 + fold, notification.build());
  }
}
