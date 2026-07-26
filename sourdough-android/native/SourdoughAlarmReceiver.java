package com.troyfowlermd.sourdoughworkbench;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Notification;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class SourdoughAlarmReceiver extends BroadcastReceiver {
  public static final String CHANNEL_ID = "sourdough-fold-alerts";

  @Override public void onReceive(Context context, Intent intent) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationManager manager = context.getSystemService(NotificationManager.class);
      manager.createNotificationChannel(new NotificationChannel(CHANNEL_ID, "Sourdough fold alerts", NotificationManager.IMPORTANCE_HIGH));
    }
    int fold = intent.getIntExtra("foldNumber", 1);
    Notification.Builder notification = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
      ? new Notification.Builder(context, CHANNEL_ID)
      : new Notification.Builder(context);
    notification
      .setSmallIcon(android.R.drawable.ic_popup_reminder)
      .setContentTitle("Sourdough: fold set " + fold + " is ready")
      .setContentText("Return to Sourdough Workbench to complete the fold.")
      .setPriority(Notification.PRIORITY_HIGH)
      .setAutoCancel(true)
      .setDefaults(Notification.DEFAULT_ALL);
    context.getSystemService(NotificationManager.class).notify(4100 + fold, notification.build());
  }
}
