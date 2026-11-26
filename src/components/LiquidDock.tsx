import React from 'react';
import { Clock, Heart, Settings, BarChart3, Play } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { useInterfaceStyle } from '../context/interfaceStyleStore';

export type ZeroNavTab = 'dial' | 'dashboard' | 'zerotube' | 'schedules' | 'support';

interface LiquidDockProps {
  activeTab: ZeroNavTab;
  ticketCount?: number;
  onSelectTab: (tab: ZeroNavTab) => void;
}

const TABS: Array<{ id: ZeroNavTab; label: string }> = [
  { id: 'dial', label: 'Focus' },
  { id: 'dashboard', label: 'Insights' },
  { id: 'zerotube', label: 'ZeroTube' },
  { id: 'schedules', label: 'Settings & OS' },
  { id: 'support', label: 'Support' },
];

export const LiquidDock: React.FC<LiquidDockProps> = ({
  activeTab,
  ticketCount: _ticketCount,
  onSelectTab,
}) => {
  const { isAero } = useInterfaceStyle();
  const activeIdx = Math.max(
    0,
    TABS.findIndex((t) => t.id === activeTab)
  );

  return (
    <nav
      aria-label="Primary Navigation"
      data-frosted-chrome="true"
      className="fixed left-3 right-3 z-40 max-w-md mx-auto pointer-events-auto"
      style={{ bottom: 'calc(20px + var(--zero-safe-bottom))' }}
    >
      <div
        className={`liquid-dock rounded-2xl p-1.5 relative overflow-hidden ${
          isAero ? 'bg-[#F8F4F0] border border-[rgba(53,59,91,0.09)] shadow-sm' : ''
        }`}
      >
        <div className="grid grid-cols-5 relative">
          {/* Smooth sliding pill indicator */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-0 w-1/5 p-1 pointer-events-none will-change-transform"
            style={{
              transform: `translateX(${activeIdx * 100}%)`,
              transition: 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              className="w-full h-full rounded-[10px] liquid-dock-item-active"
              style={
                isAero
                  ? {
                      backgroundColor: '#353B5B',
                      border: '1px solid #353B5B',
                    }
                  : {
                      background: 'var(--accent-soft, rgba(244, 63, 94, 0.14))',
                      border: '1px solid var(--accent-border, rgba(244, 63, 94, 0.45))',
                    }
              }
            />
          </div>

          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  haptics.tick(900);
                  onSelectTab(tab.id);
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative z-10 flex flex-col items-center justify-center py-2 px-1 rounded-[10px] cursor-pointer liquid-spring ${
                  isAero
                    ? active
                      ? 'text-[var(--accent-primary,#E69F86)]'
                      : 'text-[#353B5B]/75 hover:text-[#353B5B]'
                    : active
                    ? 'text-white'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  {tab.id === 'dial' && (
                    <Clock
                      size={17}
                      strokeWidth={active ? 2.2 : 1.9}
                      className={isAero ? (active ? 'text-[var(--accent-primary,#E69F86)]' : 'text-[#353B5B]/75') : (active ? 'text-cyan-300' : undefined)}
                    />
                  )}
                  {tab.id === 'dashboard' && (
                    <BarChart3
                      size={17}
                      strokeWidth={active ? 2.2 : 1.9}
                      className={isAero ? (active ? 'text-[var(--accent-primary,#E69F86)]' : 'text-[#353B5B]/75') : (active ? 'text-cyan-300' : undefined)}
                    />
                  )}
                  {tab.id === 'zerotube' && (
                    <Play
                      size={17}
                      strokeWidth={active ? 2.2 : 1.9}
                      fill={active ? 'currentColor' : 'none'}
                      className={isAero ? (active ? 'text-[var(--accent-primary,#E69F86)]' : 'text-[#353B5B]/75') : (active ? 'text-cyan-300' : undefined)}
                    />
                  )}
                  {tab.id === 'schedules' && (
                    <Settings
                      size={17}
                      strokeWidth={active ? 2.2 : 1.9}
                      className={isAero ? (active ? 'text-[var(--accent-primary,#E69F86)]' : 'text-[#353B5B]/75') : (active ? 'text-cyan-300' : undefined)}
                    />
                  )}
                  {tab.id === 'support' && (
                    <Heart
                      size={17}
                      strokeWidth={active ? 2.2 : 1.9}
                      className={isAero ? (active ? 'text-[var(--accent-primary,#E69F86)]' : 'text-[#353B5B]/75') : (active ? 'text-cyan-300' : undefined)}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight whitespace-nowrap font-sans ${
                    isAero
                      ? active
                        ? 'font-extrabold text-[var(--accent-primary,#E69F86)]'
                        : 'font-semibold text-[#353B5B]/75'
                      : active
                      ? 'font-extrabold text-white'
                      : 'font-semibold text-zinc-300'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
