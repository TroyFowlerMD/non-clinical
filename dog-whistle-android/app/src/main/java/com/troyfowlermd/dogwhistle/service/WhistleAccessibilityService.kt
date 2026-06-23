package com.troyfowlermd.dogwhistle.service

import android.accessibilityservice.AccessibilityService
import android.view.KeyEvent
import android.view.accessibility.AccessibilityEvent
import com.troyfowlermd.dogwhistle.DogWhistleApplication
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class WhistleAccessibilityService : AccessibilityService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private var screenOffArmed = false

    override fun onServiceConnected() {
        super.onServiceConnected()
        val repository = (application as DogWhistleApplication).repository
        scope.launch {
            repository.config.collectLatest { screenOffArmed = it.screenOffArmed }
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) = Unit

    override fun onInterrupt() = Unit

    override fun onKeyEvent(event: KeyEvent): Boolean {
        if (!screenOffArmed) {
            return super.onKeyEvent(event)
        }

        val supportedKey = event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN ||
            event.keyCode == KeyEvent.KEYCODE_VOLUME_UP
        if (!supportedKey) {
            return super.onKeyEvent(event)
        }

        when (event.action) {
            KeyEvent.ACTION_DOWN -> {
                WhistleServiceBridge.startWhistle(
                    this,
                    ActivationSource.VOLUME_KEY_ACCESSIBILITY,
                )
                return true
            }

            KeyEvent.ACTION_UP -> {
                WhistleServiceBridge.stopWhistle(
                    this,
                    ActivationSource.VOLUME_KEY_ACCESSIBILITY,
                )
                return true
            }
        }

        return super.onKeyEvent(event)
    }

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }
}

