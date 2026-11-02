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
 * Helper to escape special XML characters
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 2. Exports the ID card DOM element as a standard CR80 print-ready PDF
 * (53.98mm x 85.60mm standard physical credit card / CR80 ID dimensions at 300+ DPI)
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

  pdf.setProperties({
    title: `metamorphosis ID Card - ${employeeName}`,
    subject: 'CR80 Standard Print-Ready ID Card',
    author: 'metamorphosis',
    creator: 'metamorphosis ID Card Generator',
  });

  pdf.addImage(
    dataUrl,
    'PNG',
    0,
    0,
    CR80_DIMENSIONS.physicalWidthMm,
    CR80_DIMENSIONS.physicalHeightMm,
    undefined,
    'SLOW'
  );

  const sanitized = employeeName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '') || 'employee';
  const filename = `metamorphosis-id-card-${sanitized}.pdf`;

  pdf.save(filename);
  fireConfetti();
}

/**
 * Converts SVG path definition string to jsPDF path operations array
 */
function parseSvgPath(d, scale = 1, offsetX = 0, offsetY = 0) {
  const tokens = d.trim().split(/\s+/);
  let i = 0;
  const ops = [];
  let curX = 0;
  let curY = 0;
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M') {
      curX = parseFloat(tokens[i++]);
      curY = parseFloat(tokens[i++]);
      ops.push({ op: 'm', c: [offsetX + curX * scale, offsetY + curY * scale] });
    } else if (cmd === 'L') {
      curX = parseFloat(tokens[i++]);
      curY = parseFloat(tokens[i++]);
      ops.push({ op: 'l', c: [offsetX + curX * scale, offsetY + curY * scale] });
    } else if (cmd === 'Q') {
      const qx = parseFloat(tokens[i++]);
      const qy = parseFloat(tokens[i++]);
      const x1 = parseFloat(tokens[i++]);
      const y1 = parseFloat(tokens[i++]);
      // Quadratic bezier Q(qx, qy, x1, y1) converted to Cubic bezier C(cp1, cp2, x1, y1)
      const cp1x = curX + (2 / 3) * (qx - curX);
      const cp1y = curY + (2 / 3) * (qy - curY);
      const cp2x = x1 + (2 / 3) * (qx - x1);
      const cp2y = y1 + (2 / 3) * (qy - y1);
      ops.push({
        op: 'c',
        c: [
          offsetX + cp1x * scale,
          offsetY + cp1y * scale,
          offsetX + cp2x * scale,
          offsetY + cp2y * scale,
          offsetX + x1 * scale,
          offsetY + y1 * scale,
        ],
      });
      curX = x1;
      curY = y1;
    } else if (cmd === 'Z' || cmd === 'z') {
      ops.push({ op: 'h', c: [] });
    }
  }
  return ops;
}

/**
 * Pre-renders ONLY the circular employee photo frame on a 4x ultra-high-res 600-DPI canvas
 * with exact circular clipping, white background, and pan/zoom transforms
 */
function renderCircularPhotoCanvas(photoUrl, employee) {
  return new Promise((resolve) => {
    if (!photoUrl) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 364;
        const pixelRatio = 4; // 4x ultra-high resolution (1456x1456)
        const canvas = document.createElement('canvas');
        canvas.width = size * pixelRatio;
        canvas.height = size * pixelRatio;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.scale(pixelRatio, pixelRatio);

        // Circular clip with solid #FFFFFF background
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.clip();

        // Calculate aspect ratio for object-fit: contain + object-position: center bottom
        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;
        const aspect = imgW / imgH;

        let drawW = size;
        let drawH = size;
        let baseX = 0;
        let baseY = 0;

        if (aspect <= 1) {
          // Portrait: height fills frame, width fits with white margins on sides
          drawH = size;
          drawW = size * aspect;
          baseX = (size - drawW) / 2;
          baseY = 0; // bottom aligned because drawH === size
        } else {
          // Landscape: width fills frame, height anchored to bottom
          drawW = size;
          drawH = size / aspect;
          baseX = 0;
          baseY = size - drawH; // bottom aligned
        }

        const scale = employee?.photoScale || 1.0;
        const offsetX = employee?.photoOffsetX || 0;
        const offsetY = employee?.photoOffsetY || 0;

        // Apply interactive pan and zoom around center
        ctx.translate(size / 2, size / 2);
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        ctx.translate(-size / 2, -size / 2);

        ctx.drawImage(img, baseX, baseY, drawW, drawH);
        resolve(canvas.toDataURL('image/png', 1.0));
      } catch (err) {
        console.warn('Canvas photo render error:', err);
        resolve(photoUrl);
      }
    };
    img.onerror = () => resolve(null);
    img.src = photoUrl;
  });
}

