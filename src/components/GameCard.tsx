'use client';
import { useEffect, useState } from "react";
import { getGameRegion, getGameTDBRegion } from "../utils";
import Spinner from "@/components/Spinner";

interface GameCardProps {
  gameCode: string;
}

export default function GameCard({ gameCode }: GameCardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // fetch data from local /api/gameInfo
                const response = await fetch(`/api/gameInfo?gameCode=${gameCode}`);
                // if (!response.ok) {
                //     throw new Error("Network response was not ok: " + response.statusText);
                // }
                const data = await response.json();
                setData(data);

                if (data === null) {
                    console.error("No data found for game code:", gameCode);
                }
            } catch (error) {
                console.error("Error fetching game data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [gameCode])

    if (isLoading) {
        // loading spinner
        return <Spinner />;
    }

    return (
        <div className="card">
            <figure className="image is-4by3">
                <img
                    src={`https://art.gametdb.com/ds/coverM/${getGameTDBRegion(gameCode)}/${gameCode}.jpg`}
                    alt="Game cover image"
                    onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null; // Prevents infinite loop
                        console.log("Failed to load:", img.src);
                        img.src = "https://demofree.sirv.com/nope-not-here.jpg";
                    }}
                    width={300}
                    height={300}
                />
            </figure>
            <div className="card-content">
                <h2 className="title">{data.title}</h2>
                <div className="content">
                    <p>Game Code: {gameCode}</p> {/* Updated to display the correct game code */}
                    <p>Game Region: {getGameRegion(gameCode)}</p>
                </div>
            </div>
            <div className="card-footer">
                <a href="#" className="card-footer-item">Download</a>
                <a href="#" className="card-footer-item">More Info</a>
            </div>
        </div>
    );
}