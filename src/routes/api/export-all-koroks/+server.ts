import type { RequestHandler } from './$types';
import JSZip from 'jszip';
import { generateKorokCardBuffer } from '$lib/server/card-generator';
import { getKoroksAdmin } from '../../query/korok.remote';

export const GET: RequestHandler = async ({ locals }) => {
    if (locals.user?.role !== 'admin') {
        return new Response('Unauthorized', { status: 401 });
    }

    const koroks = await getKoroksAdmin();
    if (!koroks || koroks.length === 0) {
        return new Response('No koroks found', { status: 404 });
    }

    const zip = new JSZip();

    for (const korok of koroks) {
        const padded = String(korok.number).padStart(3, '0');
        const buffer = await generateKorokCardBuffer(korok.id, korok.type, korok.number);
        zip.file(`korok_${padded}.png`, buffer);
    }

    // optional metadata
    zip.file('koroks.json', JSON.stringify(koroks, null, 2));

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new Response(zipBuffer, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="koroks.zip"'
        }
    });
};
