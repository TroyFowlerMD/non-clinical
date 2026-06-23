package com.troyfowlermd.dogwhistle.data

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.troyfowlermd.dogwhistle.model.WhistleConfig
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "dog_whistle_preferences")

class WhistlePreferencesRepository(private val context: Context) {
    val config: Flow<WhistleConfig> = context.dataStore.data.map { prefs ->
        WhistleConfig(
            mediaVolumePercent = prefs[MEDIA_VOLUME_PERCENT] ?: 100,
            whistleGainPercent = prefs[WHISTLE_GAIN_PERCENT] ?: 85,
            vibrateFeedback = prefs[VIBRATE_FEEDBACK] ?: true,
            audibleCueFeedback = prefs[AUDIBLE_CUE_FEEDBACK] ?: false,
            screenOffArmed = prefs[SCREEN_OFF_ARMED] ?: false,
        ).sanitized()
    }

    suspend fun setMediaVolumePercent(value: Int) {
        context.dataStore.edit { it[MEDIA_VOLUME_PERCENT] = value.coerceIn(0, 100) }
    }

    suspend fun setWhistleGainPercent(value: Int) {
        context.dataStore.edit { it[WHISTLE_GAIN_PERCENT] = value.coerceIn(0, 100) }
    }

    suspend fun setVibrateFeedback(enabled: Boolean) {
        context.dataStore.edit { it[VIBRATE_FEEDBACK] = enabled }
    }

    suspend fun setAudibleCueFeedback(enabled: Boolean) {
        context.dataStore.edit { it[AUDIBLE_CUE_FEEDBACK] = enabled }
    }

    suspend fun setScreenOffArmed(enabled: Boolean) {
        context.dataStore.edit { it[SCREEN_OFF_ARMED] = enabled }
    }

    companion object {
        private val MEDIA_VOLUME_PERCENT = intPreferencesKey("media_volume_percent")
        private val WHISTLE_GAIN_PERCENT = intPreferencesKey("whistle_gain_percent")
        private val VIBRATE_FEEDBACK = booleanPreferencesKey("vibrate_feedback")
        private val AUDIBLE_CUE_FEEDBACK = booleanPreferencesKey("audible_cue_feedback")
        private val SCREEN_OFF_ARMED = booleanPreferencesKey("screen_off_armed")
    }
}

