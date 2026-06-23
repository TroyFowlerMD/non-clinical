package com.troyfowlermd.dogwhistle

import android.app.Application
import android.content.ComponentName
import android.provider.Settings
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.troyfowlermd.dogwhistle.data.WhistlePreferencesRepository
import com.troyfowlermd.dogwhistle.model.WhistleConfig
import com.troyfowlermd.dogwhistle.model.WhistleRuntimeState
import com.troyfowlermd.dogwhistle.service.ActivationSource
import com.troyfowlermd.dogwhistle.service.WhistleServiceBridge
import com.troyfowlermd.dogwhistle.service.WhistleStatusBus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class DogWhistleUiState(
    val config: WhistleConfig = WhistleConfig(),
    val runtime: WhistleRuntimeState = WhistleRuntimeState(),
    val accessibilityEnabled: Boolean = false,
)

class DogWhistleViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application
    private val repository: WhistlePreferencesRepository =
        (application as DogWhistleApplication).repository
    private val accessibilityEnabled = MutableStateFlow(isAccessibilityEnabled())

    val uiState: StateFlow<DogWhistleUiState> = combine(
        repository.config,
        WhistleStatusBus.state,
        accessibilityEnabled,
    ) { config, runtime, isEnabled ->
        DogWhistleUiState(
            config = config,
            runtime = runtime,
            accessibilityEnabled = isEnabled,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = DogWhistleUiState(),
    )

    fun refreshAccessibilityState() {
        accessibilityEnabled.value = isAccessibilityEnabled()
    }

    fun setMediaVolumePercent(value: Int) {
        viewModelScope.launch { repository.setMediaVolumePercent(value) }
    }

    fun setWhistleGainPercent(value: Int) {
        viewModelScope.launch { repository.setWhistleGainPercent(value) }
    }

    fun setVibrateFeedback(enabled: Boolean) {
        viewModelScope.launch { repository.setVibrateFeedback(enabled) }
    }

    fun setAudibleCueFeedback(enabled: Boolean) {
        viewModelScope.launch { repository.setAudibleCueFeedback(enabled) }
    }

    fun setScreenOffArmed(enabled: Boolean) {
        viewModelScope.launch {
            repository.setScreenOffArmed(enabled)
        }
        if (enabled) {
            WhistleServiceBridge.prepare(app)
        } else {
            WhistleServiceBridge.stopIfIdle(app)
        }
    }

    fun startWhistleFromScreen() {
        WhistleServiceBridge.startWhistle(app, ActivationSource.SCREEN_BUTTON)
    }

    fun stopWhistleFromScreen() {
        WhistleServiceBridge.stopWhistle(app, ActivationSource.SCREEN_BUTTON)
    }

    private fun isAccessibilityEnabled(): Boolean {
        val enabledServices = Settings.Secure.getString(
            app.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
        ) ?: return false
        val expectedComponent = ComponentName(app, com.troyfowlermd.dogwhistle.service.WhistleAccessibilityService::class.java)
            .flattenToString()
        return enabledServices.split(':').any { it.equals(expectedComponent, ignoreCase = true) }
    }
}

