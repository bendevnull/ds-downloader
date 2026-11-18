import { NextApiRequest, NextApiResponse } from 'next';
import { getAllGames, cache } from '@/cache';

// const games = Object.keys(JSON.parse(readFileSync("cache.json", "utf-8"))).map((gameCode) => {
//     return { gameCode };
// });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { page = 1, pageSize = 16, search = "" } = req.query;
    console.log(search)

    const games = await getAllGames();

    if (!(await cache.ref('initialized').get()).val() || !games || typeof games !== 'object' || Array.isArray(games)) {
        console.log({ games: [], pages: 0, initialized: false })
        res.status(200).json({ games: [], pages: 0, initialized: false });
        return;
    }

    console.log(games)

    var filteredGames: any = games;

    if (search && typeof search === "string") {
        // load games from database with search value in title or gameCode
        console.log("searching for:", search.trim())
        filteredGames = Object.fromEntries(
            Object.entries(games).filter(([gameCode, game]: any) => {
                return game.title.toLowerCase().includes(search.trim().toLowerCase()) || gameCode.toLowerCase().includes(search.trim().toLowerCase());
            }
        ));
    }

    // games is a list of game codes. just need to send a list of game codes to the client.
    const gameList = Object.keys(filteredGames)?.slice((Number(page) - 1) * Number(pageSize), Number(page) * Number(pageSize));
    
    if (!gameList) {
        res.status(404).json({ error: "No games found" });
        return;
    }

    // todo: calculate page count here
    console.log(Object.keys(filteredGames).length)
    res.status(200).json({ totalItems: Object.keys(filteredGames).length, games: Object.values(gameList), initialized: true }); // Send a JSON response
}