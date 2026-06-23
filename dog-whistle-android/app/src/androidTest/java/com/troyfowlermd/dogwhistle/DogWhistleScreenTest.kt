package com.troyfowlermd.dogwhistle

import androidx.compose.ui.test.assertExists
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import org.junit.Rule
import org.junit.Test

class DogWhistleScreenTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun whistleButtonIsRendered() {
        composeRule.onNodeWithTag("whistle_button").assertExists()
    }
}
