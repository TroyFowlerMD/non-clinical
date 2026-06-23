package com.troyfowlermd.dogwhistle.service

import com.troyfowlermd.dogwhistle.model.WhistleRuntimeState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object WhistleStatusBus {
    private val mutableState = MutableStateFlow(WhistleRuntimeState())
    val state: StateFlow<WhistleRuntimeState> = mutableState.asStateFlow()

    fun update(newState: WhistleRuntimeState) {
        mutableState.value = newState
    }
}

