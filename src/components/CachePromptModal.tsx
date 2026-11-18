'use client';
import { useEffect, useState } from "react";
import { useStore } from "@/components/StoreProvider";

export default function CachePromptModal() {
    const store = useStore();

    const [showModal, setShowModal] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [finished, setFinished] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conflicts, setConflicts] = useState<{ gameCode: string; files: string[] }[]>([]);
    const [choices, setChoices] = useState<Record<string, string>>({});
    const [ready, setReady] = useState(false);
    const { cacheInitialized, setCacheInitialized, reinitializeRequested, setReinitializeRequested } = store;

    const handleClose = () => {
        if (!finished) return;
        setShowModal(false);
        setCacheInitialized(true);
        setReinitializeRequested(false);
        setReady(false);
        setConflicts([]);
        setChoices({});
        setError(null);
    };

    const requestInitialize = async (body?: object) => {
        setInitializing(true);
        setError(null);
        try {
            const response = await fetch('/api/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body ?? {}),
            });
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 409) setReady(false);
                throw new Error(data.error || 'Failed to initialize cache');
            }
            if (body) {
                setFinished(true);
            } else {
                setConflicts(data.conflicts);
                setChoices(Object.fromEntries(data.conflicts.map((group: { gameCode: string; files: string[] }) => [group.gameCode, group.files.find(file => file !== '') ?? ''])));
                setReady(true);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setInitializing(false);
        }
    };

    useEffect(() => {
        if (reinitializeRequested || !cacheInitialized) {
            setShowModal(true);
            setInitializing(false);
            setFinished(false);
            setReady(false);
            setConflicts([]);
            setChoices({});
            setError(null);
        }
    }, [reinitializeRequested, cacheInitialized]);


    const StartInitializeCacheModal = () => {
        return (
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Cache Initialization</p>
                </header>
                <section className="modal-card-body">
                    <p>Scan ROMs in the data folder, resolve any duplicates, then initialize the cache.</p>
                    {error && <p className="has-text-danger">{error}</p>}
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-success" onClick={() => requestInitialize()}>Initialize Cache</button>
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

    const ConflictModal = () => (
        <div className="modal-card">
            <header className="modal-card-head"><p className="modal-card-title">Choose ROMs to keep</p></header>
            <section className="modal-card-body">
                <p>Only selected ROMs will be added to the cache. Unchosen files remain untouched.</p>
                {conflicts.map(({ gameCode, files }) => (
                    <div className="field" key={gameCode}>
                        <label className="label" htmlFor={`rom-${gameCode}`}>{gameCode}</label>
                        <div className="select is-fullwidth">
                            <select id={`rom-${gameCode}`} value={choices[gameCode]} onChange={event => setChoices({ ...choices, [gameCode]: event.target.value })}>
                                {files.map(file => <option key={file} value={file}>{file || 'Keep existing folder unchanged (exclude new ROM)'}</option>)}
                            </select>
                        </div>
                    </div>
                ))}
                {error && <p className="has-text-danger">{error}</p>}
            </section>
            <footer className="modal-card-foot">
                <button className="button is-success" onClick={() => requestInitialize({ action: 'apply', choices })}>Finish Initialization</button>
            </footer>
        </div>
    );

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
        <div className={`modal ${showModal && (!cacheInitialized || reinitializeRequested) ? "is-active" : ""}`}>
            <div className="modal-background" onClick={() => { if (finished) handleClose() }}></div>
            <div className="modal-card">
                { !initializing && !finished && !ready ? <StartInitializeCacheModal /> : null }
                { !initializing && !finished && ready ? <ConflictModal /> : null }
                { initializing && !finished ? <InitializingCacheModal /> : null }
                { finished ? <FinishedModal /> : null }
            </div>
        </div>
    );
}