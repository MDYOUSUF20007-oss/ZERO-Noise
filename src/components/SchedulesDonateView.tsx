import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  FIRST_DONATION_BONUS_INR,
  KOFI_URL,
  RELEASES_URL,
  SOURCE_URL,
  UPI_ID,
  UPI_PAY_URL,
  UPI_FIFTY_RS_PAY_URL,
  copyTextSafely,
  handleOpenExternalUrl,
} from '../utils/supportLinks';
import type { CloudReminderScheduleInfo } from '../core/integrity/IntegrityEngine';
import type {
  RecurringSchedule,
  SessionTag,
  ThemeConfig,
  InterfaceStyle,
  MaterialYouSeed,
  SleepFarmingMode,
  NativePermissionStatus,
  NativeAppBuildInfo,
  NativeEnvironmentSecurity,
  ZeroProfile,
  CloudAutoBackupStatus,
  CloudReminderInterval,
} from '../types';
import { useInterfaceStyle, AMOLED_ACCENTS } from '../context/interfaceStyleStore';
import { evaluatePermissionPriority } from '../utils/permissionPriority';
import { RestrictedSettingsGuideCard } from './RestrictedSettingsGuideCard';
import { ProfileAvatar } from './ProfileAvatar';
import { ZeroSupporterGoldenBadge } from './AchievementBadgeChip';
import { DonorPerksBadgesCard } from './DonorPerksBadgesCard';
import { ObsidianCard } from './ObsidianCard';
import { ZeroTubeSettingsCard } from './ZeroTubeSettingsCard';
import { CompulsoryStudyAppsCard } from './CompulsoryStudyAppsCard';
import { ActionRemindersSettingsCard } from './ActionRemindersSettingsCard';
import { isOvernightSchedule, getScheduleDurationMinutes } from '../utils/routineEngine';

const CreditsModal = lazy(() =>
  import('./CreditsModal').then((m) => ({ default: m.CreditsModal }))
);
const ZeroTubeModal = lazy(() =>
  import('./ZeroTubeModal').then((m) => ({ default: m.ZeroTubeModal }))
);
import { haptics } from '../utils/haptics';
import {
  Plus,
  Trash2,
  Bell,
  Heart,
  Coffee,
  Copy,
  Check,
  Upload,
  RotateCcw,
  ExternalLink,
  Palette,
  QrCode,
  Code2,
  Sun,
  Moon,
  Smartphone,
  Terminal,
  ShieldAlert,
  Gift,
  Sparkles,
  CheckCircle2,
  UserPlus,
  CloudUpload,
  Loader2,
  KeyRound,
  ShieldCheck,
  HardDrive,
  Sliders,
  Save,
  Ticket,
  Users,
  Target,
  Zap,
  Flame,
  Battery,
  Layers,
} from 'lucide-react';

