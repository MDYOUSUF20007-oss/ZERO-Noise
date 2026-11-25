import React, { useState } from 'react';
import {
  Dumbbell,
  X,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Play,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  type ActionReminderConfig,
  type ActionReminderItem,
  saveActionReminderConfig,
  triggerActionReminder,
} from '../utils/actionReminders';
import { useInterfaceStyle } from '../context/InterfaceStyleContext';
import { ObsidianCard } from './ObsidianCard';
import { haptics } from '../utils/haptics';

export interface ActionReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ActionReminderConfig;
  onConfigChange: (updated: ActionReminderConfig) => void;
}

export const ActionReminderModal: React.FC<ActionReminderModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [newReminderText, setNewReminderText] = useState('');
  const { isAero, isBespoke, isFluentGlass } = useInterfaceStyle();
  const isModernFont = isBespoke || isFluentGlass;

  if (!isOpen) return null;

  const handleToggleEnabled = () => {
    haptics.tick(600);
    const updated = { ...config, enabled: !config.enabled };
    onConfigChange(updated);
    saveActionReminderConfig(updated);
  };

  const handleToggleVoice = () => {
    haptics.tick(600);
    const updated = { ...config, voiceEnabled: !config.voiceEnabled };
    onConfigChange(updated);
    saveActionReminderConfig(updated);
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newReminderText.trim();
    if (!text) return;
    haptics.tick(700);

    const newItem: ActionReminderItem = {
      id: `item-${Date.now()}`,
      text,
      enabled: true,
    };
    const updated = {
      ...config,
      items: [newItem, ...config.items],
    };
    onConfigChange(updated);
    saveActionReminderConfig(updated);
    setNewReminderText('');
  };

  const handleToggleItem = (id: string) => {
    haptics.tick(400);
    const updated = {
      ...config,
      items: config.items.map((it) => (it.id === id ? { ...it, enabled: !it.enabled } : it)),
    };
    onConfigChange(updated);
    saveActionReminderConfig(updated);
  };

  const handleDeleteItem = (id: string) => {
    haptics.tick(400);
    const updated = {
      ...config,
      items: config.items.filter((it) => it.id !== id),
    };
    onConfigChange(updated);
    saveActionReminderConfig(updated);
  };

  const handleTriggerNudge = (itemText?: string) => {
    haptics.thud();
    triggerActionReminder(itemText, config);
  };

  const formatIntervalLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes % 60 === 0) return `${minutes / 60}h`;
    return `${(minutes / 60).toFixed(1)}h`;
  };

  const formatTime12h = (time24: string) => {
    const [h, m] = time24.split(':').map(Number);
    const period = (h || 0) >= 12 ? 'PM' : 'AM';
    const hours12 = (h || 0) % 12 || 12;
    return `${hours12}:${(m || 0).toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Action & Movement Reminders"
      className={`fixed inset-0 z-[10020] flex items-center justify-center p-4 animate-fadeIn ${
        isAero
          ? 'bg-slate-900/40 backdrop-blur-md'
          : isFluentGlass
          ? 'bg-black/75 backdrop-blur-md'
          : 'bg-black/85 backdrop-blur-xl'
      }`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <ObsidianCard
          ambientGlow
          className={`w-full max-h-[88vh] rounded-[28px] shadow-2xl select-none ${
            isModernFont ? 'font-sans' : 'font-mono'
          }`}
          headerClassName="p-5 flex-1 min-h-0 flex flex-col space-y-4 overflow-y-auto"
          footerClassName="p-4 flex items-center gap-2"
          headerContent={
            <>
              {/* Top Header */}
              <div
                className="flex items-center justify-between pb-3"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      border: '1px solid var(--accent-border)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    <Dumbbell size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold tracking-wide"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Movement Reminders
                    </h3>
                    <p
                      className="text-[11px] font-mono"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      No tick marks • No guilt • Just the next move
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full liquid-pill-inactive liquid-spring flex items-center justify-center cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Status / Quick Settings Bar */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* Master Toggle */}
                <button
                  type="button"
                  onClick={handleToggleEnabled}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-2 cursor-pointer liquid-spring ${
                    config.enabled
                      ? 'liquid-inset shadow-[0_0_16px_var(--liquid-accent-soft-glow)]'
                      : 'liquid-row opacity-80'
                  }`}
                  style={
                    config.enabled
                      ? { borderColor: 'var(--accent-border)' }
                      : undefined
                  }
                >
                  <span
                    className="font-semibold text-left truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Status
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase shrink-0 ${
                      config.enabled ? 'liquid-pill-active' : 'liquid-pill-inactive'
                    }`}
                  >
                    {config.enabled ? 'Active' : 'Off'}
                  </span>
                </button>

                {/* Voice Toggle */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-2 cursor-pointer liquid-spring ${
                    config.voiceEnabled
                      ? 'liquid-inset shadow-[0_0_16px_var(--liquid-accent-soft-glow)]'
                      : 'liquid-row opacity-80'
                  }`}
                  style={
                    config.voiceEnabled
                      ? { borderColor: 'var(--accent-border)' }
                      : undefined
                  }
                >
                  <span
                    className="font-semibold flex items-center gap-1.5 truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {config.voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                    <span>Voice</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase shrink-0 ${
                      config.voiceEnabled ? 'liquid-pill-active' : 'liquid-pill-inactive'
                    }`}
                  >
                    {config.voiceEnabled ? 'On' : 'Silent'}
                  </span>
                </button>
              </div>

              {/* Schedule Summary Banner */}
              <div className="liquid-inset p-3 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span>
                    {formatTime12h(config.startTime)} &ndash; {formatTime12h(config.endTime)}
                  </span>
                </div>
                <span className="liquid-pill-inactive px-2.5 py-0.5 text-[10px] font-bold">
                  Every {formatIntervalLabel(config.intervalMinutes)}
                </span>
              </div>

              {/* Add Custom Reminder Form */}
              <form onSubmit={handleAddReminder} className="flex gap-2">
                <input
                  type="text"
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                  placeholder="e.g. Do 10 pushups, Drink water..."
                  className="flex-1 obsidian-input rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newReminderText.trim()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 liquid-spring cursor-pointer shrink-0 disabled:opacity-40"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-on-accent)',
                    boxShadow: '0 4px 14px -2px var(--liquid-accent-soft-glow)',
                  }}
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </form>

              {/* Active Reminders List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {config.items.length === 0 ? (
                  <div
                    className="liquid-row p-4 text-center text-xs font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No reminders added. Tap Add above to create one.
                  </div>
                ) : (
                  config.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 flex items-center justify-between gap-2 text-xs transition-all ${
                        item.enabled
                          ? 'liquid-inset'
                          : 'liquid-row opacity-55 line-through'
                      }`}
                      style={
                        item.enabled
                          ? { borderColor: 'var(--accent-border)' }
                          : undefined
                      }
                    >
                      <div
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleToggleItem(item.id)}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: item.enabled
                              ? 'var(--accent-primary)'
                              : 'var(--text-muted)',
                            boxShadow: item.enabled
                              ? '0 0 8px var(--liquid-accent-glow)'
                              : undefined,
                          }}
                        />
                        <span
                          className="truncate font-sans font-medium"
                          style={{
                            color: item.enabled ? 'var(--text-primary)' : 'var(--text-muted)',
                          }}
                        >
                          {item.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTriggerNudge(item.text)}
                          title="Nudge Now"
                          className="p-1.5 rounded-full liquid-pill-inactive liquid-spring cursor-pointer"
                        >
                          <Play size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete"
                          className="p-1.5 rounded-full liquid-pill-inactive liquid-spring hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Zero-Guilt Manifesto Note */}
              <div
                className="liquid-inset p-3 text-[11px] font-mono space-y-1"
                style={{
                  borderColor: 'var(--accent-border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <div
                  className="flex items-center gap-1.5 font-bold"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <Sparkles size={12} />
                  <span>Zero-Guilt Philosophy</span>
                </div>
                <p className="leading-relaxed">
                  No checklists or streak tracking. When it pops up, you can do it or dismiss it. No guilt, no history logs &mdash; just the next move.
                </p>
              </div>
            </>
          }
          footerContent={
            <>
              <button
                type="button"
                onClick={() => handleTriggerNudge()}
                className="flex-1 py-2.5 px-3 liquid-pill-inactive liquid-spring text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                <Play size={13} style={{ color: 'var(--accent-primary)' }} />
                <span>Nudge Me Now</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 rounded-full text-xs font-bold flex items-center justify-center liquid-spring cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-on-accent)',
                  boxShadow:
                    '0 6px 18px -4px var(--liquid-accent-glow), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                }}
              >
                Got it
              </button>
            </>
          }
        />
      </div>
    </div>
  );
};
