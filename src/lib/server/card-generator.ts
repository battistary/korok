import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs/promises';
import { tripleNumber } from '$lib/utils';

const staticPath = path.join(process.cwd(), 'static');

GlobalFonts.registerFromPath(
    path.join(staticPath, 'HyliaSerifBeta-Regular.ttf'),
    'hylia'
);

export async function generateKorokCardBuffer(
    id: string,
    type: number,
    number: number
): Promise<Buffer> {
    // Read image files as buffers (works on Vercel)
    const baseBuffer = await fs.readFile(path.join(staticPath, 'korok_sticker_base.png'));
    const overlayBuffer = await fs.readFile(path.join(staticPath, `koroks/k_${type}.png`));
    const logoBuffer = await fs.readFile(path.join(staticPath, 'korok_hunt_logo.png'));

    const base = await loadImage(baseBuffer);
    const overlay = await loadImage(overlayBuffer);
    const logo = await loadImage(logoBuffer);

    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(base, 0, 0);

    const qrCanvas = createCanvas(482, 482);
    const origin = process.env.ORIGIN || 'http://localhost:5173';
    await QRCode.toCanvas(qrCanvas, `${origin}/find?id=${id}`, {
        width: 482,
        version: 7,
        margin: 0,
        color: { dark: '#000', light: '#d4963d' }
    });
    ctx.drawImage(qrCanvas, 67, 67);

    ctx.fillStyle = '#d3973e';
    ctx.beginPath();
    ctx.rect(239, 239, 150, 150);
    ctx.fill();
    ctx.drawImage(logo, 239, 239, 150, 150);

    const multiplier = Math.min(420 / overlay.width, 500 / overlay.height);
    const ow = overlay.width * multiplier;
    const oh = overlay.height * multiplier;
    const ox = 799 - ow / 2;
    const oy = 293 - oh / 2;
    ctx.drawImage(overlay, ox, oy, ow, oh);

    ctx.font = '60px hylia';
    ctx.fillStyle = '#995a05';
    ctx.textAlign = 'center';
    ctx.fillText('#' + tripleNumber(number), 920, 587);

    return canvas.toBuffer('image/png');
}
