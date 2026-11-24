import React, { useState, useRef, useEffect, useCallback, useId, useMemo } from 'react';
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

export function resolveTicketAccent(explicitAccent?: string, isAero?: boolean): string {
  if (explicitAccent && explicitAccent.trim().length > 0) return explicitAccent.trim();
  if (isAero) return '#E69F86';
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
 * Compact text-free notched ticket preview for the bottom dock.
 * Rendered in authentic Liquid Glass with specular optical refraction.
 * Automatically hides when ticketCount <= 0.
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
  const specularGradId = `znDockSpecular_${uid}`;
  const clipId = `znDockClip_${uid}`;

  const isAeroTheme =
    isAero ||
    (typeof document !== 'undefined' &&
      (document.documentElement.getAttribute('data-theme') === 'aero' ||
        document.documentElement.getAttribute('data-interface-style') === 'aero'));

  if (!ticketCount || ticketCount <= 0) return null;

  const primaryAccent = resolveTicketAccent(explicitAccent, isAeroTheme);

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
        viewBox="0 0 296 124"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={bgGradId} x1="0" y1="0" x2="296" y2="124" gradientUnits="userSpaceOnUse">
            {isAeroTheme ? (
              <>
                <stop offset="0%" stopColor="#F8F4F0" />
                <stop offset="100%" stopColor="#F3EDE8" />
              </>
            ) : (
              <>
                {/* Authentic High-Contrast Deep Liquid Glass Obsidian */}
                <stop offset="0%" stopColor="#0B101D" />
                <stop offset="100%" stopColor="#020408" />
              </>
            )}
          </linearGradient>
          <linearGradient id={specularGradId} x1="0" y1="0" x2="296" y2="124" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={primaryAccent} stopOpacity={0.95} />
            <stop offset="34%" stopColor={primaryAccent} stopOpacity={0.45} />
            <stop offset="68%" stopColor="rgba(255, 255, 255, 0.50)" stopOpacity={0.35} />
            <stop offset="100%" stopColor={isAeroTheme ? 'rgba(53, 59, 91, 0.12)' : 'rgba(255, 255, 255, 0.08)'} stopOpacity={0.15} />
          </linearGradient>
          <clipPath id={clipId}>
            <path d="M 16 2 L 68 2 L 74 8 L 80 2 L 280 2 A 14 14 0 0 1 294 16 L 294 48 A 14 14 0 0 0 294 76 L 294 108 A 14 14 0 0 1 280 122 L 80 122 L 74 116 L 68 122 L 16 122 A 14 14 0 0 1 2 108 L 2 76 A 14 14 0 0 0 2 48 L 2 16 A 14 14 0 0 1 16 2 Z" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {/* Base Fill */}
          <rect x="0" y="0" width="296" height="124" fill={`url(#${bgGradId})`} />

          {/* Translucent Left Stub Tint */}
          <rect x="0" y="0" width="74" height="124" fill={isAeroTheme ? '#EDE6DF' : 'rgba(32, 44, 68, 0.48)'} />

          {/* Ambient Specular Sheen Sweep */}
          <rect
            className="zn-dock-sheen"
            x="-120"
            y="0"
            width="90"
            height="124"
            fill={primaryAccent}
            fillOpacity={isAeroTheme ? 0.04 : 0.14}
            transform="skewX(-22)"
          />

          {/* Vertical Perforation Seam at 25% (x=74) */}
          <line
            x1="74"
            y1="10"
            x2="74"
            y2="114"
            stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.16)' : 'rgba(255, 255, 255, 0.22)'}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Left Stub Grip Dots */}
          <circle cx="38" cy="48" r="2" fill={primaryAccent} fillOpacity="0.75" />
          <circle cx="38" cy="62" r="2" fill={primaryAccent} fillOpacity="1" />
          <circle cx="38" cy="76" r="2" fill={primaryAccent} fillOpacity="0.75" />

          {/* In-Ticket Typography */}
          <text
            x="180"
            y="38"
            textAnchor="middle"
            fill={isAeroTheme ? '#353B5B' : '#FFFFFF'}
            fontSize="11"
            fontWeight="800"
            letterSpacing="0.08em"
            fontFamily="system-ui, sans-serif"
          >
            ESCAPE TICKET
          </text>
          <text
            x="180"
            y="96"
            textAnchor="middle"
            fill={isAeroTheme ? '#353B5B' : 'rgba(255, 255, 255, 0.80)'}
            fontSize="10.5"
            fontWeight="700"
            letterSpacing="0.04em"
            fontFamily="system-ui, sans-serif"
          >
            {ticketCount} {ticketCount === 1 ? 'TICKET' : 'TICKETS'} AVAILABLE
          </text>

          {/* Right Body Live Breathing Damped Waveform */}
          <path
            className="zn-dock-wave"
            d="M 96 62 L 108 62 L 114 44 L 120 80 L 126 36 L 132 88 L 138 48 L 144 74 L 150 54 L 156 68 L 162 58 L 168 65 L 174 61 L 182 62 L 266 62"
            stroke={primaryAccent}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Top Specular Rim Line for Liquid Glass Cut Look */}
          <path
            d="M 16 3 L 68 3 L 74 9 L 80 3 L 280 3"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Outer & Inner Concentric Hairline Borders */}
          <path
            d="M 16 2 L 68 2 L 74 8 L 80 2 L 280 2 A 14 14 0 0 1 294 16 L 294 48 A 14 14 0 0 0 294 76 L 294 108 A 14 14 0 0 1 280 122 L 80 122 L 74 116 L 68 122 L 16 122 A 14 14 0 0 1 2 108 L 2 76 A 14 14 0 0 0 2 48 L 2 16 A 14 14 0 0 1 16 2 Z"
            stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.12)' : 'rgba(255, 255, 255, 0.20)'}
            strokeWidth="1.75"
          />
          <path
            d="M 19 7 L 66 7 L 74 14 L 82 7 L 277 7 A 10 10 0 0 1 289 19 L 289 45 A 17 17 0 0 0 289 79 L 289 105 A 10 10 0 0 1 277 117 L 82 117 L 74 110 L 66 117 L 19 117 A 10 10 0 0 1 7 105 L 7 79 A 17 17 0 0 0 7 45 L 7 19 A 10 10 0 0 1 19 7 Z"
            stroke={`url(#${specularGradId})`}
            strokeWidth="1.25"
          />
        </g>
      </svg>

      <span
        className="zn-dock-ticket-badge"
        style={{
          background: primaryAccent,
          boxShadow: `0 0 12px ${primaryAccent}88`,
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

/**
 * Full-size interactive two-part tear-off Escape Ticket modal
 * with authentic 3D physical ticket paper tearing and "zip" snap acoustics.
 */
export const EscapeTicketModal: React.FC<EscapeTicketModalProps> = ({
  isOpen,
  ticketCount,
  onClose,
  onEscapeConfirmed,
  accentColor: explicitAccent,
  isAero = false,
  parachuteMetrics,
}) => {
  const isAeroTheme =
    isAero ||
    (typeof document !== 'undefined' &&
      (document.documentElement.getAttribute('data-theme') === 'aero' ||
        document.documentElement.getAttribute('data-interface-style') === 'aero'));

  const effectiveTicketCount = ticketCount ?? parachuteMetrics?.currentBalance ?? 0;
  const primaryAccent = resolveTicketAccent(explicitAccent, isAeroTheme);

  const [ripProgress, setRipProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'ripping' | 'escaped'>('idle');
  const [waveFlatness, setWaveFlatness] = useState(0);

  const ticketBoxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStartYRef = useRef(0);
  const lastNotchRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const rafMoveRef = useRef<number | null>(null);
  const pendingMoveYRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<'idle' | 'ripping' | 'escaped'>('idle');

  const uid = useId().replace(/:/g, '');
  const mainBgId = `znMainBg_${uid}`;
  const stubBgId = `znStubBg_${uid}`;
  const iceBorderId = `znIceBorder_${uid}`;
  const stubClipId = `znStubClip_${uid}`;
  const mainClipId = `znMainClip_${uid}`;
  const sheenGradId = `znSheen_${uid}`;
  const specularRimId = `znSpecularRim_${uid}`;
  const thumbGradId = `znThumbGrad_${uid}`;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Reset modal state whenever opened
  useEffect(() => {
    if (isOpen) {
      setRipProgress(0);
      setIsDragging(false);
      setPhase('idle');
      setWaveFlatness(0);
      lastNotchRef.current = 0;
      particlesRef.current = [];
      lastTimeRef.current = 0;
      pendingMoveYRef.current = null;
      if (rafMoveRef.current !== null) {
        cancelAnimationFrame(rafMoveRef.current);
        rafMoveRef.current = null;
      }
    }
  }, [isOpen]);

  // Web Audio API synthesizer for mechanical paper tooth friction click
  const playTickSound = useCallback((progress: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const baseFreq = 850 + progress * 720;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.018);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // Ignore audio restriction errors
    }
  }, []);

  // Web Audio API synthesizer for authentic paper ticket "Zzzzip-SNAP!" rip sound
  const playZipSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const duration = 0.17; // 170ms rapid zipping rip

      // 1. Modulated paper perforation teeth noise burst ("zzzz-ip!")
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        // Teeth tooth-to-tooth flutter frequency at ~115Hz
        const toothFlutter = 0.5 + 0.5 * Math.sin(2 * Math.PI * 115 * t);
        data[i] = (Math.random() * 2 - 1) * toothFlutter * Math.exp(-t / 0.11);
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Resonant bandpass filter rapidly sweeping down from 3800Hz to 1050Hz
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(3.5, now);
      bandpass.frequency.setValueAtTime(3800, now);
      bandpass.frequency.exponentialRampToValueAtTime(1050, now + duration);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.42, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(now);

      // 2. High-frequency paper fracture snap transient at the bottom
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(2600, now + 0.035);
      snapOsc.frequency.exponentialRampToValueAtTime(220, now + 0.13);

      snapGain.gain.setValueAtTime(0.001, now);
      snapGain.gain.setValueAtTime(0.22, now + 0.035);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now + 0.035);
      snapOsc.stop(now + 0.16);
    } catch {
      // Ignore audio restriction errors
    }
  }, []);

  // Spawn paper fiber sparks along the perforation seam in screen coordinates
  const spawnSeamSparks = useCallback((progress: number, burst = false) => {
    const box = ticketBoxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const seamX = rect.left + rect.width * 0.25;
    const seamY = rect.top + rect.height * (0.05 + progress * 0.9);

    const count = burst ? 24 : 4;
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 1.4 - Math.PI * 0.5;
      const speed = burst ? 2.5 + Math.random() * 5.5 : 1.0 + Math.random() * 2.5;
      particlesRef.current.push({
        x: seamX + (Math.random() - 0.5) * 4,
        y: seamY + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: Math.sin(angle) * speed - 0.6,
        size: burst ? 1.6 + Math.random() * 2.0 : 1.1 + Math.random() * 1.4,
        alpha: 1,
        decay: burst ? 0.02 + Math.random() * 0.015 : 0.038 + Math.random() * 0.025,
        color: Math.random() > 0.35 ? (primaryAccent || '#00F0FF') : '#ffffff',
      });
    }
  }, [primaryAccent]);

  // Trigger paper ticket rip-out sequence once rip >= 85%
  const triggerEscapeSequence = useCallback(() => {
    if (phaseRef.current === 'escaped') return;
    setPhase('escaped');
    setRipProgress(1);
    setIsDragging(false);

    playZipSound();
    if (navigator.vibrate) {
      navigator.vibrate([14, 26, 32]);
    }
    haptics.parachuteDeploy();
    spawnSeamSparks(1, true);

    // Smoothly flatten audio waveform to 0.00 dB
    const startWave = performance.now();
    const flattenDuration = 480;
    const stepWave = (now: number) => {
      const t = Math.min(1, (now - startWave) / flattenDuration);
      const eased = 1 - Math.pow(1 - t, 3);
      setWaveFlatness(eased);
      if (t < 1) requestAnimationFrame(stepWave);
    };
    setTimeout(() => requestAnimationFrame(stepWave), 120);

    // Commit ticket consumption & unlock session
    setTimeout(() => {
      if (onEscapeConfirmed) {
        onEscapeConfirmed();
      } else {
        onClose();
      }
    }, 1450);
  }, [playZipSound, spawnSeamSparks, onEscapeConfirmed, onClose]);

  // 2D Canvas overlay loop for subtle paper tear sparks (Ripples REMOVED)
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

      // Delta time normalized to 60fps
      const rawDt = (now - lastTimeRef.current) / 16.667;
      const dt = Math.max(0.2, Math.min(rawDt, 2.0));
      lastTimeRef.current = now;

      // Update & draw glowing paper fiber sparks with delta-time
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0.02);
      for (const p of particlesRef.current) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.12 * dt;
        p.alpha -= p.decay * dt;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, primaryAccent]);

  // Spring back if user releases before reaching 85% rip threshold
  useEffect(() => {
    if (isDragging || phase === 'escaped' || ripProgress === 0) return;
    let raf: number;
    let lastSpringTime = performance.now();
    const springBack = (now: number) => {
      const rawDt = (now - lastSpringTime) / 16.667;
      const dt = Math.max(0.2, Math.min(rawDt, 2.0));
      lastSpringTime = now;
      setRipProgress((prev) => {
        const next = prev * Math.pow(0.78, dt);
        if (next < 0.008) {
          setPhase('idle');
          lastNotchRef.current = 0;
          return 0;
        }
        raf = requestAnimationFrame(springBack);
        return next;
      });
    };
    raf = requestAnimationFrame(springBack);
    return () => cancelAnimationFrame(raf);
  }, [isDragging, phase, ripProgress]);

  const getDragRange = useCallback(() => {
    const box = ticketBoxRef.current;
    if (!box) return 160;
    return Math.max(120, box.getBoundingClientRect().height * 0.72);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase === 'escaped') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setPhase('ripping');
    const dragRange = getDragRange();
    dragStartYRef.current = e.clientY - ripProgress * dragRange;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || phase === 'escaped') return;
    pendingMoveYRef.current = e.clientY;
    if (rafMoveRef.current !== null) return;

    rafMoveRef.current = requestAnimationFrame(() => {
      rafMoveRef.current = null;
      if (pendingMoveYRef.current === null) return;
      const dragRange = getDragRange();
      const raw = (pendingMoveYRef.current - dragStartYRef.current) / dragRange;
      const clamped = Math.max(0, Math.min(1, raw));
      setRipProgress(clamped);

      // Mechanical notch tick + micro-sparks every ~8%
      const notch = Math.floor(clamped * 12);
      if (notch > lastNotchRef.current) {
        lastNotchRef.current = notch;
        playTickSound(clamped);
        if (navigator.vibrate) navigator.vibrate(6);
        haptics.tick(150);
        spawnSeamSparks(clamped, false);
      }

      if (clamped >= 0.85) {
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
    if (ripProgress >= 0.85) {
      triggerEscapeSequence();
    }
  };

  if (!isOpen) return null;

  // Interpolate audio waveform points toward flat line y=156
  const baseWaveY = [156, 156, 126, 186, 114, 198, 130, 182, 138, 174, 145, 167, 150, 162, 154, 158, 156];
  const waveX = [204, 224, 236, 248, 260, 272, 284, 296, 308, 320, 332, 344, 356, 368, 380, 392, 410];
  const currentWavePath =
    waveX
      .map((x, idx) => {
        const y = 156 + (baseWaveY[idx] - 156) * (1 - waveFlatness);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`;
      })
      .join(' ') + ' L 594 156';

  const isEscaped = phase === 'escaped';
  const tearY = 14 + ripProgress * 268;

  // Real physical jagged paper perforation teeth paths
  const tearTeethPath = useMemo(() => {
    const pts: string[] = ['M 160 14'];
    const step = 8;
    const count = Math.max(1, Math.floor((tearY - 14) / step));
    for (let i = 0; i < count; i++) {
      const y = 14 + i * step;
      const offset = i % 2 === 0 ? 1.8 : -1.8;
      pts.push(`L ${(160 + offset).toFixed(1)} ${(y + step * 0.5).toFixed(1)}`);
    }
    pts.push(`L 160 ${tearY.toFixed(1)}`);
    return pts.join(' ');
  }, [tearY]);

  const fullTearTeethPath = useMemo(() => {
    const pts: string[] = ['M 160 14'];
    const step = 7.5;
    const count = Math.floor((282 - 14) / step);
    for (let i = 0; i < count; i++) {
      const y = 14 + i * step;
      const offset = i % 2 === 0 ? 2.2 : -2.0;
      pts.push(`L ${(160 + offset).toFixed(1)} ${(y + step * 0.5).toFixed(1)}`);
    }
    pts.push('L 160 282');
    return pts.join(' ');
  }, []);

  // Left stub physical 3D paper curl & gravity tear transform
  const stubStyle: React.CSSProperties = isEscaped
    ? {
        transform: 'translate3d(-105px, 520px, 80px) rotateZ(-38deg) rotateY(44deg) rotateX(20deg) scale(0.85)',
        opacity: 0,
        filter: 'blur(2px)',
        transition: 'transform 0.72s cubic-bezier(0.18, 0.88, 0.26, 1.05), opacity 0.58s cubic-bezier(0.4, 0, 0.8, 1), filter 0.58s ease-out',
        willChange: 'transform, opacity, filter',
      }
    : {
        transform: `translate3d(${-ripProgress * 28}px, ${ripProgress * 70}px, ${ripProgress * 20}px) rotateZ(${-ripProgress * 15}deg) rotateY(${ripProgress * 22}deg) rotateX(${-ripProgress * 8}deg)`,
        transformOrigin: '160px 292px',
        transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
      };

  return (
    <div
      className="zn-escape-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Escape Ticket"
      style={{
        background: isAeroTheme ? 'rgba(243, 237, 232, 0.95)' : 'rgba(4, 6, 12, 0.92)',
        backdropFilter: 'blur(36px) saturate(190%)',
        WebkitBackdropFilter: 'blur(36px) saturate(190%)',
        ['--liquid-accent-glow' as any]: `${primaryAccent}44`,
        ['--liquid-accent-soft-glow' as any]: `${primaryAccent}22`,
        ['--accent-hex' as any]: primaryAccent,
      }}
    >
      {/* 2D Particle Sparks & Void Fracture Canvas */}
      <canvas ref={canvasRef} className="zn-escape-canvas" />

      {/* Top Subtle Status / Close Bar */}
      <div className="zn-escape-topbar">
        <span
          className={`zn-escape-pill ${
            isAeroTheme
              ? 'bg-[#F8F4F0] border border-[rgba(53,59,91,0.12)] text-[#353B5B] shadow-sm font-bold'
              : 'bg-[rgba(18,22,34,0.75)] border border-[rgba(255,255,255,0.18)] text-white shadow-lg backdrop-blur-md font-bold'
          }`}
        >
          {isEscaped ? 'VOID LOCK // RELEASED' : `TICKETS AVAILABLE: ${effectiveTicketCount}`}
        </span>
        {!isEscaped && (
          <button
            type="button"
            className={`zn-escape-close ${
              isAeroTheme
                ? 'bg-[#F8F4F0] border border-[rgba(53,59,91,0.12)] text-[#353B5B] hover:bg-[#EDE6DF] shadow-sm'
                : 'bg-[rgba(18,22,34,0.75)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(26,32,48,0.9)] shadow-lg backdrop-blur-md'
            }`}
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

      {/* Centered Two-Part Notched Escape Ticket */}
      <div
        ref={ticketBoxRef}
        className={`zn-ticket-stage ${isEscaped ? 'zn-ticket-stage--escaped' : ''}`}
      >
        {/* Soft Ambient Caustic Underglow */}
        <div className="zn-ticket-ambient-glow" />

        <svg
          className="zn-ticket-svg"
          viewBox="0 0 640 296"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={mainBgId} x1="160" y1="0" x2="640" y2="296" gradientUnits="userSpaceOnUse">
              {isAeroTheme ? (
                <>
                  <stop offset="0%" stopColor="#F8F4F0" />
                  <stop offset="100%" stopColor="#F3EDE8" />
                </>
              ) : (
                <>
                  {/* Authentic High-Contrast Deep Liquid Glass Obsidian */}
                  <stop offset="0%" stopColor="#0B101D" />
                  <stop offset="40%" stopColor="#060912" />
                  <stop offset="100%" stopColor="#020306" />
                </>
              )}
            </linearGradient>
            <linearGradient id={stubBgId} x1="0" y1="0" x2="160" y2="296" gradientUnits="userSpaceOnUse">
              {isAeroTheme ? (
                <>
                  <stop offset="0%" stopColor="#EDE6DF" />
                  <stop offset="100%" stopColor="#E5DDD5" />
                </>
              ) : (
                <>
                  {/* Deep Smoked Left Stub Glass */}
                  <stop offset="0%" stopColor="#0E1424" />
                  <stop offset="100%" stopColor="#03050A" />
                </>
              )}
            </linearGradient>
            <linearGradient id={iceBorderId} x1="0" y1="0" x2="640" y2="296" gradientUnits="userSpaceOnUse">
              {isAeroTheme ? (
                <>
                  <stop offset="0%" stopColor={primaryAccent} stopOpacity="0.85" />
                  <stop offset="50%" stopColor="rgba(53, 59, 91, 0.16)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="rgba(53, 59, 91, 0.08)" stopOpacity="0.8" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
                  <stop offset="24%" stopColor={primaryAccent} stopOpacity="0.88" />
                  <stop offset="65%" stopColor="rgba(255, 255, 255, 0.42)" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" stopOpacity="0.2" />
                </>
              )}
            </linearGradient>
            <linearGradient id={sheenGradId} x1="0" y1="0" x2="1" y2="0.8">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
              <stop offset="26%" stopColor="rgba(255, 255, 255, 0.07)" />
              <stop offset="55%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>
            <linearGradient id={specularRimId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="25%" stopColor={primaryAccent} stopOpacity="0.90" />
              <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.06)" />
            </linearGradient>
            <radialGradient id={thumbGradId} cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="42%" stopColor={primaryAccent} />
              <stop offset="100%" stopColor={primaryAccent} stopOpacity="0.85" />
            </radialGradient>
            <clipPath id={stubClipId}>
              <path d="M 22 4 L 152 4 L 160 14 L 160 282 L 152 292 L 22 292 A 18 18 0 0 1 4 274 L 4 176 A 28 28 0 0 0 4 120 L 4 22 A 18 18 0 0 1 22 4 Z" />
            </clipPath>
            <clipPath id={mainClipId}>
              <path d="M 160 14 L 168 4 L 618 4 A 18 18 0 0 1 636 22 L 636 120 A 28 28 0 0 0 636 176 L 636 274 A 18 18 0 0 1 618 292 L 168 292 L 160 282 Z" />
            </clipPath>
          </defs>

          {/* ================= RIGHT MAIN BODY (75%) ================= */}
          <g clipPath={`url(#${mainClipId})`}>
            {/* Deep Obsidian Glass Fill */}
            <rect x="160" y="0" width="480" height="296" fill={`url(#${mainBgId})`} />

            {/* Specular Diagonal Glass Sheen */}
            <rect x="160" y="0" width="480" height="296" fill={`url(#${sheenGradId})`} pointerEvents="none" />

            {/* Subtle Technical Grid Texture */}
            <g opacity={isAeroTheme ? 0.04 : 0.06} stroke={primaryAccent} strokeWidth="1">
              <line x1="160" y1="74" x2="640" y2="74" />
              <line x1="160" y1="222" x2="640" y2="222" />
              <line x1="398" y1="0" x2="398" y2="296" />
            </g>

            {/* Top Micro Status */}
            <text
              x="204"
              y="44"
              fill={isAeroTheme ? 'rgba(53, 59, 91, 0.75)' : 'rgba(255, 255, 255, 0.75)'}
              fontSize="10.5"
              fontWeight="700"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              letterSpacing="2.4"
            >
              {isEscaped ? 'STATUS // BYPASS GRANTED' : 'ZERO NOISE // PROTOCOL'}
            </text>

            {/* Main Headline */}
            <text
              x="204"
              y="102"
              fill={isAeroTheme ? '#353B5B' : (isEscaped ? primaryAccent : '#FFFFFF')}
              fontSize="36"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              letterSpacing="3.5"
            >
              {isEscaped ? 'ESCAPE INITIATED' : 'ESCAPE TICKET'}
            </text>

            {/* Audio-to-Silence Waveform */}
            <path
              d={currentWavePath}
              stroke={primaryAccent}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{ filter: `drop-shadow(0 0 6px ${primaryAccent}99)` }}
            />
            <text
              x="594"
              y="142"
              textAnchor="end"
              fill={isAeroTheme ? 'rgba(53, 59, 91, 0.60)' : 'rgba(255, 255, 255, 0.70)'}
              fontSize="9.5"
              fontWeight="600"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              letterSpacing="1.6"
            >
              {isEscaped ? '0.00 dB' : 'VOID LOCK'}
            </text>

            {/* Bottom Divider & Destination Line */}
            <line x1="204" y1="228" x2="594" y2="228" stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.12)' : 'rgba(255, 255, 255, 0.16)'} strokeWidth="1" />
            <text
              x="204"
              y="258"
              fill={isAeroTheme ? 'rgba(53, 59, 91, 0.75)' : 'rgba(255, 255, 255, 0.75)'}
              fontSize="11.5"
              fontWeight="600"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              letterSpacing="2.6"
            >
              DESTINATION:{' '}
              <tspan fill={isAeroTheme ? '#353B5B' : '#FFFFFF'} fontWeight="700">
                ESCAPE
              </tspan>
            </text>

            {/* Top Specular Rim Reflection Highlight */}
            <path
              d="M 168 5 L 618 5 A 17 17 0 0 1 635 22"
              stroke={`url(#${specularRimId})`}
              strokeWidth="1.75"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Outer & Inner Specular Borders (Main Body) */}
            <path
              d="M 160 14 L 168 4 L 618 4 A 18 18 0 0 1 636 22 L 636 120 A 28 28 0 0 0 636 176 L 636 274 A 18 18 0 0 1 618 292 L 168 292 L 160 282"
              stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.12)' : 'rgba(255, 255, 255, 0.20)'}
              strokeWidth="2"
            />
            <path
              d="M 166 20 L 172 11 L 614 11 A 12 12 0 0 1 629 25 L 629 115 A 34 34 0 0 0 629 181 L 629 271 A 12 12 0 0 1 614 285 L 172 285 L 166 276"
              stroke={`url(#${iceBorderId})`}
              strokeWidth="1.25"
            />
          </g>

          {/* ================= PERFORATION SEAM (x = 160) ================= */}
          {/* Intact Lower Dashed Seam */}
          {!isEscaped && tearY < 282 && (
            <line
              x1="160"
              y1={tearY}
              x2="160"
              y2="282"
              stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.16)' : 'rgba(255, 255, 255, 0.24)'}
              strokeOpacity={0.9}
              strokeWidth="1.6"
              strokeDasharray="5 5"
            />
          )}
          {/* Unzipped Jagged Paper Tear Teeth */}
          {ripProgress > 0.01 && !isEscaped && (
            <>
              <path
                d={tearTeethPath}
                stroke={primaryAccent}
                strokeWidth="4"
                strokeOpacity="0.4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={tearTeethPath}
                stroke={primaryAccent}
                strokeWidth="2.2"
                strokeOpacity="0.95"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}
          {/* Ripped Paper Tooth Edge on Escape */}
          {isEscaped && (
            <>
              <path
                className="zn-seam-flash"
                d={fullTearTeethPath}
                stroke={primaryAccent}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={fullTearTeethPath}
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {/* ================= LEFT TEAR-OFF STUB (25%) ================= */}
          <g style={stubStyle}>
            <g clipPath={`url(#${stubClipId})`}>
              <rect x="0" y="0" width="160" height="296" fill={`url(#${stubBgId})`} />

              {/* Diagonal Refractive Sheen on Stub */}
              <rect x="0" y="0" width="160" height="296" fill={`url(#${sheenGradId})`} pointerEvents="none" />

              {/* Top Specular Rim on Stub */}
              <path
                d="M 22 5 L 152 5"
                stroke={`url(#${specularRimId})`}
                strokeWidth="1.75"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Vertical Slider Track: Deep liquid groove */}
              <rect
                x="75"
                y="54"
                width="28"
                height="188"
                rx="14"
                fill={isAeroTheme ? '#EDE6DF' : '#03050A'}
                stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.12)' : 'rgba(255, 255, 255, 0.18)'}
                strokeWidth="1.2"
              />
              <line
                x1="89"
                y1="68"
                x2="89"
                y2="228"
                stroke={primaryAccent}
                strokeOpacity="0.30"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Animated Downward Chevrons */}
              <g
                className="zn-stub-chevrons"
                stroke={primaryAccent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="83,84 89,90 95,84" opacity={isAeroTheme ? 0.6 : 0.45} />
                <polyline points="83,102 89,108 95,102" opacity={isAeroTheme ? 0.8 : 0.7} />
                <polyline points="83,120 89,126 95,120" opacity={0.95} />
              </g>

              {/* Draggable Liquid Glass Pearl Indicator */}
              <g transform={`translate(0, ${ripProgress * 144})`}>
                {/* Ambient glow halo */}
                <circle cx="89" cy="76" r="15" fill={primaryAccent} fillOpacity="0.28" />
                {/* Outer glass ring bevel */}
                <circle cx="89" cy="76" r="10.5" fill="none" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="1.2" />
                {/* Glowing pearl core */}
                <circle
                  cx="89"
                  cy="76"
                  r="9.5"
                  fill={`url(#${thumbGradId})`}
                  style={{ filter: `drop-shadow(0 0 12px ${primaryAccent})` }}
                />
                {/* Specular light glint reflection */}
                <ellipse
                  cx="86.5"
                  cy="73"
                  rx="2.8"
                  ry="1.5"
                  fill="#FFFFFF"
                  fillOpacity="0.95"
                  transform="rotate(-28 86.5 73)"
                />
              </g>

              {/* Vertical Stub Label */}
              <text
                x="48"
                y="148"
                fill={isAeroTheme ? 'rgba(53, 59, 91, 0.60)' : 'rgba(255, 255, 255, 0.70)'}
                fontSize="9.5"
                fontWeight="700"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                letterSpacing="2.2"
                textAnchor="middle"
                transform="rotate(-90 48 148)"
              >
                STUB // 01
              </text>

              {/* Outer & Inner Specular Borders (Left Stub) */}
              <path
                d="M 160 14 L 152 4 L 22 4 A 18 18 0 0 0 4 22 L 4 120 A 28 28 0 0 1 4 176 L 4 274 A 18 18 0 0 0 22 292 L 152 292 L 160 282"
                stroke={isAeroTheme ? 'rgba(53, 59, 91, 0.12)' : 'rgba(255, 255, 255, 0.20)'}
                strokeWidth="2"
              />
              <path
                d="M 154 20 L 148 11 L 26 11 A 12 12 0 0 0 11 25 L 11 115 A 34 34 0 0 1 11 181 L 11 271 A 12 12 0 0 0 26 285 L 148 285 L 154 276"
                stroke={`url(#${iceBorderId})`}
                strokeWidth="1.25"
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

      {/* Minimal Bottom Hint */}
      <div className="zn-escape-footer">
        {isEscaped ? (
          <span className={`zn-escape-hint zn-escape-hint--active ${
            isAeroTheme
              ? 'bg-[#F8F4F0] border border-[rgba(53,59,91,0.12)] text-[#353B5B] shadow-sm font-bold'
              : 'bg-[rgba(18,22,34,0.75)] border border-[rgba(255,255,255,0.18)] text-white shadow-lg backdrop-blur-md font-bold'
          }`}>
            ESCAPING THE VOID...
          </span>
        ) : (
          <span className={`zn-escape-hint ${
            isAeroTheme
              ? 'bg-[#F8F4F0] border border-[rgba(53,59,91,0.12)] text-[#353B5B] shadow-sm font-bold'
              : 'bg-[rgba(18,22,34,0.75)] border border-[rgba(255,255,255,0.18)] text-white shadow-lg backdrop-blur-md font-bold'
          }`}>
            SLIDE LEFT STUB DOWN TO RIP
          </span>
        )}
      </div>
    </div>
  );
};
