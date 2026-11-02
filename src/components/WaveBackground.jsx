import React from 'react';
import { WAVE_PATH_DATA } from '../constants/svgData';

/**
 * Pixel-perfect SVG background separating the Vibrant Orange header (#EA6A2A)
 * and Pure White (#FFFFFF) body via custom smooth asymmetrical cloud-waves
 * rising to form the central arch around the photo frame.
 */
export default function WaveBackground({ className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 638 1012"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Top Vibrant Orange Background */}
      <rect width="638" height="1012" fill="#EA6A2A" />

      {/* Custom Asymmetrical Cloud Wave Transition to Pure White */}
      <path d={WAVE_PATH_DATA} fill="#FFFFFF" />
    </svg>
  );
}
