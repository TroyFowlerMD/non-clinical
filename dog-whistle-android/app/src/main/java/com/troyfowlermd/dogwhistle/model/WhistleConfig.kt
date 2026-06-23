package com.troyfowlermd.dogwhistle.model

data class WhistleConfig(
    val mediaVolumePercent: Int = 100,
    val whistleGainPercent: Int = 85,
    val vibrateFeedback: Boolean = true,
    val audibleCueFeedback: Boolean = false,
    val screenOffArmed: Boolean = false,
) {
    fun sanitized(): WhistleConfig = copy(
        mediaVolumePercent = mediaVolumePercent.coerceIn(0, 100),
        whistleGainPercent = whistleGainPercent.coerceIn(0, 100),
    )
}

