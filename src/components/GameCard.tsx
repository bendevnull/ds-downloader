'use client';
import { useEffect, useState } from "react";
import { getGameRegion, getGameTDBRegion } from "../utils";
import QRModal from "@/components/QRModal";
import Spinner from "@/components/Spinner";

interface GameCardProps {
  gameCode: string;
}

export default function GameCard({ gameCode }: GameCardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const downloadUrl = typeof window !== 'undefined'
        ? new URL(`/api/download?gameCode=${encodeURIComponent(gameCode)}`, window.location.origin).toString()
        : '';

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
            <figure className="image is-1by1">
                <img
                    src={`https://art.gametdb.com/ds/coverM/${getGameTDBRegion(gameCode)}/${gameCode}.jpg`}
                    alt="Game cover image"
                    onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null; // Prevents infinite loop
                        console.log("Failed to load:", img.src);
                        img.src = "https://demofree.sirv.com/nope-not-here.jpg";
                    }}
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
                <a href={`/api/download?gameCode=${gameCode}`} className="card-footer-item">Download</a><br/>
                <button className="card-footer-item" onClick={() => setShowQRModal(true)}>
                    QR Code
                </button>
            </div>
            {showQRModal && <QRModal gameTitle={data.title} downloadUrl={downloadUrl} onClose={() => setShowQRModal(false)} />}
        </div>
    );
}