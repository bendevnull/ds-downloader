import { NextApiRequest, NextApiResponse } from 'next';
import { Cache } from '@/cache';
import fs from 'fs';
import path from 'path';
import config from '@/serverConfig';
import { getShortRegion } from '@/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // Initialize the cache
    const gameTitles = JSON.parse(fs.readFileSync("dstdb.json", "utf8"));
    for (const dir of fs.readdirSync(config.dataFolder)) {
        if (!fs.statSync(path.join(config.dataFolder, dir)).isDirectory()) continue;
        const gameCodeFilePath = path.join(config.dataFolder, dir, "game_code.txt");
        if (!fs.existsSync(gameCodeFilePath)) continue;
        const gameCode = fs.readFileSync(gameCodeFilePath, "utf8").trim();
        const gameTitle = Object.keys(gameTitles).includes(gameCode) ? gameTitles[gameCode] : dir;
        const gameDir = path.join(config.dataFolder, dir);
        // find zip file in gameDir
        const zipFiles = fs.readdirSync(gameDir).filter(file => file.endsWith(".zip"));
        if (zipFiles.length == 0) continue;
        const gameFile = path.join(gameDir, zipFiles[0]);
        const region = getShortRegion(gameCode);

        await Cache.ref(`games/${gameCode}`).set({
            title: gameTitle,
            file: gameFile,
            region,
            gameCode
        })
    }
    // fs.writeFileSync("cache.json", JSON.stringify(cache, null, 2), "utf8");
    await Cache.ref("initialized").set(true);
    res.status(200).json({ message: 'Cache initialized successfully' });
}