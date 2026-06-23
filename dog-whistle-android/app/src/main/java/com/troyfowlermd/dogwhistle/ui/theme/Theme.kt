package com.troyfowlermd.dogwhistle.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Color(0xFF204A36),
    secondary = Color(0xFF7E9B59),
    tertiary = Color(0xFFE7B75D),
    background = Color(0xFFEEF4EA),
    surface = Color(0xFFFFFFFF),
    onPrimary = Color(0xFFFFFFFF),
    onSecondary = Color(0xFF13261C),
    onTertiary = Color(0xFF13261C),
    onBackground = Color(0xFF13261C),
    onSurface = Color(0xFF13261C),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFFBFD6A9),
    secondary = Color(0xFFD9E8C6),
    tertiary = Color(0xFFFFD88D),
    background = Color(0xFF0E1712),
    surface = Color(0xFF18221C),
    onPrimary = Color(0xFF13261C),
    onSecondary = Color(0xFF13261C),
    onTertiary = Color(0xFF13261C),
    onBackground = Color(0xFFEFF7EA),
    onSurface = Color(0xFFEFF7EA),
)

@Composable
fun DogWhistleTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (androidx.compose.foundation.isSystemInDarkTheme()) DarkColors else LightColors,
        content = content,
    )
}

