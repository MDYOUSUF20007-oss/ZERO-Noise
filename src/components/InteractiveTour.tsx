import { useState, useEffect } from 'react';
import { haptics } from '../utils/haptics';
import { ArrowRight, X, Clock, BarChart3, Settings, Heart, Sparkles } from 'lucide-react';
import { useInterfaceStyle } from '../context/interfaceStyleStore';
import { ObsidianCard } from './ObsidianCard';
import type { ZeroNavTab } from './LiquidDock';

interface InteractiveTourProps {
  onComplete: () => void;
  onNavigateTab: (tab: ZeroNavTab) => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    tab: 'dial' as const,
    title: 'The Focus Dial',
    icon: Clock,
    badge: 'Step 1 of 4',
    spotlight: 'Active Screen: Focus Dial & Intention Locking',
    description:
      'Dial in your intended focus time and select a session tag (#DeepWork, #Study, #Sleep). Once locked, Zero guards your attention against digital impulses.',
  },
  {
    step: 2,
    tab: 'dashboard' as const,
    title: 'Discipline Insights & Escape Tickets',
    icon: BarChart3,
    badge: 'Step 2 of 4',
    spotlight: 'Active Screen: Escape Tickets & Reclaimed Hours (Look Above)',
    description:
      'Review your daily reclaimed hours and streak calendar. Every 35 hours of clean phone-free discipline earns you 1 Emergency Escape Ticket.',
  },
  {
    step: 3,
    tab: 'schedules' as const,
    title: 'Automated Routines & App Bags',
    icon: Settings,
    badge: 'Step 3 of 4',
    spotlight: 'Active Screen: Automated Shields & Occasion Bags',
    description:
      'Set automated recurring schedules (like Late-Night Sleep or Morning Focus) and organize apps into custom Occasion Bags with tailored friction.',
  },
  {
    step: 4,
    tab: 'support' as const,
    title: 'Pure FOSS & Developer Support',
    icon: Heart,
    badge: 'Step 4 of 4',
    spotlight: 'Active Screen: 100% Free & Open-Source Guarantee',
    description:
      'ZERO is 100% Free and Open-Source Software built by Mohammed Yusuf (@MDYOUSUF20007-oss). Zero paywalls, zero subscriptions, zero countdown pressure. Support via UPI or Ko-fi if you wish.',
  },
];

export function InteractiveTour({ onComplete, onNavigateTab }: InteractiveTourProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStep = TOUR_STEPS[currentIndex];
  const StepIcon = currentStep.icon;
  const { isBespoke, isFluentGlass } = useInterfaceStyle();
  const isModernFont = isBespoke || isFluentGlass;

  useEffect(() => {
    onNavigateTab(TOUR_STEPS[0].tab);
  }, [onNavigateTab]);

  const handleNext = () => {
    haptics.tick(900);
    if (currentIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      onNavigateTab(TOUR_STEPS[nextIdx].tab);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    haptics.tick(900);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-4 pb-20 sm:pb-24">
      {/* Crystal-clear non-blurring touch backdrop to allow underlying cards to remain 100% sharp & visible */}
      <div
        className="absolute inset-0 bg-black/25 pointer-events-auto transition-opacity"
        onClick={handleSkip}
        aria-label="Tap to skip tour"
      />

      {/* Top Floating Spotlight Badge */}
      <div className="relative pointer-events-none w-full flex justify-center pt-3 animate-fadeIn">
        <div
          className="liquid-inset px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-xl"
          style={{ borderColor: 'var(--accent-border)' }}
        >
          <span
            className="w-2 h-2 rounded-full animate-ping shrink-0"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {currentStep.spotlight}
          </span>
        </div>
      </div>

      {/* Floating Tour Card Docked Neatly at Bottom */}
      <div className="relative pointer-events-auto max-w-md mx-auto w-full animate-slideUp">
        <ObsidianCard
          ambientGlow
          className={`rounded-[24px] shadow-2xl ${isModernFont ? 'font-sans' : 'font-mono'}`}
          headerClassName="p-5 space-y-4"
          headerContent={
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="p-2 rounded-xl shadow-sm shrink-0"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      border: '1px solid var(--accent-border)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    <StepIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={11} style={{ color: 'var(--accent-primary)' }} />
                      <span
                        className="text-[10px] font-mono uppercase tracking-wider font-bold"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        {currentStep.badge}
                      </span>
                    </div>
                    <h3
                      className="text-base font-bold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {currentStep.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-8 h-8 rounded-full liquid-pill-inactive liquid-spring flex items-center justify-center shrink-0 cursor-pointer"
                  title="Skip Tour"
                  aria-label="Skip Tour"
                >
                  <X size={15} />
                </button>
              </div>

              <p
                className="text-xs leading-relaxed font-sans"
                style={{ color: 'var(--text-secondary)' }}
              >
                {currentStep.description}
              </p>

              {/* Step indicators & Next Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === currentIndex ? 24 : 6,
                        backgroundColor:
                          i === currentIndex ? 'var(--accent-primary)' : 'var(--border-strong)',
                        boxShadow:
                          i === currentIndex ? '0 0 8px var(--liquid-accent-glow)' : undefined,
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="py-2 px-4 rounded-full text-xs font-bold flex items-center gap-1.5 liquid-spring shadow-md cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-on-accent)',
                    boxShadow: '0 6px 16px -4px var(--liquid-accent-glow)',
                  }}
                >
                  <span>{currentIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Glance'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </>
          }
        />
      </div>
    </div>
  );
}
