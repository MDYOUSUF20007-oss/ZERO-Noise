import React, { type CSSProperties } from 'react';
import type { ObsidianCardProps } from './ObsidianCard';
import { useInterfaceStyle } from '../context/interfaceStyleStore';

export type GlassCardProps = ObsidianCardProps;

/**
 * Adaptive Surface Card:
 * - Fluent Glass: Frosted acrylic glass with subtle specular highlight
 * - Material Dusk: Material 3 tonal filled container (no specular glare)
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  headerContent,
  footerContent,
  overlays,
  ambientGlow: _ambientGlow = false,
  fullWidth = true,
  staggerIndex,
  className = '',
  headerClassName,
  footerClassName,
  style,
  onClick,
  onSubmit,
  asButton = false,
  disabled = false,
  title,
  'aria-label': ariaLabel,
  'data-amoled-banner': dataAmoledBanner,
  'data-restricted-guide': dataRestrictedGuide,
}) => {
  const { isMaterial } = useInterfaceStyle();
  const resolvedHeaderClass = headerClassName ?? 'p-4 sm:p-5';
  const resolvedFooterClass = footerClassName ?? 'px-4 sm:px-5 py-3';
  const widthClass = fullWidth ? 'w-full' : '';

  const interactiveClasses =
    onClick && !disabled
      ? 'cursor-pointer liquid-spring zn-hover-float hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]'
      : '';

  const staggerClass = typeof staggerIndex === 'number' ? 'zn-stagger-item' : '';

  const sharedClassName = `relative flex flex-col justify-between ${widthClass} ${
    isMaterial ? 'rounded-[20px]' : 'rounded-[22px]'
  } overflow-hidden liquid-glass font-sans ${staggerClass} ${interactiveClasses} ${className}`;

  // Strip opaque classic/bespoke style overrides so active theme surface styling stays clean
  const cleanedStyle: CSSProperties | undefined = style
    ? (() => {
        const {
          background: _bg,
          backgroundColor: _bgc,
          border: _b,
          borderColor: _bc,
          boxShadow: _bs,
          ...rest
        } = style;
        return rest;
      })()
    : undefined;

  const passthroughStyle: CSSProperties | undefined =
    typeof staggerIndex === 'number'
      ? {
          ...cleanedStyle,
          '--zn-stagger-idx': staggerIndex,
        } as CSSProperties
      : cleanedStyle;

  const innerMarkup = (
    <>
      {/* Top Specular Optical Highlight Rim (Fluent Glass only) */}
      {!isMaterial && (
        <>
          <div
            aria-hidden="true"
            className="absolute top-0 left-4 right-4 h-[1px] pointer-events-none z-20"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 18%, rgba(255,255,255,0.78) 50%, rgba(255,255,255,0.28) 82%, transparent 100%)',
              opacity: 'var(--glass-specular-opacity, 0.525)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-10 rounded-[inherit]"
            style={{
              background:
                'radial-gradient(120% 60% at 14% 0%, rgba(255,255,255,0.06) 0%, transparent 55%)',
            }}
          />
        </>
      )}

      {overlays}

      {/* Tier 1: Primary Content */}
      <div className={`relative z-10 ${resolvedHeaderClass}`}>{headerContent}</div>

      {/* Tier 2: Footer Strip */}
      {footerContent && (
        <div
          className="relative z-10 shrink-0 border-t"
          style={{
            borderColor: isMaterial ? 'var(--md-sys-color-outline-variant)' : 'rgba(255,255,255,0.08)',
            backgroundColor: isMaterial
              ? 'var(--md-sys-color-surface-container)'
              : 'var(--glass-row-bg, rgba(0, 0, 0, 0.35))',
          }}
        >
          <div className={resolvedFooterClass}>{footerContent}</div>
        </div>
      )}
    </>
  );

  if (onSubmit) {
    return (
      <form
        onSubmit={onSubmit}
        onClick={onClick}
        title={title}
        aria-label={ariaLabel}
        data-obsidian-card="true"
        data-liquid-card="true"
        data-amoled-banner={dataAmoledBanner}
        data-restricted-guide={dataRestrictedGuide}
        className={sharedClassName}
        style={passthroughStyle}
      >
        {innerMarkup}
      </form>
    );
  }

  if (asButton && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-label={ariaLabel}
        data-obsidian-card="true"
        data-liquid-card="true"
        data-amoled-banner={dataAmoledBanner}
        data-restricted-guide={dataRestrictedGuide}
        className={`items-stretch text-left ${sharedClassName}`}
        style={passthroughStyle}
      >
        {innerMarkup}
      </button>
    );
  }

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onKeyDown={
        onClick && !disabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      title={title}
      aria-label={ariaLabel}
      data-obsidian-card="true"
      data-liquid-card="true"
      data-amoled-banner={dataAmoledBanner}
      data-restricted-guide={dataRestrictedGuide}
      className={sharedClassName}
      style={passthroughStyle}
    >
      {innerMarkup}
    </div>
  );
};
