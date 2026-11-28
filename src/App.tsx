import { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { useZeroStore } from './store/useZeroStore';
import { LockDialView } from './components/LockDialView';
import { ObsidianCard } from './components/ObsidianCard';
import { AmbientBackground } from './components/AmbientBackground';
import { LiquidDock, type ZeroNavTab } from './components/LiquidDock';
import { InterfaceStyleProvider } from './context/InterfaceStyleContext';
import { IntegrityEngine } from './core/integrity/IntegrityEngine';
import { checkForAppUpdate, isUpdatePromptDue, recordUpdatePromptShown } from './utils/autoUpdater';
import { checkAndEnforceRoutines } from './utils/routineEngine';
import { syncYouTubeGuardToNative } from './utils/zeroTubeWhitelist';
import { handleOpenExternalUrl } from './utils/supportLinks';
import {
  type ActionReminderConfig,
  getActionReminderConfig,
  shouldTriggerReminder,
  triggerActionReminder,
} from './utils/actionReminders';
import type { AppUpdateReleaseInfo, HabitCalibrationProfile, RecurringSchedule, OccasionBag } from './types';
import { BellRing, X, AlertTriangle, Download, Upload } from 'lucide-react';

const TheVoidView = lazy(() =>
  import('./components/TheVoidView').then((m) => ({ default: m.TheVoidView }))
);
const ParachuteDashboardView = lazy(() =>
  import('./components/ParachuteDashboardView').then((m) => ({ default: m.ParachuteDashboardView }))
);
const SchedulesDonateView = lazy(() =>
  import('./components/SchedulesDonateView').then((m) => ({ default: m.SchedulesDonateView }))
);
const BagDrawerModal = lazy(() =>
  import('./components/BagDrawerModal').then((m) => ({ default: m.BagDrawerModal }))
);
const PermissionGateModal = lazy(() =>
  import('./components/PermissionGateModal').then((m) => ({ default: m.PermissionGateModal }))
);
const TipAfterSessionModal = lazy(() =>
  import('./components/TipAfterSessionModal').then((m) => ({ default: m.TipAfterSessionModal }))
);
const ProfileModal = lazy(() =>
  import('./components/ProfileModal').then((m) => ({ default: m.ProfileModal }))
);
const ParachuteRewardAnimation = lazy(() =>
  import('./components/ParachuteRewardAnimation').then((m) => ({ default: m.ParachuteRewardAnimation }))
);
const ShareStatsModal = lazy(() =>
  import('./components/ShareStatsModal').then((m) => ({ default: m.ShareStatsModal }))
);
const EscapeTicketModal = lazy(() =>
  import('./components/EscapeTicketModal').then((m) => ({ default: m.EscapeTicketModal }))
);
const ZeroTubeModal = lazy(() =>
  import('./components/ZeroTubeModal').then((m) => ({ default: m.ZeroTubeModal }))
);
const OnboardingWizard = lazy(() =>
  import('./components/OnboardingWizard').then((m) => ({ default: m.OnboardingWizard }))
);
const InteractiveTour = lazy(() =>
  import('./components/InteractiveTour').then((m) => ({ default: m.InteractiveTour }))
);
const SessionVictoryModal = lazy(() =>
  import('./components/SessionVictoryModal').then((m) => ({ default: m.SessionVictoryModal }))
);
const ActionReminderAlertModal = lazy(() =>
  import('./components/ActionReminderAlertModal').then((m) => ({ default: m.ActionReminderAlertModal }))
);
const AetherialController = lazy(() =>
  import('./aetherial/AetherialController').then((m) => ({ default: m.AetherialController }))
);
const AetherialVoidView = lazy(() =>
  import('./aetherial/AetherialVoidView').then((m) => ({ default: m.AetherialVoidView }))
);

export function App() {
  const store = useZeroStore();
  const [activeTab, setActiveTab] = useState<ZeroNavTab>('dial');
  const [showZeroTubeModal, setShowZeroTubeModal] = useState(false);
  const [rulesSectionOverride, setRulesSectionOverride] = useState<{
    section: 'schedules' | 'themes' | 'settings' | 'os_security' | 'support';
    key: number;
  } | null>(null);
  const [showBagModal, setShowBagModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState<'welcome' | 'edit'>('welcome');
  const [showSessionFlexModal, setShowSessionFlexModal] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(!store.onboardingComplete);
  const [suppressOnboardingForRestore, setSuppressOnboardingForRestore] = useState(false);
  const [showInteractiveTour, setShowInteractiveTour] = useState(false);
  const [exitToast, setExitToast] = useState(false);
  const [integrityViolation] = useState<string | null>(() => {
    const check = IntegrityEngine.verifyAuthorIntegrity();
    if (!check.ok || !check.signatureValid) {
      return (
        check.error ||
        'CRITICAL INTEGRITY VIOLATION: Author credits or support endpoints have been modified.'
      );
    }
    return null;
  });
  const [updateInfo, setUpdateInfo] = useState<AppUpdateReleaseInfo | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [backupNudgeDismissed, setBackupNudgeDismissed] = useState(false);
  const [globalReminderAlert, setGlobalReminderAlert] = useState<string | null>(null);
  const [globalReminderConfig, setGlobalReminderConfig] = useState<ActionReminderConfig>(getActionReminderConfig);
  const lastBackPressRef = useRef<number>(0);
  const hasAutoPromptedRef = useRef(false);
  const onBackActionRef = useRef<() => void>(() => {});

  const backupNudgeVisible =
    !backupNudgeDismissed &&
    !store.autoBackupEnabled &&
    IntegrityEngine.isWeeklyBackupDue(false, store.lastBackupTimestamp);

  useEffect(() => {
    const handleConfigUpdate = (e: CustomEvent<ActionReminderConfig>) => {
      if (e.detail) setGlobalReminderConfig(e.detail);
    };
    const handleAlert = (e: CustomEvent<{ text: string }>) => {
      if (e.detail?.text) {
        setGlobalReminderAlert(e.detail.text);
      }
    };
    window.addEventListener('zero:action_reminder_config_updated', handleConfigUpdate as EventListener);
    window.addEventListener('zero:action_reminder_alert', handleAlert as EventListener);

    const interval = setInterval(() => {
      if (!store.activeLock.isLocked) {
        const current = getActionReminderConfig();
        if (shouldTriggerReminder(current)) {
          triggerActionReminder(undefined, current);
        }
      }
    }, 20000);

    return () => {
      window.removeEventListener('zero:action_reminder_config_updated', handleConfigUpdate as EventListener);
      window.removeEventListener('zero:action_reminder_alert', handleAlert as EventListener);
      clearInterval(interval);
    };
  }, [store.activeLock.isLocked]);

  // Native YouTube guard whitelist sync on startup
  useEffect(() => {
    void syncYouTubeGuardToNative();
  }, []);

  // Auto-updater check on launch (throttled to 24h)
  useEffect(() => {
    let active = true;
    checkForAppUpdate(false, store.appBuildInfo).then((info) => {
      if (active && info && isUpdatePromptDue()) {
        setUpdateInfo(info);
        setShowUpdateModal(true);
      }
    });
    return () => {
      active = false;
    };
  }, [store.appBuildInfo]);

  // Routine execution engine synchronization
  useEffect(() => {
    checkAndEnforceRoutines(store.schedules);
  }, [store.schedules]);

  useEffect(() => {
    const onResume = () => {
      checkAndEnforceRoutines(store.schedules);
    };
    window.addEventListener('focus', onResume);
    document.addEventListener('visibilitychange', onResume);
    return () => {
      window.removeEventListener('focus', onResume);
      document.removeEventListener('visibilitychange', onResume);
    };
  }, [store.schedules]);

  // Keep latest back-action callback fresh without re-registering listeners or history entries
  useEffect(() => {
    onBackActionRef.current = () => {
      if (globalReminderAlert) {
        setGlobalReminderAlert(null);
        return;
      }
      if (showTicketModal) {
        setShowTicketModal(false);
        return;
      }
      if (showProfileModal) {
        setShowProfileModal(false);
        return;
      }
      if (showBagModal) {
        setShowBagModal(false);
        return;
      }
      if (showPermissionModal) {
        setShowPermissionModal(false);
        return;
      }
      if (showSessionFlexModal) {
        setShowSessionFlexModal(false);
        return;
      }
      if (showUpdateModal) {
        setShowUpdateModal(false);
        return;
      }
      if (showZeroTubeModal || activeTab === 'zerotube') {
        setShowZeroTubeModal(false);
        if (activeTab === 'zerotube') {
          setActiveTab('dial');
        }
        return;
      }
      if (showInteractiveTour) {
        setShowInteractiveTour(false);
        return;
      }
      if (showOnboardingWizard) {
        return;
      }

      if (activeTab !== 'dial') {
        setActiveTab('dial');
        return;
      }

      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        try {
          if (window.ZeroNative?.exitApp) {
            window.ZeroNative.exitApp();
          } else {
            const capAppPlugin = (
              window as unknown as { Capacitor?: { Plugins?: { App?: { exitApp?: () => void } } } }
            ).Capacitor?.Plugins?.App;
            capAppPlugin?.exitApp?.();
          }
        } catch {}
      } else {
        lastBackPressRef.current = now;
        setExitToast(true);
        setTimeout(() => setExitToast(false), 2000);
      }
    };
  }, [
    globalReminderAlert,
    showTicketModal,
    showProfileModal,
    showBagModal,
    showPermissionModal,
    showSessionFlexModal,
    showUpdateModal,
    showZeroTubeModal,
    showInteractiveTour,
    showOnboardingWizard,
    activeTab,
  ]);

  // Android Back Gesture & Navigation Stack Hierarchical Popping (registered once)
  useEffect(() => {
    const dispatchBack = () => onBackActionRef.current();

    const capApp = (
      window as unknown as {
        Capacitor?: {
          Plugins?: {
            App?: {
              addListener?: (
                ev: string,
                cb: () => void
              ) => Promise<{ remove?: () => void }>;
            };
          };
        };
      }
    ).Capacitor?.Plugins?.App;
    let removeListener: (() => void) | undefined;
    if (capApp?.addListener) {
      capApp.addListener('backButton', dispatchBack).then((sub) => {
        if (sub?.remove) removeListener = () => sub.remove?.();
      });
    }

    document.addEventListener('backbutton', dispatchBack);

    if (typeof window !== 'undefined') {
      window.history.pushState({ page: 'zero_root' }, '');
      const onPopState = () => {
        window.history.pushState({ page: 'zero_root' }, '');
        dispatchBack();
      };
      window.addEventListener('popstate', onPopState);
      return () => {
        if (removeListener) removeListener();
        document.removeEventListener('backbutton', dispatchBack);
        window.removeEventListener('popstate', onPopState);
      };
    }

    return () => {
      if (removeListener) removeListener();
      document.removeEventListener('backbutton', dispatchBack);
    };
  }, []);

  const handleOnboardingComplete = (
    profile: HabitCalibrationProfile,
    recommendedSchedules: RecurringSchedule[],
    recommendedBags: OccasionBag[]
  ) => {
    store.completeOnboarding({
      schedules: recommendedSchedules,
      bags: recommendedBags,
      profile,
    });
    localStorage.setItem('zero_habit_calibration_profile_v1', JSON.stringify(profile));

    if (!store.profile) {
      store.saveProfileAndClaimGift({
        displayName: 'Zero User',
        handle: 'focus',
        primaryMission: 'Deep Work',
        dailyGoalHours: profile.dailyReclaimTargetHours || 3,
        motto: profile.primaryGoal,
        avatarId: 'monk',
        accentColor: 'emerald',
      });
    }

    setShowOnboardingWizard(false);
    setShowInteractiveTour(true);
  };

  // Ask for required Android permissions upfront once onboarding is finished (never stacked over Wizard)
  useEffect(() => {
    if (
      !hasAutoPromptedRef.current &&
      !showOnboardingWizard &&
      store.onboardingComplete &&
      !store.activeLock.isLocked &&
      store.permissions.isNativeAndroid &&
      !store.permissions.strictReady
    ) {
      hasAutoPromptedRef.current = true;
      const timer = window.setTimeout(() => setShowPermissionModal(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, [
    showOnboardingWizard,
    store.onboardingComplete,
    store.activeLock.isLocked,
    store.permissions.isNativeAndroid,
    store.permissions.strictReady,
  ]);

  const [restoreToast, setRestoreToast] = useState<string>('');

  const handleCloudRestoreSuccess = () => {
    setShowProfileModal(false);
    setActiveTab('dashboard');
    setRestoreToast('Cloud Backup Restored — Welcome back to Zero-Noise!');
    setTimeout(() => setRestoreToast(''), 4200);
  };

  const openInteractiveProfile = () => {
    setProfileModalMode(!store.profile && !store.hasClaimedFirstTimeParachute ? 'welcome' : 'edit');
    setShowProfileModal(true);
  };

  const isBespoke = store.interfaceStyle === 'bespoke' || store.interfaceStyle === 'minimalist' || store.interfaceStyle === 'minimal';
  const isFluentGlass = store.interfaceStyle === 'fluent_glass' || store.interfaceStyle === 'fluent';
  const isAetherial = store.interfaceStyle === 'aetherial';

  // If Lock is active, THE VOID takes over everything
  if (store.activeLock.isLocked) {
    return (
      <InterfaceStyleProvider
        interfaceStyle={store.interfaceStyle}
        setInterfaceStyle={store.setInterfaceStyle}
        materialYouSeed={store.materialYouSeed}
        setMaterialYouSeed={store.setMaterialYouSeed}
        materialYouAmoled={store.materialYouAmoled}
        setMaterialYouAmoled={store.setMaterialYouAmoled}
        themeConfig={store.themeConfig}
        setThemeConfig={store.setThemeConfig}
      >
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          {isAetherial ? (
            <AetherialVoidView
              activeLock={store.activeLock}
              parachuteMetrics={store.parachuteMetrics}
              activeBag={store.activeBag}
              profile={store.profile}
              onDeployParachute={store.deployParachute}
              onExtendLock={store.extendLock}
            />
          ) : (
            <TheVoidView
              activeLock={store.activeLock}
              parachuteMetrics={store.parachuteMetrics}
              activeBag={store.activeBag}
              profile={store.profile}
              themeConfig={store.themeConfig}
              onDeployParachute={store.deployParachute}
              onExtendLock={store.extendLock}
            />
          )}
        </Suspense>
      </InterfaceStyleProvider>
    );
  }

  return (
    <InterfaceStyleProvider
      interfaceStyle={store.interfaceStyle}
      setInterfaceStyle={store.setInterfaceStyle}
      materialYouSeed={store.materialYouSeed}
      setMaterialYouSeed={store.setMaterialYouSeed}
      materialYouAmoled={store.materialYouAmoled}
      setMaterialYouAmoled={store.setMaterialYouAmoled}
      themeConfig={store.themeConfig}
      setThemeConfig={store.setThemeConfig}
    >
      {isAetherial ? (
        <Suspense fallback={<div className="min-h-screen bg-[#11131b]" />}>
          <AetherialController
            store={store}
            onOpenProfileModal={openInteractiveProfile}
            onOpenBagDrawer={() => {
              store.refreshInstalledApps();
              setShowBagModal(true);
            }}
            onRestoreSuccess={handleCloudRestoreSuccess}
            onRecalibrateHabitProfile={() => setShowOnboardingWizard(true)}
            tipSkipRemaining={store.tipSkipRemaining}
            onResetTipPromptBlock={store.resetTipPromptBlock}
            isDeveloper={store.isDeveloper}
            nextCloudReminderInfo={store.nextCloudReminderInfo}
          />
        </Suspense>
      ) : (
        <div className="min-h-screen zero-app-shell flex flex-col justify-between relative selection:bg-white selection:text-black">
          <AmbientBackground />

          {/* Top Status Bar Safe-Area Scrim */}
          <div
            aria-hidden="true"
            data-frosted-chrome="true"
            className={`fixed top-0 left-0 right-0 z-40 zero-top-scrim pointer-events-none ${
              isBespoke ? '' : 'backdrop-blur-md'
            }`}
            style={{ height: 'var(--zero-safe-top)' }}
          />

          {/* Main Content Area */}
          <main
            className="relative z-10 flex-1 flex flex-col justify-start"
            style={{
              paddingTop: 'var(--zero-safe-top)',
              paddingBottom: 'var(--zero-safe-bottom)',
            }}
          >
            <div key={activeTab} className="zn-view-enter flex-1 flex flex-col">
            {activeTab === 'dial' && (
              <LockDialView
                onIgnite={integrityViolation ? () => false : store.igniteSession}
                parachuteMetrics={store.parachuteMetrics}
                activeBag={store.activeBag}
                permissions={store.permissions}
                profile={store.profile}
                customHashtags={store.customHashtags}
                onAddCustomHashtag={store.addCustomHashtag}
                isZeroSupporter={store.isZeroSupporter}
                sessions={store.sessions}
                hasClaimedFirstTimeParachute={store.hasClaimedFirstTimeParachute}
                todayReclaimedHours={store.todayReclaimedHours}
                justEarnedParachute={store.justEarnedParachute}
                showWeeklyBackupBanner={store.weeklyBackupDue}
                cloudReminderInterval={store.cloudReminderInterval}
                isCloudBusy={store.isCloudBusy}
                onOneTapUpload={store.oneTapCloudUpload}
                onOneTapSave={store.oneTapSaveBackup}
                onExportZbakData={store.exportZbakData}
                onOpenTicketModal={() => setShowTicketModal(true)}
                onOpenBagDrawer={() => {
                  store.refreshInstalledApps();
                  setShowBagModal(true);
                }}
                onOpenPermissionGate={() => {
                  store.refreshPermissions();
                  setShowPermissionModal(true);
                }}
                onOpenProfileModal={openInteractiveProfile}
                onOpenThemes={() => {
                  setRulesSectionOverride({ section: 'themes', key: Date.now() });
                  setActiveTab('schedules');
                }}
                onOpenManualBackup={() => {
                  setRulesSectionOverride({ section: 'settings', key: Date.now() });
                  setActiveTab('schedules');
                }}
              />
            )}

            {activeTab === 'dashboard' && (
              <Suspense fallback={null}>
                <ParachuteDashboardView
                  parachuteMetrics={store.parachuteMetrics}
                  ledger={store.ledger}
                  sessions={store.sessions}
                  profile={store.profile}
                  themeConfig={store.themeConfig}
                  widgetsConfig={store.widgetsConfig}
                  onWidgetsConfigChange={store.setWidgetsConfig}
                  isZeroSupporter={store.isZeroSupporter}
                  hasClaimedFirstTimeParachute={store.hasClaimedFirstTimeParachute}
                  todayReclaimedHours={store.todayReclaimedHours}
                  justEarnedParachute={store.justEarnedParachute}
                  onOpenProfileModal={openInteractiveProfile}
                  onOpenTicketModal={() => setShowTicketModal(true)}
                />
              </Suspense>
            )}

            {(activeTab === 'schedules' || activeTab === 'support') && (
              <Suspense fallback={null}>
                <SchedulesDonateView
                  schedules={store.schedules}
                  permissions={store.permissions}
                  appBuildInfo={store.appBuildInfo}
                  environmentSecurity={store.environmentSecurity}
                  onRefreshPermissions={store.refreshPermissions}
                  onToggleSchedule={store.toggleSchedule}
                  onToggleScheduleBurnTheBoats={store.toggleScheduleBurnTheBoats}
                  onAddSchedule={store.addSchedule}
                  onDeleteSchedule={store.deleteSchedule}
                  onTriggerTestWarning={store.triggerTestWarning}
                  themeConfig={store.themeConfig}
                  onThemeConfigChange={store.setThemeConfig}
                  interfaceStyle={store.interfaceStyle}
                  onInterfaceStyleChange={store.setInterfaceStyle}
                  materialYouSeed={store.materialYouSeed}
                  onMaterialYouSeedChange={store.setMaterialYouSeed}
                  materialYouAmoled={store.materialYouAmoled}
                  onMaterialYouAmoledChange={store.setMaterialYouAmoled}
                  sectionOverride={rulesSectionOverride}
                  viewMode={activeTab === 'support' ? 'support' : 'settings_os'}
                  sleepFarmingMode={store.sleepFarmingMode}
                  onSleepFarmingModeChange={store.setSleepFarmingMode}
                  onExportZbakData={store.exportZbakData}
                  onOneTapSaveBackup={store.oneTapSaveBackup}
                  onImportData={store.importData}
                  onResetData={store.resetAllData}
                  cloudBackupStatus={store.cloudBackupStatus}
                  cloudReminderInterval={store.cloudReminderInterval}
                  lastCloudUploadTimestamp={store.lastCloudUploadTimestamp}
                  nextCloudReminderInfo={store.nextCloudReminderInfo}
                  onCloudReminderIntervalChange={store.setCloudReminderInterval}
                  isCloudBusy={store.isCloudBusy}
                  onEnableCloudAutoBackup={store.enableCloudAutoBackup}
                  onDisableCloudAutoBackup={store.disableCloudAutoBackup}
                  onOneTapCloudUpload={store.oneTapCloudUpload}
                  onRestoreFromCloudPicker={store.restoreBackupFromCloudPicker}
                  onRestoreSuccess={handleCloudRestoreSuccess}
                  tipSkipRemaining={store.tipSkipRemaining}
                  onResetTipPromptBlock={store.resetTipPromptBlock}
                  profile={store.profile}
                  isZeroSupporter={store.isZeroSupporter}
                  isDeveloper={store.isDeveloper}
                  remainingEscapeTickets={store.parachuteMetrics.currentBalance}
                  hasClaimedFirstTimeParachute={store.hasClaimedFirstTimeParachute}
                  hasClaimedFirstDonationParachute={store.hasClaimedFirstDonationParachute}
                  onOpenProfileModal={openInteractiveProfile}
                  onClaimFirstDonationBonus={store.claimFirstDonationBonus}
                  onActivateDonorToken={store.activateDonorUnlockToken}
                  onBurnAllEscapeTickets={store.burnAllEscapeTickets}
                  onRecalibrateHabitProfile={() => setShowOnboardingWizard(true)}
                />
              </Suspense>
            )}
            </div>
          </main>

          {/* Bottom Navigation Dock */}
          <LiquidDock
            activeTab={activeTab}
            ticketCount={store.parachuteMetrics.currentBalance}
            onSelectTab={setActiveTab}
          />
        </div>
      )}

      {/* 5-Minute Pre-Lock Heads-Up Warning Banner */}
      {store.preLockAlert && (
        <div
          className="fixed left-4 right-4 z-50 max-w-md mx-auto zn-modal-enter"
          style={{ top: 'calc(0.75rem + var(--zero-safe-top))' }}
        >
          <ObsidianCard
            ambientGlow={!isBespoke}
            className={isBespoke || isFluentGlass ? 'font-sans' : 'font-mono shadow-2xl'}
            headerClassName={
              isBespoke
                ? 'p-3.5 flex items-center justify-between gap-3'
                : 'p-3 flex items-center justify-between gap-2.5'
            }
            headerContent={
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={
                      isFluentGlass
                        ? 'liquid-squircle'
                        : `w-9 h-9 obsidian-icon-box flex items-center justify-center shrink-0 ${
                            isBespoke ? 'rounded-md' : 'rounded-xl'
                          }`
                    }
                    style={
                      isFluentGlass
                        ? undefined
                        : { color: isBespoke ? '#3B82F6' : 'var(--accent-hex, #FFFFFF)' }
                    }
                  >
                    <BellRing size={17} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs uppercase tracking-wider ${
                        isBespoke || isFluentGlass ? 'font-semibold' : 'font-black'
                      }`}
                      style={{
                        color: isFluentGlass
                          ? 'var(--liquid-accent-tint, var(--accent-primary))'
                          : isBespoke
                          ? '#60A5FA'
                          : 'var(--accent-hex, #FFFFFF)',
                      }}
                    >
                      Heads-up: Lock Starts in{' '}
                      <span className="font-mono tabular-nums">
                        {store.preLockAlert.minutesLeft}m
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-300 truncate">
                      &ldquo;{store.preLockAlert.scheduleName}&rdquo; is about to engage The Void.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => store.triggerTestWarning('')}
                  className={`p-1.5 border text-zinc-400 hover:text-white shrink-0 ${
                    isFluentGlass
                      ? 'rounded-xl liquid-pill border-transparent'
                      : isBespoke
                      ? 'rounded-md bg-neutral-950 border-neutral-800 transition-colors duration-75'
                      : 'rounded-xl bg-zinc-900 border-white/10'
                  }`}
                  aria-label="Dismiss Heads-up Warning"
                >
                  <X size={15} strokeWidth={1.75} />
                </button>
              </>
            }
          />
        </div>
      )}

      {/* Cloud Restore Confirmation Toast */}
      {restoreToast && (
        <div
          className="fixed left-4 right-4 z-50 max-w-md mx-auto zn-modal-enter"
          style={{ top: 'calc(0.75rem + var(--zero-safe-top))' }}
        >
          <ObsidianCard
            data-amoled-banner="true"
            accentOverride={{ hex: '#8B5CF6', rgb: '139, 92, 246' }}
            ambientGlow={!isBespoke}
            className={
              isBespoke || isFluentGlass ? 'font-sans text-xs' : 'font-mono text-xs shadow-2xl'
            }
            headerClassName="p-3 flex items-center justify-between gap-2"
            style={
              isBespoke || isFluentGlass
                ? undefined
                : {
                    backgroundColor: '#000000',
                    borderColor: 'rgba(139, 92, 246, 0.7)',
                    color: '#FFFFFF',
                  }
            }
            headerContent={
              <>
                <span className="amoled-banner-title font-bold">{restoreToast}</span>
                <button
                  type="button"
                  onClick={() => setRestoreToast('')}
                  className="p-1 text-zinc-400 hover:text-white shrink-0"
                  aria-label="Dismiss Cloud Restore Notification"
                >
                  <X size={14} strokeWidth={1.75} />
                </button>
              </>
            }
          />
        </div>
      )}

      {/* Shared Modals (Available across all interface styles including Aetherial Focus) */}
      <Suspense fallback={null}>
        {showBagModal && (
          <BagDrawerModal
            isOpen={showBagModal}
            bags={store.bags}
            activeBagId={store.activeBagId}
            installedApps={store.installedApps}
            environmentSecurity={store.environmentSecurity}
            onClose={() => setShowBagModal(false)}
            onSelectActiveBag={store.setActiveBagId}
            onUpdateBag={store.updateBag}
            onToggleBagApp={store.toggleBagApp}
            onUpdateBagAppRule={store.updateBagAppRule}
            onCreateCustomBag={store.createCustomBag}
            onDeleteCustomBag={store.deleteCustomBag}
            onRefreshInstalledApps={store.refreshInstalledApps}
          />
        )}

        {showPermissionModal && (
          <PermissionGateModal
            isOpen={showPermissionModal}
            permissions={store.permissions}
            onClose={() => setShowPermissionModal(false)}
            onRefresh={store.refreshPermissions}
            onProceedReady={() => setShowPermissionModal(false)}
          />
        )}

        {store.postSessionTipPrompt && (
          <TipAfterSessionModal
            completedSession={store.postSessionTipPrompt}
            hasClaimedFirstDonationParachute={store.hasClaimedFirstDonationParachute}
            onClaimFirstDonationBonus={store.claimFirstDonationBonus}
            onShareResults={() => {
              store.dismissPostSessionTipPrompt();
              setShowSessionFlexModal(true);
            }}
            onDismiss={store.dismissPostSessionTipPrompt}
            onBlockFiveSessions={store.blockTipPromptForFiveSessions}
          />
        )}

        {showSessionFlexModal && (
          <ShareStatsModal
            isOpen={showSessionFlexModal}
            sessions={store.sessions}
            parachuteMetrics={store.parachuteMetrics}
            currentStreak={store.currentStreak}
            profile={store.profile}
            themeConfig={store.themeConfig}
            isZeroSupporter={store.isZeroSupporter}
            onClose={() => setShowSessionFlexModal(false)}
          />
        )}

        {showProfileModal && (
          <ProfileModal
            isOpen={showProfileModal}
            mode={profileModalMode}
            initialProfile={store.profile}
            hasClaimedFirstTimeParachute={store.hasClaimedFirstTimeParachute}
            isZeroSupporter={store.isZeroSupporter}
            sessions={store.sessions}
            totalReclaimedHours={store.parachuteMetrics.totalReclaimedHours}
            themeConfig={store.themeConfig}
            onThemeConfigChange={store.setThemeConfig}
            customHashtags={store.customHashtags}
            onAddCustomHashtag={store.addCustomHashtag}
            isCloudBusy={store.isCloudBusy}
            environmentSecurity={store.environmentSecurity}
            onRestoreFromCloud={store.restoreBackupFromCloudPicker}
            onRestoreSuccess={handleCloudRestoreSuccess}
            onSaveProfile={store.saveProfileAndClaimGift}
            onClose={() => {
              setShowProfileModal(false);
              if (profileModalMode === 'welcome') {
                store.dismissWelcomePrompt();
              }
            }}
          />
        )}

        {store.parachuteRewardEvent && (
          <ParachuteRewardAnimation
            reward={store.parachuteRewardEvent}
            onDismiss={store.dismissParachuteRewardAnimation}
          />
        )}

        {showTicketModal && (
          <EscapeTicketModal
            isOpen={showTicketModal}
            ticketCount={store.parachuteMetrics.currentBalance}
            parachuteMetrics={store.parachuteMetrics}
            profile={store.profile}
            isZeroSupporter={store.isZeroSupporter}
            hasClaimedFirstTimeParachute={store.hasClaimedFirstTimeParachute}
            hasClaimedFirstDonationParachute={store.hasClaimedFirstDonationParachute}
            onClose={() => setShowTicketModal(false)}
            onOpenProfile={() => {
              setShowTicketModal(false);
              openInteractiveProfile();
            }}
            onOpenSupport={() => {
              setShowTicketModal(false);
              setActiveTab('support');
            }}
            onOpenInsights={() => {
              setShowTicketModal(false);
              setActiveTab('dashboard');
            }}
          />
        )}

        {(showZeroTubeModal || activeTab === 'zerotube') && (
          <ZeroTubeModal
            isOpen={showZeroTubeModal || activeTab === 'zerotube'}
            onClose={() => {
              setShowZeroTubeModal(false);
              if (activeTab === 'zerotube') {
                setActiveTab('dial');
              }
            }}
            onOpenSettingsStudio={() => {
              setShowZeroTubeModal(false);
              setActiveTab('schedules');
            }}
          />
        )}

        {/* Integrity Violation Unremovable Banner */}
        {integrityViolation && (
          <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-red-950 border-b border-red-500 text-white flex items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={20} className="text-red-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-200">
                  Tamper Alert: Integrity Verification Failed
                </h4>
                <p className="text-[11px] text-red-300">
                  Official author constants or support endpoints have been modified. Focus blocking actions are locked.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FTUE Theme-First & Habit Calibration Wizard */}
        {(showOnboardingWizard || !store.onboardingComplete) && !suppressOnboardingForRestore && (
          <OnboardingWizard
            themeConfig={store.themeConfig}
            setThemeConfig={store.setThemeConfig}
            interfaceStyle={store.interfaceStyle}
            setInterfaceStyle={store.setInterfaceStyle}
            installedApps={store.installedApps}
            onComplete={handleOnboardingComplete}
            onOpenRestore={() => {
              setSuppressOnboardingForRestore(true);
              setShowOnboardingWizard(false);
              openInteractiveProfile();
            }}
            onRestoreFromCloudPicker={async () => {
              const res = await store.restoreBackupFromCloudPicker();
              if (res.ok) {
                setSuppressOnboardingForRestore(false);
                setShowOnboardingWizard(false);
              }
              return res;
            }}
            onRestoreFromFile={async (content: string) => {
              const res = store.importData(content);
              if (res.ok) {
                setSuppressOnboardingForRestore(false);
                setShowOnboardingWizard(false);
              }
              return res;
            }}
          />
        )}

        {/* 4-Step Interactive Tour */}
        {showInteractiveTour && (
          <InteractiveTour
            onComplete={() => setShowInteractiveTour(false)}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Mindful Closure: What Did You Build? Victory Card */}
        {store.victorySession && (
          <SessionVictoryModal
            durationSeconds={store.victorySession.durationSeconds}
            sessionTag={store.victorySession.tag}
            onSave={(note, rating) => {
              store.saveSessionReflection(store.victorySession!.id, note, rating);
            }}
            onDismiss={() => {
              store.dismissVictoryModal();
            }}
          />
        )}

        {/* Global In-App Movement Reminder Alert */}
        {globalReminderAlert && (
          <ActionReminderAlertModal
            text={globalReminderAlert}
            voiceEnabled={globalReminderConfig.voiceEnabled}
            onDismiss={() => setGlobalReminderAlert(null)}
          />
        )}
      </Suspense>

      {/* 2-Second Swipe Again to Exit Toast */}
      {exitToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-zinc-900/95 border border-zinc-700 text-xs font-medium text-white shadow-xl flex items-center gap-2">
            <span>Swipe back again to exit Zero-Noise</span>
          </div>
        </div>
      )}

      {/* 7-Day Recurring Local Backup Reminder Nudge */}
      {backupNudgeVisible && (
        <div className="fixed bottom-24 right-4 z-40 max-w-sm pointer-events-auto">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-700 shadow-2xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Upload size={14} className="text-blue-400" />
                Backup Due (7 Days)
              </span>
              <button
                type="button"
                onClick={() => setBackupNudgeDismissed(true)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-[11px] text-zinc-300 leading-snug">
              Your discipline stats and Escape Tickets are stored locally. Export a .zbak backup to prevent data loss.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setBackupNudgeDismissed(true);
                  store.exportZbakData();
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center"
              >
                Save .zbak
              </button>
              <button
                type="button"
                onClick={() => setBackupNudgeDismissed(true)}
                className="py-1.5 px-3 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-xs"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Updater Release Prompt Modal */}
      {showUpdateModal && updateInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Update Available: v{updateInfo.latestVersion}</h3>
                  <p className="text-[11px] text-zinc-400">Current version: v{updateInfo.currentVersion}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  recordUpdatePromptShown();
                  setShowUpdateModal(false);
                }}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="text-xs text-zinc-300 max-h-40 overflow-y-auto space-y-1.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 whitespace-pre-wrap font-mono">
              {updateInfo.releaseNotes}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  recordUpdatePromptShown();
                  setShowUpdateModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Remind Me in 7 Days
              </button>
              <a
                href={updateInfo.apkDownloadUrl || updateInfo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  handleOpenExternalUrl(e, updateInfo.apkDownloadUrl || updateInfo.htmlUrl);
                  recordUpdatePromptShown();
                  setShowUpdateModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Download APK</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </InterfaceStyleProvider>
  );
}

export default App;
