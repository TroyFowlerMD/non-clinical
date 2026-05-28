package com.troyfowlermd.psychscheduler

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

class PsychSchedulerWidget : AppWidgetProvider() {

    companion object {
        const val PREFS_NAME = "psych_scheduler_widget"
        const val PREF_FORCE_REFRESH = "force_refresh_requested"

        const val PREF_WIDGET_SNAPSHOT_JSON = "widget_snapshot_json"

        private const val ACTION_UPDATE_ALL = "com.troyfowlermd.psychscheduler.widget.UPDATE_ALL"
        private const val ACTION_SWITCH_VIEW = "com.troyfowlermd.psychscheduler.widget.SWITCH_VIEW"
        private const val ACTION_REFRESH = "com.troyfowlermd.psychscheduler.widget.REFRESH"

        private const val EXTRA_VIEW = "extra_view"

        private const val KEY_OVERRIDE_VIEW_PREFIX = "widget_override_view_"
        private const val KEY_LAST_SNAPSHOT_PREFIX = "widget_last_snapshot_"

        private const val CACHE_SCHEDULE = "psychScheduleCache"
        private const val CACHE_BACKUP = "psychScheduleCache_backup"
        private const val CACHE_CALENDAR = "psychScheduleCache_calendar"
        private const val TIME_SCHEDULE = "psychScheduleCacheTime"
        private const val TIME_BACKUP = "psychScheduleCacheTime_backup"
        private const val TIME_CALENDAR = "psychScheduleCacheTime_calendar"

        fun requestWidgetUpdate(context: Context) {
            val intent = Intent(context, PsychSchedulerWidget::class.java).apply {
                action = ACTION_UPDATE_ALL
            }
            context.sendBroadcast(intent)
        }
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        appWidgetIds.forEach { updateWidget(context, appWidgetManager, it) }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle
    ) {
        updateWidget(context, appWidgetManager, appWidgetId)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        val manager = AppWidgetManager.getInstance(context)
        when (intent.action) {
            ACTION_UPDATE_ALL -> {
                val ids = manager.getAppWidgetIds(ComponentName(context, PsychSchedulerWidget::class.java))
                ids.forEach { updateWidget(context, manager, it) }
            }
            ACTION_SWITCH_VIEW -> {
                val widgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
                val viewName = intent.getStringExtra(EXTRA_VIEW)
                if (widgetId != AppWidgetManager.INVALID_APPWIDGET_ID && viewName != null) {
                    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    prefs.edit().putString(KEY_OVERRIDE_VIEW_PREFIX + widgetId, viewName).apply()
                    updateWidget(context, manager, widgetId)
                }
            }
            ACTION_REFRESH -> {
                val widgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
                setForceRefresh(context)
                launchApp(context, refreshRequested = true)
                if (widgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                    updateWidget(context, manager, widgetId)
                }
            }
        }
    }

    private fun setForceRefresh(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putBoolean(PREF_FORCE_REFRESH, true).apply()
    }

