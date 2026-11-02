import { removeBackground } from '@imgly/background-removal';

/**
 * Convert a File or Blob to a Base64 data URI string with optional max dimension resize
 * @param {File|Blob} file 
 * @param {number} maxDimension 
 * @returns {Promise<string>}
 */
export function fileToBase64(file, maxDimension = 1200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Real AI Human Subject Segmentation & Solid Pure White (#FFFFFF) Studio Background Pipeline.
 * 
 * 1. Segments the human subject using @imgly/background-removal into a clean transparent PNG cutout.
 * 2. Draws the transparent cutout onto an offscreen canvas pre-filled with solid flat studio white (#FFFFFF).
 * 3. Keeps clothing, white shirts, tie, skin tone, hair, and face 100% unaltered with crisp edges.
 * 
 * @param {string|Blob|File} imageSource - Base64 DataURL or File/Blob of the employee photo
 * @param {function} onProgress - Optional status/progress callback
 * @returns {Promise<string>} Solid pure white background photo as base64 PNG data URL
 */
export async function processAiWhiteBackground(imageSource, onProgress) {
  try {
    if (onProgress) {
      onProgress('Initializing AI neural segmentation model...');
    }

    // Step 1: Run client-side AI segmentation
    const cutoutBlob = await removeBackground(imageSource, {
      progress: (key, current, total) => {
        if (onProgress) {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            onProgress(`Segmenting subject (${pct}%)...`);
          } else {
            onProgress('Segmenting human subject & edge matting...');
          }
        }
      },
      output: {
        format: 'image/png',
        quality: 1.0,
      },
    });

    if (onProgress) {
      onProgress('Applying pure studio white (#FFFFFF) background...');
    }

    // Step 2: Load the transparent cutout into an Image element
    const cutoutUrl = URL.createObjectURL(cutoutBlob);
    const cutoutImage = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error('Failed to load cutout blob image'));
      img.src = cutoutUrl;
    });

    // Step 3: Draw onto offscreen canvas pre-filled with solid #FFFFFF
    const width = cutoutImage.naturalWidth || cutoutImage.width || 800;
    const height = cutoutImage.naturalHeight || cutoutImage.height || 800;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fill entire background with pure flat studio white (#FFFFFF)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Draw the 100% unaltered subject (shirt, hair, face, tie) directly on top
    ctx.drawImage(cutoutImage, 0, 0, width, height);

    // Revoke blob URL to release browser memory
    URL.revokeObjectURL(cutoutUrl);

    // Step 4: Export resulting high-resolution composite as PNG data URL
    const whiteStudioPhotoBase64 = canvas.toDataURL('image/png');

    if (onProgress) {
      onProgress('Pure studio white background complete!');
    }

    return whiteStudioPhotoBase64;
  } catch (err) {
    console.error('[AI Background Removal Error]:', err);
    throw err;
  }
}
