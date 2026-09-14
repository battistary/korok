import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import QRCode from 'qrcode';
import Swal from 'sweetalert2';
import type { SweetAlertOptions } from 'sweetalert2';

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
export const sweetAlertClasses = {
	popup: `
    !bg-background
    !text-foreground
    !border
    !border-border
    !rounded-lg
    !shadow-lg
  `,
	title: `
    !text-foreground
    !text-lg
    !font-semibold
  `,
	htmlContainer: `
    !text-muted-foreground
    !text-sm
  `,
	confirmButton: `
    !items-center
    !justify-center
    !whitespace-nowrap
    !rounded-md
    !text-sm
    !font-medium
    !ring-offset-background
    !transition-colors
    !focus-visible:outline-none
    !focus-visible:ring-2
    !focus-visible:ring-ring
    !focus-visible:ring-offset-2
    !disabled:pointer-events-none
    !disabled:opacity-50
    !bg-primary
    !text-primary-foreground
    !hover:bg-primary/90
    !px-4
    !py-2
  `,
	cancelButton: `
    !items-center
    !justify-center
    !whitespace-nowrap
    !rounded-md
    !text-sm
    !font-medium
    !ring-offset-background
    !transition-colors
    !focus-visible:outline-none
    !focus-visible:ring-2
    !focus-visible:ring-ring
    !focus-visible:ring-offset-2
    !disabled:pointer-events-none
    !disabled:opacity-50
    !border
    !border-input
    !bg-background
    !hover:bg-accent
    !hover:text-accent-foreground
    !px-4
    !py-2
  `,
	denyButton: `
    !items-center
    !justify-center
    !whitespace-nowrap
    !rounded-md
    !text-sm
    !font-medium
    !ring-offset-background
    !transition-colors
    !focus-visible:outline-none
    !focus-visible:ring-2
    !focus-visible:ring-ring
    !focus-visible:ring-offset-2
    !disabled:pointer-events-none
    !disabled:opacity-50
    !bg-destructive
    !text-destructive-foreground
    !hover:bg-destructive/90
    !px-4
    !py-2
  `,
	actions: `
    !gap-2
    !mt-4
  `,
	input: `
    !flex
    !h-10
    !w-full
    !rounded-md
    !border
    !border-input
    !bg-background
    !px-3
    !py-2
    !text-sm
    !text-foreground
    !ring-offset-background
    !placeholder:text-muted-foreground
    !focus-visible:outline-none
    !focus-visible:ring-2
    !focus-visible:ring-ring
    !focus-visible:ring-offset-2
  `,
	textarea: `
    !flex
    !min-h-[80px]
    !w-full
    !rounded-md
    !border
    !border-input
    !bg-background
    !px-3
    !py-2
    !text-sm
    !text-foreground
    !ring-offset-background
    !placeholder:text-muted-foreground
    !focus-visible:outline-none
    !focus-visible:ring-2
    !focus-visible:ring-ring
    !focus-visible:ring-offset-2
  `,
	select: `
    !flex
    !h-10
    !w-full
    !rounded-md
    !border
    !border-input
    !bg-background
    !px-3
    !py-2
    !text-sm
    !text-foreground
    !ring-offset-background
    !focus:outline-none
    !focus:ring-2
    !focus:ring-ring
  `,
	validationMessage: `
    !text-destructive
    !text-sm
    !mt-2
  `,
	loader: `
    !text-primary
  `,
	footer: `
    !text-muted-foreground
    !text-xs
    !border-t
    !border-border
    !mt-4
    !pt-3
  `,
	closeButton: `
    !text-muted-foreground
    !hover:text-foreground
    !hover:bg-accent
    !rounded-md
    !transition-colors
    !focus:outline-none
    !focus:ring-2
    !focus:ring-ring
  `
};
export function swalFire(props: SweetAlertOptions) {
	return Swal.fire({ ...props, customClass: sweetAlertClasses });
}
