import { NextApiRequest, NextApiResponse } from 'next';
import { getAllGames } from '@/cache';

// const games = Object.keys(JSON.parse(readFileSync("cache.json", "utf-8"))).map((gameCode) => {
//     return { gameCode };
// });

var games: any;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { page = 1, pageSize = 16, query = "" } = req.query;

    if (!games) { games = Object.keys(await getAllGames()) }

    console.log(games)

    // games is a list of game codes. just need to send a list of game codes to the client.
    const gameList = games?.slice((Number(page) - 1) * Number(pageSize), Number(page) * Number(pageSize));
    
    if (!gameList) {
        res.status(404).json({ error: "No games found" });
        return;
    }

    console.log(Object.values(gameList));

    res.status(200).json(Object.values(gameList)); // Send a JSON response
}