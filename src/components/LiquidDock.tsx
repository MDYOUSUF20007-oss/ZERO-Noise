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
  const { isMaterial } = useInterfaceStyle();
  const activeIdx = Math.max(
    0,
    TABS.findIndex((t) => t.id === activeTab)
  );

  return (
    <nav
      aria-label="Primary Navigation"
      data-frosted-chrome="true"
      className="fixed left-3 right-3 z-40 max-w-md mx-auto pointer-events-auto"
      style={{ bottom: 'calc(16px + var(--zero-safe-bottom))' }}
    >
      <div
        className={`liquid-dock p-1.5 relative overflow-hidden ${
          isMaterial ? 'rounded-3xl' : 'rounded-[28px]'
        }`}
      >
        {!isMaterial && (
          <div
            aria-hidden="true"
            className="absolute top-0 left-5 right-5 h-[1px] pointer-events-none z-20"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.32) 20%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.32) 80%, transparent 100%)',
              opacity: 'var(--glass-specular-opacity, 0.525)',
            }}
          />
        )}
        <div className="grid grid-cols-5 relative">
          {/* Active Destination Indicator: Floating Liquid Lens Pill in Fluent Glass only; Material uses standard M3 icon pill */}
          {!isMaterial && (
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0 left-0 w-1/5 p-1 pointer-events-none"
              style={{
                transform: `translate3d(${activeIdx * 100}%, 0, 0)`,
                transition: 'transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1)',
              }}
            >
              <div
                className="w-full h-full liquid-dock-item-active rounded-[20px]"
                style={{
                  background:
                    'linear-gradient(155deg, rgba(255, 255, 255, 0.18) 0%, var(--accent-soft, rgba(244, 63, 94, 0.16)) 52%, rgba(var(--accent-rgb, 244, 63, 94), 0.24) 100%)',
                  border: '1px solid var(--accent-border, rgba(244, 63, 94, 0.55))',
                  boxShadow:
                    'inset 0 1px 0 rgba(255, 255, 255, 0.42), inset 0 -1px 0 rgba(0, 0, 0, 0.22), 0 4px 16px -3px var(--liquid-accent-soft-glow, rgba(244, 63, 94, 0.25))',
                }}
              />
            </div>
          )}

          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const iconColor = isMaterial
              ? active
                ? 'var(--md-sys-color-on-primary-container)'
                : 'var(--md-sys-color-on-surface-variant)'
              : active
              ? 'var(--liquid-accent-tint, var(--accent-primary))'
              : undefined;
            const labelColor = isMaterial
              ? active
                ? 'var(--md-sys-color-on-surface)'
                : 'var(--md-sys-color-on-surface-variant)'
              : undefined;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  haptics.tick(900);
                  onSelectTab(tab.id);
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative z-10 min-h-[48px] flex flex-col items-center justify-center py-1.5 px-1 cursor-pointer focus-visible:outline-none liquid-spring ${
                  isMaterial
                    ? 'rounded-2xl'
                    : `rounded-[20px] ${active ? 'text-white' : 'text-zinc-300/90 hover:text-white'}`
                }`}
              >
                <div
                  className={
                    isMaterial
                      ? 'relative flex items-center justify-center w-14 h-7 rounded-full overflow-hidden'
                      : 'relative flex items-center justify-center'
                  }
                  style={
                    isMaterial
                      ? {
                          color: iconColor,
                          transform: active ? 'translate3d(0, -1px, 0) scale(1.06)' : 'translate3d(0, 0, 0) scale(1)',
                          transition: 'transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.18s ease',
                        }
                      : {
                          color: iconColor,
                          transform: active ? 'translate3d(0, -1.5px, 0) scale(1.12)' : 'translate3d(0, 0, 0) scale(1)',
                          transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.18s ease',
                        }
                  }
                >
                  {isMaterial && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        backgroundColor: 'var(--md-sys-color-primary-container)',
                        opacity: active ? 1 : 0,
                        transform: active ? 'scaleX(1)' : 'scaleX(0.55)',
                        transition: 'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s ease',
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">
                  {tab.id === 'dial' && (
                    <Clock
                      size={18}
                      strokeWidth={active ? 2.25 : 1.85}
                    />
                  )}
                  {tab.id === 'dashboard' && (
                    <BarChart3
                      size={18}
                      strokeWidth={active ? 2.25 : 1.85}
                    />
                  )}
                  {tab.id === 'zerotube' && (
                    <Play
                      size={18}
                      strokeWidth={active ? 2.25 : 1.85}
                      fill={active ? 'currentColor' : 'none'}
                    />
                  )}
                  {tab.id === 'schedules' && (
                    <Settings
                      size={18}
                      strokeWidth={active ? 2.25 : 1.85}
                    />
                  )}
                  {tab.id === 'support' && (
                    <Heart
                      size={18}
                      strokeWidth={active ? 2.25 : 1.85}
                      fill={active ? 'currentColor' : 'none'}
                    />
                  )}
                  </span>
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight whitespace-nowrap font-sans transition-opacity duration-150 ${
                    isMaterial
                      ? active
                        ? 'font-bold opacity-100'
                        : 'font-medium opacity-85'
                      : active
                      ? 'font-bold text-white opacity-100'
                      : 'font-semibold text-zinc-300 opacity-85'
                  }`}
                  style={labelColor ? { color: labelColor } : undefined}
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
