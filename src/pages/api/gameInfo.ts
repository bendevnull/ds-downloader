import { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from "fs";

const gameInfo = JSON.parse(readFileSync("./dstdb.json", "utf-8"));

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { gameCode } = req.query;

    if (!gameCode || typeof gameCode !== "string") {
        return res.status(400).json({ error: "Invalid game ID" }); // Use res.status and res.json
    }

    const title = gameInfo[gameCode];

    if (!title) {
        return res.status(404).json({ error: "Game not found" }); // Use res.status and res.json
    }

    const data = {
        gameId: gameCode,
        title: title,
        cover: `https://art.gametdb.com/ds/cover/US/${gameCode}.jpg`,
    };

    res.status(200).json(data); // Send a JSON response
}