    private fun updateWidget(context: Context, manager: AppWidgetManager, widgetId: Int) {
        val options = manager.getAppWidgetOptions(widgetId)
        val sizeClass = resolveSizeClass(options)
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        val snapshot = loadWidgetSnapshot(context)
        val selectedView = resolveWidgetView(prefs, widgetId, snapshot, sizeClass)

        val viewData = snapshot?.views?.get(selectedView)
        val baseLines = viewData?.lines ?: loadLegacyLines(context, selectedView)
        val lines = linesForSize(baseLines, sizeClass)

        val updatedAt = snapshot?.updatedAtEpochMillis ?: loadUpdatedAtMillisLegacy(context, selectedView)
        val stale = snapshot?.isStale ?: (updatedAt != null && (System.currentTimeMillis() - updatedAt) > 24L * 60L * 60L * 1000L)

        val rv = RemoteViews(context.packageName, R.layout.widget_schedule)

        val textColor = if (isNightMode(context)) Color.parseColor("#F3F4F6") else Color.parseColor("#111827")
        val mutedColor = if (isNightMode(context)) Color.parseColor("#9CA3AF") else Color.parseColor("#4B5563")
        val staleColor = Color.parseColor("#B91C1C")
        val activeChip = if (isNightMode(context)) Color.parseColor("#1D4ED8") else Color.parseColor("#2563EB")
        val inactiveChip = if (isNightMode(context)) Color.parseColor("#374151") else Color.parseColor("#E5E7EB")

        rv.setTextViewText(R.id.widget_title, viewData?.title?.takeIf { it.isNotBlank() } ?: titleForView(selectedView))
        rv.setTextColor(R.id.widget_title, textColor)
        rv.setTextColor(R.id.widget_context, mutedColor)
        rv.setTextColor(R.id.widget_last_updated, mutedColor)
        rv.setTextColor(R.id.widget_stale, staleColor)

        val contextText = viewData?.context.orEmpty()
        if (contextText.isNotBlank()) {
            rv.setViewVisibility(R.id.widget_context, View.VISIBLE)
            rv.setTextViewText(R.id.widget_context, contextText)
        } else {
            rv.setViewVisibility(R.id.widget_context, View.GONE)
        }

        bindButtonStyle(rv, R.id.widget_button_schedule, selectedView == WidgetView.SCHEDULE, activeChip, inactiveChip, textColor)
        bindButtonStyle(rv, R.id.widget_button_backup, selectedView == WidgetView.BACKUP, activeChip, inactiveChip, textColor)
        bindButtonStyle(rv, R.id.widget_button_calendar, selectedView == WidgetView.CALENDAR, activeChip, inactiveChip, textColor)

        val showSwitcher = sizeClass != WidgetSize.SMALL
        rv.setViewVisibility(R.id.widget_switcher_row, if (showSwitcher) View.VISIBLE else View.GONE)

        bindLines(rv, lines, textColor)
        rv.setTextViewText(R.id.widget_last_updated, "Last updated: ${formatUpdatedAt(updatedAt)}")
        rv.setViewVisibility(R.id.widget_stale, if (stale) View.VISIBLE else View.GONE)
        rv.setTextViewText(R.id.widget_stale, "Stale data (>24h)")

        rv.setOnClickPendingIntent(R.id.widget_root, buildLaunchPendingIntent(context, widgetId, refreshRequested = false))
        rv.setOnClickPendingIntent(R.id.widget_refresh, buildRefreshPendingIntent(context, widgetId))
        rv.setOnClickPendingIntent(R.id.widget_button_schedule, buildSwitchPendingIntent(context, widgetId, WidgetView.SCHEDULE))
        rv.setOnClickPendingIntent(R.id.widget_button_backup, buildSwitchPendingIntent(context, widgetId, WidgetView.BACKUP))
        rv.setOnClickPendingIntent(R.id.widget_button_calendar, buildSwitchPendingIntent(context, widgetId, WidgetView.CALENDAR))

        manager.updateAppWidget(widgetId, rv)
    }

    private fun resolveWidgetView(
        prefs: android.content.SharedPreferences,
        widgetId: Int,
        snapshot: WidgetSnapshot?,
        sizeClass: WidgetSize
    ): WidgetView {
        if (sizeClass == WidgetSize.SMALL) return WidgetView.SCHEDULE

        if (snapshot != null) {
            val lastKey = KEY_LAST_SNAPSHOT_PREFIX + widgetId
            val overrideKey = KEY_OVERRIDE_VIEW_PREFIX + widgetId
            val currentVersion = snapshot.updatedAtEpochMillis ?: Long.MIN_VALUE
            val previousVersion = prefs.getLong(lastKey, Long.MIN_VALUE)
            if (currentVersion != previousVersion) {
                prefs.edit().putLong(lastKey, currentVersion).remove(overrideKey).apply()
            }
            val overrideView = WidgetView.fromValue(prefs.getString(overrideKey, null))
            return overrideView ?: snapshot.activeView
        }

        return WidgetView.fromValue(prefs.getString(KEY_OVERRIDE_VIEW_PREFIX + widgetId, WidgetView.SCHEDULE.value))
            ?: WidgetView.SCHEDULE
    }

