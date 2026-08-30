import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';
import path from 'path';
import { tripleNumber } from '$lib/utils';

// Register the hylia font (same as client)
registerFont(path.resolve('./static/HyliaSerifBeta-Regular.ttf'), {
    family: 'hylia'
});

export async function generateKorokCardBuffer(
    id: string,
    type: number,
    number: number
): Promise<Buffer> {
    // Load all images from static folder
    const base = await loadImage(path.resolve('./static/korok_sticker_base.png'));
    const overlay = await loadImage(path.resolve(`./static/koroks/k_${type}.png`));
    const logo = await loadImage(path.resolve('./static/korok_hunt_logo.png'));

    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');

    // Draw base
    ctx.drawImage(base, 0, 0);

    // Generate QR code as canvas
    const qrCanvas = createCanvas(482, 482);
    await QRCode.toCanvas(qrCanvas, `${process.env.ORIGIN || 'http://localhost:5173'}/find?id=${id}`, {
        width: 482,
        version: 7,
        margin: 0,
        color: { dark: '#000', light: '#d4963d' }
    });
    ctx.drawImage(qrCanvas, 67, 67);

    // White rectangle behind logo
    ctx.fillStyle = '#d3973e';
    ctx.beginPath();
    ctx.rect(239, 239, 150, 150);
    ctx.fill();
    ctx.drawImage(logo, 239, 239, 150, 150);

    // Overlay (Korok icon) – centered at x=799, y=293 with scaling
    const multiplier = Math.min(420 / overlay.width, 500 / overlay.height);
    const ow = overlay.width * multiplier;
    const oh = overlay.height * multiplier;
    const ox = 799 - ow / 2;
    const oy = 293 - oh / 2;
    ctx.drawImage(overlay, ox, oy, ow, oh);

    // Number text
    ctx.font = '60px hylia';
    ctx.fillStyle = '#995a05';
    ctx.textAlign = 'center';
    ctx.fillText('#' + tripleNumber(number), 920, 587);

    return canvas.toBuffer('image/png');
}
