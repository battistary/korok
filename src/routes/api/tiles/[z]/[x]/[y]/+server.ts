import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export async function GET({
	params
}: {
	params: {
		z: string;
		x: string;
		y: string;
	};
}) {
	const z = Number(params.z);
	const x = Number(params.x);

	// Remove .pbf from the parameter if SvelteKit includes it.
	const y = Number(params.y.replace(/\.pbf$/, ''));

	if (
		!Number.isInteger(z) ||
		!Number.isInteger(x) ||
		!Number.isInteger(y) ||
		z < 0 ||
		x < 0 ||
		y < 0
	) {
		throw error(400, 'Invalid tile coordinates');
	}

	const tilePath = resolve('data', 'tiles', String(z), String(x), `${y}.pbf`);

	if (!existsSync(tilePath)) {
		throw error(404, 'Tile not found');
	}

	const tile = await readFile(tilePath);

	return new Response(tile, {
		headers: {
			'Content-Type': 'application/x-protobuf',
			'Content-Encoding': 'gzip',

			// Tiles don't change during a deployment.
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
}
