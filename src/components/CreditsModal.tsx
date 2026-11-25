import { useState, useEffect } from 'react';
import type { GithubContributor } from '../types';
import { useInterfaceStyle } from '../context/InterfaceStyleContext';
import { ObsidianCard } from './ObsidianCard';
import { haptics } from '../utils/haptics';
import { X, ExternalLink, Heart, Award, Code, Users } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY_CONTRIBUTORS = 'zero_cached_contributors_v1';

const FALLBACK_CONTRIBUTORS: GithubContributor[] = [
  {
    login: 'MDYOUSUF20007-oss',
    avatar_url: 'https://github.com/MDYOUSUF20007-oss.png',
    html_url: 'https://github.com/MDYOUSUF20007-oss',
    contributions: 180,
    role: 'Creator & Lead Architect',
  },
];

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  const [contributors, setContributors] = useState<GithubContributor[]>(() => {
    if (typeof localStorage === 'undefined') return FALLBACK_CONTRIBUTORS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTRIBUTORS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return FALLBACK_CONTRIBUTORS;
  });
  const [loading, setLoading] = useState(false);
  const { isAero, isBespoke, isFluentGlass } = useInterfaceStyle();
  const isModernFont = isBespoke || isFluentGlass;

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchContributors = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://api.github.com/repos/MDYOUSUF20007-oss/ZERO/contributors', {
          headers: { Accept: 'application/vnd.github.v3+json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            const mapped: GithubContributor[] = data.map((item: any) => ({
              login: item.login,
              avatar_url: item.avatar_url,
              html_url: item.html_url,
              contributions: item.contributions || 1,
              role: item.login === 'MDYOUSUF20007-oss' ? 'Creator & Lead Architect' : 'Open Source Contributor',
            }));
            setContributors(mapped);
            localStorage.setItem(STORAGE_KEY_CONTRIBUTORS, JSON.stringify(mapped));
          }
        }
      } catch {
        // Fallback is already loaded
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchContributors();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 ${
          isAero
            ? 'bg-slate-900/40 backdrop-blur-md'
            : isFluentGlass
            ? 'bg-black/75 backdrop-blur-md'
            : 'bg-black/80 backdrop-blur-sm'
        }`}
        onClick={onClose}
      />

      <div className="relative max-w-lg w-full max-h-[85vh] flex flex-col">
        <ObsidianCard
          ambientGlow
          className={`rounded-[26px] shadow-2xl max-h-[85vh] ${isModernFont ? 'font-sans' : 'font-mono'}`}
          headerClassName="p-5 sm:p-6 overflow-y-auto space-y-5"
          headerContent={
            <>
              {/* Header */}
              <div
                className="flex items-center justify-between pb-3"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2 rounded-2xl"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      border: '1px solid var(--accent-border)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    <Award size={20} />
                  </div>
                  <div>
                    <h2
                      className="text-lg font-bold tracking-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Credits &amp; Contributors
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      The minds behind Zero-Noise
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    haptics.tick(900);
                    onClose();
                  }}
                  className="w-8 h-8 rounded-full liquid-pill-inactive liquid-spring flex items-center justify-center cursor-pointer"
                  aria-label="Close credits"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Lead Developer Spotlight Card */}
              <div
                className="liquid-inset p-4 space-y-3 shadow-[0_0_18px_var(--liquid-accent-soft-glow)]"
                style={{ borderColor: 'var(--accent-border)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="liquid-pill-active text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5">
                    Lead Developer &amp; Architect
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    v1.0 FOSS
                  </span>
                </div>

                <div className="flex items-center gap-3.5 pt-1">
                  <img
                    src="https://github.com/MDYOUSUF20007-oss.png"
                    alt="Mohammed Yusuf"
                    className="w-14 h-14 rounded-full shadow-md object-cover shrink-0"
                    style={{
                      border: '2px solid var(--accent-primary)',
                      backgroundColor: 'var(--bg-input)',
                    }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      Mohammed Yusuf
                    </h3>
                    <p className="text-xs font-mono" style={{ color: 'var(--accent-primary)' }}>
                      @MDYOUSUF20007-oss
                    </p>
                    <p
                      className="text-xs mt-1 leading-snug"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Designed &amp; developed Zero as an uncompromising, offline-first digital detox tool with zero ads and zero subscriptions.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 pt-2.5"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <a
                    href="https://github.com/MDYOUSUF20007-oss"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 liquid-pill-inactive liquid-spring text-xs font-mono flex items-center justify-center gap-1.5"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Code size={13} /> GitHub Profile
                  </a>
                  <a
                    href="https://ko-fi.com/mdyousuf2620"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-full text-xs font-mono font-bold flex items-center justify-center gap-1.5 liquid-spring"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--text-on-accent)',
                      boxShadow: '0 4px 14px -2px var(--liquid-accent-soft-glow)',
                    }}
                  >
                    <Heart size={13} /> Ko-fi Tip
                  </a>
                </div>
              </div>

              {/* Contributors Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className="font-mono uppercase tracking-wider flex items-center gap-1.5 font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Users size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span>Open-Source Contributors</span>
                  </span>
                  {loading && (
                    <span
                      className="font-mono text-[10px] animate-pulse"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      Syncing...
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {contributors.map((c) => (
                    <a
                      key={c.login}
                      href={c.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="liquid-row liquid-spring p-3 flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={c.avatar_url}
                          alt={c.login}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                          style={{
                            border: '1px solid var(--border-strong)',
                            backgroundColor: 'var(--bg-input)',
                          }}
                        />
                        <div className="min-w-0">
                          <div
                            className="font-bold flex items-center gap-1.5 truncate"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <span>{c.login}</span>
                            <ExternalLink size={11} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                            {c.role || 'Contributor'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="liquid-pill-inactive font-mono text-[10px] px-2.5 py-0.5 font-semibold">
                          {c.contributions} {c.contributions === 1 ? 'commit' : 'commits'}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* FOSS Philosophy Guarantee */}
              <div
                className="liquid-row p-3.5 text-xs space-y-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                <div
                  className="font-semibold flex items-center gap-1.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Code size={13} style={{ color: 'var(--accent-primary)' }} />
                  <span>Free &amp; Open-Source</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Zero is licensed under permissive open-source principles. Pull requests, translations, and architectural improvements from the global community are warmly welcomed.
                </p>
              </div>
            </>
          }
        />
      </div>
    </div>
  );
}
