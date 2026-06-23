package com.troyfowlermd.dogwhistle.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import com.troyfowlermd.dogwhistle.DogWhistleApplication
import com.troyfowlermd.dogwhistle.MainActivity
import com.troyfowlermd.dogwhistle.R
import com.troyfowlermd.dogwhistle.audio.WhistleAudioEngine
import com.troyfowlermd.dogwhistle.model.WhistleConfig
import com.troyfowlermd.dogwhistle.model.WhistleRuntimeState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class WhistleService : Service() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val audioEngine = WhistleAudioEngine()
    private val audioManager by lazy { getSystemService(Context.AUDIO_SERVICE) as AudioManager }
    private val notificationManager by lazy {
        getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    }
    private val vibratorManager by lazy {
        getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
    }
    private val toneGenerator by lazy { ToneGenerator(AudioManager.STREAM_MUSIC, 70) }
    private val repository by lazy { (application as DogWhistleApplication).repository }

    private var latestConfig = WhistleConfig()
    private var previousMediaVolume: Int? = null
    private var feedbackJob: Job? = null
    private var holdTimeoutJob: Job? = null
    private var isActive = false
    private var lastSource = ActivationSource.SCREEN_BUTTON.name
    private var isPreparedForScreenOff = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        scope.launch {
            repository.config.collectLatest { config ->
                latestConfig = config
                audioEngine.updateGain(config.whistleGainPercent)
                if (!isActive && !isPreparedForScreenOff) {
                    return@collectLatest
                }
                when {
                    isActive -> startForeground(NOTIFICATION_ID, buildNotification(isActive = true))
                    config.screenOffArmed -> {
                        isPreparedForScreenOff = true
                        startForeground(NOTIFICATION_ID, buildNotification(isActive = false))
                    }
                    else -> shutdownIfIdle()
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            WhistleServiceBridge.ACTION_PREPARE -> {
                isPreparedForScreenOff = true
                startForeground(NOTIFICATION_ID, buildNotification(isActive = false))
            }

            WhistleServiceBridge.ACTION_START -> {
                val source = intent.getStringExtra(WhistleServiceBridge.EXTRA_SOURCE)
                    ?: ActivationSource.SCREEN_BUTTON.name
                startWhistle(source)
            }

            WhistleServiceBridge.ACTION_STOP -> {
                stopWhistle()
            }

            WhistleServiceBridge.ACTION_STOP_IF_IDLE -> {
                if (!isActive && !latestConfig.screenOffArmed) {
                    shutdownIfIdle()
                }
            }
        }
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        feedbackJob?.cancel()
        holdTimeoutJob?.cancel()
        audioEngine.stop()
        audioEngine.release()
        toneGenerator.release()
        scope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun startWhistle(source: String) {
        lastSource = source
        isActive = true
        if (previousMediaVolume == null) {
            previousMediaVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        }
        setMediaVolumeToConfiguredLevel()
        audioEngine.play(latestConfig.whistleGainPercent)
        startFeedbackLoop()
        if (source == ActivationSource.VOLUME_KEY_ACCESSIBILITY.name) {
            refreshHoldTimeout()
        } else {
            holdTimeoutJob?.cancel()
        }
        WhistleStatusBus.update(
            WhistleRuntimeState(
                isActive = true,
                lastSource = source,
                lastError = null,
            ),
        )
        startForeground(NOTIFICATION_ID, buildNotification(isActive = true))
    }

    private fun stopWhistle() {
        if (!isActive) {
            if (latestConfig.screenOffArmed) {
                isPreparedForScreenOff = true
                startForeground(NOTIFICATION_ID, buildNotification(isActive = false))
            } else {
                shutdownIfIdle()
            }
            return
        }

        isActive = false
        holdTimeoutJob?.cancel()
        feedbackJob?.cancel()
        vibratorManager.defaultVibrator.cancel()
        audioEngine.stop()
        previousMediaVolume?.let {
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, it, 0)
        }
        previousMediaVolume = null
        WhistleStatusBus.update(
            WhistleRuntimeState(
                isActive = false,
                lastSource = lastSource,
                lastError = null,
            ),
        )
        if (latestConfig.screenOffArmed) {
            isPreparedForScreenOff = true
            startForeground(NOTIFICATION_ID, buildNotification(isActive = false))
        } else {
            shutdownIfIdle()
        }
    }

    private fun startFeedbackLoop() {
        feedbackJob?.cancel()
        if (!latestConfig.vibrateFeedback && !latestConfig.audibleCueFeedback) {
            return
        }

        feedbackJob = scope.launch {
            while (isActive) {
                if (latestConfig.vibrateFeedback) {
                    vibratorManager.defaultVibrator.vibrate(
                        VibrationEffect.createOneShot(150, VibrationEffect.DEFAULT_AMPLITUDE),
                    )
                }
                if (latestConfig.audibleCueFeedback) {
                    toneGenerator.startTone(ToneGenerator.TONE_PROP_BEEP2, 200)
                }
                delay(800)
            }
        }
    }

    private fun refreshHoldTimeout() {
        holdTimeoutJob?.cancel()
        holdTimeoutJob = scope.launch {
            delay(750)
            stopWhistle()
        }
    }

    private fun setMediaVolumeToConfiguredLevel() {
        val max = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
        val requested = (max * (latestConfig.mediaVolumePercent / 100f)).toInt().coerceIn(0, max)
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, requested, 0)
    }

    private fun shutdownIfIdle() {
        isPreparedForScreenOff = false
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun buildNotification(isActive: Boolean): Notification {
        val startIntent = PendingIntent.getService(
            this,
            100,
            Intent(this, WhistleService::class.java)
                .setAction(WhistleServiceBridge.ACTION_START)
                .putExtra(WhistleServiceBridge.EXTRA_SOURCE, ActivationSource.NOTIFICATION.name),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val stopIntent = PendingIntent.getService(
            this,
            101,
            Intent(this, WhistleService::class.java)
                .setAction(WhistleServiceBridge.ACTION_STOP)
                .putExtra(WhistleServiceBridge.EXTRA_SOURCE, ActivationSource.NOTIFICATION.name),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val contentIntent = PendingIntent.getActivity(
            this,
            102,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val statusText = if (isActive) {
            "Whistle active from ${lastSource.replace('_', ' ').lowercase()}"
        } else {
            "Ready for lock-screen and notification controls"
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Dog whistle")
            .setContentText(statusText)
            .setSmallIcon(android.R.drawable.ic_lock_silent_mode_off)
            .setContentIntent(contentIntent)
            .setOngoing(isActive || latestConfig.screenOffArmed)
            .setSilent(!isActive)
            .addAction(0, "Start", startIntent)
            .addAction(0, "Stop", stopIntent)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = getString(R.string.notification_channel_description)
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    companion object {
        private const val CHANNEL_ID = "dog_whistle_playback"
        private const val NOTIFICATION_ID = 19_000
    }
}
