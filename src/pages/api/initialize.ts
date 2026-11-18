import { NextApiRequest, NextApiResponse } from 'next';
import { cache } from '@/cache';
import fs from 'fs';
import path from 'path';
import config from '@/serverConfig';
import { getShortRegion } from '@/utils';
import { organizeRom, scanRoms } from '@/romScanner';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const root = path.resolve(config.dataFolder);
        const groups = await scanRoms(root);
        const conflicts = groups.map(({ gameCode, files }) => ({
            gameCode,
            files: fs.existsSync(path.join(root, gameCode)) &&
                !files.some(file => path.dirname(file) === gameCode)
                ? ['', ...files] : files
        })).filter(({ files }) => files.length > 1);

        if (req.body?.action !== 'apply') {
            return res.status(200).json({ conflicts, total: groups.length });
        }

        const choices = req.body.choices;
        if (!choices || typeof choices !== 'object' || Array.isArray(choices)) {
            return res.status(400).json({ error: 'Invalid choices' });
        }
        for (const { gameCode, files } of conflicts) {
            if (typeof choices[gameCode] !== 'string' || !files.includes(choices[gameCode])) {
                return res.status(409).json({ error: 'Conflicts changed or require a choice. Please scan again.' });
            }
        }
        const gameTitles: Record<string, string> = JSON.parse(fs.readFileSync('dstdb.json', 'utf8'));
        const games: Record<string, { title: string; file: string; region: string; gameCode: string }> = {};
        await cache.ref('initialized').set(false);
        for (const { gameCode, files } of groups) {
            const selected = conflicts.some(group => group.gameCode === gameCode) ? choices[gameCode] : files[0];
            if (selected === '') continue;
            const gameFile = await organizeRom(root, gameCode, selected);
            games[gameCode] = {
                title: gameTitles[gameCode] ?? gameCode,
                file: gameFile,
                region: getShortRegion(gameCode),
                gameCode
            };
        }
        await cache.ref('games').set(games);
        await cache.ref('initialized').set(true);
        return res.status(200).json({ message: 'cache initialized successfully' });
    } catch (error) {
        console.error('Cache initialization failed:', error);
        return res.status(500).json({ error: 'Cache initialization failed' });
    }
}