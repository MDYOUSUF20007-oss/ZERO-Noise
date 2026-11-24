import { useState, useEffect } from 'react';
import { haptics } from '../utils/haptics';
import { ArrowRight, X, Clock, BarChart3, Settings, Heart, Sparkles } from 'lucide-react';
import { useInterfaceStyle } from '../context/InterfaceStyleContext';
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
  const { isAero } = useInterfaceStyle();

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
        className="absolute inset-0 bg-black/20 pointer-events-auto transition-opacity"
        onClick={handleSkip}
        aria-label="Tap to skip tour"
      />

      {/* Top Floating Spotlight Badge pointing to the exact feature on screen */}
      <div className="relative pointer-events-none w-full flex justify-center pt-3 animate-fadeIn">
        <div
          className={`px-3.5 py-1.5 rounded-full border shadow-lg flex items-center gap-2 backdrop-blur-md ${
            isAero
              ? 'bg-[#F8F4F0] border-[rgba(53,59,91,0.08)] text-[#353B5B]'
              : 'bg-[#2C314C] border-[rgba(243,237,232,0.10)] text-[#F3EDE8]'
          }`}
        >
          <span
            className="w-2 h-2 rounded-full animate-ping shrink-0 bg-[#E69F86]"
          />
          <span className="text-xs font-semibold">{currentStep.spotlight}</span>
        </div>
      </div>

      {/* Floating Tour Card Docked Neatly at Bottom */}
      <div
        className={`relative pointer-events-auto max-w-md mx-auto w-full rounded-2xl p-5 shadow-2xl space-y-4 backdrop-blur-xl animate-slideUp border ${
          isAero
            ? 'bg-[#F8F4F0] border-[rgba(53,59,91,0.08)] text-[#353B5B]'
            : 'bg-[#2C314C] border-[rgba(243,237,232,0.10)] text-[#F3EDE8]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl border bg-[rgba(230,159,134,0.18)] text-[#E69F86] border-[rgba(230,159,134,0.40)] shadow-sm"
            >
              <StepIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#E69F86]" />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#E69F86]">
                  {currentStep.badge}
                </span>
              </div>
              <h3 className={`text-base font-bold ${isAero ? 'text-[#353B5B]' : 'text-[#F3EDE8]'}`}>
                {currentStep.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className={`p-1.5 rounded-lg transition-colors ${
              isAero ? 'text-[rgba(53,59,91,0.60)] hover:text-[#353B5B] hover:bg-[#EDE6DF]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Skip Tour"
          >
            <X size={16} />
          </button>
        </div>

        <p className={`text-xs leading-relaxed font-sans ${isAero ? 'text-[rgba(53,59,91,0.75)]' : 'text-[rgba(243,237,232,0.75)]'}`}>
          {currentStep.description}
        </p>

        {/* Step indicators & Next Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 bg-[#E69F86] shadow-sm'
                    : isAero
                    ? 'w-1.5 bg-[#EDE6DF]'
                    : 'w-1.5 bg-[#202438]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isAero
                ? 'bg-[#353B5B] text-[#F3EDE8] hover:bg-[#434A70]'
                : 'bg-[#E69F86] text-[#24283F] hover:bg-[#EEB9A4]'
            }`}
          >
            <span>{currentIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Glance'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
