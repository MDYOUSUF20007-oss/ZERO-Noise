import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type {
  SessionTag,
  SessionRecord,
  ParachuteMetrics,
  OccasionBag,
  NativePermissionStatus,
  ZeroProfile,
  CloudReminderInterval,
} from '../types';
import { useInterfaceStyle } from '../context/interfaceStyleStore';
import { haptics } from '../utils/haptics';
import {
  DEFAULT_SESSION_TAGS,
  mergeHashtagList,
  normalizeCustomHashtag,
} from '../utils/bagLayout';
import { ProfileAvatar } from './ProfileAvatar';
import { ObsidianCard } from './ObsidianCard';
import { getZeroRankFromHours } from '../utils/parachuteRewardsPolicy';
import { evaluateBadges } from '../utils/achievements';
import { ZeroSupporterGoldenBadge } from './AchievementBadgeChip';
import { IntentionRitualModal } from './IntentionRitualModal';
import {
  ShieldAlert,
  Clock,
  Flame,
  ChevronRight,
  Briefcase,
  Phone,
  MessageSquare,
  Gift,
  Sparkles,
  UserPlus,
  Trophy,
  Palette,
  Ticket,
  CloudUpload,
  Loader2,
  Download,
} from 'lucide-react';

const MAX_BURN_THE_BOATS_SECONDS = 4 * 3600;
const HOLD_DURATION_MS = 3000;

interface LockDialViewProps {
  onIgnite: (durationSeconds: number, tag: SessionTag, burnTheBoats?: boolean) => boolean;
  parachuteMetrics: ParachuteMetrics;
  activeBag: OccasionBag;
  permissions: NativePermissionStatus;
  profile: ZeroProfile | null;
  customHashtags?: string[];
  onAddCustomHashtag?: (tag: string) => string | null;
  isZeroSupporter: boolean;
  sessions: SessionRecord[];
  hasClaimedFirstTimeParachute: boolean;
  todayReclaimedHours: number;
  justEarnedParachute: boolean;
  showWeeklyBackupBanner?: boolean;
  cloudReminderInterval?: CloudReminderInterval;
  isCloudBusy?: boolean;
  onOneTapUpload?: () => Promise<{ ok: boolean; cancelled?: boolean; message: string }>;
  onOneTapSave?: () => Promise<{ ok: boolean; message: string }>;
  onExportZbakData?: () => string;
  onOpenTicketModal: () => void;
  onOpenBagDrawer: () => void;
  onOpenPermissionGate: () => void;
  onOpenProfileModal: () => void;
  onOpenThemes: () => void;
  onOpenManualBackup?: () => void;
}

const PRESET_DURATIONS = [
  { label: '5m', seconds: 5 * 60, desc: 'Quick Reset' },
  { label: '15m', seconds: 15 * 60, desc: 'Sprint' },
  { label: '25m', seconds: 25 * 60, desc: 'Pomodoro' },
  { label: '45m', seconds: 45 * 60, desc: 'Deep Focus' },
  { label: '1h', seconds: 60 * 60, desc: 'Standard' },
  { label: '2h', seconds: 120 * 60, desc: 'Deep Work' },
  { label: '4h', seconds: 240 * 60, desc: 'Monk Mode' },
  { label: '8h', seconds: 480 * 60, desc: 'Overnight' },
  { label: '24h', seconds: 1440 * 60, desc: 'Full Detox' },
];

const MIN_SECS = 5 * 60;
const MAX_SECS = 24 * 3600;
const DIAL_ARC_CIRCUMFERENCE = 829.38;
const UNTIL_TIME_FMT = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
});

