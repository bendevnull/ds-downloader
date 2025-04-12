import { NextApiRequest, NextApiResponse } from 'next';
// import decompress from 'decompress';
// import yauzl from 'yauzl';
import { rmSync, existsSync, mkdirSync, readFileSync, createReadStream } from 'fs';
import { cache } from '@/cache';
// import { exec } from 'child_process';
import path from 'path';
import unzipper from 'unzipper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { gameCode } = req.query;

    const game = (await cache.ref(`games/${gameCode}`).get()).val();
    if (!game) {
        return res.status(404).json({ error: "Game not found" });
    }
    const zipPath = game.file;

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!existsSync(tmpDir)) {
        mkdirSync(tmpDir);
    }

    console.log(zipPath)

    const archive = await unzipper.Open.file(zipPath);
    await archive.extract({ path: tmpDir })
    const filePath = path.join(tmpDir, zipPath.split('/').pop().replace('.zip', '.nds'));
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${zipPath.split('/').pop().replace('.zip', '.nds')}"`);
    const fileStream = createReadStream(filePath);
    res.status(200);
    fileStream.pipe(res);
    fileStream.on('close', () => {
        rmSync(filePath);
    })
}

export const config = {
    api: {
        responseLimit: false,
    },
};