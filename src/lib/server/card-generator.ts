import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import QRCode from 'qrcode';
import path from 'path';
import { tripleNumber } from '$lib/utils';

// Helper to resolve static asset paths correctly in Node/Vercel
function getStaticPath(relativePath: string): string {
  return path.join(process.cwd(), 'static', relativePath);
}

// Safely register font once using absolute path
try {
  GlobalFonts.registerFromPath(
    getStaticPath('HyliaSerifBeta-Regular.ttf'),
    'hylia'
  );
} catch (err) {
  // Catch potential re-registration errors in hot-reloading dev mode
  console.warn('Font registration warning:', err);
}

export async function generateKorokCardBuffer(
  id: string,
  type: number,
  number: number
): Promise<Buffer> {
  // Load images using absolute file paths
  const base = await loadImage(getStaticPath('korok_sticker_base.png'));
  const overlay = await loadImage(getStaticPath(`koroks/k_${type}.png`));
  const logo = await loadImage(getStaticPath('korok_hunt_logo.png'));

  const canvas = createCanvas(base.width, base.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(base, 0, 0);

  // Generate QR Code as a Buffer instead of passing a Canvas element
  const origin = process.env.ORIGIN || 'http://localhost:5173';
  const qrBuffer = await QRCode.toBuffer(`${origin}/find?id=${id}`, {
    width: 482,
    version: 7,
    margin: 0,
    color: { dark: '#000000', light: '#d4963d' }
  });
  
  const qrImage = await loadImage(qrBuffer);
  ctx.drawImage(qrImage, 67, 67);

  // Draw overlay shape and logo
  ctx.fillStyle = '#d3973e';
  ctx.beginPath();
  ctx.rect(239, 239, 150, 150);
  ctx.fill();
  ctx.drawImage(logo, 239, 239, 150, 150);

  // Calculate and draw scaled overlay
  const multiplier = Math.min(420 / overlay.width, 500 / overlay.height);
  const ow = overlay.width * multiplier;
  const oh = overlay.height * multiplier;
  const ox = 799 - ow / 2;
  const oy = 293 - oh / 2;
  ctx.drawImage(overlay, ox, oy, ow, oh);

  // Text rendering
  ctx.font = '60px hylia';
  ctx.fillStyle = '#995a05';
  ctx.textAlign = 'center';
  ctx.fillText('#' + tripleNumber(number), 920, 587);

  return canvas.toBuffer('image/png');
}
