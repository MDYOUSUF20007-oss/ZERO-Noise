import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { haptics } from '../utils/haptics';
import './EscapeTicketSystem.css';

export interface EscapeTicketDockButtonProps {
  ticketCount?: number;
  onOpen: () => void;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
  isAero?: boolean;
}

const ACCENT_COLOR_MAP: Record<string, string> = {
  crimson: '#F43F5E', // Rose Coral
  emerald: '#10B981', // Neon Emerald
  silver: '#E2E8F0',  // Ice Platinum
  azure: '#0EA5E9',   // Liquid Sapphire
  cyan: '#00F0FF',    // Cyber Cyan
  amber: '#F59E0B',   // Sunset Amber
  purple: '#A855F7',  // Cosmic Violet
  indigo: '#6366F1',  // Electric Indigo
  lime: '#84CC16',    // Laser Volt
};

function getMaterialTicketPalette(explicitIsAero?: boolean) {
  const docEl = typeof document !== 'undefined' ? document.documentElement : null;
  const docTheme = docEl?.getAttribute('data-theme');
  const docStyle = docEl?.getAttribute('data-interface-style');
  const matMode = docEl?.getAttribute('data-material-mode');
  const isMaterial =
    Boolean(explicitIsAero) ||
    docTheme === 'material' ||
    docTheme === 'aero' ||
    docTheme === 'dusk' ||
    docStyle === 'aero' ||
    docStyle === 'dusk';
  const isMaterialDark =
    isMaterial && ((docTheme === 'material' && matMode === 'dark') || docTheme === 'dusk' || docStyle === 'dusk');
  const isMaterialLight = isMaterial && !isMaterialDark;
  return { isMaterial, isMaterialLight, isMaterialDark };
}

function resolveTicketAccent(explicitAccent?: string, isMaterial?: boolean): string {
  if (explicitAccent && explicitAccent.trim().length > 0) return explicitAccent.trim();
  if (isMaterial) return '#E69F86';
  if (typeof document !== 'undefined') {
    const activeAccentAttr = document.documentElement.getAttribute('data-accent');
    if (activeAccentAttr && ACCENT_COLOR_MAP[activeAccentAttr]) {
      return ACCENT_COLOR_MAP[activeAccentAttr];
    }
    const cssVarHex = getComputedStyle(document.documentElement).getPropertyValue('--accent-hex').trim();
    if (cssVarHex && cssVarHex.startsWith('#')) return cssVarHex;
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim();
    if (cssVar && cssVar.startsWith('#')) return cssVar;
  }
  return '#00F0FF';
}

/**
 * Compact notched ticket preview for the bottom dock.
 * Rendered in Material Dusk (Day Porcelain / Night Twilight) or Liquid Glass obsidian
 * with zero wireframe clutter and automatic hiding when ticketCount <= 0.
 */