interface SchedulesDonateViewProps {
  schedules: RecurringSchedule[];
  permissions: NativePermissionStatus;
  appBuildInfo?: NativeAppBuildInfo | null;
  environmentSecurity?: NativeEnvironmentSecurity;
  onRefreshPermissions: () => void;
  onToggleSchedule: (id: string) => void;
  onToggleScheduleBurnTheBoats?: (id: string) => { ok: boolean; message?: string };
  onAddSchedule: (sched: Omit<RecurringSchedule, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
  onTriggerTestWarning: (scheduleName: string) => void;
  themeConfig: ThemeConfig;
  onThemeConfigChange: (next: ThemeConfig) => void;
  interfaceStyle?: InterfaceStyle;
  onInterfaceStyleChange?: (next: InterfaceStyle) => void;
  materialYouSeed?: MaterialYouSeed;
  onMaterialYouSeedChange?: (next: MaterialYouSeed) => void;
  materialYouAmoled?: boolean;
  onMaterialYouAmoledChange?: (next: boolean) => void;
  sectionOverride?: {
    section: 'schedules' | 'themes' | 'settings' | 'os_security' | 'support';
    key: number;
  } | null;
  viewMode?: 'all' | 'settings_os' | 'support';
  sleepFarmingMode: SleepFarmingMode;
  onSleepFarmingModeChange: (mode: SleepFarmingMode) => void;
  onExportZbakData?: () => string;
  onOneTapSaveBackup?: () => Promise<{ ok: boolean; message: string }>;
  onImportData: (rawJson: string) => { ok: boolean; message: string };
  onResetData: () => void;
  cloudBackupStatus?: CloudAutoBackupStatus;
  cloudReminderInterval?: CloudReminderInterval;
  lastCloudUploadTimestamp?: number;
  nextCloudReminderInfo?: CloudReminderScheduleInfo;
  onCloudReminderIntervalChange?: (next: CloudReminderInterval) => void;
  isCloudBusy?: boolean;
  onEnableCloudAutoBackup?: () => Promise<{ ok: boolean; cancelled?: boolean; message: string }>;
  onDisableCloudAutoBackup?: () => Promise<void>;
  onOneTapCloudUpload?: () => Promise<{ ok: boolean; cancelled?: boolean; message: string }>;
  onRestoreFromCloudPicker?: () => Promise<{ ok: boolean; cancelled?: boolean; message: string }>;
  onRestoreSuccess?: () => void;
  tipSkipRemaining?: number;
  onResetTipPromptBlock?: () => void;
  profile?: ZeroProfile | null;
  isZeroSupporter?: boolean;
  remainingEscapeTickets?: number;
  hasClaimedFirstTimeParachute?: boolean;
  hasClaimedFirstDonationParachute?: boolean;
  isDeveloper?: boolean;
  onOpenProfileModal?: () => void;
  onClaimFirstDonationBonus?: (rawToken?: string) => boolean;
  onActivateDonorToken?: (rawToken: string) => { ok: boolean; message: string; grantedNewPerks: boolean };
  onBurnAllEscapeTickets?: () => { ok: boolean; burnedCount: number; message: string };
  onRecalibrateHabitProfile?: () => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TAGS: SessionTag[] = ['Deep Work', 'Study', 'Sleep', 'Detox', 'Family'];

const REMINDER_OPTIONS: Array<{ id: CloudReminderInterval; label: string }> = [
  { id: 'weekly', label: '1 Week' },
  { id: 'monthly', label: '1 Month' },
  { id: 'off', label: 'Off' },
];

function formatCloudReminderCountdown(
  interval: CloudReminderInterval,
  info?: CloudReminderScheduleInfo,
  lastCloudUploadTs?: number
): string {
  if (interval === 'off') return 'Reminders paused';
  if (info?.isDue) return 'Due now — upload to reset timer';
  const targetMs =
    info?.nextReminderAtMs ??
    (lastCloudUploadTs && lastCloudUploadTs > 0
      ? lastCloudUploadTs + (interval === 'monthly' ? 30 : 7) * 24 * 60 * 60 * 1000
      : null);
  if (!targetMs) return 'Due now — upload to reset timer';
  const remainingMs = Math.max(0, targetMs - Date.now());
  if (remainingMs <= 0) return 'Due now — upload to reset timer';
  const totalHours = Math.floor(remainingMs / (60 * 60 * 1000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const mins = Math.max(1, Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000)));
  if (days > 0) return `Next reminder in ${days}d ${hours}h`;
  if (hours > 0) return `Next reminder in ${hours}h ${mins}m`;
  return `Next reminder in ${mins}m`;
}

export const SchedulesDonateView: React.FC<SchedulesDonateViewProps> = ({
  schedules,
  permissions,
  appBuildInfo = null,
  environmentSecurity,
  onRefreshPermissions,
  onToggleSchedule,
  onToggleScheduleBurnTheBoats,
  onAddSchedule,
  onDeleteSchedule,
  onTriggerTestWarning,
  themeConfig: _themeConfig,
  onThemeConfigChange: _onThemeConfigChange,
  interfaceStyle: _interfaceStyleProp,
  onInterfaceStyleChange: _onInterfaceStyleChange,
  materialYouSeed: _materialYouSeedProp,
  onMaterialYouSeedChange: _onMaterialYouSeedChange,
  materialYouAmoled: _materialYouAmoledProp,
  onMaterialYouAmoledChange: _onMaterialYouAmoledChange,
  sectionOverride = null,
  viewMode = 'all',
  sleepFarmingMode,
  onSleepFarmingModeChange,
  onExportZbakData,
  onOneTapSaveBackup,
  onImportData,
  onResetData,
  cloudBackupStatus,
  cloudReminderInterval = 'weekly',
  lastCloudUploadTimestamp,
  nextCloudReminderInfo,
  onCloudReminderIntervalChange,
  isCloudBusy = false,
  onEnableCloudAutoBackup,
  onDisableCloudAutoBackup,
  onOneTapCloudUpload,
  onRestoreFromCloudPicker,
  onRestoreSuccess,
  tipSkipRemaining = 0,
  onResetTipPromptBlock,
  profile = null,
  isZeroSupporter,
  isDeveloper,
  remainingEscapeTickets = 0,
  hasClaimedFirstTimeParachute = false,
  hasClaimedFirstDonationParachute = false,
  onOpenProfileModal,
  onClaimFirstDonationBonus,
  onActivateDonorToken,
  onBurnAllEscapeTickets,
  onRecalibrateHabitProfile,
}) => {
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    availableThemes,
    isBespoke,
    isFluentGlass,
    isMaterialYou,
    isMaterial,
    materialMode,
    setMaterialMode,
    aeroPalette,
    setAeroPalette,
    materialYouSeed: _ctxMaterialYouSeed,
    setMaterialYouSeed: _ctxSetMaterialYouSeed,
    fluentOrbIntensity,
    setFluentOrbIntensity,
    fluentGlassStrength,
    setFluentGlassStrength,
    gpuThermalSafeguard,
    setGpuThermalSafeguard,
    ambientDriftEnabled,
    setAmbientDriftEnabled,
    glassEngine,
    setGlassEngine,
    targetFps,
    setTargetFps,
  } = useInterfaceStyle();
  const isModernFont = isBespoke || isFluentGlass || isMaterialYou || isMaterial;

  const [cloudNotice, setCloudNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const supporterBadgeUnlocked = Boolean(isZeroSupporter ?? (hasClaimedFirstDonationParachute || isDeveloper));
  const restoreDisabled = Boolean(environmentSecurity?.restrictions?.backupRestoreDisabled);
  const [sectionState, setSectionState] = useState<{
    section: 'schedules' | 'themes' | 'settings' | 'os_security' | 'support';
    overrideKey: string | number | undefined;
  }>(() => ({
    section: sectionOverride?.section || 'schedules',
    overrideKey: sectionOverride?.key,
  }));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showZeroTubeModal, setShowZeroTubeModal] = useState(false);
  const [selectedZeroTubeVideoId, setSelectedZeroTubeVideoId] = useState<string | undefined>(undefined);

  const currentOverrideKey = sectionOverride?.key;
  const activeSection =
    sectionOverride?.section && currentOverrideKey !== sectionState.overrideKey
      ? sectionOverride.section
      : sectionState.section;

  const setActiveSection = (
    section: 'schedules' | 'themes' | 'settings' | 'os_security' | 'support'
  ) => {
    setSectionState({ section, overrideKey: currentOverrideKey });
  };

  const effectiveSection =
    viewMode === 'support'
      ? 'support'
      : viewMode === 'settings_os' && activeSection === 'support'
      ? 'schedules'
      : activeSection;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUPIQR, setShowUPIQR] = useState(false);
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [confirmingDonationClaim, setConfirmingDonationClaim] = useState(false);
  const [confirmingBurnTickets, setConfirmingBurnTickets] = useState(false);
  const [burnTicketsNotice, setBurnTicketsNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [backupNotice, setBackupNotice] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!showUPIQR || upiQrUrl) return;
    let cancelled = false;
    void import('qrcode')
      .then(({ toDataURL }) =>
        toDataURL(UPI_PAY_URL, {
          width: 240,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        })
      )
      .then((url) => {
        if (!cancelled) setUpiQrUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [showUPIQR, upiQrUrl]);

  const hasNativeBridge = permissions.isNativeAndroid;
  const isStrictBuild = permissions.isStrictAccessibilityBuild;
  const hasOverlayPerm = permissions.hasOverlayPermission;
  const hasUsagePerm = permissions.hasUsageStatsPermission;
  const hasNotifPerm = permissions.hasNotificationPermission;
  const isDeviceOwner = permissions.isDeviceOwner;
  const isAccessibilityOn = permissions.isAccessibilityEnabled;
  const permissionPriority = evaluatePermissionPriority(permissions);

  // New Schedule Form State
  const [newName, setNewName] = useState('Afternoon Focus');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('16:30');
  const [newTag, setNewTag] = useState<SessionTag>('Deep Work');
  const [newBurnTheBoats, setNewBurnTheBoats] = useState<boolean>(false);
  const [burnBoatsWarning, setBurnBoatsWarning] = useState<string | null>(null);
  const [scheduleNotice, setScheduleNotice] = useState<{ id: string; message: string } | null>(null);

  // Quick Settings Tile Configuration
  const [qsDuration, setQsDuration] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.ZeroNative?.getQuickSettingsConfigJson?.();
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.durationSeconds) return Number(parsed.durationSeconds);
        }
      } catch {}
      const saved = localStorage.getItem('zero_qs_duration_seconds');
      if (saved) return Number(saved);
    }
    return 25 * 60;
  });
  const [qsTag, setQsTag] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.ZeroNative?.getQuickSettingsConfigJson?.();
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.tag) return String(parsed.tag);
        }
      } catch {}
      const saved = localStorage.getItem('zero_qs_tag');
      if (saved) return saved;
    }
    return 'Deep Work';
  });

  const handleUpdateQsConfig = (duration: number, tag: string) => {
    setQsDuration(duration);
    setQsTag(tag);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zero_qs_duration_seconds', String(duration));
      localStorage.setItem('zero_qs_tag', tag);
      window.ZeroNative?.syncQuickSettingsConfig?.(duration, tag, 'work', 'Work');
    }
  };

  // OEM Battery Killer & Background Exemption State
  const [isBatteryIgnored, setIsBatteryIgnored] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.ZeroNative?.isIgnoringBatteryOptimizations) {
      return Boolean(window.ZeroNative.isIgnoringBatteryOptimizations());
    }
    return true;
  });
  const [deviceMfg, setDeviceMfg] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.ZeroNative?.getDeviceManufacturer) {
      return window.ZeroNative.getDeviceManufacturer() || 'generic';
    }
    return 'generic';
  });

  const checkBatteryState = () => {
    if (typeof window !== 'undefined') {
      if (window.ZeroNative?.isIgnoringBatteryOptimizations) {
        setIsBatteryIgnored(Boolean(window.ZeroNative.isIgnoringBatteryOptimizations()));
      }
      if (window.ZeroNative?.getDeviceManufacturer) {
        setDeviceMfg(window.ZeroNative.getDeviceManufacturer() || 'generic');
      }
    }
  };

  useEffect(() => {
    const syncNative = () => checkBatteryState();
    window.addEventListener('focus', syncNative);
    document.addEventListener('visibilitychange', syncNative);
    return () => {
      window.removeEventListener('focus', syncNative);
      document.removeEventListener('visibilitychange', syncNative);
    };
  }, []);

  const handleOpenExternal = (e: React.MouseEvent, url: string) => {
    handleOpenExternalUrl(e, url);
  };

  const handleCopy = async (text: string, id: string) => {
    await copyTextSafely(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newDays.length === 0) return;

    const durationMins = getScheduleDurationMinutes(newStartTime, newEndTime);
    const safeBurn = newBurnTheBoats && durationMins <= 240;

    onAddSchedule({
      name: newName.trim(),
      days: newDays,
      startTime: newStartTime,
      endTime: newEndTime,
      tag: newTag,
      isEnabled: true,
      preLockWarningMinutes: 5,
      burnTheBoats: safeBurn,
    });

    setNewBurnTheBoats(false);
    setBurnBoatsWarning(null);
    setShowAddModal(false);
  };

  const toggleDaySelection = (dayIndex: number) => {
    if (newDays.includes(dayIndex)) {
      setNewDays(newDays.filter((d) => d !== dayIndex));
    } else {
      setNewDays([...newDays, dayIndex].sort());
    }
  };

  return (
    <div
      className={`flex flex-col px-4 py-5 max-w-md mx-auto w-full select-none ${
        isFluentGlass ? 'gap-5 font-sans pb-32' : isBespoke ? 'gap-6 font-sans pb-28' : 'gap-5 pb-28'
      }`}
    >
      {/* View Header */}
      {viewMode === 'support' ? (
        <div className="space-y-1">
          <h1
            className={`text-xl tracking-tight flex items-center gap-2 ${
              isMaterial
                ? 'font-display font-extrabold text-[var(--md-sys-color-on-surface)]'
                : isFluentGlass
                ? 'font-display font-extrabold liquid-metric text-white'
                : isBespoke
                ? 'font-display font-extrabold text-white'
                : 'font-mono font-black text-white'
            }`}
          >
            <span>Support Zero-Noise</span>
          </h1>
          <p className={`text-xs font-medium ${isMaterial ? 'font-sans text-[var(--md-sys-color-on-surface-variant)]' : isModernFont ? 'font-sans text-zinc-300' : 'font-mono text-zinc-300'}`}>
            100% FOSS • Voluntary UPI / Ko-fi Support &amp; Donor Perks
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <h1
            className={`text-xl tracking-tight flex items-center gap-2 ${
              isMaterial
                ? 'font-display font-bold text-[var(--md-sys-color-on-surface)]'
                : isFluentGlass
                ? 'font-display font-bold liquid-metric text-white'
                : isBespoke
                ? 'font-display font-bold text-white'
                : 'font-mono font-bold text-white'
            }`}
          >
            <span>Settings &amp; OS</span>
          </h1>
          <p className={`text-xs font-medium ${isMaterial ? 'font-sans text-[var(--md-sys-color-on-surface-variant)]' : isModernFont ? 'font-sans text-zinc-300' : 'font-mono text-zinc-300'}`}>
            Auto-Pilot Schedules, Theme Studio, Backups &amp; Android Guards
          </p>
        </div>
      )}

      {/* Sub-Navigation Bar */}
      {viewMode !== 'support' && (
        <div
          className={`grid ${
            viewMode === 'settings_os' ? 'grid-cols-4' : 'grid-cols-5'
          } gap-1 p-1 ${
            isMaterial
              ? 'bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-full text-[11px] font-sans'
              : isFluentGlass
              ? 'liquid-track rounded-full text-[11px] font-sans'
              : isBespoke
              ? 'bg-black border border-neutral-800 rounded-md text-[11px] font-sans'
              : 'obsidian-shell-bar rounded-2xl text-[10px] font-mono'
          }`}
        >
          <button
            onClick={() => setActiveSection('schedules')}
            className={`py-2 min-h-[38px] truncate px-1 ${
              isMaterial
                ? `rounded-full transition-colors ${
                    effectiveSection === 'schedules'
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] font-medium'
                  }`
                : isFluentGlass
                ? `rounded-full font-medium liquid-spring ${
                    effectiveSection === 'schedules'
                      ? 'liquid-pill-active font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`
                : isBespoke
                ? `rounded-sm transition-colors duration-75 ${
                    effectiveSection === 'schedules'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white font-medium'
                  }`
                : `rounded-xl transition-all font-semibold ${
                    effectiveSection === 'schedules'
                      ? 'obsidian-pill-active font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`
            }`}
          >
            Schedules
          </button>
          <button
            onClick={() => setActiveSection('themes')}
            className={`py-2 min-h-[38px] truncate px-1 ${
              isMaterial
                ? `rounded-full transition-colors ${
                    effectiveSection === 'themes'
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] font-medium'
                  }`
                : isFluentGlass
                ? `rounded-full font-medium liquid-spring ${
                    effectiveSection === 'themes'
                      ? 'liquid-pill-active font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`
                : isBespoke
                ? `rounded-sm transition-colors duration-75 ${
                    effectiveSection === 'themes'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white font-medium'
                  }`
                : `rounded-xl transition-all font-semibold ${
                    effectiveSection === 'themes'
                      ? 'obsidian-pill-active font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`
            }`}
          >
            Themes
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`py-2 min-h-[38px] truncate px-1 ${
              isMaterial
                ? `rounded-full transition-colors ${
                    effectiveSection === 'settings'
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] font-medium'
                  }`
                : isFluentGlass
                ? `rounded-full font-medium liquid-spring ${
                    effectiveSection === 'settings'
                      ? 'liquid-pill-active font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`
                : isBespoke
                ? `rounded-sm transition-colors duration-75 ${
                    effectiveSection === 'settings'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white font-medium'
                  }`
                : `rounded-xl transition-all font-semibold ${
                    effectiveSection === 'settings'
                      ? 'obsidian-pill-active font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveSection('os_security')}
            className={`py-2 min-h-[38px] truncate px-1 ${
              isMaterial
                ? `rounded-full transition-colors ${
                    effectiveSection === 'os_security'
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] font-medium'
                  }`
                : isFluentGlass
                ? `rounded-full font-medium liquid-spring ${
                    effectiveSection === 'os_security'
                      ? 'liquid-pill-active font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`
                : isBespoke
                ? `rounded-sm transition-colors duration-75 ${
                    effectiveSection === 'os_security'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white font-medium'
                  }`
                : `rounded-xl transition-all font-semibold ${
                    effectiveSection === 'os_security'
                      ? 'obsidian-pill-active font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`
            }`}
          >
            OS
          </button>
          {viewMode === 'all' && (
            <button
              onClick={() => setActiveSection('support')}
              className={`py-2 min-h-[38px] truncate px-1 ${
                isMaterial
                  ? `rounded-full transition-colors ${
                      effectiveSection === 'support'
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                        : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] font-medium'
                    }`
                  : isFluentGlass
                  ? `rounded-full font-medium liquid-spring ${
                      effectiveSection === 'support'
                        ? 'liquid-pill-active font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`
                  : isBespoke
                  ? `rounded-sm transition-colors duration-75 ${
                      effectiveSection === 'support'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white font-medium'
                    }`
                  : `rounded-xl transition-all font-semibold ${
                      effectiveSection === 'support'
                        ? 'obsidian-pill-active font-black'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`
              }`}
            >
              Support
            </button>
          )}
        </div>
      )}

      {/* Active Section Content Container */}
      <div key={effectiveSection} className="zn-view-enter space-y-5">
      {/* SECTION 0: THEME SETTINGS (INTERFACE STYLE + 2 TONAL ACCENT COLORS + COMMUNITY MODS) */}
      {effectiveSection === 'themes' && (
        <div className="space-y-4">
          {/* Dedicated Runtime Switcher Card */}
          <div className="theme-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl theme-bg-secondary flex items-center justify-center shrink-0 border theme-border">
                  <Sliders size={15} strokeWidth={1.75} className="theme-text-accent" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs theme-text-primary font-semibold uppercase tracking-wider">
                    Interface Style
                  </h2>
                  <p className="text-[11px] theme-text-muted">
                    {isMaterial
                      ? `Material Dusk • ${materialMode === 'dark' ? 'Night (Twilight)' : 'Day (Porcelain)'}`
                      : 'Fluent Glass • VisionOS Liquid Acrylic'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full theme-pill-active border shrink-0">
                Active &amp; Calibrated
              </span>
            </div>

            {/* Interface Style Choice Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableThemes.map((engineDef) => {
                const isSelected = engineDef.id === 'material' ? isMaterial : theme === engineDef.id;
                return (
                  <button
                    key={engineDef.id}
                    type="button"
                    onClick={() => {
                      haptics.tick(900);
                      setTheme(engineDef.id);
                    }}
                    className={`w-full p-3.5 text-left rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? isMaterial
                          ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                          : 'border-[var(--accent-primary,#f43f5e)] bg-[var(--accent-soft,rgba(244,63,94,0.16))] shadow-[0_0_16px_var(--liquid-accent-soft-glow)]'
                        : 'theme-border theme-bg-secondary/40 hover:theme-bg-secondary/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="font-semibold text-xs theme-text-primary flex items-center gap-2 min-w-0">
                        <span className="truncate">{engineDef.name}</span>
                        <span
                          className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-mono border whitespace-nowrap shrink-0 ${
                            isSelected
                              ? isMaterial
                                ? 'border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary-container)]'
                                : 'border-[var(--accent-primary,#f43f5e)] text-[var(--liquid-accent-tint,var(--accent-primary,#f43f5e))]'
                              : 'theme-border theme-text-muted'
                          }`}
                        >
                          {engineDef.badge}
                        </span>
                      </div>
                      {isSelected && (
                        isMaterial ? (
                          <CheckCircle2 size={15} className="shrink-0 text-[var(--md-sys-color-primary)]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[var(--accent-primary,#f43f5e)] shadow-[0_0_8px_var(--accent-primary,#f43f5e)] animate-pulse shrink-0" />
                        )
                      )}
                    </div>

                    <p className="text-[11px] theme-text-muted leading-relaxed line-clamp-2">
                      {engineDef.description}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1">
                      {engineDef.id === 'fluent' ? (
                        <>
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 bg-[#08090c]"
                            title="Deep Silicate Night Canvas"
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 bg-[#161b26]"
                            title="Frosted Silicate Glass Surface"
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 bg-[#cbd5e1]"
                            title="Specular Highlight Rim"
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                            style={{
                              backgroundColor: 'var(--accent-primary, #f43f5e)',
                              boxShadow: '0 0 6px var(--accent-primary, #f43f5e)',
                            }}
                            title="Active AMOLED Accent"
                          />
                        </>
                      ) : (
                        <>
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 bg-[#F3EDE8]"
                            title="Warm Porcelain Day"
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 bg-[#24283F]"
                            title="Deep Twilight Night"
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 bg-[#353B5B]"
                            title="Twilight Indigo Ink"
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 bg-[#E69F86]"
                            title="Sunset Peach Accent"
                          />
                        </>
                      )}
                      <span className="text-[9px] theme-text-muted ml-auto font-mono">
                        {isSelected ? 'ACTIVE' : 'SELECT'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Fluent Glass Calibration Controls (Active when not in Material Dusk mode) */}
            {!isMaterial && (
              <>
                {/* Premium AMOLED Accent Color Palette */}
                <div className="pt-3 border-t theme-border space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={13} style={{ color: 'var(--liquid-accent-tint, var(--accent-primary, #f43f5e))' }} />
                        <label className="text-xs font-semibold theme-text-primary block">
                          AMOLED Accent Palette
                        </label>
                      </div>
                      <p className="text-[11px] theme-text-muted leading-tight mt-0.5">
                        High-contrast, pure-glow accents calibrated for deep AMOLED dark mode
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase shrink-0 font-bold border transition-colors"
                      style={{
                        borderColor: 'var(--accent-primary, #f43f5e)',
                        color: 'var(--liquid-accent-tint, var(--accent-primary, #f43f5e))',
                        backgroundColor: 'var(--accent-soft, rgba(244, 63, 94, 0.16))',
                        boxShadow: '0 0 10px var(--liquid-accent-soft-glow, rgba(244, 63, 94, 0.2))',
                      }}
                    >
                      {AMOLED_ACCENTS.find((a) => a.id === accent)?.name ?? 'Rose Coral'}
                    </span>
                  </div>

                  {/* 8 AMOLED Color Card Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {AMOLED_ACCENTS.map((item, idx) => {
                      const isSelected = accent === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            haptics.tick(950);
                            setAccent(item.id);
                          }}
                          style={{ '--zn-stagger-idx': idx * 0.45 } as React.CSSProperties}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-2 liquid-spring zn-hover-float zn-stagger-item ${
                            isSelected
                              ? 'border-[var(--accent-primary,#f43f5e)] bg-[var(--accent-soft,rgba(244,63,94,0.16))] shadow-[0_0_18px_var(--liquid-accent-soft-glow)] ring-1 ring-[var(--accent-primary,#f43f5e)]'
                              : 'theme-border theme-bg-secondary/40 hover:theme-bg-secondary/80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span
                              className="w-4 h-4 rounded-full shrink-0 border border-white/25 transition-transform"
                              style={{
                                backgroundColor: item.color,
                                boxShadow: isSelected
                                  ? `0 0 12px ${item.color}, 0 0 4px #ffffff`
                                  : `0 0 6px ${item.color}88`,
                                transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                              }}
                            />
                            {isSelected && (
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                                style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
                              />
                            )}
                          </div>

                          <div className="min-w-0 w-full space-y-0.5">
                            <span className="text-[11px] font-bold theme-text-primary leading-tight block truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] theme-text-muted leading-tight font-mono block truncate">
                              {item.subtitle}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ambient Glow Intensity Slider */}
                <div className="pt-3 border-t theme-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold theme-text-primary block">
                      Ambient Glow Intensity
                    </label>
                    <span className="text-[10px] font-mono tabular-nums text-zinc-400">
                      {Math.round(fluentOrbIntensity * 100)}%
                      <span className="text-zinc-500 ml-1.5">
                        {fluentOrbIntensity === 0
                          ? '• Stealth AMOLED'
                          : fluentOrbIntensity < 0.3
                          ? '• Subtle'
                          : fluentOrbIntensity < 0.6
                          ? '• Balanced'
                          : '• Radiant'}
                      </span>
                    </span>
                  </div>

                  {/* Slider Track */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={Math.round(fluentOrbIntensity * 100)}
                      onChange={(e) => {
                        const val = Number(e.target.value) / 100;
                        setFluentOrbIntensity(val);
                        haptics.tick(600 + val * 600);
                      }}
                      className="w-full cursor-pointer h-1.5 rounded-lg bg-zinc-800"
                      style={{ accentColor: 'var(--accent-primary, #f43f5e)' }}
                      aria-label="Ambient Glow Intensity"
                    />
                  </div>

                  {/* 3 Quick Presets */}
                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    {[
                      { label: 'Stealth (0%)', value: 0 },
                      { label: 'Subtle (35%)', value: 0.35 },
                      { label: 'Radiant (75%)', value: 0.75 },
                    ].map((preset) => {
                      const isActive = Math.abs(fluentOrbIntensity - preset.value) < 0.05;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            haptics.tick(850);
                            setFluentOrbIntensity(preset.value);
                          }}
                          className={`py-1.5 px-2 text-[10px] font-medium rounded-full border transition-all text-center ${
                            isActive
                              ? 'theme-pill-active font-semibold'
                              : 'theme-pill text-zinc-300 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fluent Glass Strength & Transparency Slider */}
                <div className="pt-3 border-t theme-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold theme-text-primary block">
                      Glass Strength &amp; Transparency
                    </label>
                    <span className="text-[10px] font-mono tabular-nums text-zinc-300">
                      {Math.round(fluentGlassStrength * 100)}%
                      <span className="text-zinc-400 ml-1.5">
                        {fluentGlassStrength <= 0.15
                          ? '• Ultra-Clear'
                          : fluentGlassStrength < 0.35
                          ? '• High Transparency'
                          : fluentGlassStrength < 0.65
                          ? '• Balanced Glass'
                          : fluentGlassStrength < 0.85
                          ? '• Frosted Acrylic'
                          : '• Deep Frost'}
                      </span>
                    </span>
                  </div>

                  {/* Live Optical Glass Preview Box */}
                  <div className="relative w-full rounded-2xl p-3.5 overflow-hidden border theme-border bg-[#07090e] select-none">
                    <div
                      aria-hidden="true"
                      className="absolute -top-6 -right-4 w-36 h-36 rounded-full pointer-events-none blur-xl transition-all duration-300"
                      style={{
                        background:
                          'radial-gradient(circle, var(--accent-primary, #f43f5e) 0%, var(--accent-soft, rgba(244,63,94,0.22)) 52%, transparent 80%)',
                        opacity: Math.max(0.22, fluentOrbIntensity),
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute -bottom-6 left-4 w-28 h-28 rounded-full pointer-events-none blur-xl transition-all duration-300"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(186, 210, 255, 0.35) 0%, rgba(99, 102, 241, 0.14) 55%, transparent 82%)',
                        opacity: Math.max(0.18, fluentOrbIntensity * 0.85),
                      }}
                    />
                    <div className="relative z-10 glass-card p-3.5 rounded-[18px] border">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <Layers size={13} style={{ color: 'var(--liquid-accent-tint, var(--accent-primary, #f43f5e))' }} />
                          <span className="text-xs font-semibold theme-text-primary">
                            Optical Refraction Preview
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full liquid-pill-active shrink-0">
                          {Math.round(fluentGlassStrength * 100)}%
                        </span>
                      </div>
                      <p className="text-[11px] theme-text-secondary leading-relaxed">
                        VisionOS silicate frost with Fresnel rim &amp; {AMOLED_ACCENTS.find((a) => a.id === accent)?.name ?? 'Rose Coral'} refraction.
                      </p>
                    </div>
                  </div>

                  {/* Slider Track */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={Math.round(fluentGlassStrength * 100)}
                      onChange={(e) => {
                        const val = Number(e.target.value) / 100;
                        setFluentGlassStrength(val);
                        haptics.tick(600 + val * 600);
                      }}
                      className="w-full cursor-pointer h-1.5 rounded-lg bg-zinc-800"
                      style={{ accentColor: 'var(--accent-primary, #f43f5e)' }}
                      aria-label="Glass Strength &amp; Transparency"
                    />
                  </div>

                  {/* 3 Quick Presets */}
                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    {[
                      { label: 'Clear (20%)', value: 0.20 },
                      { label: 'Balanced (50%)', value: 0.50 },
                      { label: 'Frosted (80%)', value: 0.80 },
                    ].map((preset) => {
                      const isActive = Math.abs(fluentGlassStrength - preset.value) < 0.05;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            haptics.tick(850);
                            setFluentGlassStrength(preset.value);
                          }}
                          className={`py-1.5 px-2 text-[10px] font-medium rounded-full border transition-all text-center ${
                            isActive
                              ? 'theme-pill-active font-semibold'
                              : 'theme-pill text-zinc-300 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* GPU Battery & Thermal Safeguard Switch */}
                <div className="pt-3 border-t theme-border space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl theme-bg-secondary flex items-center justify-center shrink-0 border theme-border">
                        <Zap
                          size={15}
                          strokeWidth={1.75}
                          className={gpuThermalSafeguard ? 'text-amber-400' : 'theme-text-muted'}
                        />
                      </div>
                      <div className="min-w-0">
                        <label className="text-xs font-semibold theme-text-primary block truncate">
                          GPU Battery &amp; Thermal Safeguard
                        </label>
                        <p className="text-[11px] theme-text-muted leading-tight">
                          Disables heavy blur shaders &amp; pauses mesh drift for cool, low-battery 60FPS
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={gpuThermalSafeguard}
                      onClick={() => {
                        haptics.tick(gpuThermalSafeguard ? 600 : 900);
                        setGpuThermalSafeguard(!gpuThermalSafeguard);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        gpuThermalSafeguard ? 'bg-amber-500' : 'bg-zinc-800'
                      }`}
                      aria-label="Toggle GPU Battery & Thermal Safeguard"
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          gpuThermalSafeguard ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Glass Surface Engine Toggle */}
                <div className="pt-3 border-t theme-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <label className="text-xs font-semibold theme-text-primary block">
                        Glass Surface Engine
                      </label>
                      <p className="text-[11px] theme-text-muted leading-tight">
                        Switch between original high-fidelity acrylic blur or eco shaderless
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full liquid-pill-active uppercase shrink-0">
                      {glassEngine === 'acrylic' ? 'Acrylic Blur' : 'Eco Matte'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'acrylic', label: 'Acrylic Glass', note: 'Backdrop blur' },
                      { id: 'eco', label: 'Eco Shaderless', note: '0ms GPU pass' },
                    ].map((opt) => {
                      const isSel = glassEngine === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            haptics.tick(isSel ? 500 : 850);
                            setGlassEngine(opt.id as any);
                          }}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer liquid-spring ${
                            isSel
                              ? 'liquid-pill-active'
                              : 'theme-border theme-bg-secondary/40 hover:theme-bg-secondary/70'
                          }`}
                        >
                          <div className="font-semibold text-xs theme-text-primary flex items-center justify-between">
                            <span>{opt.label}</span>
                            {isSel && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: 'var(--accent-primary, #f43f5e)',
                                  boxShadow: '0 0 8px var(--accent-primary, #f43f5e)',
                                }}
                              />
                            )}
                          </div>
                          <span className="text-[10px] theme-text-muted block mt-0.5">{opt.note}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Ambient Drift Animation Toggle */}
                <div className="pt-3 border-t theme-border flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <label className="text-xs font-semibold theme-text-primary block truncate">
                      Ambient Mesh Drift
                    </label>
                    <p className="text-[11px] theme-text-muted leading-tight">
                      Smooth kinetic respiration drift across ambient canvas (44s-60s multi-axis loop)
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={ambientDriftEnabled}
                    onClick={() => {
                      haptics.tick(ambientDriftEnabled ? 600 : 900);
                      setAmbientDriftEnabled(!ambientDriftEnabled);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      ambientDriftEnabled ? '' : 'bg-zinc-800'
                    }`}
                    style={{
                      backgroundColor: ambientDriftEnabled ? 'var(--accent-primary, #f43f5e)' : undefined,
                    }}
                    aria-label="Toggle Ambient Mesh Drift"
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        ambientDriftEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </>
            )}

            {/* Material Dusk Controls (Appearance Mode + Tonal Seed Palette) */}
            {isMaterial && (
              <div className="pt-3 border-t theme-border space-y-4">
                {/* M3 Segmented Appearance Mode Selector (Day Porcelain vs Night Twilight) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <label className="text-xs font-semibold theme-text-primary block">
                        Appearance Mode
                      </label>
                      <p className="text-[11px] theme-text-muted leading-tight">
                        Switch between Aero Porcelain (Day) and Twilight Dusk (Night) tonal roles
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase shrink-0 font-bold border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                      {materialMode === 'dark' ? 'Night' : 'Day'}
                    </span>
                  </div>

                  <div
                    role="group"
                    aria-label="Material appearance mode"
                    className="grid grid-cols-2 p-1 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]"
                  >
                    <button
                      type="button"
                      aria-pressed={materialMode === 'light'}
                      onClick={() => {
                        haptics.tick(900);
                        setMaterialMode('light');
                      }}
                      className={`min-h-[42px] px-3 py-2 rounded-full flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${
                        materialMode === 'light'
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                          : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      <Sun size={14} strokeWidth={2} />
                      <span>Day · Porcelain</span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={materialMode === 'dark'}
                      onClick={() => {
                        haptics.tick(900);
                        setMaterialMode('dark');
                      }}
                      className={`min-h-[42px] px-3 py-2 rounded-full flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${
                        materialMode === 'dark'
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                          : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      <Moon size={14} strokeWidth={2} />
                      <span>Night · Twilight</span>
                    </button>
                  </div>
                </div>

                {/* Material Seed Palette */}
                <div className="space-y-2.5 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <label className="text-xs font-semibold theme-text-primary block">
                        Material Seed Palette
                      </label>
                      <p className="text-[11px] theme-text-muted leading-tight">
                        Adaptive tonal accents calibrated for Porcelain &amp; Twilight surfaces
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase shrink-0 font-bold border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]">
                      {aeroPalette === 'espresso' ? 'Twilight Navy' : aeroPalette === 'terracotta' ? 'Terracotta' : 'Sunset Peach'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'orange', name: 'Sunset Peach', color: '#E69F86', note: 'Warm Peach Seed' },
                      { id: 'espresso', name: 'Twilight Navy', color: '#353B5B', note: 'Deep Indigo Seed' },
                      { id: 'terracotta', name: 'Terracotta', color: '#D87255', note: 'Earthy Clay Seed' },
                    ].map((p) => {
                      const isSelected = aeroPalette === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            haptics.tick(900);
                            setAeroPalette(p.id as any);
                          }}
                          className={`p-2.5 rounded-2xl border text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                              : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/15"
                              style={{ backgroundColor: p.color }}
                            />
                            <span className="text-xs font-bold truncate">
                              {p.name}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] block mt-1 truncate ${
                              isSelected
                                ? 'text-[var(--md-sys-color-on-primary-container)] opacity-80'
                                : 'text-[var(--md-sys-color-on-surface-variant)]'
                            }`}
                          >
                            {p.note}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Display Refresh Rate & Target FPS (24, 30, 60, 90, 120 FPS / Native) */}
            <div className="pt-3 border-t theme-border space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <label className="text-xs font-semibold theme-text-primary block">
                    Display Refresh Rate &amp; Target FPS
                  </label>
                  <p className="text-[11px] theme-text-muted leading-tight">
                    Sync Android SurfaceFlinger &amp; UI frame pacing from 24Hz to 120Hz
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full liquid-pill-active uppercase shrink-0">
                  {targetFps === 0 ? 'Display Sync' : `${targetFps} FPS`}
                </span>
              </div>

              {/* 6 FPS Pill Selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '24 FPS', value: 24, note: 'Cinematic' },
                  { label: '30 FPS', value: 30, note: 'Power Saver' },
                  { label: '60 FPS', value: 60, note: 'Standard' },
                  { label: '90 FPS', value: 90, note: 'High Refresh' },
                  { label: '120 FPS', value: 120, note: 'Flagship' },
                  { label: 'Native', value: 0, note: 'Display Sync' },
                ].map((fpsOption) => {
                  const isActive = targetFps === fpsOption.value;
                  return (
                    <button
                      key={fpsOption.label}
                      type="button"
                      onClick={() => {
                        haptics.tick(isActive ? 500 : 850);
                        setTargetFps(fpsOption.value);
                      }}
                      className={`py-2 px-2 rounded-xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'theme-pill-active font-semibold shadow-md'
                          : 'theme-pill text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold theme-text-primary leading-tight">
                        {fpsOption.label}
                      </span>
                      <span className="text-[9px] theme-text-muted leading-tight mt-0.5">
                        {fpsOption.note}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] theme-text-muted pt-0.5">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      targetFps >= 90 ? 'bg-cyan-400 animate-pulse' : targetFps >= 60 ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {targetFps === 120
                    ? '120Hz Flagship Ultra Smooth Compositing'
                    : targetFps === 90
                    ? '90Hz High-Refresh Motion Pacing'
                    : targetFps === 60
                    ? '60Hz Standard Fluid Performance'
                    : targetFps === 30
                    ? '30Hz Low Power Consumption'
                    : targetFps === 24
                    ? '24Hz LTPO Ultra-Low Thermal Mode'
                    : 'Display Adaptive Sync Mode'}
                </span>
                <span className="font-mono">
                  {targetFps === 0 ? 'SurfaceFlinger Auto' : `${targetFps}Hz Hardware Sync`}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t theme-border flex items-center justify-between text-[11px] theme-text-muted">
              <span>Applies instantaneously — no restart required</span>
              <span className="theme-text-primary font-semibold">Active &amp; Persistent</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: AUTO-PILOT RECURRING SCHEDULES */}
      {effectiveSection === 'schedules' && (
        <div className={isBespoke ? 'space-y-5' : 'space-y-4'}>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs uppercase tracking-wider font-bold ${
                isMaterial ? 'text-[var(--md-sys-color-on-surface)] font-sans font-bold' : isBespoke ? 'font-sans text-zinc-400' : 'font-mono text-zinc-400'
              }`}
            >
              Recurring Schedules (<span className="font-mono tabular-nums">{schedules.length}</span>)
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className={`px-3.5 py-2 font-semibold text-xs flex items-center gap-1.5 cursor-pointer ${
                isMaterial
                  ? 'rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-sans font-semibold active:scale-95 transition-transform'
                  : isBespoke
                  ? 'rounded-md bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 transition-colors duration-75 font-sans'
                  : 'obsidian-pill-active font-mono font-black rounded-xl active:scale-95 transition-all'
              }`}
            >
              <Plus size={14} />
              <span>Add Schedule</span>
            </button>
          </div>

          {/* Schedule List */}
          <div className={isModernFont ? 'space-y-4' : 'space-y-3'}>
            {schedules.map((sched) => (
              <ObsidianCard
                key={sched.id}
                className={`${
                  isMaterial
                    ? 'font-sans'
                    : isModernFont
                    ? 'font-sans'
                    : 'font-mono'
                } ${sched.isEnabled ? '' : 'opacity-65'}`}
                headerClassName={isModernFont ? 'p-5' : 'p-4'}
                footerClassName={
                  isMaterial
                    ? 'px-5 py-3 flex items-center justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-semibold border-t border-[var(--md-sys-color-outline-variant)]'
                    : isBespoke
                    ? 'px-5 py-3 flex items-center justify-between text-[11px] text-zinc-400'
                    : 'px-4 py-2.5 flex items-center justify-between text-[11px] text-zinc-400'
                }
                headerContent={
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className={`font-black text-sm flex items-center gap-2 flex-wrap ${isMaterial ? 'text-[var(--md-sys-color-on-surface)]' : 'text-zinc-100'}`}>
                          <span>{sched.name}</span>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 ${
                              isMaterial
                                ? 'rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] font-semibold'
                                : isBespoke
                                ? 'rounded-sm bg-neutral-950 border border-neutral-800 text-zinc-300'
                                : 'rounded obsidian-inset-neutral text-zinc-300'
                            }`}
                          >
                            #{sched.tag}
                          </span>
                        </div>
                        <div className={`text-xs tabular-nums mt-1 ${isMaterial ? 'font-sans text-[var(--md-sys-color-on-surface-variant)] font-semibold' : 'font-mono text-zinc-400'}`}>
                          {sched.startTime} – {sched.endTime}
                        </div>
                      </div>

                      {/* Mechanical / M3 Switch */}
                      <button
                        onClick={() => onToggleSchedule(sched.id)}
                        aria-label={`Toggle ${sched.name}`}
                        style={
                          isMaterial
                            ? sched.isEnabled
                              ? { backgroundColor: 'var(--md-sys-color-primary)', borderColor: 'var(--md-sys-color-primary)' }
                              : { backgroundColor: 'var(--md-sys-color-surface-container-highest)', borderColor: 'var(--md-sys-color-outline)' }
                            : sched.isEnabled
                            ? isFluentGlass
                              ? {
                                  background: 'var(--accent-primary, #E69F86)',
                                  borderColor: 'rgba(255, 255, 255, 0.45)',
                                  boxShadow: '0 0 12px var(--liquid-accent-soft-glow)',
                                }
                              : isBespoke
                              ? {
                                  backgroundColor: '#2563EB',
                                  borderColor: '#3B82F6',
                                }
                              : {
                                  background:
                                    'var(--accent-badge-gradient, linear-gradient(135deg, #FFFFFF 0%, #D4D4D8 100%))',
                                  borderColor: 'rgba(var(--accent-rgb, 255, 255, 255), 0.75)',
                                }
                            : undefined
                        }
                        className={`relative border shrink-0 toggle-track ${
                          isMaterial
                            ? 'w-12 h-6 rounded-full transition-colors'
                            : isBespoke
                            ? `w-11 h-6 rounded-sm transition-colors duration-75 ${
                                sched.isEnabled
                                  ? ''
                                  : 'bg-neutral-950 border-neutral-700'
                              }`
                            : isFluentGlass
                            ? `w-12 h-6 rounded-full transition-colors ${
                                sched.isEnabled
                                  ? ''
                                  : 'liquid-track'
                              }`
                            : `w-12 h-6 rounded-full transition-colors ${
                                sched.isEnabled
                                  ? ''
                                  : 'obsidian-inset-neutral'
                              }`
                        }`}
                      >
                        <div
                          style={
                            isMaterial
                              ? { backgroundColor: sched.isEnabled ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)' }
                              : sched.isEnabled
                              ? {
                                  backgroundColor: isBespoke || isFluentGlass
                                    ? '#FFFFFF'
                                    : 'var(--accent-badge-text, #09090B)',
                                }
                              : undefined
                          }
                          className={`w-4 h-4 transform toggle-thumb ${
                            isMaterial
                              ? `rounded-full transition-transform ${
                                  sched.isEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`
                              : isBespoke
                              ? `rounded-sm transition-transform duration-75 ${
                                  sched.isEnabled
                                    ? 'translate-x-5'
                                    : 'translate-x-1 bg-neutral-500'
                                }`
                              : `rounded-full transition-transform ${
                                  sched.isEnabled
                                    ? 'translate-x-6'
                                    : 'translate-x-1 bg-zinc-500'
                                }`
                          }`}
                        />
                      </button>
                    </div>

                    {/* Days of Week Indicators */}
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {DAYS_OF_WEEK.map((day, idx) => (
                        <span
                          key={day}
                          className={`text-[10px] px-2.5 py-0.5 ${
                            isMaterial
                              ? `rounded-full font-sans font-semibold ${
                                  sched.days.includes(idx)
                                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]'
                                    : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
                                }`
                              : isFluentGlass
                              ? `rounded-full font-sans font-semibold ${
                                  sched.days.includes(idx)
                                    ? 'liquid-pill-active'
                                    : 'liquid-pill-inactive'
                                }`
                              : isBespoke
                              ? `rounded-sm font-sans font-semibold border ${
                                  sched.days.includes(idx)
                                    ? 'bg-blue-600 text-white border-blue-500'
                                    : 'bg-neutral-950 text-neutral-500 border-neutral-800'
                                }`
                              : `rounded-md font-mono ${
                                  sched.days.includes(idx)
                                    ? 'obsidian-pill-active font-black'
                                    : 'obsidian-inset-neutral text-zinc-500'
                                }`
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>

                    {/* Burn the Boats Option Switch / Badge */}
                    {(() => {
                      const schedDurationMins = getScheduleDurationMinutes(sched.startTime, sched.endTime);
                      const isOverMaxBurn = schedDurationMins > 240;
                      return (
                        <div className={`pt-2 mt-2 flex items-center justify-between gap-2 flex-wrap border-t ${isMaterial ? 'border-[var(--md-sys-color-outline-variant)]' : 'border-white/5'}`}>
                          <button
                            type="button"
                            disabled={isOverMaxBurn}
                            onClick={() => {
                              if (isOverMaxBurn) return;
                              const res = onToggleScheduleBurnTheBoats?.(sched.id);
                              if (res && !res.ok && res.message) {
                                setScheduleNotice({ id: sched.id, message: res.message });
                                setTimeout(() => setScheduleNotice(null), 3500);
                              }
                            }}
                            title={
                              isOverMaxBurn
                                ? 'Burn the Boats is limited to routines ≤ 4 hours (240 min)'
                                : sched.burnTheBoats
                                ? 'Burn the Boats is active: Escape tickets are strictly disabled during this block'
                                : 'Enable Burn the Boats to strictly disable escape tickets for this routine (Max 4h)'
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] transition-all rounded-lg cursor-pointer ${
                              isOverMaxBurn
                                ? 'opacity-40 cursor-not-allowed theme-bg-secondary theme-text-muted border theme-border'
                                : sched.burnTheBoats
                                ? isMaterial
                                  ? 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] border border-[var(--md-sys-color-tertiary)] font-bold'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-xs'
                                : isMaterial
                                ? 'bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)] font-semibold'
                                : 'obsidian-inset-neutral hover:text-zinc-200 text-zinc-400 font-medium'
                            }`}
                          >
                            <Flame
                              size={12}
                              className={`shrink-0 ${
                                sched.burnTheBoats
                                  ? isMaterial
                                    ? 'text-[var(--md-sys-color-on-tertiary-container)]'
                                    : 'text-amber-400'
                                  : 'text-zinc-500'
                              }`}
                            />
                            <span>
                              Burn Boats: {sched.burnTheBoats ? 'Active (Strict No-Escape)' : 'Off (Max 4h)'}
                            </span>
                          </button>

                          {sched.burnTheBoats && (
                            <span
                              className={`text-[10px] font-mono ${
                                isMaterial ? 'text-[var(--md-sys-color-tertiary)] font-semibold' : 'text-amber-400/90'
                              }`}
                            >
                              Escape Tickets Disabled
                            </span>
                          )}

                          {scheduleNotice?.id === sched.id && (
                            <div className="w-full text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md font-sans">
                              {scheduleNotice.message}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                }
                footerContent={
                  <>
                    <div className={`flex items-center gap-1.5 ${isMaterial ? 'text-[var(--md-sys-color-on-surface-variant)]' : 'text-zinc-300'}`}>
                      <Bell
                        size={12}
                        className={isMaterial ? 'shrink-0 text-[var(--md-sys-color-primary)]' : isBespoke ? 'shrink-0 text-blue-500' : 'shrink-0'}
                        style={isBespoke || isMaterial ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      />
                      <span>5-min heads-up alert enabled</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onTriggerTestWarning(sched.name)}
                        className={`text-[10px] underline ${isMaterial ? 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]' : 'text-zinc-300 hover:text-white'}`}
                        title="Simulates 5-minute pre-lock heads-up warning notification"
                      >
                        Test Warning
                      </button>
                      <button
                        onClick={() => onDeleteSchedule(sched.id)}
                        className={`${isMaterial ? 'text-[var(--md-sys-color-error)] hover:opacity-80' : 'text-red-400 hover:text-red-300'} p-1`}
                        aria-label={`Delete ${sched.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: BACKUP & RESTORE EVERYTHING, DISCIPLINE RULES & PROFILE */}
      {effectiveSection === 'settings' && (
        <div className={isBespoke ? 'space-y-5' : 'space-y-4'}>
          {/* CONSOLIDATED CARD #1: BACKUP & RESTORE EVERYTHING */}
          <ObsidianCard
            ambientGlow={!isBespoke}
            className={isModernFont ? 'font-sans' : 'font-mono'}
            headerClassName={isModernFont ? 'p-5 space-y-4' : 'p-4 space-y-3.5'}
            footerClassName={
              isModernFont
                ? 'px-5 py-3 text-[11px] text-zinc-400 leading-relaxed flex items-center justify-between gap-2 flex-wrap'
                : 'px-4 py-2.5 text-[10px] text-zinc-400 leading-relaxed flex items-center justify-between gap-2 flex-wrap'
            }
            headerContent={
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={
                        isFluentGlass
                          ? 'liquid-squircle text-cyan-200'
                          : `w-9 h-9 obsidian-icon-box flex items-center justify-center shrink-0 ${
                              isBespoke ? 'rounded-md text-blue-500' : 'rounded-xl'
                            }`
                      }
                    >
                      <HardDrive
                        size={16}
                        strokeWidth={1.75}
                        style={isModernFont ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white font-semibold uppercase tracking-wider">
                        Backup and Restore Everything
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        Our stats, Escape Tickets, donor perks &amp; config (.zbak)
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 border shrink-0 ${
                      isBespoke ? 'rounded-sm' : 'rounded-full font-black'
                    } ${
                      cloudBackupStatus?.enabled
                        ? isBespoke
                          ? 'bg-blue-600/15 border-blue-500/60 text-blue-300'
                          : 'obsidian-pill-active'
                        : 'obsidian-inset-neutral text-zinc-300'
                    }`}
                  >
                    {cloudBackupStatus?.enabled ? 'Auto-Sync ON' : 'Manual'}
                  </span>
                </div>

                {/* Compact Sync & Upload Status */}
                <div
                  className={`p-3 obsidian-inset-neutral space-y-1.5 text-[11px] ${
                    isBespoke ? 'rounded-md bg-neutral-950 border border-neutral-800' : 'rounded-xl text-[10px]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400">Storage Auto-Sync:</span>
                    <span className="text-white font-semibold truncate font-mono">
                      {cloudBackupStatus?.enabled
                        ? `${cloudBackupStatus.providerLabel || 'Device Storage'} • ${
                            cloudBackupStatus.displayName || 'zero-backup.zbak'
                          }`
                        : 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400">Last Saved:</span>
                    <span className="text-zinc-200 font-semibold truncate font-mono tabular-nums">
                      {cloudBackupStatus?.lastBackupTimestamp &&
                      cloudBackupStatus.lastBackupTimestamp > 0
                        ? new Date(cloudBackupStatus.lastBackupTimestamp).toLocaleString()
                        : 'Not saved yet'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400">Last Cloud Upload:</span>
                    <span className="text-zinc-200 font-semibold truncate font-mono tabular-nums">
                      {lastCloudUploadTimestamp && lastCloudUploadTimestamp > 0
                        ? new Date(lastCloudUploadTimestamp).toLocaleString()
                        : 'Not uploaded yet'}
                    </span>
                  </div>
                </div>

                {cloudBackupStatus?.lastError && (
                  <div
                    className={`p-2.5 bg-red-950/50 border border-red-700/80 text-red-200 text-[11px] ${
                      isBespoke ? 'rounded-md' : 'rounded-xl text-[10px]'
                    }`}
                  >
                    {cloudBackupStatus.lastError}
                  </div>
                )}

                {restoreDisabled && (
                  <div
                    className={`p-2.5 bg-red-950/50 border border-red-700/80 text-red-200 text-[11px] leading-relaxed flex items-start gap-2 ${
                      isBespoke ? 'rounded-md' : 'rounded-xl text-[10px]'
                    }`}
                  >
                    <ShieldAlert size={13} className="text-red-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Integrity Protection Active:</strong> Root access, custom test-keys ROM, or debug emulator detected. Backup restore is disabled; saves and uploads remain active.
                    </span>
                  </div>
                )}

                {(cloudNotice || backupNotice) && (
                  <div
                    className={`p-2.5 text-[11px] border ${
                      isBespoke ? 'rounded-md' : 'rounded-xl'
                    } ${
                      (cloudNotice || backupNotice)!.ok
                        ? isBespoke
                          ? 'bg-neutral-950 border-blue-500/60 text-blue-300'
                          : 'obsidian-inset text-zinc-100'
                        : 'bg-red-950/50 border-red-700 text-red-200'
                    }`}
                    style={
                      !isBespoke && (cloudNotice || backupNotice)!.ok
                        ? { color: 'var(--accent-hex, #FFFFFF)' }
                        : undefined
                    }
                  >
                    {(cloudNotice || backupNotice)!.message}
                  </div>
                )}

                {/* 1. Create Auto-Sync File in Storage */}
                {onEnableCloudAutoBackup && (
                  <>
                    {!cloudBackupStatus?.enabled ? (
                      <button
                        type="button"
                        disabled={isCloudBusy}
                        onClick={async () => {
                          setBackupNotice(null);
                          const res = await onEnableCloudAutoBackup();
                          if (!res.cancelled) {
                            setCloudNotice({ ok: res.ok, message: res.message });
                          }
                        }}
                        className={`w-full py-2.5 px-3 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60 ${
                          isBespoke
                            ? 'rounded-md bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white transition-colors duration-75'
                            : 'rounded-xl obsidian-pill-active font-black active:scale-95 transition-all'
                        }`}
                      >
                        {isCloudBusy ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <HardDrive size={14} />
                        )}
                        <span>Create Auto-Sync File in Storage</span>
                      </button>
                    ) : (
                      <div
                        className={`p-2.5 border flex items-center justify-between gap-2 ${
                          isBespoke
                            ? 'rounded-md bg-neutral-950 border-neutral-800'
                            : 'rounded-xl obsidian-inset-neutral'
                        }`}
                      >
                        <div className="min-w-0">
                          <div
                            className={`text-[11px] font-semibold truncate ${
                              isBespoke ? 'text-blue-400' : ''
                            }`}
                            style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                          >
                            Auto-Sync Linked
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate font-mono">
                            {cloudBackupStatus.displayName || 'zero-backup.zbak'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={isCloudBusy}
                            onClick={async () => {
                              setBackupNotice(null);
                              const res = await onEnableCloudAutoBackup();
                              if (!res.cancelled) {
                                setCloudNotice({ ok: res.ok, message: res.message });
                              }
                            }}
                            className={`py-1.5 px-2.5 obsidian-inset-neutral hover:border-white/30 text-white font-semibold text-[10px] uppercase ${
                              isBespoke ? 'rounded-md transition-colors duration-75' : 'rounded-lg font-bold'
                            }`}
                          >
                            Change File
                          </button>
                          {onDisableCloudAutoBackup && (
                            <button
                              type="button"
                              disabled={isCloudBusy}
                              onClick={async () => {
                                setBackupNotice(null);
                                await onDisableCloudAutoBackup();
                                setCloudNotice({
                                  ok: true,
                                  message: 'Auto-sync storage file unlinked.',
                                });
                              }}
                              className={`py-1.5 px-2.5 bg-zinc-950 border border-red-900/70 text-red-400 hover:text-red-300 font-semibold text-[10px] uppercase ${
                                isBespoke ? 'rounded-md transition-colors duration-75' : 'rounded-lg font-bold'
                              }`}
                            >
                              Turn Off
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 2 & 3. One-Tap Save + Restore Data Picker */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isCloudBusy}
                    onClick={async () => {
                      setCloudNotice(null);
                      if (onOneTapSaveBackup) {
                        const res = await onOneTapSaveBackup();
                        setBackupNotice({ ok: res.ok, message: res.message });
                      } else if (onExportZbakData) {
                        onExportZbakData();
                        setBackupNotice({
                          ok: true,
                          message: 'Saved zero-backup.zbak to storage.',
                        });
                      }
                    }}
                    className={`p-2.5 font-semibold flex items-center justify-center gap-1.5 text-[11px] disabled:opacity-60 ${
                      isBespoke
                        ? 'rounded-md bg-neutral-950 border border-neutral-800 hover:border-neutral-600 text-neutral-100 transition-colors duration-75'
                        : 'rounded-xl obsidian-inset-neutral hover:border-white/25 text-white font-bold active:scale-95 transition-all'
                    }`}
                  >
                    <Save
                      size={13}
                      style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      className={isBespoke ? 'text-blue-400' : undefined}
                    />
                    <span>One-Tap Save</span>
                  </button>

                  {onRestoreFromCloudPicker && (
                    <button
                      type="button"
                      disabled={isCloudBusy || restoreDisabled}
                      onClick={async () => {
                        setCloudNotice(null);
                        const res = await onRestoreFromCloudPicker();
                        if (res.ok) {
                          setBackupNotice({ ok: true, message: res.message });
                          onRestoreSuccess?.();
                        } else if (!res.cancelled) {
                          setBackupNotice({ ok: false, message: res.message });
                        }
                      }}
                      className={`p-2.5 font-semibold flex items-center justify-center gap-1.5 text-[11px] disabled:opacity-45 disabled:cursor-not-allowed ${
                        isBespoke
                          ? 'rounded-md bg-neutral-950 border border-neutral-800 hover:border-neutral-600 text-neutral-100 transition-colors duration-75'
                          : 'rounded-xl obsidian-inset text-white font-bold active:scale-95 transition-all'
                      }`}
                    >
                      <Upload
                        size={13}
                        style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                        className={isBespoke ? 'text-blue-400' : undefined}
                      />
                      <span>Restore Data Picker</span>
                    </button>
                  )}
                </div>

                {/* 4. Upload Stats to Cloud (opens chosen cloud app) */}
                {onOneTapCloudUpload && (
                  <button
                    type="button"
                    disabled={isCloudBusy}
                    onClick={async () => {
                      setBackupNotice(null);
                      const res = await onOneTapCloudUpload();
                      if (!res.cancelled) {
                        setCloudNotice({ ok: res.ok, message: res.message });
                      }
                    }}
                    className={`w-full py-2.5 px-3 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-60 ${
                      isBespoke
                        ? 'rounded-md bg-neutral-950 border border-neutral-800 hover:border-blue-500 text-neutral-100 transition-colors duration-75'
                        : 'rounded-xl obsidian-inset hover:border-white/30 text-white font-black active:scale-95 transition-all'
                    }`}
                  >
                    {isCloudBusy ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CloudUpload
                        size={14}
                        style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                        className={isBespoke ? 'text-blue-400' : undefined}
                      />
                    )}
                    <span>Upload Stats to Cloud</span>
                  </button>
                )}

                {/* Cloud Upload Reminder Timer (1 Week / 1 Month / Off) */}
                {onCloudReminderIntervalChange && (
                  <div
                    className={`p-3 border space-y-2.5 ${
                      isBespoke
                        ? 'rounded-md bg-neutral-950 border-neutral-800'
                        : 'rounded-xl obsidian-inset-neutral'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white uppercase tracking-wider">
                        <Bell
                          size={12}
                          style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                          className={isBespoke ? 'text-blue-400' : undefined}
                        />
                        <span>Cloud Upload Reminder</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono tabular-nums ${
                          nextCloudReminderInfo?.isDue
                            ? isBespoke
                              ? 'text-blue-400 font-semibold'
                              : 'font-bold'
                            : 'text-zinc-400'
                        }`}
                        style={
                          nextCloudReminderInfo?.isDue && !isBespoke
                            ? { color: 'var(--accent-hex, #FFFFFF)' }
                            : undefined
                        }
                      >
                        {formatCloudReminderCountdown(
                          cloudReminderInterval,
                          nextCloudReminderInfo,
                          lastCloudUploadTimestamp
                        )}
                      </span>
                    </div>

                    <div
                      role="radiogroup"
                      aria-label="Cloud Upload Reminder Timer"
                      className="grid grid-cols-3 gap-1.5"
                    >
                      {REMINDER_OPTIONS.map((opt) => {
                        const selected = cloudReminderInterval === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onCloudReminderIntervalChange(opt.id)}
                            className={`py-2 px-2 text-[11px] font-semibold ${
                              isBespoke
                                ? `rounded-md border transition-colors duration-75 ${
                                    selected
                                      ? 'bg-blue-600 border-blue-500 text-white'
                                      : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
                                  }`
                                : `rounded-lg transition-all ${
                                    selected
                                      ? 'obsidian-pill-active font-black'
                                      : 'bg-black/50 border border-white/10 text-zinc-400 hover:text-white'
                                  }`
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Subtle Bottom Reset Divider */}
                <div
                  className={`pt-2 border-t ${
                    isBespoke ? 'border-neutral-800' : 'border-white/10'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          'Reset all Zero data to factory defaults? This clears your Escape Tickets, bags, and streaks.'
                        )
                      ) {
                        setCloudNotice(null);
                        onResetData();
                        setBackupNotice({ ok: true, message: 'All data reset cleanly to Zero.' });
                      }
                    }}
                    className={`w-full py-2 px-3 bg-black/75 border border-red-950/90 hover:border-red-700 text-red-400 hover:text-red-300 flex items-center justify-center gap-2 text-[11px] font-medium ${
                      isBespoke
                        ? 'rounded-md transition-colors duration-75'
                        : 'rounded-xl transition-colors'
                    }`}
                  >
                    <RotateCcw size={12} />
                    <span>Factory Reset App State</span>
                  </button>
                </div>
              </>
            }
            footerContent={
              <>
                <span>
                  Our stats, Escape Tickets &amp; donor perks &mdash; zero telemetry.
                </span>
                <span className="font-semibold text-zinc-300 font-mono">SHA-256 .ZBAK</span>
              </>
            }
          />

          {/* CARD #2: ANTI-SLEEP-FARMING RULE CARD */}
          <ObsidianCard
            ambientGlow={!isBespoke}
            className={isModernFont ? 'font-sans' : 'font-mono'}
            headerClassName="p-5 space-y-3.5"
            footerClassName="px-5 py-3 text-[11px] text-zinc-400 leading-relaxed"
            headerContent={
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
                    <div
                      className={
                        isFluentGlass
                          ? 'liquid-squircle text-cyan-200'
                          : `w-7 h-7 obsidian-icon-box flex items-center justify-center shrink-0 ${
                              isBespoke ? 'rounded-md text-blue-500' : 'rounded-xl'
                            }`
                      }
                    >
                      <Moon
                        size={15}
                        strokeWidth={1.75}
                        style={isModernFont ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      />
                    </div>
                    <span>ANTI-SLEEP-FARMING RULE</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 obsidian-inset text-white font-semibold ${
                      isBespoke ? 'rounded-sm' : 'rounded-full font-bold'
                    }`}
                  >
                    Integrity
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                    Select Escape Ticket Rate for #Sleep:
                  </label>

                  {/* Option 1: 0.25x Credit (Recommended) */}
                  <button
                    type="button"
                    onClick={() => onSleepFarmingModeChange('quarter_credit')}
                    className={`w-full p-3.5 text-left text-xs flex items-start justify-between ${
                      isBespoke
                        ? `rounded-md transition-colors duration-75 ${
                            sleepFarmingMode === 'quarter_credit'
                              ? 'bg-neutral-950 border border-blue-500 text-white'
                              : 'bg-black border border-neutral-800 text-neutral-400 hover:border-neutral-600'
                          }`
                        : `rounded-2xl transition-all ${
                            sleepFarmingMode === 'quarter_credit'
                              ? 'obsidian-inset text-white'
                              : 'obsidian-inset-neutral text-zinc-400 hover:border-white/25'
                          }`
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-2 text-zinc-100">
                        <span>
                          <span className="font-mono tabular-nums">0.25x</span> Sleep Ticket Credit
                        </span>
                        <span
                          className={`text-[9px] obsidian-pill-active px-1.5 py-0.5 uppercase ${
                            isBespoke ? 'rounded-sm font-semibold' : 'rounded font-black'
                          }`}
                        >
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        An 8-hour sleep session earns 2.0 hours towards the 20h Escape Ticket milestone. Keeps rewards meaningful.
                      </p>
                    </div>
                    {sleepFarmingMode === 'quarter_credit' && (
                      <Check
                        size={16}
                        style={{ color: 'var(--accent-hex, #FFFFFF)' }}
                        className="shrink-0 mt-0.5"
                      />
                    )}
                  </button>

                  {/* Option 2: Daytime Hours Only (0.0x Sleep) */}
                  <button
                    type="button"
                    onClick={() => onSleepFarmingModeChange('daytime_only')}
                    className={`w-full p-3.5 text-left text-xs flex items-start justify-between ${
                      isBespoke
                        ? `rounded-md transition-colors duration-75 ${
                            sleepFarmingMode === 'daytime_only'
                              ? 'bg-neutral-950 border border-blue-500 text-white'
                              : 'bg-black border border-neutral-800 text-neutral-400 hover:border-neutral-600'
                          }`
                        : `rounded-2xl transition-all ${
                            sleepFarmingMode === 'daytime_only'
                              ? 'obsidian-inset text-white'
                              : 'obsidian-inset-neutral text-zinc-400 hover:border-white/25'
                          }`
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-zinc-100">
                        Daytime Focus Only (<span className="font-mono tabular-nums">0.0x</span> Sleep Credit)
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Escape Tickets can only be earned during daytime waking hours. Sleep blocks still track total reclaimed time, but 0h toward Escape Tickets.
                      </p>
                    </div>
                    {sleepFarmingMode === 'daytime_only' && (
                      <Check
                        size={16}
                        style={{ color: 'var(--accent-hex, #FFFFFF)' }}
                        className="shrink-0 mt-0.5"
                      />
                    )}
                  </button>

                  {/* Option 3: Full Credit (1.0x) */}
                  <button
                    type="button"
                    onClick={() => onSleepFarmingModeChange('full_credit')}
                    className={`w-full p-3.5 text-left text-xs flex items-start justify-between ${
                      isBespoke
                        ? `rounded-md transition-colors duration-75 ${
                            sleepFarmingMode === 'full_credit'
                              ? 'bg-neutral-950 border border-blue-500 text-white'
                              : 'bg-black border border-neutral-800 text-neutral-400 hover:border-neutral-600'
                          }`
                        : `rounded-2xl transition-all ${
                            sleepFarmingMode === 'full_credit'
                              ? 'obsidian-inset text-white'
                              : 'obsidian-inset-neutral text-zinc-400 hover:border-white/25'
                          }`
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-zinc-100">
                        Full <span className="font-mono tabular-nums">1.0x</span> Credit (Relaxed)
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Every hour locked (day or night) counts 1:1 toward emergency escape tickets.
                      </p>
                    </div>
                    {sleepFarmingMode === 'full_credit' && (
                      <Check
                        size={16}
                        style={{ color: 'var(--accent-hex, #FFFFFF)' }}
                        className="shrink-0 mt-0.5"
                      />
                    )}
                  </button>
                </div>
              </>
            }
            footerContent={
              <p>
                Prevents farming a free Emergency Escape Ticket every 2.5 nights overnight without resisting waking temptation.
              </p>
            }
          />

          {/* CARD #3: ANDROID QUICK SETTINGS TILE // 1-TAP ENGAGE */}
          <ObsidianCard
            ambientGlow={!isBespoke}
            className={isModernFont ? 'font-sans' : 'font-mono'}
            headerClassName="p-5 space-y-4"
            footerClassName="px-5 py-3 text-[11px] text-zinc-400 leading-relaxed"
            headerContent={
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
                    <div
                      className={
                        isFluentGlass
                          ? 'liquid-squircle text-cyan-200'
                          : `w-7 h-7 obsidian-icon-box flex items-center justify-center shrink-0 ${
                              isBespoke ? 'rounded-md text-blue-500' : 'rounded-xl'
                            }`
                      }
                    >
                      <Zap
                        size={15}
                        strokeWidth={1.75}
                        style={isModernFont ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      />
                    </div>
                    <span>QUICK SETTINGS TILE // 1-TAP ENGAGE</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 obsidian-inset text-white font-semibold ${
                      isBespoke ? 'rounded-sm' : 'rounded-full font-bold'
                    }`}
                  >
                    OS Shade
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Ignite your focus lock instantly directly from your Android notification drawer with one tap, without touching or scrolling the dial.
                </p>

                {/* Live Preview Box */}
                <div className={`p-3.5 obsidian-inset-neutral flex items-center justify-between gap-3 ${isBespoke ? 'rounded-md' : 'rounded-xl'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <Zap size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                        <span>ZERO: Engage</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">Tile Preview</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {Math.floor(qsDuration / 60)}m • #{qsTag}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shrink-0">
                    Tile Armed
                  </span>
                </div>

                {/* Duration Picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                    Default Tile Duration:
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { label: '15m', secs: 15 * 60 },
                      { label: '25m', secs: 25 * 60 },
                      { label: '45m', secs: 45 * 60 },
                      { label: '1h', secs: 60 * 60 },
                      { label: '2h', secs: 120 * 60 },
                    ].map((pill) => (
                      <button
                        key={pill.label}
                        type="button"
                        onClick={() => {
                          haptics.tick(600);
                          handleUpdateQsConfig(pill.secs, qsTag);
                        }}
                        className={`py-1.5 text-xs font-semibold text-center transition-all ${
                          isBespoke ? 'rounded-sm' : 'rounded-lg'
                        } ${
                          qsDuration === pill.secs
                            ? 'obsidian-pill-active font-black shadow-sm'
                            : 'obsidian-inset-neutral text-zinc-400 hover:text-white'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                    Default Session Tag:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Deep Work', 'Study', 'Coding', 'Exams', 'Detox'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          haptics.tick(600);
                          handleUpdateQsConfig(qsDuration, tag);
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold transition-all ${
                          isBespoke ? 'rounded-sm' : 'rounded-lg'
                        } ${
                          qsTag === tag
                            ? 'obsidian-pill-active font-black'
                            : 'obsidian-inset-neutral text-zinc-400 hover:text-white'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            }
            footerContent={
              <div className="space-y-1">
                <span className="font-semibold text-white">How to add to Quick Settings:</span>
                <p>
                  Swipe down twice from top of screen → Tap the pencil (Edit) icon → Find <strong className="text-white">ZERO: Engage</strong> in Available Tiles → Drag it into your active Quick Settings drawer.
                </p>
              </div>
            }
          />

          {/* CARD #4: ABORTED SESSION PENALTY EXPLANATION */}
          <ObsidianCard
            accentOverride={{ hex: '#EF4444', rgb: '239, 68, 68' }}
            className={`${isBespoke ? 'font-sans' : 'font-mono'} text-xs`}
            headerClassName={isBespoke ? 'p-5 space-y-2' : 'p-4 space-y-2'}
            footerClassName={isBespoke ? 'px-5 py-3 text-[11px] text-zinc-300 leading-relaxed' : 'px-4 py-2.5 text-[11px] text-zinc-300 leading-relaxed'}
            headerContent={
              <>
                <div className="flex items-center gap-2 text-zinc-200 font-semibold uppercase tracking-wider">
                  <ShieldAlert size={14} className="text-red-400 shrink-0" />
                  <span>Aborted Session Penalty (Anti-Exploit)</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  Using an Emergency Escape Ticket forfeits all accumulated hours in that specific broken session toward the 35-hour meter.
                </p>
              </>
            }
            footerContent={
              <div>
                <strong className="text-white">Example:</strong> If you set a 4-hour lock and use an escape ticket at hour 3, you spend 1 Escape Ticket and receive <strong className="text-red-300">0 hours</strong> toward your next one.
              </div>
            }
          />

          {/* CARD: Habit Calibration Profile */}
          <ObsidianCard
            className={isBespoke ? 'font-sans' : 'font-mono'}
            headerClassName={isBespoke ? 'p-5 space-y-3.5' : 'p-4 space-y-3'}
            footerClassName={isBespoke ? 'px-5 py-2.5 flex items-center justify-between text-[11px] text-zinc-400' : 'px-4 py-2 flex items-center justify-between text-[10px] text-zinc-400'}
            headerContent={
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-100 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Target
                      size={14}
                      className={isBespoke ? 'text-blue-500' : undefined}
                      style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                    />
                    <span>Habit Calibration Profile</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">5 Questions</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Recalibrate your primary focus goal, distraction triggers, friction delay, vulnerability window, and daily reclaim target.
                </p>
                {onRecalibrateHabitProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tick(900);
                      onRecalibrateHabitProfile();
                    }}
                    className={`w-full py-2.5 px-3 obsidian-pill-active font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                      isBespoke
                        ? 'rounded-md transition-colors duration-75'
                        : 'rounded-xl font-black active:scale-95 transition-all'
                    }`}
                  >
                    <Sliders size={14} />
                    <span>Re-calibrate Habit Profile</span>
                  </button>
                )}
              </>
            }
            footerContent={
              <span>Tunes recommended routines and friction engine</span>
            }
          />

          {/* CARD #5: Interactive Profile Card */}
          {onOpenProfileModal && (
            <ObsidianCard
              className={isBespoke ? 'font-sans' : 'font-mono'}
              headerClassName={isBespoke ? 'p-5 space-y-3.5' : 'p-4 space-y-3'}
              footerClassName={isBespoke ? 'px-5 py-2.5 flex items-center justify-between gap-2 text-[11px] text-zinc-400' : 'px-4 py-2 flex items-center justify-between gap-2 text-[10px] text-zinc-400'}
              headerContent={
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-100 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus
                        size={14}
                        className={isBespoke ? 'text-blue-500' : undefined}
                        style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      />
                      <span>Interactive Zero Profile</span>
                    </span>
                    {!hasClaimedFirstTimeParachute && (
                      <span
                        className={`text-[9px] font-semibold uppercase px-2 py-0.5 inline-flex items-center gap-1 ${
                          isFluentGlass
                            ? 'liquid-pill-active rounded-full font-bold'
                            : `obsidian-pill-active ${isBespoke ? 'rounded-sm' : 'rounded-full font-black'}`
                        }`}
                      >
                        {isFluentGlass ? (
                          <>
                            <span>+1 Free</span>
                            <Ticket size={11} strokeWidth={1.75} />
                            <span>Gift</span>
                          </>
                        ) : (
                          <span>+1 Free Ticket Gift</span>
                        )}
                      </span>
                    )}
                  </div>

                  {profile ? (
                    <div
                      className={`flex items-center justify-between gap-3 p-3 obsidian-inset-neutral ${
                        isBespoke ? 'rounded-md' : 'rounded-xl'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ProfileAvatar
                          avatarId={profile.avatarId}
                          accent={profile.accentColor}
                          size="sm"
                          interactive={!isBespoke}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-white truncate">
                              {profile.displayName} ({profile.handle})
                            </span>
                            {supporterBadgeUnlocked && <ZeroSupporterGoldenBadge compact />}
                          </div>
                          <div
                            className={`text-[11px] truncate ${isBespoke ? 'text-blue-400' : ''}`}
                            style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                          >
                            #{profile.primaryMission} •{' '}
                            <span className="font-mono tabular-nums">{profile.dailyGoalHours}h</span>/day target
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenProfileModal}
                        className={`px-3 py-1.5 bg-zinc-900 border border-white/15 hover:border-white/30 text-[11px] font-semibold text-white shrink-0 ${
                          isBespoke ? 'rounded-md border-neutral-800 bg-neutral-950 transition-colors duration-75' : 'rounded-lg font-bold'
                        }`}
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenProfileModal}
                      className={`w-full py-2.5 px-3 obsidian-pill-active font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                        isBespoke
                          ? 'rounded-md transition-colors duration-75'
                          : 'rounded-xl font-black active:scale-95 transition-all'
                      }`}
                    >
                      <Sparkles size={14} strokeWidth={1.75} />
                      <span>
                        {hasClaimedFirstTimeParachute
                          ? 'Create Interactive Profile'
                          : isFluentGlass
                          ? 'Make Profile & Claim +1 Free Ticket'
                          : 'Make Profile & Claim +1 Free Ticket'}
                      </span>
                    </button>
                  )}
                </>
              }
              footerContent={
                profile ? (
                  <>
                    <span className="text-zinc-400">Daily Focus Target</span>
                    <span className="shrink-0 font-mono tabular-nums">{profile.dailyGoalHours}h/day</span>
                  </>
                ) : (
                  <span>Customize your callsign, emblem SVG &amp; daily lock goal</span>
                )
              }
            />
          )}

          {/* CARD #6: Theme Studio Launcher */}
          <ObsidianCard
            asButton
            onClick={() => setActiveSection('themes')}
            className={isModernFont ? 'font-sans' : 'font-mono'}
            headerClassName={isModernFont ? 'p-5 flex items-center justify-between gap-3' : 'p-4 flex items-center justify-between gap-3'}
            footerClassName={isModernFont ? 'px-5 py-2.5 flex items-center justify-between text-[11px] text-zinc-400' : 'px-4 py-2 flex items-center justify-between text-[11px] text-zinc-400'}
            headerContent={
              <>
                <div className="flex items-center gap-2.5 text-xs text-zinc-100 font-semibold uppercase tracking-wider">
                  <div
                    className={
                      isFluentGlass
                        ? 'liquid-squircle text-cyan-200'
                        : `w-8 h-8 obsidian-icon-box flex items-center justify-center shrink-0 ${
                            isBespoke ? 'rounded-md text-blue-500' : 'rounded-xl'
                          }`
                    }
                  >
                    <Palette
                      size={15}
                      strokeWidth={1.75}
                      style={isModernFont ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                    />
                  </div>
                  <span>Theme Studio &amp; Interface Style</span>
                </div>
                <span
                  className={`px-2.5 py-1.5 obsidian-inset text-[10px] font-semibold text-white uppercase shrink-0 ${
                    isBespoke ? 'rounded-md' : 'rounded-xl font-bold'
                  }`}
                >
                  Customize &rarr;
                </span>
              </>
            }
            footerContent={
              <>
                <span>
                  {isMaterial
                    ? `Material Dusk (${materialMode === 'dark' ? 'Night' : 'Day'})`
                    : 'Fluent Glass'}
                </span>
                <strong className="theme-text-primary uppercase font-sans">
                  {isMaterial
                    ? `${aeroPalette === 'espresso' ? 'Twilight Navy' : aeroPalette === 'terracotta' ? 'Terracotta' : 'Sunset Peach'} Seed`
                    : `${AMOLED_ACCENTS.find((a) => a.id === accent)?.name ?? 'Rose Coral'} AMOLED`}
                </strong>
              </>
            }
          />

          {/* CARD #6.4: COMPULSORY STUDY & ONLINE CLASS APPS (TOGGLEABLE, AUTO-SCAN + MANUAL VERIFY) */}
          <CompulsoryStudyAppsCard />

          {/* CARD #6.5: ZEROTUBE STUDY PLAYER & DETERMINISTIC CHANNEL WHITELIST STUDIO */}
          <ZeroTubeSettingsCard
            isBespoke={isBespoke}
            isFluentGlass={isFluentGlass}
            isModernFont={isModernFont}
            onOpenZeroTubePlayer={(videoId) => {
              setSelectedZeroTubeVideoId(videoId);
              setShowZeroTubeModal(true);
            }}
          />

          {/* CARD #6.6: MOVEMENT & ACTION REMINDERS (WORKOUT NUDGES) */}
          <ActionRemindersSettingsCard />

          {/* CARD #7: DONOR PERKS & BADGES */}
          <DonorPerksBadgesCard
            isZeroSupporter={supporterBadgeUnlocked}
            isDeveloper={isDeveloper}
            hasClaimedFirstDonationParachute={hasClaimedFirstDonationParachute}
            remainingEscapeTickets={remainingEscapeTickets}
            cloudAutoBackupEnabled={Boolean(cloudBackupStatus?.enabled)}
            environmentSecurity={environmentSecurity}
            onClaimFirstDonationBonus={onClaimFirstDonationBonus}
            onActivateDonorToken={onActivateDonorToken}
            onImportData={onImportData}
            onRestoreSuccess={onRestoreSuccess}
          />
        </div>
      )}

      {/* SECTION 3: ANDROID OS-LEVEL ENFORCEMENT & ARCHITECTURE */}
      {effectiveSection === 'os_security' && (
        <div className={isModernFont ? 'space-y-5' : 'space-y-4'}>
          <ObsidianCard
            ambientGlow={!isBespoke}
            className={isModernFont ? 'font-sans' : 'font-mono'}
            headerClassName={isModernFont ? 'p-5 space-y-3' : 'p-4 space-y-2.5'}
            footerClassName={
              isModernFont
                ? 'px-5 py-3 text-[11px] text-zinc-400 leading-relaxed flex items-center justify-between gap-2 flex-wrap'
                : 'px-4 py-2.5 text-[10px] text-zinc-400 leading-relaxed flex items-center justify-between gap-2 flex-wrap'
            }
            headerContent={
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
                    <div
                      className={
                        isFluentGlass
                          ? 'liquid-squircle text-cyan-200'
                          : `w-8 h-8 obsidian-icon-box flex items-center justify-center shrink-0 ${
                              isBespoke ? 'rounded-md text-blue-400' : 'rounded-xl'
                            }`
                      }
                      style={isModernFont ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                    >
                      <Smartphone size={15} strokeWidth={1.75} />
                    </div>
                    <span>OS PERMISSIONS &amp; SETUP</span>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 obsidian-inset-neutral text-zinc-300 ${
                      isBespoke ? 'rounded-sm font-mono' : 'rounded-full'
                    }`}
                  >
                    {hasNativeBridge ? (isStrictBuild ? 'STRICT APK' : 'STANDARD APK') : 'WEB PREVIEW'}
                  </span>
                </div>

                {/* 1: Core Guard — Usage Access (Standard) or Accessibility Service (Strict) */}
                {(() => {
                  const coreGranted = isStrictBuild ? isAccessibilityOn : hasUsagePerm;
                  const isBlockedNow = permissionPriority.restrictedStatus === 'blocked';
                  return (
                    <div
                      className={`${isBespoke ? 'rounded-md' : 'rounded-xl'} transition-colors ${
                        hasNativeBridge && !coreGranted
                          ? 'p-3 obsidian-inset space-y-2'
                          : 'p-2.5 obsidian-inset-neutral space-y-1'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-100">
                        <span>
                          {isStrictBuild ? '1. Accessibility Service' : '1. Usage Access'}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {hasNativeBridge && coreGranted && (
                            <button
                              type="button"
                              onClick={() => window.ZeroNative?.openAppSettingsDetails()}
                              className={`text-[9px] px-2 py-0.5 obsidian-inset-neutral text-zinc-300 hover:text-white inline-flex items-center gap-1 ${
                                isBespoke ? 'rounded-sm' : 'rounded-full'
                              }`}
                            >
                              App Info <ExternalLink size={9} />
                            </button>
                          )}
                          <span
                            className={`text-[9px] px-2 py-0.5 border font-mono ${
                              isBespoke ? 'rounded-sm' : 'rounded-full'
                            } ${
                              hasNativeBridge && !coreGranted && isBlockedNow
                                ? 'bg-red-950/60 text-red-300 border-red-700/70 font-bold'
                                : hasNativeBridge && (coreGranted || !isBlockedNow)
                                ? isBespoke
                                  ? 'bg-blue-600/15 text-blue-400 border-blue-500/40 font-semibold'
                                  : 'font-bold'
                                : 'obsidian-inset-neutral text-zinc-400'
                            }`}
                            style={
                              !isBespoke && hasNativeBridge && (coreGranted || !isBlockedNow)
                                ? {
                                    background: 'rgba(var(--accent-rgb, 255, 255, 255), 0.14)',
                                    borderColor: 'rgba(var(--accent-rgb, 255, 255, 255), 0.35)',
                                    color: 'var(--accent-hex, #FFFFFF)',
                                  }
                                : undefined
                            }
                          >
                            {hasNativeBridge
                              ? coreGranted
                                ? 'GRANTED'
                                : isBlockedNow
                                ? 'BLOCKED'
                                : 'STEP 1'
                              : isStrictBuild
                              ? 'STRICT APK ONLY'
                              : 'FOREGROUND MONITOR'}
                          </span>
                        </div>
                      </div>

                      {(!hasNativeBridge || !coreGranted) && (
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          {isStrictBuild
                            ? 'Blocks Notification pull-down, Quick Settings, Recents, Settings, and unbagged apps.'
                            : 'Select Zero-Noise in Usage Access so The Void enforces your Bag.'}
                        </p>
                      )}

                      {hasNativeBridge && !coreGranted && (
                        <div className="space-y-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              isStrictBuild
                                ? window.ZeroNative?.openAccessibilitySettings()
                                : window.ZeroNative?.requestUsageStatsPermission()
                            }
                            className={`w-full py-2 px-3 text-[11px] uppercase tracking-wider ${
                              isBespoke
                                ? 'rounded-md transition-colors duration-75'
                                : 'rounded-xl active:scale-95 transition-all'
                            } ${
                              isBlockedNow
                                ? 'obsidian-inset text-zinc-100 font-semibold'
                                : 'obsidian-pill-active font-bold'
                            }`}
                          >
                            {isStrictBuild ? 'Enable Accessibility Service' : 'Grant Usage Access'}
                          </button>
                          <RestrictedSettingsGuideCard
                            restrictedStatus={permissionPriority.restrictedStatus}
                            isStrictBuild={isStrictBuild}
                            onOpenAppInfo={() => window.ZeroNative?.openAppSettingsDetails()}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 2: SYSTEM_ALERT_WINDOW */}
                {(() => {
                  const isStep2Active =
                    hasNativeBridge && permissionPriority.coreGuardGranted && !hasOverlayPerm;
                  return (
                    <div
                      className={`${isBespoke ? 'rounded-md' : 'rounded-xl'} transition-colors ${
                        isStep2Active
                          ? 'p-3 obsidian-inset space-y-2'
                          : 'p-2.5 obsidian-inset-neutral space-y-1'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-100">
                        <span>2. Display Over Other Apps</span>
                        {hasNativeBridge ? (
                          hasOverlayPerm ? (
                            <span
                              className={`text-[9px] px-2 py-0.5 border font-mono ${
                                isBespoke
                                  ? 'rounded-sm bg-blue-600/15 text-blue-400 border-blue-500/40'
                                  : 'rounded-full font-bold'
                              }`}
                              style={
                                isBespoke
                                  ? undefined
                                  : {
                                      background: 'rgba(var(--accent-rgb, 255, 255, 255), 0.14)',
                                      borderColor: 'rgba(var(--accent-rgb, 255, 255, 255), 0.35)',
                                      color: 'var(--accent-hex, #FFFFFF)',
                                    }
                              }
                            >
                              GRANTED
                            </span>
                          ) : isStep2Active ? (
                            <span
                              className={`text-[9px] px-2 py-0.5 border font-bold font-mono ${
                                isBespoke
                                  ? 'rounded-sm bg-blue-600/15 text-blue-400 border-blue-500/40'
                                  : 'rounded-full font-black'
                              }`}
                              style={
                                isBespoke
                                  ? undefined
                                  : {
                                      background: 'rgba(var(--accent-rgb, 255, 255, 255), 0.12)',
                                      borderColor: 'rgba(var(--accent-rgb, 255, 255, 255), 0.35)',
                                      color: 'var(--accent-hex, #FFFFFF)',
                                    }
                              }
                            >
                              STEP 2
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => window.ZeroNative?.requestOverlayPermission()}
                              className={`px-2.5 py-1 obsidian-inset-neutral text-[10px] font-semibold text-zinc-200 hover:text-white shrink-0 ${
                                isBespoke ? 'rounded-sm transition-colors duration-75' : 'rounded-lg font-bold active:scale-95'
                              }`}
                            >
                              Allow
                            </button>
                          )
                        ) : (
                          <span
                            className={`text-[9px] px-2 py-0.5 border obsidian-inset-neutral text-zinc-400 font-mono ${
                              isBespoke ? 'rounded-sm' : 'rounded-full'
                            }`}
                          >
                            TOPMOST LAYER
                          </span>
                        )}
                      </div>
                      {(!hasNativeBridge || isStep2Active) && (
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          Allows The Void to snap back on screen over blocked apps from background services.
                        </p>
                      )}
                      {isStep2Active && (
                        <button
                          type="button"
                          onClick={() => window.ZeroNative?.requestOverlayPermission()}
                          className={`w-full py-2 px-3 text-[11px] uppercase tracking-wider obsidian-pill-active font-bold ${
                            isBespoke ? 'rounded-md transition-colors duration-75' : 'rounded-xl font-black active:scale-95 transition-all'
                          }`}
                        >
                          Allow Display Over Other Apps
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* 3: Notifications */}
                {(() => {
                  const isStep3Active =
                    hasNativeBridge &&
                    permissionPriority.coreGuardGranted &&
                    hasOverlayPerm &&
                    !hasNotifPerm;
                  return (
                    <div
                      className={`${isBespoke ? 'rounded-md' : 'rounded-xl'} transition-colors ${
                        isStep3Active
                          ? 'p-3 obsidian-inset space-y-2'
                          : 'p-2.5 obsidian-inset-neutral space-y-1'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-100">
                        <span>3. Lock &amp; Schedule Alerts</span>
                        {hasNativeBridge ? (
                          hasNotifPerm ? (
                            <span
                              className={`text-[9px] px-2 py-0.5 border font-mono ${
                                isBespoke
                                  ? 'rounded-sm bg-blue-600/15 text-blue-400 border-blue-500/40'
                                  : 'rounded-full font-bold'
                              }`}
                              style={
                                isBespoke
                                  ? undefined
                                  : {
                                      background: 'rgba(var(--accent-rgb, 255, 255, 255), 0.14)',
                                      borderColor: 'rgba(var(--accent-rgb, 255, 255, 255), 0.35)',
                                      color: 'var(--accent-hex, #FFFFFF)',
                                    }
                              }
                            >
                              GRANTED
                            </span>
                          ) : isStep3Active ? (
                            <span
                              className={`text-[9px] px-2 py-0.5 border font-bold font-mono ${
                                isBespoke
                                  ? 'rounded-sm bg-blue-600/15 text-blue-400 border-blue-500/40'
                                  : 'rounded-full font-black'
                              }`}
                              style={
                                isBespoke
                                  ? undefined
                                  : {
                                      background: 'rgba(var(--accent-rgb, 255, 255, 255), 0.12)',
                                      borderColor: 'rgba(var(--accent-rgb, 255, 255, 255), 0.35)',
                                      color: 'var(--accent-hex, #FFFFFF)',
                                    }
                              }
                            >
                              OPTIONAL
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => window.ZeroNative?.requestNotificationPermission()}
                              className={`px-2.5 py-1 obsidian-inset-neutral text-[10px] font-semibold text-zinc-300 hover:text-white shrink-0 ${
                                isBespoke ? 'rounded-sm transition-colors duration-75' : 'rounded-lg font-bold active:scale-95'
                              }`}
                            >
                              Allow
                            </button>
                          )
                        ) : (
                          <span
                            className={`text-[9px] px-2 py-0.5 border obsidian-inset-neutral text-zinc-400 font-mono ${
                              isBespoke ? 'rounded-sm' : 'rounded-full'
                            }`}
                          >
                            ALERT READY
                          </span>
                        )}
                      </div>
                      {(!hasNativeBridge || isStep3Active) && (
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          Live lock countdown notifications &amp; 5-minute pre-lock schedule warnings.
                        </p>
                      )}
                      {isStep3Active && (
                        <button
                          type="button"
                          onClick={() => window.ZeroNative?.requestNotificationPermission()}
                          className={`w-full py-2 px-3 text-[11px] obsidian-pill-active font-bold uppercase tracking-wider ${
                            isBespoke ? 'rounded-md transition-colors duration-75' : 'rounded-xl font-black transition-all active:scale-95'
                          }`}
                        >
                          Allow Notifications
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* 4: LockTaskMode / Device Owner */}
                <div
                  className={`p-2.5 obsidian-inset-neutral space-y-1 ${
                    isBespoke ? 'rounded-md' : 'rounded-xl'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-100">
                    <span>4. Hardware Kiosk (Optional ADB)</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 border font-mono ${
                        isBespoke ? 'rounded-sm' : 'rounded-full'
                      } ${
                        isDeviceOwner
                          ? isBespoke
                            ? 'bg-blue-600/15 text-blue-400 border-blue-500/40'
                            : 'font-bold'
                          : 'obsidian-inset-neutral text-zinc-400'
                      }`}
                      style={
                        !isBespoke && isDeviceOwner
                          ? {
                              background: 'rgba(var(--accent-rgb, 255, 255, 255), 0.14)',
                              borderColor: 'rgba(var(--accent-rgb, 255, 255, 255), 0.35)',
                              color: 'var(--accent-hex, #FFFFFF)',
                            }
                          : undefined
                      }
                    >
                      {isDeviceOwner ? 'DEVICE OWNER ACTIVE' : 'OPTIONAL'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    With ADB Device Owner, <code className="font-mono">LockTaskMode</code> engages unbreakable kiosk mode while permitting Bag apps.
                  </p>
                </div>
              </>
            }
            footerContent={
              <>
                <span>
                  {permissionPriority.allRecommendedGranted
                    ? 'All Android permissions armed'
                    : 'Only open App Info -> ⋮ -> Allow restricted settings if blocked'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onRefreshPermissions();
                    checkBatteryState();
                  }}
                  className={`font-semibold uppercase tracking-wider hover:brightness-125 ${
                    isBespoke ? 'text-blue-400' : ''
                  }`}
                  style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                >
                  Re-check Now
                </button>
              </>
            }
          />

          {/* CARD: OEM BATTERY KILLER IMMUNITY & BACKGROUND PROTECTION */}
          <ObsidianCard
            ambientGlow={!isBespoke}
            className={isModernFont ? 'font-sans' : 'font-mono'}
            headerClassName="p-5 space-y-4"
            footerClassName="px-5 py-3 text-[11px] text-zinc-400 leading-relaxed flex items-center justify-between gap-2 flex-wrap"
            headerContent={
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
                    <div
                      className={
                        isFluentGlass
                          ? 'liquid-squircle text-emerald-200'
                          : `w-7 h-7 obsidian-icon-box flex items-center justify-center shrink-0 ${
                              isBespoke ? 'rounded-md text-emerald-500' : 'rounded-xl'
                            }`
                      }
                    >
                      <Battery
                        size={15}
                        strokeWidth={1.75}
                        style={isModernFont ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      />
                    </div>
                    <span>OEM BATTERY KILLER IMMUNITY</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 border font-mono ${
                      isBespoke ? 'rounded-sm' : 'rounded-full font-bold'
                    } ${
                      isBatteryIgnored
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-black'
                    }`}
                  >
                    {isBatteryIgnored ? 'UNRESTRICTED' : 'BATTERY OPTIMIZED'}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Aggressive Android OEM task killers (Samsung OneUI, Xiaomi HyperOS/MIUI, ColorOS, OriginOS) kill background processes when the screen turns dark. Exemption ensures your monotonic lock watchdog never freezes.
                </p>

                {/* Device Info & Status Box */}
                <div className={`p-3.5 obsidian-inset-neutral space-y-2.5 ${isBespoke ? 'rounded-md' : 'rounded-xl'}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Detected Device:</span>
                    <span className="text-white font-bold uppercase tracking-wider font-mono">
                      {deviceMfg}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Background Protection:</span>
                    <span className={`font-semibold flex items-center gap-1 ${isBatteryIgnored ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isBatteryIgnored ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Immune to OS kills</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={13} />
                          <span>May be killed in sleep</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {!isBatteryIgnored ? (
                    <button
                      type="button"
                      onClick={() => {
                        haptics.tick(600);
                        window.ZeroNative?.requestIgnoreBatteryOptimizations?.();
                        setTimeout(checkBatteryState, 1500);
                      }}
                      className={`w-full py-2.5 px-3 text-[11px] uppercase tracking-wider obsidian-pill-active font-black ${
                        isBespoke ? 'rounded-md' : 'rounded-xl'
                      }`}
                    >
                      Exempt from Battery Saver
                    </button>
                  ) : (
                    <div className={`py-2 px-3 text-[11px] obsidian-inset-neutral text-emerald-300 font-semibold flex items-center justify-center gap-1.5 ${
                      isBespoke ? 'rounded-md' : 'rounded-xl'
                    }`}>
                      <CheckCircle2 size={13} />
                      <span>Battery Optimization Exempt</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      haptics.tick(600);
                      window.ZeroNative?.openOemAutostartSettings?.();
                    }}
                    className={`w-full py-2 px-3 text-[11px] uppercase tracking-wider obsidian-inset-neutral text-zinc-200 hover:text-white font-bold flex items-center justify-center gap-1.5 ${
                      isBespoke ? 'rounded-md' : 'rounded-xl'
                    }`}
                  >
                    <span>OEM Autostart / Battery Settings</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              </>
            }
            footerContent={
              <>
                <span>Recommended: Set ZERO battery to &ldquo;Unrestricted&rdquo; in Android App Info.</span>
                <button
                  type="button"
                  onClick={checkBatteryState}
                  className={`font-semibold uppercase tracking-wider hover:brightness-125 ${
                    isBespoke ? 'text-blue-400' : ''
                  }`}
                  style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                >
                  Verify Status
                </button>
              </>
            }
          />

          {/* Installed APK Build & Update Signing Key Diagnostic Card */}
          <ObsidianCard
            ambientGlow={!isBespoke}
            className={`${isBespoke ? 'font-sans' : 'font-mono'} text-xs`}
            headerClassName={isBespoke ? 'p-5 space-y-3' : 'p-4 space-y-2.5'}
            footerClassName={isBespoke ? 'px-5 py-3 text-[11px] leading-relaxed' : 'px-4 py-2.5 text-[10px] leading-relaxed'}
            headerContent={
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-white font-semibold uppercase tracking-wider">
                    <div
                      className={`w-7 h-7 obsidian-icon-box flex items-center justify-center shrink-0 ${
                        isBespoke ? 'rounded-md' : 'rounded-xl'
                      } ${
                        appBuildInfo && !appBuildInfo.isOfficialReleaseKey
                          ? 'text-red-400'
                          : isBespoke
                          ? 'text-blue-400'
                          : ''
                      }`}
                      style={
                        isBespoke || (appBuildInfo && !appBuildInfo.isOfficialReleaseKey)
                          ? undefined
                          : { color: 'var(--accent-hex, #FFFFFF)' }
                      }
                    >
                      <KeyRound size={13} />
                    </div>
                    <span>Installed Build &amp; Update Key</span>
                  </div>
                  {appBuildInfo && (
                    <span
                      className={`text-[9px] font-semibold uppercase px-2 py-0.5 border font-mono ${
                        isBespoke ? 'rounded-sm' : 'rounded-full font-black'
                      } ${
                        appBuildInfo.isOfficialReleaseKey
                          ? isBespoke
                            ? 'bg-blue-600/15 text-blue-400 border-blue-500/40'
                            : 'font-bold'
                          : 'bg-red-950/60 text-red-300 border-red-700/70'
                      }`}
                      style={
                        !isBespoke && appBuildInfo.isOfficialReleaseKey
                          ? {
                              background: 'rgba(var(--accent-rgb, 255, 255, 255), 0.14)',
                              borderColor: 'rgba(var(--accent-rgb, 255, 255, 255), 0.35)',
                              color: 'var(--accent-hex, #FFFFFF)',
                            }
                          : undefined
                      }
                    >
                      {appBuildInfo.isOfficialReleaseKey ? 'Update Key Verified' : 'Debug / Preview Key'}
                    </span>
                  )}
                </div>

                {appBuildInfo ? (
                  <div
                    className={`p-3 obsidian-inset-neutral space-y-1.5 text-[11px] ${
                      isBespoke ? 'rounded-md' : 'rounded-xl'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-zinc-400">Installed Version:</span>
                      <span className="text-white font-bold font-mono tabular-nums">
                        v{appBuildInfo.versionName} (code {appBuildInfo.versionCode})
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-zinc-400">Edition:</span>
                      <span className="text-zinc-200 font-bold uppercase font-mono">{appBuildInfo.edition}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-zinc-400">Cert SHA-256:</span>
                      <span
                        className={`font-bold font-mono truncate max-w-[190px] ${
                          isBespoke ? 'text-blue-400' : ''
                        }`}
                        style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      >
                        {appBuildInfo.signingSha256 || 'Unavailable'}
                      </span>
                    </div>
                    {environmentSecurity && (
                      <div
                        className={`flex items-center justify-between gap-2 pt-1 border-t ${
                          isBespoke ? 'border-neutral-800' : 'border-white/10'
                        }`}
                      >
                        <span className="text-zinc-400">Runtime Environment:</span>
                        <span
                          className={`font-semibold ${
                            environmentSecurity.isCompromised
                              ? 'text-red-400'
                              : isBespoke
                              ? 'text-blue-400'
                              : ''
                          }`}
                          style={
                            !isBespoke && !environmentSecurity.isCompromised
                              ? { color: 'var(--accent-hex, #FFFFFF)' }
                              : undefined
                          }
                        >
                          {environmentSecurity.isCompromised
                            ? `Restricted (${environmentSecurity.reasons.join(', ') || 'compromised'})`
                            : 'Verified Device & R8'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`p-3 obsidian-inset-neutral text-[11px] text-zinc-400 ${
                      isBespoke ? 'rounded-md' : 'rounded-xl'
                    }`}
                  >
                    Permanent APK Release Key:{' '}
                    <code
                      className={`font-mono font-bold ${isBespoke ? 'text-blue-400' : ''}`}
                      style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                    >
                      A14A36...CE11
                    </code>{' '}
                    (V1+V2+V3 signed).
                  </div>
                )}
              </>
            }
            footerContent={
              appBuildInfo && !appBuildInfo.isOfficialReleaseKey ? (
                <div className="text-zinc-300">
                  This device is running an older preview/debug key build. Save a Cloud{' '}
                  <code className="font-mono">.zbak</code> backup in <strong>Settings</strong>,{' '}
                  <strong>Uninstall (for all users)</strong> once, and install the newest signed{' '}
                  <code className="font-mono">ZERO-v*.apk</code> so all future updates install cleanly in-place!
                </div>
              ) : (
                <div className="space-y-1.5 text-zinc-300">
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck
                      size={13}
                      className={`shrink-0 mt-0.5 ${isBespoke ? 'text-blue-400' : ''}`}
                      style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                    />
                    <span>
                      Keep updating within the same edition using a higher version code. If Android ever says &ldquo;App not installed&rdquo;, check that Chrome/Files has <strong>Install unknown apps</strong> allowed and uninstall any duplicate copy from Work Profile / Dual Apps.
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed pl-5">
                    Play Protect &ldquo;App scan recommended&rdquo; on new GitHub APK updates? Every freshly built sideload has a new binary hash not yet on Play Store &mdash; tap <strong>Scan app</strong> once to let Google verify it cleanly and continue installing.
                  </p>
                </div>
              )
            }
          />

          {/* ADB Command Box */}
          <ObsidianCard
            className={`${isBespoke ? 'font-sans' : 'font-mono'} text-xs`}
            headerClassName={isBespoke ? 'p-5 space-y-2.5' : 'p-4 space-y-2'}
            footerClassName={isBespoke ? 'px-5 py-2.5 text-[11px] text-zinc-400 leading-relaxed' : 'px-4 py-2.5 text-[10px] text-zinc-400 leading-relaxed'}
            headerContent={
              <>
                <div className="flex items-center justify-between text-zinc-200 font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 obsidian-icon-box flex items-center justify-center shrink-0 ${
                        isBespoke ? 'rounded-md text-blue-400' : 'rounded-xl'
                      }`}
                      style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                    >
                      <Terminal size={13} />
                    </div>
                    <span>ADB Device Owner Setup (Optional)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        'adb shell dpm set-device-owner org.zero.detox/.receiver.ZeroDeviceAdminReceiver',
                        'adb_cmd'
                      )
                    }
                    className={`text-[10px] text-zinc-200 hover:text-white flex items-center gap-1 px-2.5 py-1 obsidian-inset-neutral ${
                      isBespoke ? 'rounded-sm transition-colors duration-75' : 'rounded-lg'
                    }`}
                  >
                    {copiedId === 'adb_cmd' ? (
                      <Check
                        size={12}
                        className={isBespoke ? 'text-blue-400' : ''}
                        style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>{copiedId === 'adb_cmd' ? 'Copied' : 'Copy ADB'}</span>
                  </button>
                </div>
                <pre
                  className={`p-2.5 obsidian-inset-neutral font-mono text-[10px] text-zinc-200 overflow-x-auto no-scrollbar ${
                    isBespoke ? 'rounded-md' : 'rounded-xl'
                  }`}
                >
                  adb shell dpm set-device-owner org.zero.detox/.receiver.ZeroDeviceAdminReceiver
                </pre>
              </>
            }
            footerContent={
              <p>
                Also check{' '}
                <a
                  href={RELEASES_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => handleOpenExternal(e, RELEASES_URL)}
                  className={`hover:underline font-semibold ${isBespoke ? 'text-blue-400' : ''}`}
                  style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                >
                  GitHub Releases
                </a>{' '}
                anytime for the latest APK updates.
              </p>
            }
          />

          {/* Burn All Escape Tickets (Optional) */}
          <ObsidianCard
            accentOverride={{ hex: '#F97316', rgb: '249, 115, 22' }}
            className={`${isBespoke ? 'font-sans' : 'font-mono'} text-xs`}
            headerClassName={isBespoke ? 'p-5 space-y-3' : 'p-4 space-y-3'}
            footerClassName={
              isBespoke
                ? 'px-5 py-2.5 text-[11px] text-zinc-400 leading-relaxed'
                : 'px-4 py-2.5 text-[10px] text-zinc-400 leading-relaxed'
            }
            headerContent={
              <>
                <div className="flex items-center justify-between text-zinc-200 font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 obsidian-icon-box flex items-center justify-center shrink-0 ${
                        isBespoke ? 'rounded-md text-amber-400' : 'rounded-xl text-orange-400'
                      }`}
                      style={isBespoke ? undefined : { color: '#F97316' }}
                    >
                      <Flame size={14} />
                    </div>
                    <span>Burn All Escape Tickets (Optional)</span>
                  </div>
                  <span
                    className={`text-[9px] font-semibold uppercase px-2 py-0.5 border font-mono ${
                      isBespoke ? 'rounded-sm' : 'rounded-full font-black'
                    } ${
                      remainingEscapeTickets > 0
                        ? 'bg-amber-950/60 text-amber-300 border-amber-600/50'
                        : 'bg-zinc-900/60 text-zinc-400 border-zinc-700/50'
                    }`}
                  >
                    {remainingEscapeTickets} in Vault
                  </span>
                </div>

                <div
                  className={`p-3 obsidian-inset-neutral space-y-2 text-[11px] ${
                    isBespoke ? 'rounded-md' : 'rounded-xl'
                  }`}
                >
                  <p className="text-zinc-300 leading-relaxed">
                    Completely resets your escape parachute inventory to 0. Useful for developer testing, voucher recalibration, or starting with a clean slate. Focus time, streaks, and Occasion Bags are preserved.
                  </p>

                  {burnTicketsNotice && (
                    <div
                      className={`p-2 rounded text-[10px] flex items-center gap-1.5 ${
                        burnTicketsNotice.ok
                          ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300'
                          : 'bg-red-950/50 border border-red-500/30 text-red-300'
                      }`}
                    >
                      {burnTicketsNotice.ok ? (
                        <CheckCircle2 size={12} className="shrink-0" />
                      ) : (
                        <ShieldAlert size={12} className="shrink-0" />
                      )}
                      <span>{burnTicketsNotice.message}</span>
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-2">
                    {remainingEscapeTickets <= 0 ? (
                      <div className="text-[10px] text-zinc-500 italic">
                        Vault already empty (0 tickets available to burn).
                      </div>
                    ) : !confirmingBurnTickets ? (
                      <button
                        type="button"
                        onClick={() => {
                          haptics.tick(300);
                          setConfirmingBurnTickets(true);
                          setBurnTicketsNotice(null);
                        }}
                        className={`px-3 py-1.5 text-[11px] font-semibold text-orange-200 bg-orange-950/40 hover:bg-orange-900/50 border border-orange-500/40 transition-colors flex items-center gap-1.5 ${
                          isBespoke ? 'rounded-sm' : 'rounded-lg'
                        }`}
                      >
                        <Flame size={12} className="text-orange-400" />
                        <span>Burn All Tickets ({remainingEscapeTickets})</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => {
                            if (!onBurnAllEscapeTickets) return;
                            haptics.tick(900);
                            const res = onBurnAllEscapeTickets();
                            setBurnTicketsNotice(res);
                            setConfirmingBurnTickets(false);
                          }}
                          className={`flex-1 px-3 py-1.5 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-1.5 ${
                            isBespoke ? 'rounded-sm' : 'rounded-lg'
                          }`}
                        >
                          <Flame size={12} />
                          <span>Confirm Burn ({remainingEscapeTickets})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            haptics.tick(150);
                            setConfirmingBurnTickets(false);
                          }}
                          className={`px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white bg-zinc-800/80 transition-colors ${
                            isBespoke ? 'rounded-sm' : 'rounded-lg'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            }
            footerContent={
              <p>
                After burning, you can redeem a donor code in Support to get your fresh allocation.
              </p>
            }
          />
        </div>
      )}

      {/* SECTION 4: KEEP ZERO FREE (ETHICAL SUPPORT & DONATE) */}
      {effectiveSection === 'support' && (
        <div className={isModernFont ? 'space-y-5' : 'space-y-4'}>
          <ObsidianCard
            accentOverride={{ hex: '#EF4444', rgb: '239, 68, 68' }}
            ambientGlow={!isBespoke}
            className={isModernFont ? 'font-sans' : 'font-mono'}
            headerClassName="p-5 space-y-3"
            footerClassName="px-5 py-3 flex items-center justify-between text-xs gap-2"
            headerContent={
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className={`flex items-center gap-2.5 font-semibold text-sm ${isMaterial ? 'text-[var(--md-sys-color-on-surface)]' : 'text-white'}`}>
                    <div
                      className={
                        isMaterial
                          ? 'w-9 h-9 rounded-2xl bg-[var(--md-sys-color-error-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center shrink-0'
                          : isFluentGlass
                          ? 'liquid-squircle text-rose-300'
                          : `w-8 h-8 obsidian-icon-box flex items-center justify-center shrink-0 ${
                              isBespoke ? 'rounded-md' : 'rounded-xl'
                            }`
                      }
                    >
                      <Heart size={15} strokeWidth={1.75} className="text-red-500 fill-red-500" />
                    </div>
                    <span>THE ZERO-NOISE PROMISE</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      haptics.tick(900);
                      setShowCreditsModal(true);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                      isMaterial
                        ? 'bg-[var(--md-sys-color-secondary-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-secondary-container)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    <Users size={12} />
                    <span>Credits</span>
                  </button>
                </div>
                <p className={`text-xs leading-relaxed ${isMaterial ? 'text-[var(--md-sys-color-on-surface-variant)]' : 'text-zinc-300'}`}>
                  Zero-Noise is 100% free, libre, and open-source software (FOSS). There are no paywalls,
                  no subscriptions, no analytics trackers, and no advertisements.
                </p>
                <p className={`text-xs leading-relaxed ${isMaterial ? 'text-[var(--md-sys-color-on-surface-variant)]' : 'text-zinc-400'}`}>
                  We believe your attention belongs to you—not to algorithms or paywalled apps.
                  Emergency Escape Tickets can never be purchased outright; earn 1 every 35 focus
                  hours, plus one-time free gifts (+1 starter on first profile, and strictly on your
                  1st tip of minimum ₹<span className="font-mono tabular-nums">{FIRST_DONATION_BONUS_INR}</span>: +1 thank-you ticket &amp; Golden{' '}
                  <strong className={isMaterial ? 'text-[var(--md-sys-color-on-surface)]' : 'text-white'}>ZERO-SUPPORTER</strong> badge).
                </p>
              </>
            }
            footerContent={
              <>
                <a
                  href={RELEASES_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => handleOpenExternal(e, RELEASES_URL)}
                  className={`hover:underline flex items-center gap-1 font-semibold ${
                    isMaterial ? 'text-[var(--md-sys-color-primary)] font-bold' : isBespoke ? 'text-blue-400' : 'font-bold'
                  }`}
                  style={isMaterial || isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                >
                  <span>Check Updates</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href={SOURCE_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => handleOpenExternal(e, SOURCE_URL)}
                  className={`hover:underline flex items-center gap-1 font-semibold ${
                    isMaterial ? 'text-[var(--md-sys-color-on-surface)] font-bold' : 'text-white'
                  }`}
                >
                  <Code2 size={13} />
                  <span>Source Code</span>
                </a>
              </>
            }
          />

          {/* Donation Channels */}
          <div className={isBespoke ? 'space-y-4' : 'space-y-3'}>
            <span
              className={`text-xs uppercase tracking-wider font-bold block ${
                isMaterial ? 'text-[var(--md-sys-color-on-surface)]' : isBespoke ? 'font-sans text-zinc-400' : 'font-mono text-zinc-400'
              }`}
            >
              Support the Project
            </span>

            {/* UPI ID & Scannable QR (Best Offer • No Minimum Limit) */}
            <ObsidianCard
              ambientGlow={!isBespoke}
              className={isBespoke ? 'font-sans' : 'font-mono'}
              headerClassName={isBespoke ? 'p-5 space-y-3.5' : 'p-4 space-y-3'}
              footerClassName={`px-5 py-2.5 text-[11px] leading-relaxed flex items-center justify-between gap-2 flex-wrap ${
                isMaterial ? 'text-[var(--md-sys-color-on-surface-variant)]' : 'text-zinc-400'
              } ${isBespoke ? '' : 'px-4 text-[10px]'}`}
              headerContent={
                <>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${
                        isMaterial
                          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full font-bold'
                          : isBespoke
                          ? 'rounded-sm obsidian-pill-active font-semibold'
                          : 'rounded-md obsidian-pill-active font-black'
                      }`}
                    >
                      Best Offer • Best Option
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold ${
                        isMaterial
                          ? 'bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] rounded-full font-bold'
                          : isBespoke
                          ? 'rounded-sm text-blue-400 obsidian-inset'
                          : 'rounded-md font-bold obsidian-inset'
                      }`}
                      style={isMaterial || isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                    >
                      NO MINIMUM LIMIT
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={
                          isMaterial
                            ? 'w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-xs shrink-0'
                            : isFluentGlass
                            ? 'liquid-squircle font-bold text-xs text-cyan-200'
                            : `w-9 h-9 obsidian-icon-box flex items-center justify-center font-bold text-xs shrink-0 ${
                                isBespoke ? 'rounded-md font-mono text-blue-400' : 'rounded-xl text-white'
                              }`
                        }
                        style={isMaterial || isModernFont ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      >
                        UPI
                      </div>
                      <div className="min-w-0">
                        <div className={`font-semibold text-xs ${isMaterial ? 'text-[var(--md-sys-color-on-surface)] font-bold' : 'text-white'}`}>UPI / Instant Pay</div>
                        <div
                          className={`text-[11px] truncate font-mono ${
                            isMaterial ? 'text-[var(--md-sys-color-on-surface-variant)] font-semibold' : isBespoke ? 'text-zinc-300' : ''
                          }`}
                          style={isMaterial || isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                        >
                          {UPI_ID}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowUPIQR(!showUPIQR)}
                        className={`p-2 rounded-xl transition-all ${
                          showUPIQR
                            ? isMaterial
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
                              : 'bg-[#0f172a] text-white font-bold shadow-xs'
                            : isMaterial
                            ? 'bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                            : 'obsidian-inset-neutral text-zinc-300 hover:text-white'
                        }`}
                        title="Toggle QR Code"
                        aria-label="Toggle UPI QR Code"
                      >
                        <QrCode size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(UPI_ID, 'upi')}
                        className={`p-2 rounded-xl transition-all ${
                          isMaterial
                            ? 'bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                            : 'obsidian-inset-neutral text-zinc-300 hover:text-white'
                        }`}
                        title="Copy UPI ID"
                        aria-label="Copy UPI ID"
                      >
                        {copiedId === 'upi' ? (
                          <Check
                            size={14}
                            className={isMaterial ? 'text-[var(--md-sys-color-primary)]' : isBespoke ? 'text-blue-400' : ''}
                            style={isMaterial || isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                          />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 1st Minimum ₹50 Supporter Bonus */}
                  {!hasClaimedFirstDonationParachute ? (
                    <div
                      className={`p-3.5 obsidian-inset space-y-2.5 ${
                        isBespoke ? 'rounded-md' : 'rounded-xl space-y-2'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div
                          className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase ${
                            isBespoke ? 'text-blue-400' : ''
                          }`}
                          style={
                            isFluentGlass
                              ? { color: 'var(--liquid-accent-tint, var(--accent-primary))' }
                              : isModernFont
                              ? undefined
                              : { color: 'var(--accent-hex, #FFFFFF)' }
                          }
                        >
                          <Gift size={13} strokeWidth={1.75} className="shrink-0" />
                          <span>
                            {isFluentGlass
                              ? `1st Tip ₹${FIRST_DONATION_BONUS_INR}+ = +1 Ticket & Supporter Badge`
                              : `1st Tip ₹${FIRST_DONATION_BONUS_INR}+ = +1 Ticket & Gold Badge`}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 obsidian-inset-neutral text-zinc-200 shrink-0 font-mono ${
                            isBespoke ? 'rounded-sm' : 'rounded font-bold'
                          }`}
                        >
                          Min ₹{FIRST_DONATION_BONUS_INR} (1st Tip Only)
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        <strong>Strict Rule:</strong> The{' '}
                        {isFluentGlass ? 'Platinum ' : 'Golden '}
                        <strong className="text-white">ZERO-SUPPORTER</strong> Profile Badge &amp;{' '}
                        <strong>
                          +1 Free Emergency Escape Ticket
                        </strong>{' '}
                        <strong>ONLY unlock after your 1st tip of minimum ₹{FIRST_DONATION_BONUS_INR}</strong>{' '}
                        (smaller tips have no minimum limit via UPI but do not unlock the badge).
                      </p>
                      {!confirmingDonationClaim ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <a
                            href={UPI_FIFTY_RS_PAY_URL}
                            onClick={(e) => {
                              handleOpenExternal(e, UPI_FIFTY_RS_PAY_URL);
                              setConfirmingDonationClaim(true);
                            }}
                            className={`flex-1 py-2 px-3 obsidian-pill-active text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                              isBespoke
                                ? 'rounded-md font-semibold transition-colors duration-75'
                                : isFluentGlass
                                ? 'rounded-xl font-bold liquid-spring'
                                : 'rounded-xl font-black active:scale-95 transition-all'
                            }`}
                          >
                            <span>
                              {isFluentGlass
                                ? `Tip ₹${FIRST_DONATION_BONUS_INR}+ (+1 Ticket & Badge)`
                                : `Tip ₹${FIRST_DONATION_BONUS_INR}+ (+1 Ticket & Gold)`}
                            </span>
                            <ExternalLink size={12} strokeWidth={1.75} />
                          </a>
                          {onClaimFirstDonationBonus && (
                            <button
                              type="button"
                              onClick={() => setConfirmingDonationClaim(true)}
                              className={`px-3 py-2 obsidian-inset-neutral text-zinc-200 hover:text-white text-[10px] font-semibold ${
                                isBespoke
                                  ? 'rounded-md transition-colors duration-75'
                                  : isFluentGlass
                                  ? 'rounded-xl liquid-pill font-semibold'
                                  : 'rounded-xl font-bold'
                              }`}
                            >
                              Sent Min ₹{FIRST_DONATION_BONUS_INR}?
                            </button>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`p-2.5 obsidian-inset-neutral space-y-2 ${
                            isBespoke ? 'rounded-md' : 'rounded-xl'
                          }`}
                        >
                          <div className="text-[11px] text-zinc-200">
                            Confirm you sent your <strong>1st tip of minimum ₹{FIRST_DONATION_BONUS_INR}</strong>{' '}
                            to unlock the {isFluentGlass ? 'Platinum ' : 'Golden '}
                            <strong className="text-white">ZERO-SUPPORTER</strong> Badge &amp;{' '}
                            <strong>
                              +1 Free Emergency Escape Ticket
                            </strong>
                            :
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onClaimFirstDonationBonus?.();
                                setConfirmingDonationClaim(false);
                              }}
                              className={`flex-1 py-2 px-2.5 obsidian-pill-active text-[10px] uppercase tracking-wider ${
                                isBespoke
                                  ? 'rounded-md font-semibold'
                                  : 'rounded-lg font-black'
                              }`}
                            >
                              Confirm ₹{FIRST_DONATION_BONUS_INR}+ &amp; Unlock
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingDonationClaim(false)}
                              className={`px-2.5 py-2 obsidian-inset-neutral text-zinc-300 text-[10px] font-semibold ${
                                isBespoke ? 'rounded-md' : 'rounded-lg font-bold'
                              }`}
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`px-3 py-2 obsidian-inset flex items-center justify-between gap-2 flex-wrap text-[11px] ${
                        isBespoke ? 'rounded-md text-blue-400' : 'rounded-xl text-[10px]'
                      }`}
                      style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                    >
                      <span className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 size={12} />
                        <span>Min ₹{FIRST_DONATION_BONUS_INR} 1st Tip Bonus Claimed</span>
                      </span>
                      <ZeroSupporterGoldenBadge compact isDeveloper={isDeveloper} />
                    </div>
                  )}

                  <a
                    href={UPI_PAY_URL}
                    onClick={(e) => handleOpenExternal(e, UPI_PAY_URL)}
                    className={`w-full py-2.5 px-3 obsidian-pill-active text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                      isBespoke
                        ? 'rounded-md font-semibold transition-colors duration-75'
                        : 'rounded-xl font-black text-[11px] active:scale-95 transition-all'
                    }`}
                  >
                    <span>Open UPI App (Any Amount)</span>
                    <ExternalLink size={12} />
                  </a>

                  {showUPIQR && (
                    <div
                      className={`p-3.5 obsidian-inset-neutral flex flex-col items-center justify-center text-center space-y-2 ${
                        isBespoke ? 'rounded-md' : 'rounded-xl'
                      }`}
                    >
                      {upiQrUrl ? (
                        <div
                          data-qr-surface="true"
                          className={`bg-white p-2 ${isBespoke ? 'rounded-sm' : 'rounded-xl shadow-md'}`}
                        >
                          <img
                            src={upiQrUrl}
                            alt={`UPI QR code for ${UPI_ID}`}
                            className="w-36 h-36 block"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-36 h-36 bg-black/70 flex items-center justify-center text-[10px] text-zinc-400 ${
                            isBespoke ? 'rounded-sm' : 'rounded-xl'
                          }`}
                        >
                          Generating QR...
                        </div>
                      )}
                      <div className="text-[11px] font-bold font-mono text-zinc-200">{UPI_ID}</div>
                      <div className="text-[10px] text-zinc-400">
                        Scan via Google Pay, PhonePe, Paytm, or BHIM
                      </div>
                    </div>
                  )}
                </>
              }
              footerContent={
                <>
                  <span>
                    UPI has <strong>no minimum limit</strong> — tip even ₹1 with 0% platform fees.
                  </span>
                  <span
                    className={`font-semibold uppercase tracking-wider ${
                      isBespoke ? 'text-blue-400' : 'font-bold'
                    }`}
                    style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                  >
                    Instant
                  </span>
                </>
              }
            />

            {/* Buy Me a Coffee via Ko-fi */}
            <ObsidianCard
              className={isBespoke ? 'font-sans' : 'font-mono'}
              headerClassName="p-0"
              footerClassName="px-5 py-2.5 text-[11px] text-zinc-400 flex items-center justify-between gap-2"
              headerContent={
                <a
                  href={KOFI_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => handleOpenExternal(e, KOFI_URL)}
                  className={`w-full p-4 flex items-center justify-between group ${
                    isBespoke ? 'transition-colors duration-75' : 'p-3.5 transition-all active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 obsidian-icon-box flex items-center justify-center shrink-0 ${
                        isBespoke ? 'rounded-md text-blue-400' : 'rounded-xl'
                      }`}
                    >
                      <Coffee
                        size={17}
                        style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className={`font-semibold text-xs ${isMaterial ? 'text-[var(--md-sys-color-on-surface)]' : 'text-white'}`}>Buy Me a Coffee (Ko-fi)</div>
                      <div className={`text-[11px] font-mono truncate ${isMaterial ? 'text-[var(--md-sys-color-on-surface-variant)]' : 'text-zinc-400'}`}>ko-fi.com/mdyousuf2620</div>
                    </div>
                  </div>
                  <ExternalLink size={14} className={`${isMaterial ? 'text-[var(--md-sys-color-on-surface)]' : 'text-zinc-400 group-hover:text-white'} shrink-0 ml-2`} />
                </a>
              }
              footerContent={
                <>
                  <span>International &amp; card tips supported via Ko-fi</span>
                  <span
                    className={`font-semibold uppercase ${
                      isBespoke ? 'text-zinc-300' : 'font-bold'
                    }`}
                    style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                  >
                    Optional
                  </span>
                </>
              }
            />

            {/* Donor Perks & Badges (Manual Ko-fi Verification & Signed Token) */}
            <DonorPerksBadgesCard
              isZeroSupporter={supporterBadgeUnlocked}
              isDeveloper={isDeveloper}
              hasClaimedFirstDonationParachute={hasClaimedFirstDonationParachute}
              remainingEscapeTickets={remainingEscapeTickets}
              cloudAutoBackupEnabled={Boolean(cloudBackupStatus?.enabled)}
              environmentSecurity={environmentSecurity}
              onClaimFirstDonationBonus={onClaimFirstDonationBonus}
              onActivateDonorToken={onActivateDonorToken}
              onImportData={onImportData}
              onRestoreSuccess={onRestoreSuccess}
            />

            {tipSkipRemaining > 0 && (
              <ObsidianCard
                className={`${isBespoke ? 'font-sans' : 'font-mono'} text-[11px]`}
                headerClassName="p-4 flex items-center justify-between gap-2"
                headerContent={
                  <>
                    <span className="text-zinc-300">
                      Post-session tip popup blocked for{' '}
                      <strong className="text-white font-mono tabular-nums">{tipSkipRemaining}</strong> more completed{' '}
                      {tipSkipRemaining === 1 ? 'session' : 'sessions'}.
                    </span>
                    {onResetTipPromptBlock && (
                      <button
                        type="button"
                        onClick={onResetTipPromptBlock}
                        className={`px-2.5 py-1 obsidian-inset-neutral text-zinc-200 hover:text-white font-semibold shrink-0 ${
                          isBespoke ? 'rounded-sm transition-colors duration-75' : 'rounded-lg font-bold'
                        }`}
                      >
                        Unblock
                      </button>
                    )}
                  </>
                }
              />
            )}
          </div>
        </div>
      )}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div
          className={`fixed inset-0 z-60 flex items-center justify-center px-4 ${
            isFluentGlass ? 'bg-black/75 backdrop-blur-sm' : 'bg-black/90'
          }`}
          style={{
            paddingTop: 'calc(1rem + var(--zero-safe-top))',
            paddingBottom: 'calc(1rem + var(--zero-safe-bottom))',
          }}
        >
          <ObsidianCard
            onSubmit={handleCreateSchedule}
            ambientGlow={!isBespoke}
            className={`w-full max-w-sm max-h-full text-left ${isBespoke ? 'font-sans' : 'font-mono'}`}
            headerClassName="p-5 flex-1 min-h-0 overflow-y-auto space-y-4"
            footerClassName="p-4 space-y-2.5"
            headerContent={
              <>
                <div className="font-semibold text-sm text-white">Create Recurring Schedule</div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Schedule Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Morning Focus"
                    required
                    className={`w-full obsidian-input px-3 py-2 text-xs text-white outline-none ${
                      isBespoke ? 'rounded-md' : 'rounded-xl'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Active Days</label>
                  <div className="flex gap-1">
                    {DAYS_OF_WEEK.map((day, idx) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDaySelection(idx)}
                        className={`flex-1 py-1.5 text-[10px] font-semibold ${
                          isFluentGlass
                            ? `rounded-full font-sans ${
                                newDays.includes(idx)
                                  ? 'liquid-pill-active'
                                  : 'liquid-pill-inactive'
                              }`
                            : isBespoke
                            ? `rounded-sm border transition-colors duration-75 ${
                                newDays.includes(idx)
                                  ? 'bg-blue-600 text-white border-blue-500'
                                  : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                              }`
                            : `rounded-lg font-bold transition-all ${
                                newDays.includes(idx)
                                  ? 'obsidian-pill-active'
                                  : 'obsidian-inset-neutral text-zinc-400'
                              }`
                        }`}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className={`w-full obsidian-input font-mono tabular-nums px-3 py-2 text-xs text-white outline-none ${
                        isBespoke ? 'rounded-md' : 'rounded-xl'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">End Time</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className={`w-full obsidian-input font-mono tabular-nums px-3 py-2 text-xs text-white outline-none ${
                        isBespoke ? 'rounded-md' : 'rounded-xl'
                      }`}
                    />
                  </div>
                </div>

                {isOvernightSchedule(newStartTime, newEndTime) && (
                  <div className="p-2.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono flex items-center gap-2">
                    <Moon size={14} className="text-indigo-400 shrink-0" />
                    <span>Overnight Shift: Crosses midnight into next morning</span>
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Focus Tag</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className={`w-full obsidian-input px-3 py-2 text-xs text-white outline-none ${
                      isBespoke ? 'rounded-md' : 'rounded-xl'
                    }`}
                  >
                    {TAGS.map((t) => (
                      <option key={t} value={t}>
                        #{t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Burn the Boats Option */}
                {(() => {
                  const durationMins = getScheduleDurationMinutes(newStartTime, newEndTime);
                  const isDurationOverMax = durationMins > 240;
                  return (
                    <div className={`p-3 rounded-xl border transition-all ${
                      newBurnTheBoats && !isDurationOverMax
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'obsidian-inset-neutral border-white/5'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="text-xs font-semibold flex items-center gap-1.5 text-white">
                            <Flame size={13} className={newBurnTheBoats && !isDurationOverMax ? 'text-amber-400' : 'text-zinc-400'} />
                            <span>Burn the Boats</span>
                          </div>
                          <p className="text-[10px] text-zinc-400">
                            Strictly disables escape tickets for this routine (Max 4h)
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isDurationOverMax}
                          onClick={() => {
                            if (isDurationOverMax) {
                              setBurnBoatsWarning('Burn the Boats is limited to sessions under 4 hours (240 min).');
                              return;
                            }
                            const next = !newBurnTheBoats;
                            setNewBurnTheBoats(next);
                            if (!next) setBurnBoatsWarning(null);
                          }}
                          className={`relative w-11 h-6 rounded-full border transition-colors shrink-0 ${
                            isDurationOverMax
                              ? 'opacity-40 cursor-not-allowed bg-zinc-900 border-white/10'
                              : newBurnTheBoats
                              ? 'bg-amber-600 border-amber-500'
                              : 'bg-zinc-800 border-zinc-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              newBurnTheBoats && !isDurationOverMax ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {isDurationOverMax && (
                        <div className="text-[10px] text-amber-300 mt-2 flex items-center gap-1">
                          <span>Routine duration ({Math.floor(durationMins / 60)}h {durationMins % 60}m) exceeds 4-hour limit for Burn the Boats</span>
                        </div>
                      )}
                      {burnBoatsWarning && (
                        <div className="text-[10px] text-amber-300 mt-2">
                          {burnBoatsWarning}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            }
            footerContent={
              <>
                <div
                  className={`p-2.5 obsidian-inset-neutral text-[10px] text-zinc-300 flex items-center gap-1.5 ${
                    isBespoke ? 'rounded-md' : 'rounded-xl'
                  }`}
                >
                  <Bell
                    size={12}
                    className={`shrink-0 ${isBespoke ? 'text-blue-400' : ''}`}
                    style={isBespoke ? undefined : { color: 'var(--accent-hex, #FFFFFF)' }}
                  />
                  <span>Includes automatic 5-minute pre-lock heads-up warning</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`flex-1 py-2.5 obsidian-pill-active font-semibold text-xs uppercase tracking-wider ${
                      isBespoke ? 'rounded-md transition-colors duration-75' : 'rounded-xl font-black active:scale-95 transition-all'
                    }`}
                  >
                    Save Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewBurnTheBoats(false);
                      setBurnBoatsWarning(null);
                      setShowAddModal(false);
                    }}
                    className={`py-2.5 px-4 obsidian-inset-neutral text-zinc-300 text-xs font-semibold hover:text-white ${
                      isBespoke ? 'rounded-md transition-colors duration-75' : 'rounded-xl font-bold transition-colors'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </>
            }
          />
        </div>
      )}
      <Suspense fallback={null}>
        {showCreditsModal && (
          <CreditsModal
            isOpen={showCreditsModal}
            onClose={() => setShowCreditsModal(false)}
          />
        )}

        {showZeroTubeModal && (
          <ZeroTubeModal
            isOpen={showZeroTubeModal}
            onClose={() => {
              setShowZeroTubeModal(false);
              setSelectedZeroTubeVideoId(undefined);
            }}
            initialVideoId={selectedZeroTubeVideoId}
          />
        )}
      </Suspense>
    </div>
  );
};
