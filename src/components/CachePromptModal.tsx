'use client';
import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import Spinner from "@/components/Spinner";

export default function CachePromptModal() {
    const store = useStore();

    const [showModal, setShowModal] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [finished, setFinished] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { cacheInitialized, setCacheInitialized } = store;

    const handleClose = () => {
        setShowModal(false);
        setCacheInitialized(true);
    };

    const handleInitializeCache = async () => {
        setInitializing(true);
        // make a post request to initialize the cache
        try {
            const response = await fetch('/api/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setFinished(true);
            } else {
                console.error('Failed to initialize cache');
            }
        } catch(error) {
            setError(error instanceof Error ? error.message : 'Unknown error');
            console.error('Error initializing cache:', error);
        }
    }

    if (!cacheInitialized && !showModal) {
        setShowModal(true);
    }

    const StartInitializeCacheModal = () => {
        return (
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Cache Initialization</p>
                </header>
                <section className="modal-card-body">
                    <p>Your cache is not initialized. Please click the button below to initialize it.</p>
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-success" onClick={handleInitializeCache}>Initialize Cache</button>
                </footer>
            </div>
        )
    }

    const InitializingCacheModal = () => {
        return (
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Initializing Cache</p>
                </header>
                <section className="modal-card-body">
                    { error ? <p className="has-text-danger">{error}</p> : <p>Cache is being initialized. Please wait...</p> }
                </section>
                <section className="modal-card-foot">
                    { !error ? <progress className="progress is-info"></progress> : null }

                </section>
            </div>
        )
    }

    const FinishedModal = () => {
        return (
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Cache Initialization Complete</p>
                    <button className="delete" aria-label="close" onClick={handleClose}></button>
                </header>
                <section className="modal-card-body">
                    <p>Server cache has been successfully initialized!</p>
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-success" onClick={handleClose}>Close</button>
                </footer>
            </div>
        )
    }

    return (
        <div className={`modal ${!cacheInitialized ? "is-active" : ""}`}>
            <div className="modal-background" onClick={() => { if (finished) handleClose() }}></div>
            <div className="modal-card">
                { !initializing && !finished ? <StartInitializeCacheModal /> : null }
                { initializing && !finished ? <InitializingCacheModal /> : null }
                { finished ? <FinishedModal /> : null }
            </div>
        </div>
    );
}