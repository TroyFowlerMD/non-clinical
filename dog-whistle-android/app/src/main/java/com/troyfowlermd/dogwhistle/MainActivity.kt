package com.troyfowlermd.dogwhistle

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.troyfowlermd.dogwhistle.ui.theme.DogWhistleTheme

class MainActivity : ComponentActivity() {
    private val viewModel by viewModels<DogWhistleViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            DogWhistleTheme {
                val uiState by viewModel.uiState.collectAsStateWithLifecycle()
                val notificationPermissionLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission(),
                    onResult = {},
                )

                LaunchedEffect(Unit) {
                    if (
                        Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                        ContextCompat.checkSelfPermission(
                            this@MainActivity,
                            Manifest.permission.POST_NOTIFICATIONS,
                        ) != android.content.pm.PackageManager.PERMISSION_GRANTED
                    ) {
                        notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                    }
                }

                Surface {
                    DogWhistleScreen(
                        state = uiState,
                        onMediaVolumeChanged = viewModel::setMediaVolumePercent,
                        onWhistleGainChanged = viewModel::setWhistleGainPercent,
                        onVibrateFeedbackChanged = viewModel::setVibrateFeedback,
                        onAudibleCueChanged = viewModel::setAudibleCueFeedback,
                        onScreenOffArmedChanged = viewModel::setScreenOffArmed,
                        onPressStart = viewModel::startWhistleFromScreen,
                        onPressStop = viewModel::stopWhistleFromScreen,
                        onOpenAccessibilitySettings = {
                            startActivity(
                                Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                },
                            )
                        },
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.refreshAccessibilityState()
    }
}

@Composable
private fun DogWhistleScreen(
    state: DogWhistleUiState,
    onMediaVolumeChanged: (Int) -> Unit,
    onWhistleGainChanged: (Int) -> Unit,
    onVibrateFeedbackChanged: (Boolean) -> Unit,
    onAudibleCueChanged: (Boolean) -> Unit,
    onScreenOffArmedChanged: (Boolean) -> Unit,
    onPressStart: () -> Unit,
    onPressStop: () -> Unit,
    onOpenAccessibilitySettings: () -> Unit,
) {
    val scrollState = rememberScrollState()
    val buttonHeight = (LocalConfiguration.current.screenHeightDp.dp / 3).coerceAtLeast(180.dp)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .verticalScroll(scrollState),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            text = "Dog whistle",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = if (state.runtime.isActive) {
                "Whistle active from ${state.runtime.lastSource.replace('_', ' ').lowercase()}."
            } else {
                "Press and hold to whistle. Release to stop."
            },
            style = MaterialTheme.typography.bodyLarge,
        )

        Button(
            onClick = {},
            modifier = Modifier
                .testTag("whistle_button")
                .fillMaxWidth()
                .height(buttonHeight)
                .pointerInput(Unit) {
                    detectTapGestures(
                        onPress = {
                            onPressStart()
                            tryAwaitRelease()
                            onPressStop()
                        },
                    )
                },
        ) {
            Text(
                text = if (state.runtime.isActive) "Release to stop" else "Press and hold whistle",
                style = MaterialTheme.typography.headlineSmall,
            )
        }

        ControlCard(
            title = "Feedback while the whistle is active",
        ) {
            SettingRow(
                label = "Vibrate feedback",
                checked = state.config.vibrateFeedback,
                onCheckedChange = onVibrateFeedbackChanged,
            )
            SettingRow(
                label = "Audible cue feedback",
                checked = state.config.audibleCueFeedback,
                onCheckedChange = onAudibleCueChanged,
            )
        }

        ControlCard(title = "Volume and gain") {
            SliderRow(
                label = "Media volume",
                value = state.config.mediaVolumePercent,
                onValueChange = onMediaVolumeChanged,
            )
            SliderRow(
                label = "Whistle gain",
                value = state.config.whistleGainPercent,
                onValueChange = onWhistleGainChanged,
            )
            Text(
                text = "The app uses the phone's normal media max. It does not override the hardware maximum on stock Android.",
                style = MaterialTheme.typography.bodySmall,
            )
        }

        ControlCard(title = "Screen-off controls") {
            SettingRow(
                label = "Arm screen-off buttons",
                checked = state.config.screenOffArmed,
                onCheckedChange = onScreenOffArmedChanged,
            )
            Text(
                text = if (state.accessibilityEnabled) {
                    "Accessibility service is enabled. Volume-button hold mode is available, but behavior can still vary by phone."
                } else {
                    "Accessibility service is not enabled yet. Notification controls will still work with the screen off."
                },
                style = MaterialTheme.typography.bodyMedium,
            )
            Button(onClick = onOpenAccessibilitySettings) {
                Text("Open Accessibility Settings")
            }
        }
    }
}

@Composable
private fun ControlCard(
    title: String,
    content: @Composable () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            content()
        }
    }
}

@Composable
private fun SettingRow(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyLarge)
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
        )
    }
}

@Composable
private fun SliderRow(
    label: String,
    value: Int,
    onValueChange: (Int) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            text = "$label: $value%",
            style = MaterialTheme.typography.bodyLarge,
        )
        Slider(
            value = value.toFloat(),
            onValueChange = { onValueChange(it.toInt()) },
            valueRange = 0f..100f,
        )
    }
}
