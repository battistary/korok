import { error } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import type { RequestHandler } from './$types';

let db: Database.Database | undefined;

function getDatabase() {
	if (!db) {
		const path = 'data/rpi-troy.mbtiles';

		db = new Database(path, {
			readonly: true
		});

		db.pragma('query_only = ON');
	}

	return db;
}

export const GET: RequestHandler = ({
	params
}: {
	params: { x: string; y: string; z: string };
}) => {
	const z = Number(params.z);
	const x = Number(params.x);
	const y = Number(params.y);

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

	/*
	 * MBTiles uses TMS tile coordinates where Y is flipped compared
	 * to the XYZ coordinates used by MapLibre.
	 *
	 * TMS Y = (2^z - 1) - XYZ Y
	 */
	const tmsY = (1 << z) - 1 - y;

	if (tmsY < 0) {
		console.log('tmsY', tmsY, 'z', z, 'y', y);
		throw error(404, 'Tile not found');
	}

	const database = getDatabase();

	const row = database
		.prepare(
			`
			SELECT tile_data
			FROM tiles
			WHERE zoom_level = ?
			  AND tile_column = ?
			  AND tile_row = ?
			`
		)
		.get(z, x, tmsY) as { tile_data: Buffer } | undefined;

	if (!row) {
		console.log('no row', z, x, tmsY);
		throw error(404, 'Tile not found');
	}

	return new Response(new Uint8Array(row.tile_data), {
		headers: {
			'Content-Type': 'application/x-protobuf',
			'Content-Encoding': 'gzip',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
