package com.troyfowlermd.dogwhistle.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlin.math.PI
import kotlin.math.sin

class WhistleAudioEngine(
    private val sampleRate: Int = 48_000,
    private val frequencyHz: Double = 19_000.0,
) {
    private var track: AudioTrack? = null

    fun play(gainPercent: Int) {
        val audioTrack = track ?: buildTrack().also { track = it }
        audioTrack.setVolume(gainPercent.coerceIn(0, 100) / 100f)
        if (audioTrack.playState != AudioTrack.PLAYSTATE_PLAYING) {
            audioTrack.reloadStaticData()
            audioTrack.play()
        }
    }

    fun updateGain(gainPercent: Int) {
        track?.setVolume(gainPercent.coerceIn(0, 100) / 100f)
    }

    fun stop() {
        track?.runCatching {
            pause()
            stop()
            reloadStaticData()
        }
    }

    fun release() {
        track?.release()
        track = null
    }

    private fun buildTrack(): AudioTrack {
        val sampleCount = sampleRate
        val samples = ShortArray(sampleCount)
        for (i in samples.indices) {
            val angle = 2.0 * PI * frequencyHz * i / sampleRate
            val amplitude = sin(angle) * Short.MAX_VALUE * 0.85
            samples[i] = amplitude.toInt().toShort()
        }

        val format = AudioFormat.Builder()
            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
            .setSampleRate(sampleRate)
            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
            .build()

        val attributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build()

        return AudioTrack.Builder()
            .setAudioAttributes(attributes)
            .setAudioFormat(format)
            .setTransferMode(AudioTrack.MODE_STATIC)
            .setBufferSizeInBytes(samples.size * 2)
            .build().also { audioTrack ->
                audioTrack.write(samples, 0, samples.size, AudioTrack.WRITE_BLOCKING)
                audioTrack.setLoopPoints(0, samples.size, -1)
            }
    }
}

