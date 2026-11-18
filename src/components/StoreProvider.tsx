'use client';

import { useState, createContext, useContext, useEffect } from "react";

const StoreContext = createContext<{
    columns: number;
    setColumns: React.Dispatch<React.SetStateAction<number>>;
    rows: number;
    setRows: React.Dispatch<React.SetStateAction<number>>;
    cacheInitialized: boolean;
    setCacheInitialized: React.Dispatch<React.SetStateAction<boolean>>;
    reinitializeRequested: boolean;
    setReinitializeRequested: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export function useStore() {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return context;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const [columns, setColumns] = useState(5);
    const [rows, setRows] = useState(4);
    const [cacheInitialized, setCacheInitialized] = useState(true);
    const [reinitializeRequested, setReinitializeRequested] = useState(false);
    
    const [storeLoading, setStoreLoading] = useState(true);

    const contextValue = {
        columns,
        setColumns,
        rows,
        setRows,
        cacheInitialized,
        setCacheInitialized,
        reinitializeRequested,
        setReinitializeRequested
    };

    useEffect(() => {
        // load initial state from localStorage if available
        const storedSettings = localStorage.getItem('settings');
        if (!storedSettings) { localStorage.setItem('settings', JSON.stringify({})); return; }
        const settings = JSON.parse(storedSettings || '{}');
        if (settings.columns) {
            setColumns(settings.columns);
        }
        if (settings.rows) {
            setRows(settings.rows);
        }
        if (settings.cacheInitialized) {
            setCacheInitialized(settings.cacheInitialized);
        }
        setStoreLoading(false);
    }, []);

    // when the state is updated, save it to localStorage
    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify({
            columns,
            rows,
            cacheInitialized
        }));
    }, [columns, rows, cacheInitialized]);

    if (storeLoading) {
        return null;
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    );
}