    private fun bindButtonStyle(
        rv: RemoteViews,
        viewId: Int,
        active: Boolean,
        activeBg: Int,
        inactiveBg: Int,
        textColor: Int
    ) {
        rv.setInt(viewId, "setBackgroundColor", if (active) activeBg else inactiveBg)
        rv.setTextColor(viewId, textColor)
    }

    private fun bindLines(rv: RemoteViews, lines: List<String>, textColor: Int) {
        val lineIds = listOf(
            R.id.widget_line_1,
            R.id.widget_line_2,
            R.id.widget_line_3,
            R.id.widget_line_4,
            R.id.widget_line_5,
            R.id.widget_line_6,
            R.id.widget_line_7,
            R.id.widget_line_8
        )

        lineIds.forEachIndexed { index, id ->
            if (index < lines.size) {
                rv.setViewVisibility(id, View.VISIBLE)
                rv.setTextColor(id, textColor)
                rv.setTextViewText(id, lines[index])
            } else {
                rv.setViewVisibility(id, View.GONE)
            }
        }
    }

    private fun buildSwitchPendingIntent(context: Context, widgetId: Int, view: WidgetView): PendingIntent {
        val intent = Intent(context, PsychSchedulerWidget::class.java).apply {
            action = ACTION_SWITCH_VIEW
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
            putExtra(EXTRA_VIEW, view.value)
        }
        return PendingIntent.getBroadcast(
            context,
            (widgetId * 10) + view.ordinal,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun buildRefreshPendingIntent(context: Context, widgetId: Int): PendingIntent {
        val intent = Intent(context, PsychSchedulerWidget::class.java).apply {
            action = ACTION_REFRESH
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
        }
        return PendingIntent.getBroadcast(
            context,
            (widgetId * 1000) + 9,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun buildLaunchPendingIntent(context: Context, widgetId: Int, refreshRequested: Boolean): PendingIntent {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            ?.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            ?.putExtra("widget_force_refresh", refreshRequested)
            ?: Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("widget_force_refresh", refreshRequested)
            }

        return PendingIntent.getActivity(
            context,
            (widgetId * 1000) + if (refreshRequested) 1 else 0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun launchApp(context: Context, refreshRequested: Boolean) {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            ?.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            ?.putExtra("widget_force_refresh", refreshRequested)
            ?: Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("widget_force_refresh", refreshRequested)
            }
        context.startActivity(launchIntent)
    }

    private fun titleForView(view: WidgetView): String {
        return when (view) {
            WidgetView.SCHEDULE -> "My Schedule"
            WidgetView.BACKUP -> "Backup Call"
            WidgetView.CALENDAR -> "Calendar"
        }
    }

    private fun resolveSizeClass(options: Bundle): WidgetSize {
        val minWidthDp = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
        val minHeightDp = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT)

        return when {
            minWidthDp >= 360 && minHeightDp >= 300 -> WidgetSize.FULL
            minWidthDp >= 250 && minHeightDp >= 170 -> WidgetSize.LARGE
            minWidthDp >= 150 && minHeightDp >= 110 -> WidgetSize.MEDIUM
            else -> WidgetSize.SMALL
        }
    }

    private fun linesForSize(lines: List<String>, size: WidgetSize): List<String> {
        val safeLines = if (lines.isEmpty()) listOf("No widget snapshot data yet") else lines
        return when (size) {
            WidgetSize.SMALL -> safeLines.take(1)
            WidgetSize.MEDIUM -> safeLines.take(2)
            WidgetSize.LARGE -> safeLines.take(7)
            WidgetSize.FULL -> safeLines.take(8)
        }
    }

    private fun loadWidgetSnapshot(context: Context): WidgetSnapshot? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val raw = prefs.getString(PREF_WIDGET_SNAPSHOT_JSON, null) ?: return null
        return try {
            val root = JSONObject(raw)
            val activeView = WidgetView.fromValue(normalizeJsonString(root.optString("activeView", WidgetView.SCHEDULE.value)))
                ?: WidgetView.SCHEDULE
            val selectedProvider = normalizeJsonString(root.optString("selectedProvider", "")) ?: ""
            val updatedAtEpoch = parseIsoMillis(normalizeJsonString(root.optString("updatedAt", null)))
            val staleObj = root.optJSONObject("stale")
            val isStale = staleObj?.optBoolean("isStale", false) ?: false

            val views = mutableMapOf<WidgetView, SnapshotView>()
            val viewsObj = root.optJSONObject("views")
            WidgetView.entries.forEach { view ->
                val node = viewsObj?.optJSONObject(view.value)
                val title = normalizeJsonString(node?.optString("title", "")) ?: ""
                val contextText = normalizeJsonString(node?.optString("context", "")) ?: ""
                val lines = mutableListOf<String>()
                val linesArr = node?.optJSONArray("lines")
                if (linesArr != null) {
                    for (i in 0 until linesArr.length()) {
                        val line = normalizeJsonString(linesArr.optString(i, ""))
                        if (!line.isNullOrBlank()) lines.add(line)
                    }
                }
                views[view] = SnapshotView(title = title, context = contextText, lines = lines)
            }

            WidgetSnapshot(
                updatedAtEpochMillis = updatedAtEpoch,
                activeView = activeView,
                selectedProvider = selectedProvider,
                isStale = isStale,
                views = views
            )
        } catch (_: Exception) {
            null
        }
    }

    private fun normalizeJsonString(value: String?): String? {
        if (value == null) return null
        val trimmed = value.trim()
        return if (trimmed.equals("null", ignoreCase = true)) null else trimmed
    }

    private fun parseIsoMillis(value: String?): Long? {
        if (value.isNullOrBlank()) return null
        return try {
            Instant.parse(value).toEpochMilli()
        } catch (_: Exception) {
            null
        }
    }

    private fun loadLegacyLines(context: Context, view: WidgetView): List<String> {
        val rows = loadLegacyRowsForView(context, view)
        if (rows.isEmpty()) return listOf("No cached schedule data yet")
        val today = LocalDate.now()
        val todayRows = rows.filter { it.date != null && !it.date.isBefore(today) }
        val source = if (todayRows.isNotEmpty()) todayRows else rows
        return source.take(8).map { formatLegacyLine(it, view) }
    }

    private fun formatLegacyLine(row: WidgetRow, view: WidgetView): String {
        val dateLabel = row.dateLabel.ifBlank { "Unknown date" }
        return when (view) {
            WidgetView.SCHEDULE -> "$dateLabel - On-call: ${row.onCall.ifBlank { "-" }}"
            WidgetView.BACKUP -> "$dateLabel - Backup: ${row.backup.ifBlank { "-" }}"
            WidgetView.CALENDAR -> "$dateLabel - Call: ${row.onCall.ifBlank { "-" }} | Backup: ${row.backup.ifBlank { "-" }}"
        }
    }

    private fun loadLegacyRowsForView(context: Context, view: WidgetView): List<WidgetRow> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val cache = prefs.getString(cacheKeyForView(view), null) ?: return emptyList()
        return parseRowsFromTsv(cache)
    }

    private fun loadUpdatedAtMillisLegacy(context: Context, view: WidgetView): Long? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val raw = prefs.getString(timeKeyForView(view), null) ?: return null
        return parseIsoMillis(raw)
    }

