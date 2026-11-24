package org.zero.detox.service

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import android.util.Log
import org.zero.detox.MainActivity
import org.zero.detox.core.LockEngine
import org.zero.detox.data.ParachuteStore

/**
 * ZeroTileService:
 * Android Quick Settings (QS) Tile that allows users to instantly ignite a focus lock
 * session directly from their notification shade with one tap, without opening dials.
 * When locked, displays live remaining time and returns the user to The Void.
 */
class ZeroTileService : TileService() {

    companion object {
        private const val TAG = "ZeroTileService"
        const val PREFS_QS_TILE = "zero_qs_tile_prefs"
        const val KEY_DURATION_SECONDS = "qs_duration_seconds"
        const val KEY_SESSION_TAG = "qs_session_tag"
        const val KEY_BAG_ID = "qs_bag_id"
        const val KEY_BAG_NAME = "qs_bag_name"

        const val DEFAULT_DURATION_SECONDS = 25 * 60L // 25 minutes
        const val DEFAULT_TAG = "Deep Work"
        const val DEFAULT_BAG_ID = "work"
        const val DEFAULT_BAG_NAME = "Work"

        fun getPrefs(context: Context): SharedPreferences {
            return context.getSharedPreferences(PREFS_QS_TILE, Context.MODE_PRIVATE)
        }

        fun saveConfig(
            context: Context,
            durationSeconds: Long,
            tag: String,
            bagId: String,
            bagName: String
        ) {
            getPrefs(context).edit()
                .putLong(KEY_DURATION_SECONDS, maxOf(300L, durationSeconds))
                .putString(KEY_SESSION_TAG, tag)
                .putString(KEY_BAG_ID, bagId)
                .putString(KEY_BAG_NAME, bagName)
                .apply()
            requestTileUpdate(context)
        }

        fun requestTileUpdate(context: Context) {
            try {
                requestListeningState(
                    context,
                    ComponentName(context, ZeroTileService::class.java)
                )
            } catch (t: Throwable) {
                Log.w(TAG, "Failed to request tile listening state: ${t.message}")
            }
        }
    }

    private var lockEngine: LockEngine? = null

    private fun getOrCreateLockEngine(): LockEngine {
        val existing = lockEngine
        if (existing != null) return existing
        val parachuteStore = ParachuteStore(applicationContext)
        val engine = LockEngine(applicationContext, parachuteStore)
        lockEngine = engine
        return engine
    }

    override fun onStartListening() {
        super.onStartListening()
        updateTileState()
    }

    override fun onClick() {
        super.onClick()
        val engine = getOrCreateLockEngine()
        val timing = engine.getCurrentTiming()

        if (timing.isLocked && !timing.isExpired) {
            // Already locked: bring The Void / MainActivity to foreground
            launchVoidActivity()
        } else {
            // Engage lock directly from Quick Settings with configured duration and bag
            val prefs = getPrefs(applicationContext)
            val duration = prefs.getLong(KEY_DURATION_SECONDS, DEFAULT_DURATION_SECONDS)
            val tag = prefs.getString(KEY_SESSION_TAG, DEFAULT_TAG) ?: DEFAULT_TAG

            engine.igniteSession(duration, tag, false)
            updateTileState()
            launchVoidActivity()
        }
    }

    private fun updateTileState() {
        val tile = qsTile ?: return
        val engine = getOrCreateLockEngine()
        val timing = engine.getCurrentTiming()

        if (timing.isLocked && !timing.isExpired) {
            tile.state = Tile.STATE_ACTIVE
            val remainingMins = maxOf(1L, (timing.remainingSeconds + 59L) / 60L)
            tile.label = "ZERO: ${remainingMins}m"

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                tile.subtitle = timing.sessionTag
            }
        } else {
            tile.state = Tile.STATE_INACTIVE
            tile.label = "ZERO: Engage"

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val prefs = getPrefs(applicationContext)
                val duration = prefs.getLong(KEY_DURATION_SECONDS, DEFAULT_DURATION_SECONDS)
                val durationMins = duration / 60L
                val tag = prefs.getString(KEY_SESSION_TAG, DEFAULT_TAG) ?: DEFAULT_TAG
                tile.subtitle = "${durationMins}m • $tag"
            }
        }

        try {
            tile.updateTile()
        } catch (t: Throwable) {
            Log.w(TAG, "Error updating QS tile: ${t.message}")
        }
    }

    private fun launchVoidActivity() {
        try {
            val intent = Intent(applicationContext, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
            }
            if (Build.VERSION.SDK_INT >= 34) {
                // Android 14+ pending intent requirement for TileService
                val pendingIntent = android.app.PendingIntent.getActivity(
                    applicationContext,
                    0,
                    intent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )
                startActivityAndCollapse(pendingIntent)
            } else {
                @Suppress("DEPRECATION")
                startActivityAndCollapse(intent)
            }
        } catch (t: Throwable) {
            Log.e(TAG, "Failed to launch MainActivity from QS Tile", t)
        }
    }
}
