import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import QRCode from 'qrcode';
import { tripleNumber } from '$lib/utils';

let fontRegistered = false;

export async function generateKorokCardBuffer(
  id: string,
  type: number,
  number: number,
  fetchFn: typeof fetch = fetch
): Promise<Buffer> {
  const origin = process.env.ORIGIN || 'http://localhost:5173';

  // 1. Fetch raw ArrayBuffers
  const [baseRes, overlayRes, logoRes] = await Promise.all([
    fetchFn(`${origin}/korok_sticker_base.png`),
    fetchFn(`${origin}/koroks/k_${type}.png`),
    fetchFn(`${origin}/korok_hunt_logo.png`)
  ]);

  // Convert ArrayBuffers explicitly to Node Buffers
  const baseBuffer = Buffer.from(await baseRes.arrayBuffer());
  const overlayBuffer = Buffer.from(await overlayRes.arrayBuffer());
  const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

  // Register Font safely as a Node Buffer
  if (!fontRegistered) {
    try {
      const fontRes = await fetchFn(`${origin}/HyliaSerifBeta-Regular.ttf`);
      const fontBuffer = Buffer.from(await fontRes.arrayBuffer());
      GlobalFonts.register(fontBuffer, 'hylia');
      fontRegistered = true;
    } catch (e) {
      console.warn('Font registration warning:', e);
    }
  }

  // 2. Pass explicit Node Buffers into loadImage
  const base = await loadImage(baseBuffer);
  const overlay = await loadImage(overlayBuffer);
  const logo = await loadImage(logoBuffer);

  const canvas = createCanvas(base.width, base.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(base, 0, 0);

  // 3. Generate QR Code directly as a Node Buffer
  const qrBuffer = await QRCode.toBuffer(`${origin}/find?id=${id}`, {
    width: 482,
    version: 7,
    margin: 0,
    color: { dark: '#000000', light: '#d4963d' }
  });
  
  const qrImage = await loadImage(qrBuffer);
  ctx.drawImage(qrImage, 67, 67);

  // Draw logo box and icon
  ctx.fillStyle = '#d3973e';
  ctx.beginPath();
  ctx.rect(239, 239, 150, 150);
  ctx.fill();
  ctx.drawImage(logo, 239, 239, 150, 150);

  // Draw scaled overlay
  const multiplier = Math.min(420 / overlay.width, 500 / overlay.height);
  const ow = overlay.width * multiplier;
  const oh = overlay.height * multiplier;
  const ox = 799 - ow / 2;
  const oy = 293 - oh / 2;
  ctx.drawImage(overlay, ox, oy, ow, oh);

  // Draw text
  ctx.font = '60px hylia';
  ctx.fillStyle = '#995a05';
  ctx.textAlign = 'center';
  ctx.fillText('#' + tripleNumber(number), 920, 587);

  return canvas.toBuffer('image/png');
}
