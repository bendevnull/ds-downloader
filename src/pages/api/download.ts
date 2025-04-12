import { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from "fs";
import yauzl from "yauzl";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { gameCode } = req.query;

    
}