    private fun cacheKeyForView(view: WidgetView): String {
        return when (view) {
            WidgetView.SCHEDULE -> CACHE_SCHEDULE
            WidgetView.BACKUP -> CACHE_BACKUP
            WidgetView.CALENDAR -> CACHE_CALENDAR
        }
    }

    private fun timeKeyForView(view: WidgetView): String {
        return when (view) {
            WidgetView.SCHEDULE -> TIME_SCHEDULE
            WidgetView.BACKUP -> TIME_BACKUP
            WidgetView.CALENDAR -> TIME_CALENDAR
        }
    }

    private fun parseRowsFromTsv(tsv: String): List<WidgetRow> {
        val rows = parseTsv(tsv)
        if (rows.size < 2) return emptyList()

        val headers = rows.first().map { it.trim() }
        val dateIdx = headers.indexOfFirst {
            it.equals("Day/Date", ignoreCase = true) ||
                it.equals("Date", ignoreCase = true) ||
                (it.contains("day", ignoreCase = true) && it.contains("date", ignoreCase = true))
        }
        val overnightIdx = headers.indexOfFirst { it.contains("overnight", ignoreCase = true) }
        val backupIdx = headers.indexOfFirst { it.contains("backup", ignoreCase = true) }

        if (dateIdx < 0) return emptyList()

        return rows.drop(1).mapNotNull { cells ->
            val dateLabel = cells.getOrNull(dateIdx)?.trim().orEmpty()
            if (dateLabel.isBlank()) return@mapNotNull null
            WidgetRow(
                dateLabel = dateLabel,
                date = parseDate(dateLabel),
                onCall = cells.getOrNull(overnightIdx)?.trim().orEmpty(),
                backup = cells.getOrNull(backupIdx)?.trim().orEmpty()
            )
        }
    }

