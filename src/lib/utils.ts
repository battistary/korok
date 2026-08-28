import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import QRCode from 'qrcode';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function generateQRCode({
	id,
	type,
	number,
	canvasP
}: {
	id: string;
	type: number;
	number: number;
	canvasP?: HTMLCanvasElement;
}) {
	const canvas = canvasP ?? document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	const base = new Image();
	const overlay = new Image();
	const logo = new Image();

	base.src = '/korok_sticker_base.png';
	overlay.src = `/koroks/k_${type}.png`;
	logo.src = `/korok_hunt_logo.png`;

	const f = new FontFace('hylia', 'url(/HyliaSerifBeta-Regular.ttf)');
	await Promise.all([
		new Promise((resolve) => (base.onload = resolve)),
		new Promise((resolve) => (overlay.onload = resolve)),
		new Promise((resolve) => (logo.onload = resolve)),
		f.load()
	]);

	// Match canvas to base image
	canvas.width = base.width;
	canvas.height = base.height;
	// Base
	ctx.drawImage(base, 0, 0);

	// Overlay

	const qrCanvas = document.createElement('canvas');

	await QRCode.toCanvas(qrCanvas, location.origin + '/find?id=' + id, {
		width: 482,
		version: 7,
		margin: 0,
		color: {
			dark: '#000',
			light: '#d4963d'
		}
	});

	ctx.drawImage(
		qrCanvas,
		67, // x
		67 // y
	);
	ctx.fillStyle = '#d3973e';
	ctx.beginPath();
	ctx.rect(239, 239, 150, 150);
	ctx.fill();
	ctx.drawImage(logo, 239, 239, 150, 150);
	const multiplier = Math.min(420 / overlay.width, 500 / overlay.height);

	ctx.drawImage(
		overlay,
		799 - (overlay.width * multiplier) / 2,
		293 - (overlay.height * multiplier) / 2,
		overlay.width * multiplier,
		overlay.height * multiplier
	);
	// Text
	ctx.font = '60px hylia';
	ctx.fillStyle = '#995a05';
	ctx.textAlign = 'center';

	ctx.fillText('#' + tripleNumber(number), 920, 587);
	if (!canvasP) {
		const link = document.createElement('a');
		link.download = 'image.png';
		link.href = canvas.toDataURL('image/png');
		link.click();
	}
}

export function tripleNumber(number: number): string {
	return number < 100 ? (number < 10 ? '00' : '0') + number : number.toString();
}
