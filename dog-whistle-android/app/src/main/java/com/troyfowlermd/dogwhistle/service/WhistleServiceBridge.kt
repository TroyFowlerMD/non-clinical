package com.troyfowlermd.dogwhistle.service

import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

object WhistleServiceBridge {
    const val ACTION_PREPARE = "com.troyfowlermd.dogwhistle.action.PREPARE"
    const val ACTION_START = "com.troyfowlermd.dogwhistle.action.START"
    const val ACTION_STOP = "com.troyfowlermd.dogwhistle.action.STOP"
    const val ACTION_STOP_IF_IDLE = "com.troyfowlermd.dogwhistle.action.STOP_IF_IDLE"
    const val EXTRA_SOURCE = "extra_source"

    fun prepare(context: Context) {
        ContextCompat.startForegroundService(
            context,
            Intent(context, WhistleService::class.java).setAction(ACTION_PREPARE),
        )
    }

    fun startWhistle(context: Context, source: ActivationSource) {
        ContextCompat.startForegroundService(
            context,
            Intent(context, WhistleService::class.java)
                .setAction(ACTION_START)
                .putExtra(EXTRA_SOURCE, source.name),
        )
    }

    fun stopWhistle(context: Context, source: ActivationSource) {
        context.startService(
            Intent(context, WhistleService::class.java)
                .setAction(ACTION_STOP)
                .putExtra(EXTRA_SOURCE, source.name),
        )
    }

    fun stopIfIdle(context: Context) {
        context.startService(
            Intent(context, WhistleService::class.java).setAction(ACTION_STOP_IF_IDLE),
        )
    }
}

