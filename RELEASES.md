# Zero-Noise Releases & Changelog

All official release packages, cryptographic hashes, and version changelogs for **Zero-Noise (Zero App)**.

Official binaries are hosted directly on **[GitHub Releases](https://github.com/MDYOUSUF20007-oss/ZERO-Noise/releases)** (only the latest release is retained).

---

## Release Matrix

| Edition | Status | Package Pattern | Android Support | Recommended For |
| :--- | :--- | :--- | :--- | :--- |
| **Standard Edition** | **Latest Stable** | `ZERO-v<version>.apk` | Android 8.0 – 16+ | Direct install without ADB. Usage Access + Display Over Other Apps. |
| **Strict Edition** | **Latest Stable** | `ZERO-requires-adb-v<version>.apk` | Android 8.0 – 16+ | Maximum discipline. Blocks notifications, Quick Settings, Recents & Settings via Accessibility. |

- **Official Release Channel (Latest):** [https://github.com/MDYOUSUF20007-oss/ZERO-Noise/releases/latest](https://github.com/MDYOUSUF20007-oss/ZERO-Noise/releases/latest)
- **Release Certificate SHA-256:** `A1:4A:36:1E:D4:B7:F7:D6:6E:57:69:92:99:9D:02:8A:05:32:65:85:0A:6C:A4:AF:EE:4F:C1:2F:29:48:CE:11` (V1 + V2 + V3 in-place upgrades guaranteed)

---

## Latest Release Highlights

### Typography & UI Polish
- **Bold Self-Hosted Typography:** Bundled `Bricolage Grotesque Variable` (display headings & dial metrics), `Space Grotesk Variable` (primary UI), and `JetBrains Mono Variable` (timers, clocks & badges) directly into the app for crisp offline rendering across Windows, Web, and Android WebView.
- **Refined Controls & Accessibility:** Improved contrast, touch target sizing, keyboard `:focus-visible` indicators, and `prefers-reduced-motion` support across Focus, Insights, ZeroTube, and Settings.

### Core Focus & Discipline Features
1. **3-Theme Visual Engines:** Switch smoothly between **Fluent Glass** (Liquid Acrylic), **Aero Porcelain** (Warm Matte), and **Twilight Dusk** (Night Comfort) with live accent palettes.
2. **Liquid Glass Escape Tickets & 3D Tear-Off:** Physics-driven Emergency Escape Tickets earned every **35 cumulative focus hours**, plus **Burn the Boats** mode (up to 4h) to lock out emergency tickets completely.
3. **ZeroTube Distraction-Free Study Feed:** Whitelisted channels only — zero Shorts, zero recommendations, zero algorithm traps, plus built-in study notes and channel guard.
4. **The Void Lock Screen & Hourly 10m Pomodoro Break:** Retro 5×7 pixelated system clock, live countdown timer, compulsory **Phone Calls (`ALWAYS ON`)**, allowed Bag apps, and 10-minute hourly breaks with Zen bowl chimes.
5. **Phase 2 Unlimited Bags & Granular App Quotas:** Dedicated Occasion Bags (`Work`, `Study`, `Coding`, `Exams`, `Family`, `Night`), per-app daily limits, short-video intercept actions, and Compulsory Study Apps.
6. **Action Reminders & Universal `.zbak` Backups:** Scheduled focus nudges and offline HMAC-SHA256 sealed `.zbak` backups.

---

## Security & Anti-Cheat Hardening
- **Monotonic Hardware Time Watchdog:** Evaluates session duration via `SystemClock.elapsedRealtime()`, defeating system clock rollback exploits.
- **Reboot Protection:** Detects cold boot and immediately re-engages active locks.
- **Anti-Sleep-Farming:** Sleep sessions credit at `0.25x` by default (or `0.0x` in Daytime Only mode) to prevent overnight ticket farming.
- **Anti-Exploit Abort Penalty:** Mid-session ticket escapes forfeit 100% of elapsed progress toward the next ticket.
- **Zero-Telemetry Guarantee:** Zero analytics SDKs, zero ad networks, strict offline operation.

---

## Installation & Upgrade Guide

### Standard Edition (Recommended)
1. Download `ZERO-v<version>.apk` from [Latest GitHub Release](https://github.com/MDYOUSUF20007-oss/ZERO-Noise/releases/latest).
2. Tap the downloaded APK to install.
3. Grant **Usage Access** and **Display Over Other Apps** when prompted.

### Strict Edition (Full Zero Mode via ADB)
1. Download `ZERO-requires-adb-v<version>.apk` from [Latest GitHub Release](https://github.com/MDYOUSUF20007-oss/ZERO-Noise/releases/latest).
2. Install via ADB or Shizuku (or run `./update-phone.ps1`):
   ```bash
   adb install -r ZERO-requires-adb-v<version>.apk
   ```
3. On Android 13–16:
   - Go to `Settings → Apps → Zero-Noise → ⋮ (top right) → Allow restricted settings`.
   - Go to `Accessibility → Zero-Noise` and enable the service.

### Upgrading From Previous Versions
All official releases (`v1.0.19+`) share Zero-Noise's V1 + V2 + V3 release key:
```
Owner: CN=Zero Detox, OU=Mobile Security, O=Zero Detox Project, L=Bangalore, ST=Karnataka, C=IN
SHA-256: A1:4A:36:1E:D4:B7:F7:D6:6E:57:69:92:99:9D:02:8A:05:32:65:85:0A:6C:A4:AF:EE:4F:C1:2F:29:48:CE:11
```
Updates install directly in-place over existing installations without losing focus statistics, streaks, or Escape Tickets.

---

## Verifying Integrity Locally

```bash
# Run all 25 unit and anti-exploit verification suites
npm test

# Lint TypeScript & React code
npm run lint

# Run CI security and integrity verifier
node scripts/verify-integrity.mjs

# Build production bundle
npm run build
```

---

*Zero-Noise is 100% free and open-source under the [MIT License](./LICENSE).*
