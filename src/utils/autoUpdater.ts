import { Capacitor } from '@capacitor/core';
import type { AppUpdateReleaseInfo, NativeAppBuildInfo } from '../types';

export const CURRENT_APP_VERSION = '1.0.0';
export const GITHUB_RELEASES_API =
  'https://api.github.com/repos/MDYOUSUF20007-oss/ZERO-Noise/releases/latest';
export const OFFICIAL_FALLBACK_RELEASES_URL =
  'https://github.com/MDYOUSUF20007-oss/ZERO-Noise/releases';

const STORAGE_KEYS = {
  LAST_CHECK_TS: 'zero_last_update_check_ts',
  LAST_PROMPT_TS: 'zero_last_update_prompt_ts',
  CACHED_RELEASE: 'zero_cached_release_info',
};

const CHECK_THROTTLE_MS = 24 * 60 * 60 * 1000; // 24 hours
const REPEATING_NUDGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function normalizeVersion(v: string): number[] {
  const cleaned = v.replace(/^v/i, '').split('-')[0].trim();
  const parts = cleaned.split('.').map((p) => parseInt(p, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts;
}

export function isVersionNewer(latest: string, current: string): boolean {
  const latestParts = normalizeVersion(latest);
  const currentParts = normalizeVersion(current);

  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

function resolveInstalledBuildContext(
  appBuildInfo?: NativeAppBuildInfo | null
): { version: string; edition: 'strict' | 'standard' } | null {
  if (appBuildInfo?.versionName && appBuildInfo.versionName !== 'unknown') {
    return {
      version: appBuildInfo.versionName.replace(/-strict$/i, ''),
      edition: appBuildInfo.edition === 'strict' ? 'strict' : 'standard',
    };
  }

  if (typeof window !== 'undefined' && window.ZeroNative?.getAppBuildInfoJson) {
    try {
      const parsed = JSON.parse(window.ZeroNative.getAppBuildInfoJson()) as Partial<NativeAppBuildInfo>;
      if (parsed.versionName && parsed.versionName !== 'unknown') {
        return {
          version: parsed.versionName.replace(/-strict$/i, ''),
          edition: parsed.edition === 'strict' ? 'strict' : 'standard',
        };
      }
    } catch {
      // Ignore bridge parse error
    }
  }

  try {
    if (Capacitor.isNativePlatform()) {
      // Avoid comparing against fallback '1.0.0' before native build info is attached
      return null;
    }
  } catch {
    // Ignore Capacitor check in non-browser test envs
  }

  return { version: CURRENT_APP_VERSION, edition: 'standard' };
}

function pickEditionApkDownloadUrl(
  assets: Array<{ name?: string; browser_download_url?: string }>,
  edition: 'strict' | 'standard'
): string | undefined {
  const apkAssets = assets.filter(
    (a) => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.apk')
  );
  if (apkAssets.length === 0) return undefined;

  const isStrictAsset = (name?: string) => {
    const lower = (name || '').toLowerCase();
    return lower.includes('requires-adb') || lower.includes('strict');
  };

  const preferred =
    edition === 'strict'
      ? apkAssets.find((a) => isStrictAsset(a.name))
      : apkAssets.find((a) => !isStrictAsset(a.name));

  return (preferred ?? apkAssets[0])?.browser_download_url;
}

export function isUpdatePromptDue(nowMs: number = Date.now()): boolean {
  if (typeof localStorage === 'undefined') return false;
  const raw = localStorage.getItem(STORAGE_KEYS.LAST_PROMPT_TS);
  if (!raw) return true;
  const lastPrompt = parseInt(raw, 10) || 0;
  return nowMs - lastPrompt >= REPEATING_NUDGE_MS;
}

export function recordUpdatePromptShown(nowMs: number = Date.now()): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.LAST_PROMPT_TS, String(nowMs));
}

export function getCachedReleaseInfo(): AppUpdateReleaseInfo | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CACHED_RELEASE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function checkForAppUpdate(
  force = false,
  appBuildInfo?: NativeAppBuildInfo | null
): Promise<AppUpdateReleaseInfo | null> {
  const now = Date.now();
  if (typeof localStorage === 'undefined') return null;

  const installed = resolveInstalledBuildContext(appBuildInfo);
  if (!installed) return null;

  const currentVersion = installed.version;

  if (!force) {
    const lastCheckStr = localStorage.getItem(STORAGE_KEYS.LAST_CHECK_TS);
    const lastCheck = lastCheckStr ? parseInt(lastCheckStr, 10) || 0 : 0;
    if (now - lastCheck < CHECK_THROTTLE_MS) {
      const cached = getCachedReleaseInfo();
      if (cached && isVersionNewer(cached.latestVersion, currentVersion)) {
        return { ...cached, currentVersion };
      }
      return null;
    }
  }

  try {
    localStorage.setItem(STORAGE_KEYS.LAST_CHECK_TS, String(now));
    const response = await fetch(GITHUB_RELEASES_API, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const cached = getCachedReleaseInfo();
      return cached && isVersionNewer(cached.latestVersion, currentVersion)
        ? { ...cached, currentVersion }
        : null;
    }

    const data = await response.json();
    const tagName: string = data.tag_name || '';
    const cleanTag = tagName.replace(/^v/i, '');

    const apkDownloadUrl = Array.isArray(data.assets)
      ? pickEditionApkDownloadUrl(data.assets, installed.edition)
      : undefined;

    const isNewer = isVersionNewer(cleanTag || currentVersion, currentVersion);
    const releaseInfo: AppUpdateReleaseInfo = {
      latestVersion: cleanTag || currentVersion,
      currentVersion,
      hasUpdate: isNewer,
      releaseNotes: data.body || 'New features and bug fixes in this release.',
      apkDownloadUrl: apkDownloadUrl || data.html_url || OFFICIAL_FALLBACK_RELEASES_URL,
      htmlUrl: data.html_url || OFFICIAL_FALLBACK_RELEASES_URL,
      publishedAt: data.published_at || new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.CACHED_RELEASE, JSON.stringify(releaseInfo));

    if (isNewer) {
      return releaseInfo;
    }

    return null;
  } catch {
    const cached = getCachedReleaseInfo();
    return cached && isVersionNewer(cached.latestVersion, currentVersion)
      ? { ...cached, currentVersion }
      : null;
  }
}
