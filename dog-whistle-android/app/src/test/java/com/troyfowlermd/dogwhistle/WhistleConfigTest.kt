package com.troyfowlermd.dogwhistle

import com.troyfowlermd.dogwhistle.model.WhistleConfig
import org.junit.Assert.assertEquals
import org.junit.Test

class WhistleConfigTest {
    @Test
    fun sanitized_clampsPercentagesIntoSupportedRange() {
        val config = WhistleConfig(
            mediaVolumePercent = 160,
            whistleGainPercent = -12,
        ).sanitized()

        assertEquals(100, config.mediaVolumePercent)
        assertEquals(0, config.whistleGainPercent)
    }
}