export const EscapeTicketDockButton: React.FC<EscapeTicketDockButtonProps> = ({
  ticketCount = 0,
  onOpen,
  accentColor: explicitAccent,
  className = '',
  style,
  isAero = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const bgGradId = `znDockBg_${uid}`;
  const stubGradId = `znDockStub_${uid}`;
  const borderGradId = `znDockBorder_${uid}`;
  const sheenGradId = `znDockSheen_${uid}`;
  const clipId = `znDockClip_${uid}`;

  const { isMaterial, isMaterialLight, isMaterialDark } = getMaterialTicketPalette(isAero);
  const isAeroTheme = isMaterialLight;

  if (!ticketCount || ticketCount <= 0) return null;

  const primaryAccent = resolveTicketAccent(explicitAccent, isMaterial);

  return (
    <button
      type="button"
      className={`zn-dock-ticket-btn ${className}`}
      onClick={() => {
        haptics.tick(600);
        onOpen();
      }}
      aria-label={`Open Escape Ticket (${ticketCount} available)`}
      style={style}
    >
      <svg
        className="zn-dock-ticket-svg"
        viewBox="0 0 296 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={bgGradId} x1="0" y1="0" x2="296" y2="120" gradientUnits="userSpaceOnUse">
            {isMaterialLight ? (
              <>
                <stop offset="0%" stopColor="#FAF7F4" />
                <stop offset="100%" stopColor="#EFE9E2" />
              </>
            ) : isMaterialDark ? (
              <>
                <stop offset="0%" stopColor="#2C314C" />
                <stop offset="100%" stopColor="#202438" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#0C1220" />
                <stop offset="52%" stopColor="#060912" />
                <stop offset="100%" stopColor="#020306" />
              </>
            )}
          </linearGradient>
          <linearGradient id={stubGradId} x1="0" y1="0" x2="74" y2="120" gradientUnits="userSpaceOnUse">
            {isMaterialLight ? (
              <>
                <stop offset="0%" stopColor="#EFE8E0" />
                <stop offset="100%" stopColor="#E6DDD3" />
              </>
            ) : isMaterialDark ? (
              <>
                <stop offset="0%" stopColor="#353B5B" />
                <stop offset="100%" stopColor="#24283F" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#121B2F" />
                <stop offset="100%" stopColor="#050810" />
              </>
            )}
          </linearGradient>
          <linearGradient id={borderGradId} x1="0" y1="0" x2="296" y2="120" gradientUnits="userSpaceOnUse">
            {isAeroTheme ? (
              <>
                <stop offset="0%" stopColor={primaryAccent} stopOpacity="0.65" />
                <stop offset="50%" stopColor="rgba(53, 59, 91, 0.16)" />
                <stop offset="100%" stopColor="rgba(53, 59, 91, 0.08)" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.48" />
                <stop offset="28%" stopColor={primaryAccent} stopOpacity="0.68" />
                <stop offset="68%" stopColor="#FFFFFF" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.06" />
              </>
            )}
          </linearGradient>
          <linearGradient id={sheenGradId} x1="0" y1="0" x2="1" y2="0.85">
            <stop offset="0%" stopColor={isAeroTheme ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.14)'} />
            <stop offset="32%" stopColor={isAeroTheme ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)'} />
            <stop offset="65%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <clipPath id={clipId}>
            <path d="M 16 2 L 68 2 L 74 8 L 80 2 L 280 2 A 14 14 0 0 1 294 16 L 294 46 A 14 14 0 0 0 294 74 L 294 104 A 14 14 0 0 1 280 118 L 80 118 L 74 112 L 68 118 L 16 118 A 14 14 0 0 1 2 104 L 2 74 A 14 14 0 0 0 2 46 L 2 16 A 14 14 0 0 1 16 2 Z" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {/* Base Crystal Fill */}
          <rect x="0" y="0" width="296" height="120" fill={`url(#${bgGradId})`} />

          {/* Distinct Frosted Left Stub */}
          <rect x="0" y="0" width="74" height="120" fill={`url(#${stubGradId})`} />

          {/* Static Upper-Left Glass Refraction */}
          <rect x="0" y="0" width="296" height="120" fill={`url(#${sheenGradId})`} />

          {/* Sweeping Ambient Specular Sheen */}
          <rect
            className="zn-dock-sheen"
            x="-120"
            y="0"
            width="86"
            height="120"
            fill={primaryAccent}
            fillOpacity={isAeroTheme ? 0.05 : 0.11}
          />

          {/* Vertical Perforation Seam (x=74) */}
          <line
            x1="74"
            y1="10"
            x2="74"
            y2="110"
            stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.16)' : 'rgba(255, 255, 255, 0.20)'}
            strokeWidth="1.25"
            strokeDasharray="3.5 3.5"
          />

          {/* Left Stub Grip Dots */}
          <circle cx="38" cy="46" r="2" fill={primaryAccent} fillOpacity="0.65" />
          <circle cx="38" cy="60" r="2.2" fill={primaryAccent} fillOpacity="1" />
          <circle cx="38" cy="74" r="2" fill={primaryAccent} fillOpacity="0.65" />

          {/* In-Ticket Typography */}
          <text
            x="184"
            y="34"
            textAnchor="middle"
            fill={isAeroTheme ? '#353B5B' : '#F8FAFC'}
            fontSize="11.5"
            fontWeight="800"
            letterSpacing="0.1em"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            ESCAPE TICKET
          </text>

          {/* Centerpiece Live Waveform (Vector Glow + Crisp Core) */}
          <g className="zn-dock-wave">
            <path
              d="M 98 62 L 114 62 L 120 46 L 126 78 L 132 40 L 138 84 L 144 50 L 150 72 L 156 56 L 162 67 L 168 59 L 174 64 L 180 61 L 190 62 L 270 62"
              stroke={primaryAccent}
              strokeOpacity="0.22"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 98 62 L 114 62 L 120 46 L 126 78 L 132 40 L 138 84 L 144 50 L 150 72 L 156 56 L 162 67 L 168 59 L 174 64 L 180 61 L 190 62 L 270 62"
              stroke={primaryAccent}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          <text
            x="184"
            y="95"
            textAnchor="middle"
            fill={isAeroTheme ? 'rgba(53, 59, 91, 0.72)' : 'rgba(226, 232, 240, 0.72)'}
            fontSize="10"
            fontWeight="700"
            letterSpacing="0.08em"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          >
            {ticketCount} {ticketCount === 1 ? 'TICKET' : 'TICKETS'} READY
          </text>

          {/* Top Glass Catch Rim */}
          <path
            d="M 16 3.2 L 68 3.2 L 74 9 L 80 3.2 L 280 3.2"
            stroke={isAeroTheme ? 'rgba(255,255,255,0.85)' : 'rgba(255, 255, 255, 0.36)'}
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Single Precision Perimeter Specular Border */}
          <path
            d="M 16 2 L 68 2 L 74 8 L 80 2 L 280 2 A 14 14 0 0 1 294 16 L 294 46 A 14 14 0 0 0 294 74 L 294 104 A 14 14 0 0 1 280 118 L 80 118 L 74 112 L 68 118 L 16 118 A 14 14 0 0 1 2 104 L 2 74 A 14 14 0 0 0 2 46 L 2 16 A 14 14 0 0 1 16 2 Z"
            stroke={`url(#${borderGradId})`}
            strokeWidth="1.5"
          />
        </g>
      </svg>

      <span
        className="zn-dock-ticket-badge"
        style={{
          background: primaryAccent,
          boxShadow: `0 2px 10px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.42), 0 0 12px ${primaryAccent}77`,
          color: primaryAccent === '#E2E8F0' ? '#0F172A' : '#FFFFFF',
        }}
      >
        ×{ticketCount}
      </span>
    </button>
  );
};

