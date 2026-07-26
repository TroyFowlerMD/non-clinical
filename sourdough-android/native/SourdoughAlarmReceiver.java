package com.troyfowlermd.sourdoughworkbench;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class SourdoughAlarmReceiver extends BroadcastReceiver {
  public static final String CHANNEL_ID = "sourdough-fold-alerts";

  @Override public void onReceive(Context context, Intent intent) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationManager manager = context.getSystemService(NotificationManager.class);
      manager.createNotificationChannel(new NotificationChannel(CHANNEL_ID, "Sourdough fold alerts", NotificationManager.IMPORTANCE_HIGH));
    }
    int fold = intent.getIntExtra("foldNumber", 1);
    int icon = context.getResources().getIdentifier("ic_launcher", "mipmap", context.getPackageName());
    NotificationCompat.Builder notification = new NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(icon)
      .setContentTitle("Sourdough: fold set " + fold + " is ready")
      .setContentText("Return to Sourdough Workbench to complete the fold.")
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setAutoCancel(true)
      .setDefaults(NotificationCompat.DEFAULT_ALL);
    NotificationManagerCompat.from(context).notify(4100 + fold, notification.build());
  }
}
