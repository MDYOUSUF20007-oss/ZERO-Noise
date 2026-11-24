package org.zero.detox.ui

import android.content.Intent
import android.os.Bundle
import android.os.SystemClock
import androidx.appcompat.app.AppCompatActivity
import org.zero.detox.MainActivity

/**
 * TheVoidActivity:
 * Trampoline activity for backward compatibility with Android intents & services.
 * Forwards immediately to MainActivity (which renders the unified, themed React TheVoidView)
 * so that an old native screen never overlaps the modern, fully customized focus view.
 *
 * Holds shared cross-service session state for Void screen apps, continuous usage timers,
 * 5-minute recurring reminders, and 10-minute snooze.
 */
class TheVoidActivity : AppCompatActivity() {

    companion object {
        @JvmField
        @Volatile
        var isInForeground: Boolean = false

        @JvmField
        @Volatile
        var dialerGraceUntilElapsed: Long = 0L

        @JvmField
        @Volatile
        var bagLaunchGraceUntilElapsed: Long = 0L

        @JvmField
        @Volatile
        var pomodoroBreakUntilElapsed: Long = 0L

        @JvmField
        @Volatile
        var activeBagPackage: String? = null

        @JvmField
        @Volatile
        var appSessionStartElapsedMs: Long = 0L

        @JvmField
        @Volatile
        var snoozeUntilElapsedMs: Long = 0L

        @JvmField
        @Volatile
        var lastOverlayMilestone: Int = 0

        @JvmField
        @Volatile
        var lastNotificationMilestone: Int = 0

        @JvmStatic
        @Synchronized
        fun startBagSession(packageName: String) {
            activeBagPackage = packageName
            val nowElapsed = SystemClock.elapsedRealtime()
            appSessionStartElapsedMs = nowElapsed
            snoozeUntilElapsedMs = 0L
            lastOverlayMilestone = 0
            lastNotificationMilestone = 0
            bagLaunchGraceUntilElapsed = nowElapsed + 30_000L
        }

        @JvmStatic
        @Synchronized
        fun resetBagSession() {
            activeBagPackage = null
            appSessionStartElapsedMs = 0L
            snoozeUntilElapsedMs = 0L
            lastOverlayMilestone = 0
            lastNotificationMilestone = 0
        }

        @JvmStatic
        @Synchronized
        fun snoozeSession(minutes: Int = 10) {
            val nowElapsed = SystemClock.elapsedRealtime()
            snoozeUntilElapsedMs = nowElapsed + (minutes * 60 * 1000L)
        }

        @JvmStatic
        @Synchronized
        fun getDueOverlayMilestone(nowElapsed: Long): Int? {
            if (activeBagPackage == null || appSessionStartElapsedMs <= 0L) return null
            if (nowElapsed < snoozeUntilElapsedMs) return null

            val elapsedMinutes = ((nowElapsed - appSessionStartElapsedMs) / 60_000L).toInt()
            if (elapsedMinutes >= 5) {
                val milestone = (elapsedMinutes / 5) * 5
                if (milestone > lastOverlayMilestone) {
                    lastOverlayMilestone = milestone
                    return milestone
                }
            }
            return null
        }

        @JvmStatic
        @Synchronized
        fun getDueNotificationMilestone(nowElapsed: Long): Int? {
            if (activeBagPackage == null || appSessionStartElapsedMs <= 0L) return null
            if (nowElapsed < snoozeUntilElapsedMs) return null

            val elapsedMinutes = ((nowElapsed - appSessionStartElapsedMs) / 60_000L).toInt()
            if (elapsedMinutes >= 5) {
                val milestone = (elapsedMinutes / 5) * 5
                if (milestone > lastNotificationMilestone) {
                    lastNotificationMilestone = milestone
                    return milestone
                }
            }
            return null
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val mainIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
        }
        startActivity(mainIntent)
        finish()
    }

    override fun onResume() {
        super.onResume()
        finish()
    }
}
