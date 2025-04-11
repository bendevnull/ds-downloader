'use client';
import { useEffect, useState } from "react";

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
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setData(data);
                console.log(data);
            } catch (error) {
                console.error("Error fetching game data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [gameCode])

    if (isLoading) {
        return null;
    }

    return (
        <div className="card">
            <figure className="image is-4by3">
                <img
                    src={data.cover}
                    alt="Game cover image"
                    onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null; // Prevents infinite loop
                        (e.target as HTMLImageElement).src = "https://demofree.sirv.com/nope-not-here.jpg";
                    }}
                />
            </figure>
            <div className="card-content">
                <h2 className="title">{data.title}</h2>
                <div className="content">
                    <p>Game Code: {gameCode}</p> {/* Updated to display the correct game code */}
                </div>
            </div>
            <div className="card-footer">
                <a href="#" className="card-footer-item">Download</a>
                <a href="#" className="card-footer-item">More Info</a>
            </div>
        </div>
    );
}