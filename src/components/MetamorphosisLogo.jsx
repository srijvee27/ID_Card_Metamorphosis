import React from 'react';
import { LOGO_PEACH_PATH, LOGO_WHITE_PATH } from '../constants/svgData';

/**
 * Pixel-perfect SVG Brand Header for Metamorphosis
 * Consists of:
 * 1. Abstract 'M' ribbon logo (pure white left loop + soft peach-orange right loop)
 * 2. "metamorphosis" lowercase geometric branding
 * 3. "Driving business transformation" tagline
 */
export default function MetamorphosisLogo({
  className = '',
  iconOnly = false,
  iconSize = 'w-[96px] h-[60px]',
  textSize = 'text-[36px]',
  taglineSize = 'text-[14px]',
}) {
  const LogoIcon = (
    <div className={`relative flex-shrink-0 ${iconSize}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 530 330"
        className="w-full h-full drop-shadow-sm select-none"
        aria-label="metamorphosis logo"
      >
        {/* Soft Peach-Orange Right Arch Loop (#FACCAE) */}
        <path d={LOGO_PEACH_PATH} fill="#FACCAE" />
        {/* Pure White Left Wishbone Loop (#FFFFFF) */}
        <path d={LOGO_WHITE_PATH} fill="#FFFFFF" />
      </svg>
    </div>
  );

  if (iconOnly) {
    return LogoIcon;
  }

  return (
    <div className={`flex items-center gap-[18px] select-none ${className}`}>
      {LogoIcon}

      <div className="flex flex-col justify-center leading-none text-white">
        {/* Brand Name: metamorphosis */}
        <span
          className={`font-['Outfit',_'Plus_Jakarta_Sans',_sans-serif] font-bold tracking-tight lowercase ${textSize} leading-[1.05]`}
          style={{ letterSpacing: '-0.02em' }}
        >
          metamorphosis
        </span>

        {/* Sub-tagline: Driving business transformation */}
        <span
          className={`font-['Plus_Jakarta_Sans',_sans-serif] font-light text-white/95 tracking-[0.06em] mt-[6px] ${taglineSize}`}
        >
          Driving business transformation
        </span>
      </div>
    </div>
  );
}
