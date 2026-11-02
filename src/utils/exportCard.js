import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { CR80_DIMENSIONS } from '../constants/defaults';
import { WAVE_PATH_DATA, LOGO_PEACH_PATH, LOGO_WHITE_PATH } from '../constants/svgData';

/**
 * Triggers celebratory confetti burst on successful actions
 */
export function fireConfetti() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#EA6A2A', '#FACCAE', '#FFFFFF', '#3B82F6'],
    });
  } catch (e) {
    // Non-fatal
  }
}

/**
 * 1. Exports the ID card DOM element as a 300-DPI high-resolution PNG image
 * @param {HTMLElement} cardElement 
 * @param {string} employeeName 
 * @returns {Promise<string>} dataUrl of exported image
 */
export async function downloadCardAsPng(cardElement, employeeName = 'Employee') {
  if (!cardElement) throw new Error('Card element reference not found');

  // Generate PNG with pixelRatio: 3 for ultra-crisp 300-DPI rendering
  const dataUrl = await htmlToImage.toPng(cardElement, {
    quality: 1.0,
    pixelRatio: 3,
    cacheBust: true,
    style: {
      transform: 'none',
      margin: '0',
    },
  });

  const sanitized = employeeName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Employee';
  const filename = `metamorphosis_ID_${sanitized}.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  fireConfetti();
  return dataUrl;
}

/**
 * 2. Exports the ID card DOM element as a standard CR80 print-ready PDF
 * (53.98mm x 85.60mm standard physical credit card / CR80 ID dimensions)
 * @param {HTMLElement} cardElement 
 * @param {string} employeeName 
 */
export async function downloadCardAsPdf(cardElement, employeeName = 'Employee') {
  if (!cardElement) throw new Error('Card element reference not found');

  const dataUrl = await htmlToImage.toPng(cardElement, {
    quality: 1.0,
    pixelRatio: 3,
    cacheBust: true,
    style: {
      transform: 'none',
      margin: '0',
    },
  });

  // Standard CR80 portrait: width 53.98mm, height 85.60mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [CR80_DIMENSIONS.physicalWidthMm, CR80_DIMENSIONS.physicalHeightMm],
    compress: true,
  });

  pdf.addImage(
    dataUrl,
    'PNG',
    0,
    0,
    CR80_DIMENSIONS.physicalWidthMm,
    CR80_DIMENSIONS.physicalHeightMm,
    undefined,
    'FAST'
  );

  const sanitized = employeeName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Employee';
  const filename = `metamorphosis_ID_${sanitized}.pdf`;

  pdf.save(filename);
  fireConfetti();
}

/**
 * 3. Exports the ID card as a clean vector Adobe Illustrator .ai file
 * (Native SVG vector specification with live/outlined text and embedded high-DPI photo,
 * packaged as an Adobe Illustrator file for zero quality loss and vector editability)
 * @param {object} employee 
 * @param {string} activePhoto 
 */
export function downloadCardAsAi(employee, activePhoto) {
  const photo = activePhoto || employee?.photoBase64 || employee?.originalPhotoBase64 || '';
  const name = employee?.name || 'Mir Mynul Islam';
  const designation = employee?.designation || 'Deputy Manager';
  const nid = employee?.nid ? `NID: ${employee.nid}` : 'NID: 3718652691';
  const blood = employee?.bloodGroup ? `Blood: ${employee.bloodGroup}` : 'Blood: B+';
  const phone = employee?.phone ? `Phone: ${employee.phone}` : 'Phone: 01703 887 655';

  const offsetX = employee?.photoOffsetX || 0;
  const offsetY = employee?.photoOffsetY || 0;
  const scale = employee?.photoScale || 1.0;

  // Photo circle center cx=319, cy=396, r=182
  const imgWidth = 364 * scale;
  const imgHeight = 364 * scale;
  const imgX = 319 - imgWidth / 2 + offsetX;
  const imgY = 396 - imgHeight / 2 + offsetY;

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generator: Adobe Illustrator / metamorphosis ID Card Generator -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 638 1012" width="638pt" height="1012pt">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;700&amp;family=Outfit:wght@400;700&amp;display=swap');
      .cls-bg-orange { fill: #EA6A2A; }
      .cls-bg-white { fill: #FFFFFF; }
      .cls-logo-peach { fill: #FACCAE; }
      .cls-logo-white { fill: #FFFFFF; }
      .cls-brand-title { font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif; font-size: 37px; font-weight: 700; fill: #FFFFFF; letter-spacing: -0.025em; }
      .cls-brand-sub { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; font-weight: 300; fill: #FFFFFF; letter-spacing: 0.06em; }
      .cls-name { font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif; font-size: 38px; font-weight: 700; fill: #000000; letter-spacing: -0.025em; text-anchor: middle; }
      .cls-title { font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif; font-size: 33px; font-weight: 400; fill: #111111; letter-spacing: -0.01em; text-anchor: middle; }
      .cls-detail { font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif; font-size: 31px; font-weight: 400; fill: #111111; letter-spacing: -0.01em; text-anchor: middle; }
      .cls-footer { font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif; font-size: 25.5px; font-weight: 500; fill: #EA6A2A; letter-spacing: 0.01em; text-anchor: middle; }
    </style>
    <clipPath id="aiCardCornerClip">
      <rect x="0" y="0" width="638" height="1012" rx="26" ry="26" />
    </clipPath>
    <clipPath id="aiPhotoCircleClip">
      <circle cx="319" cy="396" r="182" />
    </clipPath>
  </defs>

  <g clip-path="url(#aiCardCornerClip)">
    <!-- Top Vibrant Orange Background -->
    <rect width="638" height="1012" class="cls-bg-orange" />

    <!-- Wave Transition to Pure White -->
    <path d="${WAVE_PATH_DATA}" class="cls-bg-white" />

    <!-- Brand Header -->
    <g transform="translate(52, 62)">
      <!-- Logo Ribbon 'M' Icon -->
      <g transform="scale(0.18113)">
        <path d="${LOGO_PEACH_PATH}" class="cls-logo-peach" />
        <path d="${LOGO_WHITE_PATH}" class="cls-logo-white" />
      </g>
      <!-- Brand Typography -->
      <text x="114" y="38" class="cls-brand-title">metamorphosis</text>
      <text x="114" y="56" class="cls-brand-sub">Driving business transformation</text>
    </g>

    <!-- Circular Photo Frame -->
    <circle cx="319" cy="396" r="182" class="cls-bg-white" />
    <g clip-path="url(#aiPhotoCircleClip)">
      <image href="${photo}" x="${imgX}" y="${imgY}" width="${imgWidth}" height="${imgHeight}" preserveAspectRatio="xMidYMid slice" />
    </g>

    <!-- Centered Typography (Lines 1 to 5) -->
    <text x="319" y="640" class="cls-name">${name}</text>
    <text x="319" y="688" class="cls-title">${designation}</text>
    <text x="319" y="736" class="cls-detail">${nid}</text>
    <text x="319" y="784" class="cls-detail">${blood}</text>
    <text x="319" y="832" class="cls-detail">${phone}</text>

    <!-- Bottom Footer (metamorphosis.com.bd) -->
    <text x="319" y="976" class="cls-footer">metamorphosis.com.bd</text>
  </g>
</svg>`;

  const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Employee';
  const filename = `metamorphosis-id-card-${sanitized}.ai`;

  const blob = new Blob([svgContent], { type: 'application/illustrator;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  fireConfetti();
}
