import { NextApiRequest, NextApiResponse } from 'next';
import { createReadStream } from 'fs';
import { cache } from '@/cache';
import path from 'path';
import unzipper from 'unzipper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { gameCode } = req.query;

    const game = (await cache.ref(`games/${gameCode}`).get()).val();
    if (!game) {
        return res.status(404).json({ error: "Game not found" });
    }
    const zipPath = game.file;

    let fileName = path.basename(zipPath);
    res.setHeader('Content-Type', 'application/octet-stream');
    if (path.extname(zipPath).toLowerCase() === '.nds') {
        res.setHeader('Content-Disposition', `attachment; filename="${fileName.replace(/[^\w. -]/g, '_')}"`);
        return createReadStream(zipPath).pipe(res);
    }

    const archive = await unzipper.Open.file(zipPath);
    const ndsFile = archive.files.find(file => file.type === 'File' && file.path.toLowerCase().endsWith('.nds'));
    if (!ndsFile) return res.status(404).json({ error: 'No NDS file in archive' });
    fileName = path.basename(ndsFile.path).replace(/[^\w. -]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    ndsFile.stream().pipe(res);
}

export const config = {
    api: {
        responseLimit: false,
    },
};