    private fun parseTsv(input: String): List<List<String>> {
        val result = mutableListOf<List<String>>()
        val row = mutableListOf<String>()
        val current = StringBuilder()
        var inQuotes = false
        var i = 0

        while (i < input.length) {
            val ch = input[i]
            if (ch == '"') {
                if (inQuotes && i + 1 < input.length && input[i + 1] == '"') {
                    current.append('"')
                    i++
                } else {
                    inQuotes = !inQuotes
                }
            } else if (ch == '\t' && !inQuotes) {
                row.add(current.toString())
                current.setLength(0)
            } else if (ch == '\n' && !inQuotes) {
                row.add(current.toString())
                result.add(row.toList())
                row.clear()
                current.setLength(0)
            } else if (ch != '\r') {
                current.append(ch)
            }
            i++
        }

        if (current.isNotEmpty() || row.isNotEmpty()) {
            row.add(current.toString())
            result.add(row.toList())
        }

        return result
    }

    private fun parseDate(text: String): LocalDate? {
        val iso = Regex("(\\d{4})-(\\d{2})-(\\d{2})").find(text)?.value
        if (iso != null) {
            return runCatching { LocalDate.parse(iso) }.getOrNull()
        }

        val us = Regex("(\\d{1,2})/(\\d{1,2})/(\\d{2,4})").find(text)
        if (us != null) {
            val month = us.groupValues[1].toIntOrNull() ?: return null
            val day = us.groupValues[2].toIntOrNull() ?: return null
            var year = us.groupValues[3].toIntOrNull() ?: return null
            if (year < 100) year += 2000
            return runCatching { LocalDate.of(year, month, day) }.getOrNull()
        }

        return null
    }

    private fun formatUpdatedAt(epochMillis: Long?): String {
        if (epochMillis == null) return "-"
        val formatter = DateTimeFormatter.ofPattern("MMM d, yyyy h:mm a", Locale.US)
        return Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault()).toLocalDateTime().format(formatter)
    }

    private fun isNightMode(context: Context): Boolean {
        val nightModeFlags = context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
        return nightModeFlags == Configuration.UI_MODE_NIGHT_YES
    }
}

private enum class WidgetView(val value: String) {
    SCHEDULE("dashboard"),
    BACKUP("backup"),
    CALENDAR("calendar");

    companion object {
        fun fromValue(value: String?): WidgetView? {
            val v = value?.trim()?.lowercase(Locale.US) ?: return null
            return when (v) {
                "schedule", "dashboard" -> SCHEDULE
                "backup" -> BACKUP
                "calendar" -> CALENDAR
                else -> null
            }
        }
    }
}

private enum class WidgetSize {
    SMALL,
    MEDIUM,
    LARGE,
    FULL
}

private data class WidgetRow(
    val dateLabel: String,
    val date: LocalDate?,
    val onCall: String,
    val backup: String
)

private data class SnapshotView(
    val title: String,
    val context: String,
    val lines: List<String>
)

private data class WidgetSnapshot(
    val updatedAtEpochMillis: Long?,
    val activeView: WidgetView,
    val selectedProvider: String,
    val isStale: Boolean,
    val views: Map<WidgetView, SnapshotView>
)
