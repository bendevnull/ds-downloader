'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

type QRModalProps = {
    gameTitle: string;
    downloadUrl: string;
    onClose: () => void;
};

export default function QRModal({ gameTitle, downloadUrl, onClose }: QRModalProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        QRCode.toDataURL(downloadUrl, { width: 256, margin: 2 })
            .then(dataUrl => {
                if (!cancelled) setQrDataUrl(dataUrl);
            })
            .catch(() => {
                if (!cancelled) setError('Could not generate the QR code.');
            });
        return () => { cancelled = true; };
    }, [downloadUrl]);

    return (
        <div className="modal is-active" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
            <div className="modal-background" onClick={onClose} />
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title" id="qr-modal-title">Download {gameTitle}</p>
                    <button className="delete" aria-label="Close QR code" onClick={onClose} />
                </header>
                <section className="modal-card-body has-text-centered">
                    <p>Scan this code in 3DS-DL to download the game to play on your 3DS.</p>
                    {qrDataUrl && <img src={qrDataUrl} alt={`QR code linking to the download for ${gameTitle}`} width="256" height="256" />}
                    {!qrDataUrl && !error && <p>Generating QR code…</p>}
                    {error && <p className="has-text-danger" role="alert">{error}</p>}
                    <p className="is-size-7 is-family-monospace is-word-break-all">{downloadUrl}</p>
                </section>
                <footer className="modal-card-foot">
                    <button className="button" onClick={onClose}>Close</button>
                </footer>
            </div>
        </div>
    );
}
