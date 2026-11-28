import React, { useEffect, useState } from 'react';
import { Dumbbell, X, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useInterfaceStyle } from '../context/interfaceStyleStore';
import { ObsidianCard } from './ObsidianCard';
import { haptics } from '../utils/haptics';

export interface ActionReminderAlertModalProps {
  text: string;
  voiceEnabled: boolean;
  onDismiss: () => void;
}

/**
 * Zero-guilt in-app alert card that pops up when a micro-habit reminder triggers.
 * No checkboxes, no streaks, no tracking guilt. Just the next move.
 */
export const ActionReminderAlertModal: React.FC<ActionReminderAlertModalProps> = ({
  text,
  voiceEnabled,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { isMaterial, isBespoke, isFluentGlass } = useInterfaceStyle();
  const isModernFont = isBespoke || isFluentGlass || isMaterial;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleDismiss = () => {
    haptics.tick(600);
    setIsVisible(false);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Movement Reminder"
      className={`fixed inset-0 z-[10050] flex items-center justify-center p-4 transition-opacity duration-200 ${
        isMaterial
          ? 'bg-black/50 backdrop-blur-sm'
          : isFluentGlass
          ? 'bg-black/75 backdrop-blur-md'
          : 'bg-black/85 backdrop-blur-lg'
      } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleDismiss}
    >
      <div
        className={`w-full max-w-sm transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ObsidianCard
          ambientGlow
          className={`rounded-[26px] shadow-2xl ${isModernFont ? 'font-sans' : 'font-mono'}`}
          headerClassName="p-6 flex flex-col items-center text-center space-y-5"
          headerContent={
            <>
              {/* Top Header Badge & Sound/Close Controls */}
              <div className="flex items-center justify-between w-full">
                <div className="liquid-pill-active px-3 py-1 flex items-center gap-1.5 text-[10px] font-mono tracking-wider font-bold">
                  <Dumbbell size={12} strokeWidth={2.2} />
                  <span>Movement Nudge</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="p-1.5 rounded-full text-xs flex items-center justify-center"
                    style={{
                      color: voiceEnabled ? 'var(--accent-primary)' : 'var(--text-muted)',
                    }}
                    title={voiceEnabled ? 'Voice Enabled' : 'Silent Reminder'}
                  >
                    {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </span>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-8 h-8 rounded-full liquid-pill-inactive liquid-spring flex items-center justify-center cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Action Typography */}
              <div className="py-2 space-y-2.5">
                <p
                  className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {text}
                </p>
                <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Zero guilt. Act on it or dismiss &mdash; it&apos;s your move.
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-3.5 px-4 rounded-2xl font-sans font-bold text-sm flex items-center justify-center gap-2 liquid-spring cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-on-accent)',
                  boxShadow:
                    '0 10px 26px -6px var(--liquid-accent-glow), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                }}
              >
                <span>Make Next Move</span>
                <ArrowRight size={15} />
              </button>
            </>
          }
        />
      </div>
    </div>
  );
};