export interface EscapeTicketModalProps {
  isOpen: boolean;
  ticketCount?: number;
  onClose: () => void;
  onEscapeConfirmed?: () => void;
  accentColor?: string;
  isAero?: boolean;
  // Compatibility with existing App.tsx props
  parachuteMetrics?: any;
  profile?: any;
  isZeroSupporter?: boolean;
  hasClaimedFirstTimeParachute?: boolean;
  hasClaimedFirstDonationParachute?: boolean;
  onOpenProfile?: () => void;
  onOpenSupport?: () => void;
  onOpenInsights?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

function buildFullTearTeethPath(): string {
  const pts: string[] = ['M 160 16'];
  const step = 7.2;
  const count = Math.floor((304 - 16) / step);
  for (let i = 0; i < count; i++) {
    const y = 16 + i * step;
    const offset = i % 2 === 0 ? 2.1 : -1.9;
    pts.push(`L ${(160 + offset).toFixed(1)} ${(y + step * 0.5).toFixed(1)}`);
  }
  pts.push('L 160 304');
  return pts.join(' ');
}

const FULL_TEAR_TEETH_PATH = buildFullTearTeethPath();

function getTearTeethPath(tearY: number): string {
  const pts: string[] = ['M 160 16'];
  const step = 7.2;
  const clampedEnd = Math.max(16, Math.min(304, tearY));
  const count = Math.max(1, Math.floor((clampedEnd - 16) / step));
  for (let i = 0; i < count; i++) {
    const y = 16 + i * step;
    const offset = i % 2 === 0 ? 1.8 : -1.8;
    pts.push(`L ${(160 + offset).toFixed(1)} ${(y + step * 0.5).toFixed(1)}`);
  }
  pts.push(`L 160 ${clampedEnd.toFixed(1)}`);
  return pts.join(' ');
}

const RIP_THRESHOLD = 0.84;

/**
 * Full-size interactive two-part tear-off Escape Ticket modal
 * with 120fps physics, clean Liquid Glass obsidian optics, 3D paper peel,
 * and synthesized "zip" paper tear acoustics.
 */
export const EscapeTicketModal: React.FC<EscapeTicketModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <EscapeTicketModalInner {...props} />;
};

