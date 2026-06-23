package com.troyfowlermd.dogwhistle.model

data class WhistleRuntimeState(
    val isActive: Boolean = false,
    val lastSource: String = "Idle",
    val lastError: String? = null,
)

