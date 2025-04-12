import { NextApiRequest, NextApiResponse } from 'next';
import { getAllGames } from '@/cache';

var games: any;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { pageSize = 16 } = req.query;

    if (!games) { games = Object.keys(await getAllGames()) }
    const gameCount = games.length;

    // calculate total pages based on the number of games per page
    res.status(200).json({ totalPages: Math.ceil(gameCount / Number(pageSize)) });
}