function formatDialTime(secs: number): string {
  const hours = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${mins} min`;
}

function formatUntilTime(secs: number): string {
  return UNTIL_TIME_FMT.format(new Date(Date.now() + secs * 1000));
}

function secsToDialAngle(secs: number): number {
  const pct = (secs - MIN_SECS) / (MAX_SECS - MIN_SECS);
  return Math.min(360, Math.max(0, pct * 360));
}

const DIAL_TICKS = Array.from({ length: 60 }, (_, idx) => {
  const angleDeg = idx * 6;
  const isMajor = idx % 5 === 0;
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const rOuter = 136;
  const rInner = isMajor ? 123 : 129;
  return {
    idx,
    isMajor,
    x1: Number((144 + rInner * Math.cos(rad)).toFixed(2)),
    y1: Number((144 + rInner * Math.sin(rad)).toFixed(2)),
    x2: Number((144 + rOuter * Math.cos(rad)).toFixed(2)),
    y2: Number((144 + rOuter * Math.sin(rad)).toFixed(2)),
  };
});

const DialTickRing = React.memo(function DialTickRing({ isMaterial }: { isMaterial?: boolean }) {
  const majorStroke = isMaterial ? 'var(--md-sys-color-outline)' : 'rgba(255, 255, 255, 0.28)';
  const minorStroke = isMaterial ? 'var(--md-sys-color-outline-variant)' : 'rgba(255, 255, 255, 0.11)';
  return (
    <g>
      {DIAL_TICKS.map((t) => (
        <line
          key={t.idx}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={t.isMajor ? majorStroke : minorStroke}
          strokeWidth={t.isMajor ? '1.8' : '1.1'}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
});

const DialWheelSection = React.memo(function DialWheelSection({
  durationSeconds,
  onSelectDuration,
  isMaterial = false,
}: {
  durationSeconds: number;
  onSelectDuration: (secs: number) => void;
  isMaterial?: boolean;
}) {
  const dialRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const knobLayerRef = useRef<HTMLDivElement>(null);
  const durationTextRef = useRef<HTMLDivElement>(null);
  const untilTextRef = useRef<HTMLSpanElement>(null);

  const isDraggingRef = useRef<boolean>(false);
  const dialCenterRef = useRef<{ cx: number; cy: number }>({ cx: 0, cy: 0 });
  const latestSecsRef = useRef<number>(durationSeconds);
  const pendingCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastTouchAtRef = useRef<number>(0);
  const onSelectDurationRef = useRef(onSelectDuration);

  useEffect(() => {
    onSelectDurationRef.current = onSelectDuration;
  }, [onSelectDuration]);

  const applyDialVisuals = useCallback((secs: number) => {
    const angle = secsToDialAngle(secs);
    if (arcRef.current) {
      arcRef.current.setAttribute(
        'stroke-dasharray',
        `${(angle / 360) * DIAL_ARC_CIRCUMFERENCE} ${DIAL_ARC_CIRCUMFERENCE}`
      );
    }
    if (knobLayerRef.current) {
      knobLayerRef.current.style.transform = `rotate(${angle}deg)`;
    }
    if (durationTextRef.current) {
      durationTextRef.current.textContent = formatDialTime(secs);
    }
    if (untilTextRef.current) {
      untilTextRef.current.textContent = formatUntilTime(secs);
    }
  }, []);

  useEffect(() => {
    if (!isDraggingRef.current) {
      latestSecsRef.current = durationSeconds;
      applyDialVisuals(durationSeconds);
    }
  }, [durationSeconds, applyDialVisuals]);

  const computeAndApplyCoords = useCallback(
    (clientX: number, clientY: number) => {
      const { cx, cy } = dialCenterRef.current;
      const dx = clientX - cx;
      const dy = clientY - cy;

      let theta = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (theta < 0) theta += 360;

      const rawSecs = MIN_SECS + (theta / 360) * (MAX_SECS - MIN_SECS);
      const steppedMins = Math.round(rawSecs / 300) * 5;
      const clampedSecs = Math.min(MAX_SECS, Math.max(MIN_SECS, steppedMins * 60));

      if (clampedSecs !== latestSecsRef.current) {
        latestSecsRef.current = clampedSecs;
        haptics.tick(700 + (clampedSecs / MAX_SECS) * 600);
        applyDialVisuals(clampedSecs);
      }
    },
    [applyDialVisuals]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!dialRef.current || e.touches.length === 0) return;
      lastTouchAtRef.current = Date.now();
      const rect = dialRef.current.getBoundingClientRect();
      dialCenterRef.current = {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      };
      isDraggingRef.current = true;
      dialRef.current.dataset.dialDragging = 'true';
      computeAndApplyCoords(e.touches[0].clientX, e.touches[0].clientY);
    },
    [computeAndApplyCoords]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (Date.now() - lastTouchAtRef.current < 500) return;
      if (!dialRef.current) return;
      const rect = dialRef.current.getBoundingClientRect();
      dialCenterRef.current = {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      };
      isDraggingRef.current = true;
      dialRef.current.dataset.dialDragging = 'true';
      computeAndApplyCoords(e.clientX, e.clientY);
    },
    [computeAndApplyCoords]
  );

  useEffect(() => {
    const flushPending = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      const coords = pendingCoordsRef.current;
      pendingCoordsRef.current = null;
      if (coords && isDraggingRef.current) {
        computeAndApplyCoords(coords.x, coords.y);
      }
    };

    const scheduleMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      pendingCoordsRef.current = { x: clientX, y: clientY };
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          const coords = pendingCoordsRef.current;
          pendingCoordsRef.current = null;
          if (coords && isDraggingRef.current) {
            computeAndApplyCoords(coords.x, coords.y);
          }
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => scheduleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length === 0) return;
      if (e.cancelable) e.preventDefault();
      scheduleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onEnd = () => {
      if (!isDraggingRef.current) return;
      flushPending();
      isDraggingRef.current = false;
      if (dialRef.current) {
        delete dialRef.current.dataset.dialDragging;
      }
      haptics.thud();
      onSelectDurationRef.current(latestSecsRef.current);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    window.addEventListener('blur', onEnd);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
      window.removeEventListener('blur', onEnd);
    };
  }, [computeAndApplyCoords]);

  const initialAngle = secsToDialAngle(durationSeconds);

  return (
    <div className="zn-dial-enter my-auto flex flex-col items-center justify-center relative w-full py-1">
      <div
        ref={dialRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`zero-dial-surface zero-dial-ring liquid-dial-outer relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow ${
          isMaterial ? 'border' : 'border border-white/10'
        }`}
        style={{
          touchAction: 'none',
          backgroundColor: isMaterial ? 'var(--md-sys-color-surface-container-low)' : '#0F1117',
          borderColor: isMaterial ? 'var(--md-sys-color-outline-variant)' : undefined,
        }}
      >
        <svg
          className="absolute pointer-events-none inset-0 w-full h-full"
          viewBox="0 0 288 288"
        >
          <defs>
            <linearGradient id="zeroLiquidDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'var(--accent-primary, #f43f5e)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--accent-secondary, #fb7185)' }} />
            </linearGradient>
          </defs>
          <DialTickRing isMaterial={isMaterial} />
          <circle
            ref={arcRef}
            cx="144"
            cy="144"
            r="130"
            fill="none"
            stroke={isMaterial ? 'var(--accent-hex, #E69F86)' : 'url(#zeroLiquidDialGrad)'}
            strokeWidth="4.5"
            strokeDasharray={`${(initialAngle / 360) * DIAL_ARC_CIRCUMFERENCE} ${DIAL_ARC_CIRCUMFERENCE}`}
            strokeLinecap="round"
            transform="rotate(-90 144 144)"
            className="zero-dial-arc transition-[stroke-dasharray] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
        </svg>

        <div
          ref={knobLayerRef}
          className="zero-dial-knob-layer absolute pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] w-full h-full"
          style={{ transform: `rotate(${initialAngle}deg)` }}
        >
          <div
            className="zero-dial-knob-thumb absolute top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: isMaterial ? 'var(--md-sys-color-surface-container-lowest)' : '#090A0E',
              borderColor: isMaterial ? 'var(--md-sys-color-primary)' : 'var(--accent-primary, #f43f5e)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: isMaterial ? 'var(--md-sys-color-primary)' : 'var(--accent-primary, #f43f5e)' }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center z-10 pointer-events-none">
          {isMaterial ? (
            <span
              className="px-2.5 py-0.5 rounded-md text-[11px] font-sans mb-1 font-medium"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container)',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              Lock duration
            </span>
          ) : (
            <span className="text-[11px] font-sans mb-1 font-medium text-zinc-400">
              Lock duration
            </span>
          )}
          <div
            ref={durationTextRef}
            className="font-display tabular-nums text-4xl font-bold tracking-tight liquid-metric"
            style={isMaterial ? { color: 'var(--md-sys-color-on-surface)' } : undefined}
          >
            {formatDialTime(durationSeconds)}
          </div>
          {isMaterial ? (
            <div
              className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container)',
                color: 'var(--md-sys-color-on-surface-variant)',
                border: '1px solid var(--md-sys-color-outline-variant)',
              }}
            >
              <Clock size={12} strokeWidth={2} style={{ color: 'var(--md-sys-color-primary)' }} />
              <span>
                Until{' '}
                <span
                  ref={untilTextRef}
                  className="font-mono tabular-nums font-semibold"
                  style={{ color: 'var(--md-sys-color-on-surface)' }}
                >
                  {formatUntilTime(durationSeconds)}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-sans text-zinc-200 bg-white/[0.06] border border-white/[0.11] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
              <Clock
                size={12}
                strokeWidth={1.9}
                style={{ color: 'var(--liquid-accent-tint, var(--accent-primary))' }}
              />
              <span>
                Until{' '}
                <span
                  ref={untilTextRef}
                  className="font-mono tabular-nums font-semibold text-white"
                >
                  {formatUntilTime(durationSeconds)}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick-Preset Chips */}
      <div
        className="flex items-center justify-center flex-wrap max-w-sm gap-2 mt-5 zn-stagger-item"
        style={{ '--zn-stagger-idx': 1 } as React.CSSProperties}
      >
        {PRESET_DURATIONS.map((preset) => {
          const isSelected = durationSeconds === preset.seconds;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                haptics.thud();
                onSelectDuration(preset.seconds);
              }}
              style={
                isMaterial
                  ? isSelected
                    ? {
                        backgroundColor: 'var(--md-sys-color-primary-container)',
                        color: 'var(--md-sys-color-on-primary-container)',
                        borderColor: 'var(--md-sys-color-outline)',
                      }
                    : {
                        backgroundColor: 'var(--md-sys-color-surface-container)',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        borderColor: 'var(--md-sys-color-outline-variant)',
                      }
                  : undefined
              }
              className={`min-h-[36px] px-3.5 py-1.5 text-xs font-sans tabular-nums inline-flex items-center justify-center liquid-spring active:scale-[0.98] cursor-pointer border ${
                isMaterial
                  ? isSelected
                    ? 'rounded-lg font-semibold'
                    : 'rounded-lg font-medium'
                  : isSelected
                  ? 'rounded-full liquid-pill-active font-semibold'
                  : 'rounded-full liquid-pill-inactive font-medium'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export const LockDialView: React.FC<LockDialViewProps> = ({
  onIgnite,
  parachuteMetrics,
  activeBag,
  permissions,
  profile,
  customHashtags = [],
  onAddCustomHashtag,
  isZeroSupporter,
  sessions,
  hasClaimedFirstTimeParachute,
  todayReclaimedHours,
  justEarnedParachute,
  showWeeklyBackupBanner = false,
  cloudReminderInterval = 'weekly',
  isCloudBusy = false,
  onOneTapUpload,
  onOneTapSave,
  onExportZbakData,
  onOpenTicketModal,
  onOpenBagDrawer,
  onOpenPermissionGate,
  onOpenProfileModal,
  onOpenThemes,
  onOpenManualBackup,
}) => {
  const { isMaterial } = useInterfaceStyle();
  const [cloudBannerMsg, setCloudBannerMsg] = useState<string>('');
  const [durationSeconds, setDurationSeconds] = useState<number>(45 * 60);
  const [selectedTag, setSelectedTag] = useState<SessionTag>('Deep Work');
  const [customTagInput, setCustomTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [localExtraTags, setLocalExtraTags] = useState<string[]>([]);

  // Hold-to-lock states
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const holdStartTimeRef = useRef<number | null>(null);
  const holdAnimFrameRef = useRef<number | null>(null);

  // 5-Second Intention Ritual state
  const [intentionRitualEnabled, setIntentionRitualEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('zero_intention_ritual_v1');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });
  const [showIntentionRitual, setShowIntentionRitual] = useState<boolean>(false);

  // Burn the Boats state (Hard maximum limit: 4 hours = 14,400 seconds)
  const [burnTheBoatsEnabled, setBurnTheBoatsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('zero_burn_the_boats_v1') === 'true';
    } catch {
      return false;
    }
  });
  const [burnBoatsWarning, setBurnBoatsWarning] = useState<string | null>(null);

  const handleSelectDuration = useCallback(
    (nextDuration: number) => {
      setDurationSeconds(nextDuration);
      if (nextDuration > MAX_BURN_THE_BOATS_SECONDS && burnTheBoatsEnabled) {
        setBurnTheBoatsEnabled(false);
        try {
          localStorage.setItem('zero_burn_the_boats_v1', 'false');
        } catch {}
        setBurnBoatsWarning(
          'Burn the Boats auto-disabled: sessions exceeding 4 hours cannot use Burn the Boats.'
        );
      }
    },
    [burnTheBoatsEnabled]
  );

  useEffect(() => {
    if (!burnBoatsWarning) return;
    const timer = setTimeout(() => setBurnBoatsWarning(null), 4000);
    return () => clearTimeout(timer);
  }, [burnBoatsWarning]);

  const allTags = useMemo(
    () => mergeHashtagList([...customHashtags, ...localExtraTags], DEFAULT_SESSION_TAGS),
    [customHashtags, localExtraTags]
  );

  const triggerIgnition = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    holdStartTimeRef.current = null;
    if (holdAnimFrameRef.current) cancelAnimationFrame(holdAnimFrameRef.current);

    if (permissions.isNativeAndroid && !permissions.strictReady) {
      onOpenPermissionGate();
      return;
    }

    const started = onIgnite(durationSeconds, selectedTag, burnTheBoatsEnabled);
    if (started === false) {
      onOpenPermissionGate();
    } else if (burnTheBoatsEnabled) {
      // Auto-reset Burn the Boats after ignition so it is never accidentally left active for future sessions
      setBurnTheBoatsEnabled(false);
      try {
        localStorage.setItem('zero_burn_the_boats_v1', 'false');
      } catch {}
    }
  }, [durationSeconds, selectedTag, burnTheBoatsEnabled, onIgnite, permissions.isNativeAndroid, permissions.strictReady, onOpenPermissionGate]);

  useEffect(() => {
    if (!isHolding) return;
    const startMs = holdStartTimeRef.current ?? Date.now();
    holdStartTimeRef.current = startMs;

    let frameId = 0;
    const tick = () => {
      const elapsed = Date.now() - startMs;
      const prog = Math.min(1, elapsed / HOLD_DURATION_MS);
      setHoldProgress(prog);

      if (prog >= 1) {
        setIsHolding(false);
        setHoldProgress(0);
        holdStartTimeRef.current = null;
        holdAnimFrameRef.current = null;
        haptics.stopHoldCharge();

        if (permissions.isNativeAndroid && !permissions.strictReady) {
          onOpenPermissionGate();
          return;
        }

        if (intentionRitualEnabled) {
          setShowIntentionRitual(true);
        } else {
          triggerIgnition();
        }
      } else {
        frameId = requestAnimationFrame(tick);
        holdAnimFrameRef.current = frameId;
      }
    };

    frameId = requestAnimationFrame(tick);
    holdAnimFrameRef.current = frameId;
    return () => {
      cancelAnimationFrame(frameId);
      holdAnimFrameRef.current = null;
    };
  }, [
    isHolding,
    triggerIgnition,
    intentionRitualEnabled,
    permissions.isNativeAndroid,
    permissions.strictReady,
    onOpenPermissionGate,
  ]);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (permissions.isNativeAndroid && !permissions.strictReady) {
      haptics.tick(500);
      onOpenPermissionGate();
      return;
    }
    holdStartTimeRef.current = Date.now();
    setHoldProgress(0);
    setIsHolding(true);
    haptics.startHoldCharge();
  };

  const cancelHold = () => {
    if (isHolding) {
      setIsHolding(false);
      setHoldProgress(0);
      holdStartTimeRef.current = null;
      haptics.stopHoldCharge();
      if (holdAnimFrameRef.current) {
        cancelAnimationFrame(holdAnimFrameRef.current);
        holdAnimFrameRef.current = null;
      }
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = normalizeCustomHashtag(customTagInput);
    if (!cleaned) return;
    const added = onAddCustomHashtag?.(cleaned) ?? cleaned;
    setLocalExtraTags((prev) => mergeHashtagList([...prev, added], []));
    setSelectedTag(added);
    setCustomTagInput('');
    setIsAddingTag(false);
    haptics.tick(880);
  };

  const profileRank = getZeroRankFromHours(parachuteMetrics.totalReclaimedHours);
  const badgeSummary = useMemo(
    () =>
      evaluateBadges({
        sessions,
        totalReclaimedHours: parachuteMetrics.totalReclaimedHours,
        isZeroSupporter,
      }),
    [sessions, parachuteMetrics.totalReclaimedHours, isZeroSupporter]
  );
  const dailyGoalPct = profile
    ? Math.min(100, Math.round((todayReclaimedHours / Math.max(1, profile.dailyGoalHours)) * 100))
    : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-between max-w-md mx-auto w-full select-none px-4 py-4 pb-36 gap-4 font-sans">
      {/* Interactive Profile Strip + Compact Escape Ticket + 1-Tap Theme Studio Shortcut */}
      <div
        className="w-full flex items-stretch gap-2 zn-stagger-item"
        style={{ '--zn-stagger-idx': 0 } as React.CSSProperties}
      >
        {profile ? (
          isMaterial ? (
            <div
              className="flex-1 min-w-0 p-2.5 flex items-center justify-between gap-2 rounded-[20px] border"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
            >
              <ProfileAvatar
                avatarId={profile.avatarId}
                size="sm"
                interactive
              />
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="flex-1 min-w-0 text-left group flex items-center justify-between gap-1.5 font-sans cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="truncate font-display font-bold text-[13px]"
                      style={{ color: 'var(--md-sys-color-on-surface)' }}
                    >
                      {profile.displayName}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0"
                      style={{
                        backgroundColor: 'var(--md-sys-color-secondary-container)',
                        color: 'var(--md-sys-color-on-secondary-container)',
                      }}
                    >
                      {profileRank.title}
                    </span>
                    {isZeroSupporter && <ZeroSupporterGoldenBadge compact />}
                  </div>
                  <div
                    className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-tight"
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  >
                    <span className="whitespace-nowrap">
                      <span
                        className="font-mono tabular-nums font-semibold"
                        style={{ color: 'var(--md-sys-color-on-surface)' }}
                      >
                        {todayReclaimedHours}h / {profile.dailyGoalHours}h
                      </span>{' '}
                      •
                    </span>
                    <span className="truncate max-w-full">#{profile.primaryMission}</span>
                    {badgeSummary.unlockedBadges.length > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 shrink-0 font-mono tabular-nums font-semibold"
                        style={{ color: 'var(--md-sys-color-on-surface)' }}
                      >
                        <Trophy size={9} strokeWidth={1.75} />
                        {badgeSummary.unlockedBadges.length}/{badgeSummary.badges.length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className="w-8 rounded-full h-1.5 hidden sm:block overflow-hidden"
                    style={{ backgroundColor: 'var(--md-sys-color-surface-container-highest)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${dailyGoalPct}%`,
                        backgroundColor: 'var(--md-sys-color-primary)',
                      }}
                    />
                  </div>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: 'var(--md-sys-color-primary)' }}
                  >
                    Edit
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <ObsidianCard
              fullWidth={false}
              className="flex-1 min-w-0"
              headerClassName="p-3 flex items-center justify-between gap-2.5"
              headerContent={
                <>
                  <ProfileAvatar
                    avatarId={profile.avatarId}
                    size="sm"
                    interactive
                  />
                  <button
                    type="button"
                    onClick={onOpenProfileModal}
                    className="flex-1 min-w-0 text-left group flex items-center justify-between gap-1.5 font-sans"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="truncate font-display font-bold text-[13px] text-white">
                          {profile.displayName}
                        </span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border shrink-0"
                          style={{
                            backgroundColor: 'var(--accent-soft, rgba(244, 63, 94, 0.16))',
                            borderColor: 'var(--accent-border, rgba(244, 63, 94, 0.45))',
                            color: 'var(--liquid-accent-tint, var(--accent-primary))',
                          }}
                        >
                          {profileRank.title}
                        </span>
                        {isZeroSupporter && <ZeroSupporterGoldenBadge compact />}
                      </div>
                      <div className="truncate mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
                        <span>
                          <span className="font-mono tabular-nums">
                            {todayReclaimedHours}h / {profile.dailyGoalHours}h
                          </span>{' '}
                          • #{profile.primaryMission}
                        </span>
                        {badgeSummary.unlockedBadges.length > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 shrink-0 font-mono tabular-nums font-semibold"
                            style={{ color: 'var(--liquid-accent-tint, var(--accent-primary))' }}
                          >
                            <Trophy size={9} strokeWidth={1.75} />
                            {badgeSummary.unlockedBadges.length}/{badgeSummary.badges.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-8 liquid-track rounded-full h-1.5 hidden sm:block overflow-hidden">
                        <div
                          className="h-full liquid-mercury-fill"
                          style={{ width: `${dailyGoalPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-zinc-400 group-hover:text-white font-medium transition-colors duration-75">
                        Edit
                      </span>
                    </div>
                  </button>
                </>
              }
            />
          )
        ) : (
          isMaterial ? (
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="flex-1 min-w-0 p-3 flex items-center justify-between gap-2.5 rounded-[20px] border text-left cursor-pointer liquid-spring"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                  }}
                >
                  {hasClaimedFirstTimeParachute ? (
                    <UserPlus size={15} strokeWidth={1.85} />
                  ) : (
                    <Gift size={15} strokeWidth={1.85} />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div
                    className="text-xs truncate font-semibold"
                    style={{ color: 'var(--md-sys-color-on-surface)' }}
                  >
                    {hasClaimedFirstTimeParachute ? 'Create Profile' : 'Profile • +1 Ticket'}
                  </div>
                  <div
                    className="text-[10px] truncate"
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  >
                    {hasClaimedFirstTimeParachute ? 'Goal & emblem' : 'Free starter ticket'}
                  </div>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0"
                style={{
                  backgroundColor: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                }}
              >
                <Sparkles size={10} strokeWidth={1.85} />
                <span>{hasClaimedFirstTimeParachute ? 'Set' : 'Claim'}</span>
              </span>
            </button>
          ) : (
            <ObsidianCard
              asButton
              fullWidth={false}
              onClick={onOpenProfileModal}
              className="flex-1 min-w-0"
              headerClassName="p-3 flex items-center justify-between gap-2.5 font-sans"
              headerContent={
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="liquid-squircle">
                      {hasClaimedFirstTimeParachute ? (
                        <UserPlus size={15} strokeWidth={1.75} />
                      ) : (
                        <Gift size={15} strokeWidth={1.75} />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-xs truncate font-semibold text-white">
                        {hasClaimedFirstTimeParachute ? 'Create Profile' : 'Profile • +1 Ticket'}
                      </div>
                      <div
                        className="text-[10px] truncate font-medium"
                        style={{ color: 'var(--liquid-accent-tint, var(--accent-primary))' }}
                      >
                        {hasClaimedFirstTimeParachute ? 'Goal & emblem' : 'Free starter ticket'}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full liquid-pill-active text-[10px] font-semibold uppercase tracking-wide shrink-0">
                    <Sparkles size={10} strokeWidth={1.75} />
                    <span>{hasClaimedFirstTimeParachute ? 'Set' : 'Claim'}</span>
                  </span>
                </>
              }
            />
          )
        )}

        {/* Compact Escape Ticket Shortcut (left of Theme) */}
        {isMaterial ? (
          <button
            type="button"
            onClick={() => {
              haptics.tick(860);
              onOpenTicketModal();
            }}
            className={`shrink-0 px-3 py-2 rounded-[20px] border flex items-center justify-center gap-2 cursor-pointer liquid-spring ${
              justEarnedParachute ? 'ring-2 ring-[var(--md-sys-color-primary)]' : ''
            }`}
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface)',
            }}
            title={`Escape Tickets (${parachuteMetrics.currentBalance}) — Tap to inspect ticket`}
            aria-label={`View Escape Ticket (${parachuteMetrics.currentBalance} available)`}
          >
            <div
              className="w-7 h-7 flex items-center justify-center rounded-xl"
              style={{
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
              }}
            >
              <Ticket size={14} strokeWidth={2} />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span
                className="text-xs font-bold font-mono tabular-nums"
                style={{ color: 'var(--md-sys-color-on-surface)' }}
              >
                {parachuteMetrics.currentBalance}
              </span>
              <span
                className="text-[10px] font-medium mt-0.5"
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                {parachuteMetrics.currentBalance === 1 ? 'Ticket' : 'Tickets'}
              </span>
            </div>
          </button>
        ) : (
          <ObsidianCard
            asButton
            fullWidth={false}
            onClick={() => {
              haptics.tick(860);
              onOpenTicketModal();
            }}
            className="shrink-0"
            style={
              justEarnedParachute
                ? { borderColor: 'var(--accent-primary, #f43f5e)' }
                : undefined
            }
            headerClassName="flex-1 px-2.5 py-2 flex flex-col items-center justify-center gap-1 font-sans text-zinc-300 hover:text-white transition-colors duration-75"
            title={`Escape Tickets (${parachuteMetrics.currentBalance}) — Tap to inspect ticket`}
            aria-label={`View Escape Ticket (${parachuteMetrics.currentBalance} available)`}
            headerContent={
              <>
                <div
                  className="relative w-6 h-6 obsidian-icon-box flex items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: 'var(--accent-soft, rgba(244, 63, 94, 0.14))',
                    border: '1px solid var(--accent-border, rgba(255, 255, 255, 0.16))',
                  }}
                >
                  <Ticket
                    size={13}
                    strokeWidth={2}
                    style={{ color: 'var(--liquid-accent-tint, var(--accent-primary))' }}
                  />
                  {parachuteMetrics.currentBalance > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#090A0E] border border-white/25 text-[9px] font-mono font-semibold leading-[13px] text-white text-center flex items-center justify-center"
                    >
                      {parachuteMetrics.currentBalance}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-none font-medium text-zinc-200">
                  {parachuteMetrics.currentBalance === 1 ? 'Ticket' : 'Tickets'}
                </span>
              </>
            }
          />
        )}

        {isMaterial ? (
          <button
            type="button"
            onClick={() => {
              haptics.tick(820);
              onOpenThemes();
            }}
            className="shrink-0 px-3 py-2 rounded-[20px] border flex flex-col items-center justify-center gap-1 cursor-pointer liquid-spring"
            style={{
              backgroundColor: 'var(--md-sys-color-primary-container)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-primary-container)',
            }}
            title="Open Theme Studio (Material Dusk, Fluent Glass)"
            aria-label="Open Theme Studio"
          >
            <Palette size={15} strokeWidth={2} />
            <span className="text-[10px] leading-none font-semibold">Theme</span>
          </button>
        ) : (
          <ObsidianCard
            asButton
            fullWidth={false}
            onClick={() => {
              haptics.tick(820);
              onOpenThemes();
            }}
            className="shrink-0"
            headerClassName="flex-1 px-2.5 py-2 flex flex-col items-center justify-center gap-1 font-sans text-zinc-200 hover:text-white transition-colors duration-75"
            title="Open Theme Studio (Fluent Glass, Material Dusk)"
            aria-label="Open Theme Studio"
            headerContent={
              <>
                <div
                  className="w-6 h-6 obsidian-icon-box flex items-center justify-center rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.40)]"
                  style={{
                    backgroundColor: 'var(--accent-primary, #f43f5e)',
                    border: '1px solid rgba(255, 255, 255, 0.28)',
                    color: 'var(--text-on-accent, #ffffff)',
                  }}
                >
                  <Palette
                    size={12}
                    strokeWidth={2}
                    style={{ color: 'var(--text-on-accent, #ffffff)' }}
                  />
                </div>
                <span className="text-[10px] leading-none font-medium text-zinc-200">
                  Theme
                </span>
              </>
            }
          />
        )}
      </div>

      {/* Native Android Strict Permission Banner — only shown when permissions are NOT armed yet */}
      {permissions.isNativeAndroid && !permissions.strictReady && (
        <ObsidianCard
          asButton
          onClick={onOpenPermissionGate}
          headerClassName="px-4 py-3 font-sans text-xs flex items-center justify-between gap-2"
          footerClassName="px-4 py-2 font-sans text-[10px] text-zinc-400"
          headerContent={
            <>
              <div className="flex items-center gap-2 min-w-0">
                <ShieldAlert
                  size={14}
                  strokeWidth={1.75}
                  className="shrink-0"
                  style={{ color: 'var(--liquid-accent-tint, var(--accent-primary))' }}
                />
                <span className="truncate font-semibold text-white">
                  Permissions Required Before Locking
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full liquid-pill-active font-semibold uppercase tracking-wide shrink-0 ml-2">
                Grant Now
              </span>
            </>
          }
          footerContent={
            <span>
              Order: Usage / Accessibility -&gt; App Info (if denied) -&gt; Overlay
            </span>
          }
        />
      )}

      {/* Weekly / Monthly Cloud Upload Reminder Banner */}
      {(showWeeklyBackupBanner || cloudBannerMsg) && (
        <ObsidianCard
          data-amoled-banner="true"
          accentOverride={{ hex: '#4FACFE', rgb: '79, 172, 254' }}
          headerClassName="p-5 font-sans space-y-3"
          footerClassName="px-5 py-2.5 font-sans"
          headerContent={
            <>
              {showWeeklyBackupBanner && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="liquid-squircle">
                      <CloudUpload size={15} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white leading-snug">
                        {cloudReminderInterval === 'monthly'
                          ? 'Monthly Cloud Upload Due — Keep your donor perks & stats safe'
                          : 'Weekly Cloud Upload Due — Keep your donor perks & stats safe'}
                      </div>
                    </div>
                  </div>

                  {onOneTapUpload && (
                    <button
                      type="button"
                      disabled={isCloudBusy}
                      onClick={async () => {
                        haptics.tick(860);
                        const res = await onOneTapUpload();
                        if (!res.cancelled && res.message) {
                          setCloudBannerMsg(res.message);
                          setTimeout(() => setCloudBannerMsg(''), 4500);
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-xl liquid-pill-active font-semibold text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 disabled:opacity-60 liquid-spring active:scale-[0.98]"
                    >
                      {isCloudBusy ? (
                        <Loader2 size={12} strokeWidth={1.75} className="animate-spin" />
                      ) : (
                        <CloudUpload size={12} strokeWidth={1.75} />
                      )}
                      <span>Upload Stats to Cloud</span>
                    </button>
                  )}

                  {(onOneTapSave || onExportZbakData || onOpenManualBackup) && (
                    <div className="grid grid-cols-2 gap-2.5">
                      {(onOneTapSave || onExportZbakData) && (
                        <button
                          type="button"
                          disabled={isCloudBusy}
                          onClick={async () => {
                            haptics.tick(820);
                            if (onOneTapSave) {
                              const res = await onOneTapSave();
                              setCloudBannerMsg(res.message);
                            } else {
                              onExportZbakData?.();
                              setCloudBannerMsg('Saved zero-backup.zbak to storage.');
                            }
                            setTimeout(() => setCloudBannerMsg(''), 4500);
                          }}
                          className="py-2 px-3 rounded-xl liquid-pill font-medium text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 disabled:opacity-60 liquid-spring active:scale-[0.98]"
                        >
                          <Download size={11} strokeWidth={1.75} />
                          <span>One-Tap Save</span>
                        </button>
                      )}
                      {onOpenManualBackup && (
                        <button
                          type="button"
                          onClick={() => {
                            haptics.tick(820);
                            onOpenManualBackup();
                          }}
                          className="py-2 px-3 rounded-xl liquid-pill font-medium text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5 liquid-spring active:scale-[0.98]"
                        >
                          <Clock size={11} strokeWidth={1.75} />
                          <span>Timer / Settings &rarr;</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {cloudBannerMsg && (
                <div className="text-[11px] px-3 py-2 rounded-xl liquid-row text-zinc-200">
                  {cloudBannerMsg}
                </div>
              )}
            </>
          }
          footerContent={
            <div className="text-[11px] text-zinc-400 leading-snug">
              Saves only your stats, Escape Tickets &amp; donor perks (<code className="font-mono">zero-backup.zbak</code>).
            </div>
          }
        />
      )}

      {/* Center: Tactile Duration Dial Wheel */}
      <DialWheelSection
        durationSeconds={durationSeconds}
        onSelectDuration={handleSelectDuration}
        isMaterial={isMaterial}
      />

      {/* Bottom Area: Bag Selector, Tags & Hold to Lock */}
      <div
        className="w-full flex flex-col items-center mt-auto gap-4 zn-stagger-item"
        style={{ '--zn-stagger-idx': 2 } as React.CSSProperties}
      >
        {/* Session Tags */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-sans font-medium"
              style={isMaterial ? { color: 'var(--md-sys-color-on-surface-variant)' } : { color: '#d4d4d8' }}
            >
              Session focus tag
            </span>
            <button
              type="button"
              onClick={() => setIsAddingTag(!isAddingTag)}
              className="text-[11px] font-sans cursor-pointer transition-colors duration-75 font-semibold"
              style={isMaterial ? { color: 'var(--md-sys-color-primary)' } : { color: '#d4d4d8' }}
            >
              {isAddingTag ? 'Cancel' : '+ Custom'}
            </button>
          </div>

          {isAddingTag ? (
            <form onSubmit={handleAddCustomTag} className="flex gap-2 mb-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="e.g. Thesis, Meditation..."
                maxLength={20}
                autoFocus
                className={`flex-1 text-xs rounded-xl px-3 py-2 font-sans outline-none ${
                  isMaterial ? 'border' : 'obsidian-input text-white'
                }`}
                style={
                  isMaterial
                    ? {
                        backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                        borderColor: 'var(--md-sys-color-outline)',
                        color: 'var(--md-sys-color-on-surface)',
                      }
                    : undefined
                }
              />
              <button
                type="submit"
                style={
                  isMaterial
                    ? {
                        backgroundColor: 'var(--md-sys-color-primary)',
                        color: 'var(--md-sys-color-on-primary)',
                      }
                    : undefined
                }
                className={`text-xs font-sans font-semibold px-4 py-2 rounded-xl liquid-spring active:scale-[0.97] cursor-pointer ${
                  isMaterial ? '' : 'liquid-pill-active'
                }`}
              >
                Add
              </button>
            </form>
          ) : (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              {allTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      haptics.tick(900);
                      setSelectedTag(tag);
                    }}
                    style={
                      isMaterial
                        ? isSelected
                          ? {
                              backgroundColor: 'var(--md-sys-color-primary-container)',
                              color: 'var(--md-sys-color-on-primary-container)',
                              borderColor: 'var(--md-sys-color-outline)',
                            }
                          : {
                              backgroundColor: 'var(--md-sys-color-surface-container)',
                              color: 'var(--md-sys-color-on-surface-variant)',
                              borderColor: 'var(--md-sys-color-outline-variant)',
                            }
                        : undefined
                    }
                    className={`min-h-[36px] px-3.5 py-1.5 text-xs font-sans whitespace-nowrap inline-flex items-center justify-center liquid-spring active:scale-[0.98] cursor-pointer border ${
                      isMaterial
                        ? isSelected
                          ? 'rounded-lg font-semibold'
                          : 'rounded-lg font-medium'
                        : isSelected
                        ? 'rounded-full liquid-pill-active font-semibold'
                        : 'rounded-full liquid-pill-inactive font-medium'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Bag Card */}
        {isMaterial ? (
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenBagDrawer}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenBagDrawer();
              }
            }}
            className="w-full rounded-[20px] p-4 flex flex-col gap-2.5 text-left group cursor-pointer liquid-spring border"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--md-sys-color-secondary-container)',
                    color: 'var(--md-sys-color-on-secondary-container)',
                  }}
                >
                  <Briefcase size={16} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs truncate font-semibold"
                      style={{ color: 'var(--md-sys-color-on-surface)' }}
                    >
                      Bag: {activeBag.name}
                    </span>
                    <span
                      className="text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-md shrink-0 font-semibold"
                      style={{
                        backgroundColor: 'var(--md-sys-color-surface-container-high)',
                        color: 'var(--md-sys-color-on-surface-variant)',
                      }}
                    >
                      {activeBag.apps.length} app{activeBag.apps.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div
                    className="truncate mt-0.5 text-[11px]"
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  >
                    {activeBag.occasionLabel}
                  </div>
                </div>
              </div>
              <span
                className="text-xs font-semibold shrink-0 ml-2 flex items-center gap-0.5"
                style={{ color: 'var(--md-sys-color-primary)' }}
              >
                Pack <ChevronRight size={14} strokeWidth={2} />
              </span>
            </div>
            <div
              className="pt-2.5 border-t flex items-center justify-between gap-2 flex-wrap text-[11px]"
              style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded-md flex items-center gap-1 font-medium"
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    color: 'var(--md-sys-color-on-surface)',
                  }}
                >
                  <Phone size={10} strokeWidth={2} /> Calls Always ON
                </span>
                <span
                  className="px-2 py-0.5 rounded-md flex items-center gap-1 font-medium"
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    color: activeBag.allowSms
                      ? 'var(--md-sys-color-on-surface)'
                      : 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  <MessageSquare size={10} strokeWidth={2} />{' '}
                  {activeBag.allowSms ? 'SMS ON' : 'SMS Off'}
                </span>
              </div>
              <span
                className="font-medium break-words"
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                {activeBag.apps.length > 0
                  ? activeBag.apps.map((a) => a.appName).join(', ')
                  : 'Monk Mode (0 apps)'}
              </span>
            </div>
          </div>
        ) : (
          <ObsidianCard
            asButton
            onClick={onOpenBagDrawer}
            headerClassName="p-4 flex items-center justify-between gap-3 text-left font-sans group"
            footerClassName="px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap font-sans text-[11px] text-zinc-400"
            headerContent={
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="liquid-squircle">
                    <Briefcase size={16} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs truncate font-semibold text-white">
                        Bag: {activeBag.name}
                      </span>
                      <span className="text-[10px] font-sans tabular-nums px-2 py-0.5 rounded-full liquid-row text-zinc-200 shrink-0">
                        {activeBag.apps.length} app{activeBag.apps.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="truncate mt-0.5 text-[11px] text-zinc-400">
                      {activeBag.occasionLabel}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white shrink-0 ml-2 flex items-center gap-0.5 transition-colors duration-75">
                  Pack <ChevronRight size={14} strokeWidth={1.75} />
                </span>
              </>
            }
            footerContent={
              <>
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center gap-1 font-medium"
                    style={{ color: 'var(--liquid-accent-tint, var(--accent-primary))' }}
                  >
                    <Phone size={10} strokeWidth={1.75} /> Calls Always ON
                  </span>
                  <span
                    className="flex items-center gap-1 font-medium"
                    style={
                      activeBag.allowSms
                        ? { color: 'var(--liquid-accent-tint, var(--accent-primary))' }
                        : undefined
                    }
                  >
                    <MessageSquare size={10} strokeWidth={1.75} />{' '}
                    {activeBag.allowSms ? 'SMS ON' : 'SMS Off'}
                  </span>
                </div>
                <span className="text-zinc-300 break-words">
                  {activeBag.apps.length > 0
                    ? activeBag.apps.map((a) => a.appName).join(', ')
                    : 'Monk Mode (0 apps)'}
                </span>
              </>
            }
          />
        )}

        {/* 3-Second Hold to Ignite Button (M3 Filled Button in Material Dusk) */}
        <div className="w-full flex flex-col items-center">
          <button
            type="button"
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            onTouchCancel={cancelHold}
            className={`relative w-full py-3 font-display font-bold text-[15px] tracking-tight overflow-hidden select-none flex items-center justify-center cursor-pointer liquid-spring ${
              isHolding ? 'scale-[0.98]' : 'active:scale-[0.98]'
            } ${
              isMaterial ? 'h-13 min-h-[52px] rounded-2xl' : 'h-12 rounded-2xl'
            }`}
            style={
              isMaterial
                ? {
                    touchAction: 'none',
                    backgroundColor: 'var(--md-sys-color-primary)',
                    color: 'var(--md-sys-color-on-primary)',
                  }
                : {
                    touchAction: 'none',
                    backgroundColor: 'var(--accent-primary, #f43f5e)',
                    backgroundImage:
                      'linear-gradient(155deg, rgba(255, 255, 255, 0.26) 0%, transparent 52%, rgba(0, 0, 0, 0.16) 100%)',
                    color: 'var(--text-on-accent, #ffffff)',
                    border: '1px solid rgba(255, 255, 255, 0.24)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 10px 28px -6px var(--liquid-accent-glow, rgba(244, 63, 94, 0.40))',
                  }
            }
          >
            <div
              className="absolute left-0 top-0 bottom-0 pointer-events-none overflow-hidden"
              style={{
                width: `${holdProgress * 100}%`,
                opacity: isHolding ? 0.98 : 0,
                background: isMaterial
                  ? 'rgba(255, 255, 255, 0.22)'
                  : 'linear-gradient(90deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.36) 100%)',
                transition: 'opacity 0.12s ease',
              }}
            >
              {isHolding && (
                <div
                  aria-hidden="true"
                  className="zn-hold-sheen absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                />
              )}
            </div>

            <div
              className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-75 font-semibold"
              style={{
                color: isMaterial
                  ? 'var(--md-sys-color-on-primary)'
                  : 'var(--text-on-accent, #ffffff)',
              }}
            >
              {isHolding ? (
                <>
                  <Flame size={18} strokeWidth={1.85} />
                  <span>
                    Arming...{' '}
                    <span className="font-mono tabular-nums">
                      {Math.ceil((1 - holdProgress) * 3)}s
                    </span>
                  </span>
                </>
              ) : permissions.isNativeAndroid && !permissions.strictReady ? (
                <>
                  <ShieldAlert size={18} strokeWidth={1.85} />
                  <span>Grant Permissions to Lock</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={18} strokeWidth={1.85} />
                  <span>Hold 3s to Lock</span>
                </>
              )}
            </div>
          </button>

          {/* Intention Ritual & Quick Features Control */}
          <div className="flex items-center justify-between w-full px-1 mt-2.5 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                haptics.tick(700);
                const nextVal = !intentionRitualEnabled;
                setIntentionRitualEnabled(nextVal);
                try {
                  localStorage.setItem('zero_intention_ritual_v1', String(nextVal));
                } catch {}
              }}
              style={
                isMaterial
                  ? intentionRitualEnabled
                    ? {
                        backgroundColor: 'var(--md-sys-color-primary-container)',
                        color: 'var(--md-sys-color-on-primary-container)',
                        borderColor: 'var(--md-sys-color-outline)',
                      }
                    : {
                        backgroundColor: 'var(--md-sys-color-surface-container)',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        borderColor: 'var(--md-sys-color-outline-variant)',
                      }
                  : undefined
              }
              className={`min-h-[36px] flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans transition-all cursor-pointer border ${
                isMaterial
                  ? intentionRitualEnabled
                    ? 'rounded-lg font-semibold'
                    : 'rounded-lg font-medium'
                  : intentionRitualEnabled
                  ? 'rounded-full liquid-pill-active font-semibold'
                  : 'rounded-full liquid-pill-inactive font-medium text-zinc-300'
              }`}
            >
              <Sparkles size={12} strokeWidth={2} />
              <span>5s Breath: {intentionRitualEnabled ? 'On' : 'Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (durationSeconds > MAX_BURN_THE_BOATS_SECONDS) {
                  haptics.tick(1000);
                  setBurnBoatsWarning('Burn the Boats is limited to a maximum of 4 hours (240 min). Reduce duration to engage.');
                  return;
                }
                haptics.thud();
                const nextVal = !burnTheBoatsEnabled;
                setBurnTheBoatsEnabled(nextVal);
                if (!nextVal) {
                  setBurnBoatsWarning(null);
                }
                try {
                  localStorage.setItem('zero_burn_the_boats_v1', String(nextVal));
                } catch {}
              }}
              title={
                durationSeconds > MAX_BURN_THE_BOATS_SECONDS
                  ? 'Burn the Boats is limited to a maximum session duration of 4 hours'
                  : 'Burn the Boats disables emergency escape tickets for this session (Max 4h)'
              }
              style={
                isMaterial && durationSeconds <= MAX_BURN_THE_BOATS_SECONDS
                  ? burnTheBoatsEnabled
                    ? {
                        backgroundColor: 'var(--md-sys-color-tertiary-container)',
                        color: 'var(--md-sys-color-on-tertiary-container)',
                        borderColor: 'var(--md-sys-color-outline)',
                      }
                    : {
                        backgroundColor: 'var(--md-sys-color-surface-container)',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        borderColor: 'var(--md-sys-color-outline-variant)',
                      }
                  : undefined
              }
              className={`min-h-[36px] flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans transition-all cursor-pointer border ${
                durationSeconds > MAX_BURN_THE_BOATS_SECONDS
                  ? `opacity-40 cursor-not-allowed bg-zinc-900/40 text-zinc-500 border-white/5 ${
                      isMaterial ? 'rounded-lg' : 'rounded-full'
                    }`
                  : isMaterial
                  ? burnTheBoatsEnabled
                    ? 'rounded-lg font-semibold'
                    : 'rounded-lg font-medium'
                  : burnTheBoatsEnabled
                  ? 'rounded-full bg-amber-500/15 text-amber-300 border-amber-500/35 font-semibold'
                  : 'rounded-full liquid-pill-inactive font-medium text-zinc-300'
              }`}
            >
              <Flame
                size={12}
                strokeWidth={2}
                className={
                  isMaterial
                    ? undefined
                    : burnTheBoatsEnabled
                    ? 'text-amber-400'
                    : 'text-zinc-500'
                }
              />
              <span>Burn Boats: {burnTheBoatsEnabled ? 'Active (Max 4h)' : 'Off (Max 4h)'}</span>
            </button>
          </div>

          {burnBoatsWarning && (
            <div className="mx-auto max-w-sm px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-sans flex items-center justify-center gap-1.5 text-center">
              <Flame size={12} className="text-amber-400 shrink-0" />
              <span>{burnBoatsWarning}</span>
            </div>
          )}

          {burnTheBoatsEnabled && (
            <div className="text-[11px] font-sans text-amber-400/90 flex items-center justify-center gap-1.5">
              <Flame size={12} className="text-amber-400" />
              <span>Boats Burned • Escape tickets strictly locked for this session</span>
            </div>
          )}

          {burnTheBoatsEnabled && parachuteMetrics.currentBalance > 0 && (
            <div className="pt-2 flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300/85 text-xs">
                <Flame size={12} className="text-amber-400" />
                <span>
                  {parachuteMetrics.currentBalance}{' '}
                  {parachuteMetrics.currentBalance === 1 ? 'ticket' : 'tickets'} locked (Boats Burned)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5-Second Intention Ritual Modal */}
      {showIntentionRitual && (
        <IntentionRitualModal
          tag={selectedTag}
          durationFormatted={formatDialTime(durationSeconds)}
          onComplete={() => {
            setShowIntentionRitual(false);
            triggerIgnition();
          }}
          onSkip={() => {
            setShowIntentionRitual(false);
            triggerIgnition();
          }}
        />
      )}
    </div>
  );
};
