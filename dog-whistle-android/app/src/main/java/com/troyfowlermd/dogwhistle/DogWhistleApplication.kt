package com.troyfowlermd.dogwhistle

import android.app.Application
import com.troyfowlermd.dogwhistle.data.WhistlePreferencesRepository

class DogWhistleApplication : Application() {
    val repository: WhistlePreferencesRepository by lazy {
        WhistlePreferencesRepository(this)
    }
}

