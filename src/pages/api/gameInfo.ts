import { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from "fs";
import { cache } from '@/cache';

// const gameInfo = JSON.parse(readFileSync("./dstdb.json", "utf-8"));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { gameCode } = req.query;

    if (!gameCode || typeof gameCode !== "string") {
        return res.status(400).json({ error: "Invalid game ID" }); // Use res.status and res.json
    }

    const game = (await cache.ref(`games/${gameCode}`).get()).val();
    if (!game) {
        return res.status(404).json({ error: "Game not found" }); // Use res.status and res.json
    }
    const title = game.title;

    if (!title) {
        return res.status(404).json({ error: "Game not found" }); // Use res.status and res.json
    }

    const data = {
        gameCode,
        title: title,
    };

    res.status(200).json(data); // Send a JSON response
}