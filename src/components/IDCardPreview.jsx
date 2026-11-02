import React, { forwardRef } from 'react';
import WaveBackground from './WaveBackground';
import MetamorphosisLogo from './MetamorphosisLogo';

/**
 * Pixel-Perfect CR80 Portrait Employee ID Card (638px x 1012px)
 * Matches template/id card template.png 100% in:
 * - Canvas ratio & dimensions (638x1012)
 * - Custom SVG wave background (#EA6A2A top to #FFFFFF bottom)
 * - Metamorphosis vector logo & typography
 * - Circular photo frame with interactive scale & offset
 * - 5 lines of centered typography + orange footer
 */
const IDCardPreview = forwardRef(function IDCardPreview(
  {
    employee,
    scale = 1,
    showCardBorder = true,
  },
  ref
) {
  const activePhoto =
    employee.useAiPhoto && employee.photoBase64
      ? employee.photoBase64
      : employee.originalPhotoBase64 || employee.photoBase64;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        width: `${638 * scale}px`,
        height: `${1012 * scale}px`,
      }}
    >
      {/* Actual 638x1012 Canvas DOM Element used for display and 300-DPI html-to-image export */}
      <div
        ref={ref}
        id="metamorphosis-id-card-canvas"
        className={`relative w-[638px] h-[1012px] bg-white rounded-[26px] overflow-hidden ${
          showCardBorder ? 'shadow-2xl' : ''
        }`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* Layer 1: Pixel-Perfect SVG Asymmetrical Cloud Wave Background */}
        <WaveBackground />

        {/* Layer 2: Company Header Branding (Top-Left) */}
        <div className="absolute top-[62px] left-[52px] z-10">
          <MetamorphosisLogo
            iconSize="w-[96px] h-[60px]"
            textSize="text-[37px]"
            taglineSize="text-[13.5px]"
          />
        </div>

        {/* Layer 3: Central Circular Employee Photo Frame */}
        {/* Positioned inside the white central arch contour */}
        <div className="absolute top-[214px] left-[137px] w-[364px] h-[364px] z-20">
          <div className="relative w-full h-full rounded-full bg-white overflow-hidden shadow-sm">
            {activePhoto ? (
              <img
                src={activePhoto}
                alt={employee.name || 'Employee Photo'}
                className="w-full h-full object-cover transition-transform duration-75 ease-out select-none"
                style={{
                  transform: `translate(${employee.photoOffsetX || 0}px, ${
                    employee.photoOffsetY || 0
                  }px) scale(${employee.photoScale || 1.0})`,
                  transformOrigin: 'center center',
                }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                <span className="text-4xl font-light">Photo</span>
              </div>
            )}
          </div>
        </div>

        {/* Layer 4: Centered Dynamic Text Fields (Bottom White Section) */}
        <div className="absolute top-[604px] left-0 right-0 flex flex-col items-center text-center z-20 px-6 font-['Plus_Jakarta_Sans',_'Outfit',_sans-serif]">
          {/* Line 1: Employee Name (Bold 700, Black #000000) */}
          <h1
            className="text-[38px] font-bold text-black tracking-tight leading-[1.1] max-w-[560px] truncate"
            style={{ letterSpacing: '-0.025em' }}
          >
            {employee.name || 'Mir Mynul Islam'}
          </h1>

          {/* Line 2: Designation / Post (Regular 400, #111111) */}
          <p
            className="text-[33px] font-normal text-[#111111] mt-[12px] leading-[1.15] max-w-[560px] truncate"
            style={{ letterSpacing: '-0.01em' }}
          >
            {employee.designation || 'Deputy Manager'}
          </p>

          {/* Line 3: NID Number (Regular 400, #111111, Prefixed with 'NID: ') */}
          <p
            className="text-[31px] font-normal text-[#111111] mt-[15px] leading-[1.15] max-w-[560px] truncate"
            style={{ letterSpacing: '-0.01em' }}
          >
            {employee.nid ? `NID: ${employee.nid}` : 'NID: 3718652691'}
          </p>

          {/* Line 4: Blood Group (Regular 400, #111111, Prefixed with 'Blood: ') */}
          <p
            className="text-[31px] font-normal text-[#111111] mt-[15px] leading-[1.15]"
            style={{ letterSpacing: '-0.01em' }}
          >
            {employee.bloodGroup ? `Blood: ${employee.bloodGroup}` : 'Blood: B+'}
          </p>

          {/* Line 5: Phone Number (Regular 400, #111111, Prefixed with 'Phone: ') */}
          <p
            className="text-[31px] font-normal text-[#111111] mt-[15px] leading-[1.15] max-w-[560px] truncate"
            style={{ letterSpacing: '-0.01em' }}
          >
            {employee.phone ? `Phone: ${employee.phone}` : 'Phone: 01703 887 655'}
          </p>
        </div>

        {/* Layer 5: Footer (Bottom Center - Vibrant Orange #EA6A2A) */}
        <div className="absolute bottom-[44px] left-0 right-0 text-center z-20">
          <p
            className="font-['Plus_Jakarta_Sans',_'Outfit',_sans-serif] text-[25.5px] font-medium text-[#EA6A2A] tracking-normal select-none"
            style={{ letterSpacing: '0.01em' }}
          >
            metamorphosis.com.bd
          </p>
        </div>
      </div>
    </div>
  );
});

export default IDCardPreview;