/**
 * 3. Exports the ID card as a true PDF-based native Adobe Illustrator .ai vector file
 * (Modern .ai files are PDF-1.5 streams that Illustrator opens natively as editable vector layers)
 * @param {object} employee 
 * @param {string} activePhoto 
 */
export async function downloadCardAsAi(employee, activePhoto) {
  const photo =
    activePhoto ||
    (employee?.useAiPhoto && employee?.photoBase64
      ? employee.photoBase64
      : employee?.originalPhotoBase64 || employee?.photoBase64 || '');

  const rawName = employee?.name || 'Mir Mynul Islam';
  const rawDesignation = employee?.designation || 'Deputy Manager';
  const rawNid = employee?.nid ? `NID: ${employee.nid}` : 'NID: 3718652691';
  const rawBlood = employee?.bloodGroup ? `Blood: ${employee.bloodGroup}` : 'Blood: B+';
  const rawPhone = employee?.phone ? `Phone: ${employee.phone}` : 'Phone: 01703 887 655';

  // Standard CR80 Canvas dimensions: 638 pt x 1012 pt
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [638, 1012],
    compress: true,
  });

  pdf.setProperties({
    title: `metamorphosis ID Card - ${rawName}`,
    subject: 'Adobe Illustrator Vector CR80 ID Card',
    author: 'metamorphosis',
    creator: 'Adobe Illustrator / metamorphosis ID Card Generator',
  });

  // Layer 1: Full Artboard Base & Vector Header
  // Top Vibrant Orange Background (#EA6A2A)
  pdf.setFillColor(234, 106, 42);
  pdf.rect(0, 0, 638, 1012, 'F');

  // Cloud-wave transition to pure white (#FFFFFF)
  pdf.setFillColor(255, 255, 255);
  pdf.path(parseSvgPath(WAVE_PATH_DATA));
  pdf.fill();

  // Metamorphosis Abstract Ribbon 'M' Icon (peach + white vector paths)
  pdf.setFillColor(250, 204, 174); // #FACCAE
  pdf.path(parseSvgPath(LOGO_PEACH_PATH, 0.18113, 52, 62));
  pdf.fill();

  pdf.setFillColor(255, 255, 255); // #FFFFFF
  pdf.path(parseSvgPath(LOGO_WHITE_PATH, 0.18113, 52, 62));
  pdf.fill();

  // Layer 2: Circular Employee Photo
  // White backing circle at (319, 396) with radius 182
  pdf.setFillColor(255, 255, 255);
  pdf.circle(319, 396, 182, 'F');

  if (photo) {
    const photoDataUrl = await renderCircularPhotoCanvas(photo, employee);
    if (photoDataUrl) {
      pdf.addImage(photoDataUrl, 'PNG', 137, 214, 364, 364, undefined, 'SLOW');
    }
  }

  // Layer 3: Live Editable Vector Text
  // Header Branding Typography
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(37);
  pdf.text('metamorphosis', 166, 100);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(13.5);
  pdf.text('Driving business transformation', 166, 118);

  // Line 1: Employee Name (Bold, Black #000000)
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(38);
  pdf.text(rawName, 319, 640, { align: 'center' });

  // Line 2: Designation / Post (Regular, #111111)
  pdf.setTextColor(17, 17, 17);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(33);
  pdf.text(rawDesignation, 319, 688, { align: 'center' });

  // Line 3: NID Number (Regular, #111111)
  pdf.setFontSize(31);
  pdf.text(rawNid, 319, 736, { align: 'center' });

  // Line 4: Blood Group (Regular, #111111)
  pdf.text(rawBlood, 319, 784, { align: 'center' });

  // Line 5: Phone Number (Regular, #111111)
  pdf.text(rawPhone, 319, 832, { align: 'center' });

  // Line 6: Bottom Footer (Bold, Vibrant Orange #EA6A2A)
  pdf.setTextColor(234, 106, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(25.5);
  pdf.text('metamorphosis.com.bd', 319, 976, { align: 'center' });

  const sanitized =
    rawName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '') || 'employee';
  const filename = `metamorphosis-id-card-${sanitized}.ai`;

  // Output as native PDF blob for Adobe Illustrator (.ai is PDF-stream specification)
  const pdfBlob = pdf.output('blob');
  const aiBlob = new Blob([pdfBlob], { type: 'application/pdf' });
  const url = URL.createObjectURL(aiBlob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  fireConfetti();
}

