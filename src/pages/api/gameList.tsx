import { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from "fs";

const games = Object.keys(JSON.parse(readFileSync("dstdb.json", "utf-8"))).map((gameCode) => {
    return { gameCode };
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { page = 1, pageSize = 16, query = "" } = req.query;

    // games is a list of game codes. just need to send a list of game codes to the client.
    const gameList = games.slice((Number(page) - 1) * Number(pageSize), Number(page) * Number(pageSize));
    console.log(Object.values(gameList));

    res.status(200).json(Object.values(gameList)); // Send a JSON response
}