const EscapeTicketModalInner: React.FC<EscapeTicketModalProps> = ({
  isOpen,
  ticketCount,
  onClose,
  onEscapeConfirmed,
  accentColor: explicitAccent,
  isAero = false,
  parachuteMetrics,
}) => {
  const { isMaterial, isMaterialLight, isMaterialDark } = getMaterialTicketPalette(isAero);
  const isAeroTheme = isMaterialLight;

  const effectiveTicketCount = ticketCount ?? parachuteMetrics?.currentBalance ?? 0;
  const primaryAccent = resolveTicketAccent(explicitAccent, isMaterial);

  const [ripProgress, setRipProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'ripping' | 'escaped'>('idle');
  const [waveFlatness, setWaveFlatness] = useState(0);

  const ticketBoxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStartYRef = useRef(0);
  const ripProgressRef = useRef(0);
  const lastNotchRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const rafMoveRef = useRef<number | null>(null);
  const pendingMoveYRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<'idle' | 'ripping' | 'escaped'>('idle');
  const waveRafRef = useRef<number | null>(null);
  const escapeTimeoutsRef = useRef<number[]>([]);

  const uid = useId().replace(/:/g, '');
  const mainBgId = `znMainBg_${uid}`;
  const stubBgId = `znStubBg_${uid}`;
  const mainBorderId = `znMainBorder_${uid}`;
  const stubBorderId = `znStubBorder_${uid}`;
  const stubClipId = `znStubClip_${uid}`;
  const mainClipId = `znMainClip_${uid}`;
  const sheenGradId = `znSheen_${uid}`;
  const causticGradId = `znCaustic_${uid}`;
  const specularRimId = `znSpecularRim_${uid}`;
  const thumbGradId = `znThumbGrad_${uid}`;
  const trackFillGradId = `znTrackFill_${uid}`;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearScheduledEscapeWork = useCallback(() => {
    if (waveRafRef.current !== null) {
      cancelAnimationFrame(waveRafRef.current);
      waveRafRef.current = null;
    }
    for (const id of escapeTimeoutsRef.current) {
      window.clearTimeout(id);
    }
    escapeTimeoutsRef.current = [];
  }, []);

  // Cancel scheduled timers/RAFs on unmount
  useEffect(() => {
    return () => {
      clearScheduledEscapeWork();
    };
  }, [clearScheduledEscapeWork]);

  // Pre-warm Web Audio context cleanly on first gesture so there is zero audio lag
  const ensureAudioCtx = useCallback((): AudioContext | null => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        void audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  // Crisp subtle mechanical tooth tick while dragging along perforation
  const playTickSound = useCallback(
    (progress: number) => {
      const ctx = ensureAudioCtx();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const baseFreq = 980 + progress * 640;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.016);

        gain.gain.setValueAtTime(0.085, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.018);
      } catch {
        // Ignore audio restriction errors
      }
    },
    [ensureAudioCtx]
  );

  // Smooth paper-tear "Zzzip-thwip!" sound effect without harsh clipping
  const playZipSound = useCallback(() => {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const duration = 0.19;

      // 1. Modulated perforation teeth noise sweep
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const toothFlutter = 0.55 + 0.45 * Math.sin(2 * Math.PI * 98 * t);
        data[i] = (Math.random() * 2 - 1) * toothFlutter * Math.exp(-t / 0.12);
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(2.8, now);
      bandpass.frequency.setValueAtTime(4100, now);
      bandpass.frequency.exponentialRampToValueAtTime(920, now + duration);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.32, now + 0.012);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(now);

      // 2. Clean tensile release snap near bottom corner
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(1950, now + 0.045);
      snapOsc.frequency.exponentialRampToValueAtTime(260, now + 0.145);

      snapGain.gain.setValueAtTime(0.001, now);
      snapGain.gain.setValueAtTime(0.16, now + 0.045);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.155);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now + 0.045);
      snapOsc.stop(now + 0.16);
    } catch {
      // Ignore audio restriction errors
    }
  }, [ensureAudioCtx]);

  // Spawn crisp luminous fiber sparks along the active tear vertex
  const spawnSeamSparks = useCallback(
    (progress: number, burst = false) => {
      const box = ticketBoxRef.current;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      const seamX = rect.left + rect.width * 0.25;
      const seamY = rect.top + rect.height * (0.05 + progress * 0.9);

      const count = burst ? 26 : 3;
      for (let i = 0; i < count; i++) {
        const angle = (Math.random() - 0.5) * Math.PI * 1.4 - Math.PI * 0.5;
        const speed = burst ? 2.4 + Math.random() * 5.2 : 0.9 + Math.random() * 2.2;
        particlesRef.current.push({
          x: seamX + (Math.random() - 0.5) * 3,
          y: seamY + (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
          vy: Math.sin(angle) * speed - 0.5,
          size: burst ? 1.4 + Math.random() * 1.9 : 1.0 + Math.random() * 1.2,
          alpha: 0.95,
          decay: burst ? 0.02 + Math.random() * 0.014 : 0.042 + Math.random() * 0.025,
          color: Math.random() > 0.35 ? primaryAccent || '#00F0FF' : '#ffffff',
        });
      }
    },
    [primaryAccent]
  );

  // Trigger clean stub detachment & escape confirmation
  const triggerEscapeSequence = useCallback(() => {
    if (phaseRef.current === 'escaped') return;
    phaseRef.current = 'escaped';
    setPhase('escaped');
    ripProgressRef.current = 1;
    setRipProgress(1);
    setIsDragging(false);

    playZipSound();
    if (navigator.vibrate) {
      navigator.vibrate([12, 24, 30]);
    }
    haptics.parachuteDeploy();
    spawnSeamSparks(1, true);

    // Smoothly flatten audio waveform to 0.00 dB
    const waveStartTimer = window.setTimeout(() => {
      const startWave = performance.now();
      const flattenDuration = 460;
      const stepWave = (now: number) => {
        const t = Math.min(1, (now - startWave) / flattenDuration);
        const eased = 1 - Math.pow(1 - t, 3);
        setWaveFlatness(eased);
        if (t < 1) {
          waveRafRef.current = requestAnimationFrame(stepWave);
        }
      };
      waveRafRef.current = requestAnimationFrame(stepWave);
    }, 110);

    // Commit ticket consumption & unlock session after detach settle
    const commitTimer = window.setTimeout(() => {
      if (onEscapeConfirmed) {
        onEscapeConfirmed();
      } else {
        onClose();
      }
    }, 1320);

    escapeTimeoutsRef.current.push(waveStartTimer, commitTimer);
  }, [playZipSound, spawnSeamSparks, onEscapeConfirmed, onClose]);

  // 2D Canvas overlay loop for tear sparks (zero ripples)
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const strokeColor = primaryAccent || '#00F0FF';

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    lastTimeRef.current = performance.now();

    const render = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const rawDt = (now - lastTimeRef.current) / 16.667;
      const dt = Math.max(0.2, Math.min(rawDt, 2.0));
      lastTimeRef.current = now;

      if (particlesRef.current.length > 0) {
        particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0.02);
        for (const p of particlesRef.current) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 0.11 * dt;
          p.alpha -= p.decay * dt;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowColor = strokeColor;
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, primaryAccent]);

  // Smooth spring-back loop without dependency teardown churn on ripProgress
  useEffect(() => {
    if (isDragging || phase !== 'ripping') return;
    if (ripProgressRef.current <= 0) {
      setPhase('idle');
      return;
    }

    let raf = 0;
    let lastSpringTime = performance.now();
    const springBack = (now: number) => {
      const rawDt = (now - lastSpringTime) / 16.667;
      const dt = Math.max(0.2, Math.min(rawDt, 2.0));
      lastSpringTime = now;

      const next = ripProgressRef.current * Math.pow(0.79, dt);
      if (next < 0.004) {
        ripProgressRef.current = 0;
        setRipProgress(0);
        setPhase('idle');
        lastNotchRef.current = 0;
        return;
      }
      ripProgressRef.current = next;
      setRipProgress(next);
      raf = requestAnimationFrame(springBack);
    };

    raf = requestAnimationFrame(springBack);
    return () => cancelAnimationFrame(raf);
  }, [isDragging, phase]);

  const getDragRange = useCallback(() => {
    const box = ticketBoxRef.current;
    if (!box) return 160;
    return Math.max(125, box.getBoundingClientRect().height * 0.72);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phaseRef.current === 'escaped') return;
    ensureAudioCtx();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setPhase('ripping');
    const dragRange = getDragRange();
    dragStartYRef.current = e.clientY - ripProgressRef.current * dragRange;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || phaseRef.current === 'escaped') return;
    pendingMoveYRef.current = e.clientY;
    if (rafMoveRef.current !== null) return;

    rafMoveRef.current = requestAnimationFrame(() => {
      rafMoveRef.current = null;
      if (pendingMoveYRef.current === null || phaseRef.current === 'escaped') return;
      const dragRange = getDragRange();
      const raw = (pendingMoveYRef.current - dragStartYRef.current) / dragRange;
      const clamped = Math.max(0, Math.min(1, raw));
      ripProgressRef.current = clamped;
      setRipProgress(clamped);

      // Subtle mechanical notch tick + micro-sparks every ~8%
      const notch = Math.floor(clamped * 12);
      if (notch > lastNotchRef.current) {
        lastNotchRef.current = notch;
        playTickSound(clamped);
        if (navigator.vibrate) navigator.vibrate(5);
        haptics.tick(150);
        spawnSeamSparks(clamped, false);
      }

      if (clamped >= RIP_THRESHOLD) {
        triggerEscapeSequence();
      }
    });
  };

  const handlePointerUp = () => {
    if (rafMoveRef.current !== null) {
      cancelAnimationFrame(rafMoveRef.current);
      rafMoveRef.current = null;
    }
    pendingMoveYRef.current = null;
    if (!isDragging) return;
    setIsDragging(false);
    if (ripProgressRef.current >= RIP_THRESHOLD) {
      triggerEscapeSequence();
    }
  };

  if (!isOpen) return null;

  // Interpolate audio waveform points smoothly toward flat line y=172
  const baseWaveY = [172, 172, 140, 204, 126, 218, 144, 200, 152, 192, 160, 184, 166, 178, 170, 174, 172];
  const waveX = [202, 224, 236, 248, 260, 272, 284, 296, 308, 320, 332, 344, 356, 368, 380, 392, 412];
  const currentWavePath =
    waveX
      .map((x, idx) => {
        const y = 172 + (baseWaveY[idx] - 172) * (1 - waveFlatness);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`;
      })
      .join(' ') + ' L 596 172';

  const isEscaped = phase === 'escaped';
  const tearY = 16 + ripProgress * 288;
  const tearTeethPath = getTearTeethPath(tearY);
  const fullTearTeethPath = FULL_TEAR_TEETH_PATH;
  const isReadyToSnap = ripProgress >= 0.68 && !isEscaped;

  // Consistent transformOrigin + transformBox across both states prevents frame-1 teleport on snap
  const stubStyle: React.CSSProperties = isEscaped
    ? {
        transform: 'translate3d(-115px, 490px, 70px) rotateZ(-36deg) rotateY(42deg) rotateX(18deg) scale(0.86)',
        transformOrigin: '160px 304px',
        transformBox: 'view-box',
        opacity: 0,
        transition:
          'transform 0.68s cubic-bezier(0.22, 0.85, 0.36, 1), opacity 0.52s cubic-bezier(0.4, 0, 0.85, 1)',
        willChange: 'transform, opacity',
      }
    : {
        transform: `translate3d(${(-ripProgress * 26).toFixed(2)}px, ${(ripProgress * 58).toFixed(2)}px, ${(ripProgress * 18).toFixed(2)}px) rotateZ(${(-ripProgress * 14).toFixed(2)}deg) rotateY(${(ripProgress * 20).toFixed(2)}deg) rotateX(${(-ripProgress * 6).toFixed(2)}deg)`,
        transformOrigin: '160px 304px',
        transformBox: 'view-box',
        transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
      };

  const chevronFade = Math.max(0, 1 - ripProgress * 2.15);

  return (
    <div
      className={`zn-escape-overlay ${isAeroTheme ? 'zn-escape-overlay--aero' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Escape Ticket"
      style={{
        ['--liquid-accent-glow' as any]: `${primaryAccent}55`,
        ['--liquid-accent-soft-glow' as any]: `${primaryAccent}28`,
        ['--accent-hex' as any]: primaryAccent,
      }}
    >
      {/* 2D Particle Sparks Canvas */}
      <canvas ref={canvasRef} className="zn-escape-canvas" />

      {/* Minimal Top Bar */}
      <div className="zn-escape-topbar">
        <span className={`zn-escape-pill ${isAeroTheme ? 'zn-escape-pill--aero' : ''}`}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: primaryAccent,
              boxShadow: `0 0 8px ${primaryAccent}`,
            }}
          />
          {isEscaped ? 'VOID LOCK // RELEASED' : `TICKETS AVAILABLE: ${effectiveTicketCount}`}
        </span>
        {!isEscaped && (
          <button
            type="button"
            className={`zn-escape-close ${isAeroTheme ? 'zn-escape-close--aero' : ''}`}
            onClick={() => {
              haptics.tick(150);
              onClose();
            }}
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Centered Two-Part Notched Escape Ticket (640x320 Golden Ratio) */}
      <div
        ref={ticketBoxRef}
        className={`zn-ticket-stage ${isDragging ? 'zn-ticket-stage--dragging' : ''} ${
          isEscaped ? 'zn-ticket-stage--escaped' : ''
        }`}
      >
        <div className="zn-ticket-shadow-floor" />
        <div className="zn-ticket-ambient-glow" />

        <svg
          className="zn-ticket-svg"
          viewBox="0 0 640 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={mainBgId} x1="160" y1="0" x2="640" y2="320" gradientUnits="userSpaceOnUse">
              {isMaterialLight ? (
                <>
                  <stop offset="0%" stopColor="#FAF7F4" />
                  <stop offset="100%" stopColor="#EFE8E0" />
                </>
              ) : isMaterialDark ? (
                <>
                  <stop offset="0%" stopColor="#2C314C" />
                  <stop offset="100%" stopColor="#202438" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#0C1220" />
                  <stop offset="48%" stopColor="#060912" />
                  <stop offset="100%" stopColor="#020306" />
                </>
              )}
            </linearGradient>

            <linearGradient id={stubBgId} x1="0" y1="0" x2="160" y2="320" gradientUnits="userSpaceOnUse">
              {isMaterialLight ? (
                <>
                  <stop offset="0%" stopColor="#EFE8E0" />
                  <stop offset="100%" stopColor="#E4DBD1" />
                </>
              ) : isMaterialDark ? (
                <>
                  <stop offset="0%" stopColor="#353B5B" />
                  <stop offset="100%" stopColor="#24283F" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#11192C" />
                  <stop offset="55%" stopColor="#080D18" />
                  <stop offset="100%" stopColor="#03050A" />
                </>
              )}
            </linearGradient>

            <linearGradient id={mainBorderId} x1="160" y1="0" x2="640" y2="320" gradientUnits="userSpaceOnUse">
              {isAeroTheme ? (
                <>
                  <stop offset="0%" stopColor={primaryAccent} stopOpacity="0.65" />
                  <stop offset="45%" stopColor="rgba(53, 59, 91, 0.16)" />
                  <stop offset="100%" stopColor="rgba(53, 59, 91, 0.07)" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.52" />
                  <stop offset="28%" stopColor={primaryAccent} stopOpacity="0.62" />
                  <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.06" />
                </>
              )}
            </linearGradient>

            <linearGradient id={stubBorderId} x1="0" y1="0" x2="160" y2="320" gradientUnits="userSpaceOnUse">
              {isAeroTheme ? (
                <>
                  <stop offset="0%" stopColor={primaryAccent} stopOpacity="0.65" />
                  <stop offset="100%" stopColor="rgba(53, 59, 91, 0.1)" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.62" />
                  <stop offset="35%" stopColor={primaryAccent} stopOpacity="0.58" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
                </>
              )}
            </linearGradient>

            <linearGradient id={sheenGradId} x1="0" y1="0" x2="1" y2="0.85">
              <stop offset="0%" stopColor={isAeroTheme ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.14)'} />
              <stop offset="30%" stopColor={isAeroTheme ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.035)'} />
              <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            <radialGradient id={causticGradId} cx="0.14" cy="0.12" r="0.65">
              <stop offset="0%" stopColor={primaryAccent} stopOpacity={isAeroTheme ? 0.08 : 0.11} />
              <stop offset="100%" stopColor={primaryAccent} stopOpacity="0" />
            </radialGradient>

            <linearGradient id={specularRimId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="32%" stopColor={primaryAccent} stopOpacity="0.72" />
              <stop offset="72%" stopColor="#FFFFFF" stopOpacity="0.28" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.04)" />
            </linearGradient>

            <linearGradient id={trackFillGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryAccent} stopOpacity="0.14" />
              <stop offset="100%" stopColor={primaryAccent} stopOpacity="0.45" />
            </linearGradient>

            <radialGradient id={thumbGradId} cx="36%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="46%" stopColor={primaryAccent} />
              <stop offset="100%" stopColor={primaryAccent} stopOpacity="0.88" />
            </radialGradient>

            <clipPath id={stubClipId}>
              <path d="M 24 4 L 152 4 L 160 16 L 160 304 L 152 316 L 24 316 A 20 20 0 0 1 4 296 L 4 186 A 26 26 0 0 0 4 134 L 4 24 A 20 20 0 0 1 24 4 Z" />
            </clipPath>
            <clipPath id={mainClipId}>
              <path d="M 160 16 L 168 4 L 616 4 A 20 20 0 0 1 636 24 L 636 134 A 26 26 0 0 0 636 186 L 636 296 A 20 20 0 0 1 616 316 L 168 316 L 160 304 Z" />
            </clipPath>
          </defs>

          {/* ================= RIGHT MAIN BODY (75%) ================= */}
          <g clipPath={`url(#${mainClipId})`}>
            {/* Deep Obsidian Crystal Fill */}
            <rect x="160" y="0" width="480" height="320" fill={`url(#${mainBgId})`} />

            {/* Subtle Upper-Left Caustic Bloom & Diagonal Sheen */}
            <rect x="160" y="0" width="480" height="320" fill={`url(#${causticGradId})`} pointerEvents="none" />
            <rect x="160" y="0" width="480" height="320" fill={`url(#${sheenGradId})`} pointerEvents="none" />

            {/* Top Micro Status Indicator */}
            <circle cx="206" cy="46" r="3" fill={primaryAccent} opacity="0.92" />
            <text
              x="217"
              y="50"
              fill={isAeroTheme ? 'rgba(53, 59, 91, 0.72)' : 'rgba(226, 232, 240, 0.68)'}
              fontSize="11"
              fontWeight="700"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              letterSpacing="2.2"
            >
              {isEscaped ? 'STATUS // BYPASS GRANTED' : 'ZERO NOISE // PROTOCOL'}
            </text>

            {/* Main Headline */}
            <text
              x="202"
              y="108"
              fill={isAeroTheme ? '#353B5B' : isEscaped ? primaryAccent : '#FFFFFF'}
              fontSize="38"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              letterSpacing="2.8"
            >
              {isEscaped ? 'ESCAPE INITIATED' : 'ESCAPE TICKET'}
            </text>

            {/* Centerpiece Live Waveform */}
            <line
              x1="202"
              y1="172"
              x2="596"
              y2="172"
              stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.08)' : 'rgba(255, 255, 255, 0.08)'}
              strokeWidth="1"
            />
            <path
              d={currentWavePath}
              stroke={primaryAccent}
              strokeOpacity="0.18"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d={currentWavePath}
              stroke={primaryAccent}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <text
              x="596"
              y="148"
              textAnchor="end"
              fill={isAeroTheme ? 'rgba(53, 59, 91, 0.58)' : 'rgba(226, 232, 240, 0.62)'}
              fontSize="10.5"
              fontWeight="700"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              letterSpacing="1.8"
            >
              {isEscaped ? '0.00 dB' : 'VOID LOCK'}
            </text>

            {/* Clean Footer Metadata Strip */}
            <line
              x1="202"
              y1="248"
              x2="596"
              y2="248"
              stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.1)' : 'rgba(255, 255, 255, 0.09)'}
              strokeWidth="1"
            />
            <text
              x="202"
              y="282"
              fill={isAeroTheme ? 'rgba(53, 59, 91, 0.54)' : 'rgba(226, 232, 240, 0.48)'}
              fontSize="11"
              fontWeight="600"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              letterSpacing="2"
            >
              PASS // 01
            </text>
            <text
              x="596"
              y="282"
              textAnchor="end"
              fill={isAeroTheme ? 'rgba(53, 59, 91, 0.68)' : 'rgba(226, 232, 240, 0.66)'}
              fontSize="11.5"
              fontWeight="600"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              letterSpacing="2.2"
            >
              DESTINATION:{' '}
              <tspan fill={isAeroTheme ? '#353B5B' : '#FFFFFF'} fontWeight="800">
                ESCAPE
              </tspan>
            </text>

            {/* Top Glass Bevel Highlight */}
            <path
              d="M 168 5.2 L 616 5.2 A 19 19 0 0 1 634.8 24"
              stroke={`url(#${specularRimId})`}
              strokeWidth="1.25"
              strokeLinecap="round"
              opacity={isAeroTheme ? 0.55 : 0.78}
            />

            {/* Single Clean Specular Perimeter Border */}
            <path
              d="M 160 16 L 168 4 L 616 4 A 20 20 0 0 1 636 24 L 636 134 A 26 26 0 0 0 636 186 L 636 296 A 20 20 0 0 1 616 316 L 168 316 L 160 304"
              stroke={`url(#${mainBorderId})`}
              strokeWidth="1.5"
            />
          </g>

          {/* ================= PERFORATION SEAM (x = 160) ================= */}
          {/* Intact Lower Dashed Seam */}
          {!isEscaped && tearY < 304 && (
            <line
              x1="160"
              y1={tearY}
              x2="160"
              y2="304"
              stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.18)' : 'rgba(255, 255, 255, 0.22)'}
              strokeWidth="1.5"
              strokeDasharray="4.5 4.5"
            />
          )}

          {/* Live Unzipped Jagged Paper Teeth & Active Split Vertex */}
          {ripProgress > 0.01 && !isEscaped && (
            <g>
              <path
                d={tearTeethPath}
                stroke={primaryAccent}
                strokeWidth="4.5"
                strokeOpacity="0.24"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d={tearTeethPath}
                stroke={primaryAccent}
                strokeWidth="1.8"
                strokeOpacity="0.92"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Crisp glowing tear vertex */}
              <circle cx="160" cy={tearY} r="5.5" fill={primaryAccent} fillOpacity="0.3" />
              <circle cx="160" cy={tearY} r="2.2" fill="#FFFFFF" />
            </g>
          )}

          {/* Permanent Torn Paper Tooth Edge on Escape */}
          {isEscaped && (
            <g>
              <path
                className="zn-seam-flash"
                d={fullTearTeethPath}
                stroke={primaryAccent}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d={fullTearTeethPath}
                stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.28)' : 'rgba(255, 255, 255, 0.48)'}
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          )}

          {/* ================= LEFT TEAR-OFF STUB (25%) ================= */}
          <g style={stubStyle}>
            <g clipPath={`url(#${stubClipId})`}>
              <rect x="0" y="0" width="160" height="320" fill={`url(#${stubBgId})`} />
              <rect x="0" y="0" width="160" height="320" fill={`url(#${sheenGradId})`} pointerEvents="none" />

              {/* Vertical Stub Label (clean margin away from left notch) */}
              <text
                x="54"
                y="160"
                fill={isAeroTheme ? 'rgba(53, 59, 91, 0.56)' : 'rgba(226, 232, 240, 0.55)'}
                fontSize="10"
                fontWeight="700"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                letterSpacing="2.4"
                textAnchor="middle"
                transform="rotate(-90 54 160)"
              >
                STUB // 01
              </text>

              {/* Vertical Recessed Liquid Channel */}
              <rect
                x="86"
                y="54"
                width="30"
                height="212"
                rx="15"
                fill={isAeroTheme ? '#E8E0D7' : '#03050A'}
                stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.14)' : 'rgba(255, 255, 255, 0.14)'}
                strokeWidth="1.2"
              />

              {/* Subtle center guide */}
              <line
                x1="101"
                y1="72"
                x2="101"
                y2="248"
                stroke={primaryAccent}
                strokeOpacity="0.22"
                strokeWidth="1"
                strokeDasharray="3 4"
              />

              {/* Progressive Accent Liquid Trail Behind Thumb */}
              {ripProgress > 0.01 && (
                <rect
                  x="91"
                  y="60"
                  width="20"
                  height={24 + ripProgress * 176}
                  rx="10"
                  fill={`url(#${trackFillGradId})`}
                />
              )}

              {/* Clean Directional Chevrons Below Pearl (fade smoothly as pearl travels down) */}
              <g
                className="zn-stub-chevrons"
                stroke={primaryAccent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={chevronFade}
              >
                <polyline points="95,146 101,152 107,146" opacity="0.45" />
                <polyline points="95,164 101,170 107,164" opacity="0.72" />
                <polyline points="95,182 101,188 107,182" opacity="0.95" />
              </g>

              {/* Draggable Crystal Pearl Indicator (Pure GPU Vectors, Zero Filter Lag) */}
              <g transform={`translate(0, ${(ripProgress * 176).toFixed(2)})`}>
                <g
                  transform={isDragging ? 'translate(101 72) scale(1.09) translate(-101 -72)' : undefined}
                >
                  {/* Soft ambient aura rings */}
                  <circle cx="101" cy="72" r="20" fill={primaryAccent} fillOpacity="0.14" />
                  <circle cx="101" cy="72" r="14" fill={primaryAccent} fillOpacity="0.26" />
                  {/* Crisp glass rim */}
                  <circle
                    cx="101"
                    cy="72"
                    r="11"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.72)"
                    strokeWidth="1.1"
                  />
                  {/* Pearl core */}
                  <circle cx="101" cy="72" r="10" fill={`url(#${thumbGradId})`} />
                  {/* Off-center specular glint */}
                  <ellipse
                    cx="98"
                    cy="68.5"
                    rx="3"
                    ry="1.6"
                    fill="#FFFFFF"
                    fillOpacity="0.95"
                    transform="rotate(-28 98 68.5)"
                  />
                </g>
              </g>

              {/* Top Glass Bevel Highlight on Stub */}
              <path
                d="M 24 5.2 L 152 5.2"
                stroke={`url(#${specularRimId})`}
                strokeWidth="1.25"
                strokeLinecap="round"
                opacity={isAeroTheme ? 0.55 : 0.85}
              />

              {/* Single Clean Specular Border on Stub */}
              <path
                d="M 160 16 L 152 4 L 24 4 A 20 20 0 0 0 4 24 L 4 134 A 26 26 0 0 1 4 186 L 4 296 A 20 20 0 0 0 24 316 L 152 316 L 160 304"
                stroke={`url(#${stubBorderId})`}
                strokeWidth="1.5"
              />
            </g>
          </g>
        </svg>

        {/* Interactive Touch / Pointer Hit Zone over Left Stub */}
        {!isEscaped && (
          <div
            className="zn-stub-hit-zone"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            aria-label="Slide down to rip escape ticket"
          />
        )}
      </div>

      {/* Responsive Bottom Hint Pill */}
      <div className="zn-escape-footer">
        <span
          className={`zn-escape-hint ${isAeroTheme ? 'zn-escape-hint--aero' : ''} ${
            isEscaped ? 'zn-escape-hint--active' : isReadyToSnap ? 'zn-escape-hint--ready' : ''
          }`}
        >
          {isEscaped
            ? 'ESCAPING THE VOID...'
            : isReadyToSnap
              ? 'RELEASE TO SNAP & ESCAPE'
              : isDragging
                ? 'PULL DOWN TO TEAR...'
                : 'SLIDE LEFT STUB DOWN TO RIP'}
        </span>
      </div>
    </div>
  );
};
