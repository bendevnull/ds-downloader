'use client';
import GameCard from "@/components/GameCard";
import { FormEvent, useRef, useState, useEffect } from "react";
import { useStore } from "@/components/StoreProvider";
import Spinner from "@/components/Spinner";
import { calculatePageCount } from "@/utils";

export default function Home() {
    const store = useStore();
    const { setCacheInitialized, rows, columns } = store;

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [gameList, setGameList] = useState<string[]>([]); // Replace with actual type
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(rows * columns);
    const [totalPageCount, setTotalPageCount] = useState<number>(1);
    const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
    const [urlParams, setURLParams] = useState<URLSearchParams | null>(null);
    const searchInput = useRef<HTMLInputElement>(null);


    const handleParamsUpdate = () => {
        if (!urlParams) return;
        // window.location.search = urlParams.toString();
        window.history.pushState({}, "", `?${urlParams.toString()}`);
    }

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPageCount) return; // Prevent going out of bounds
        setPage(newPage);
        if (!urlParams) return;
        urlParams.set("page", newPage.toString());
        handleParamsUpdate();
    };

    const handleSearch = (e: FormEvent) => {
        if (searchInput.current) {
            e.preventDefault();
            const newSearchQuery = searchInput.current.value; // Get the value directly from the input
            setSearchQuery(newSearchQuery); // Update the state
            setIsLoadingPage(true);
            if (!urlParams) return;
            urlParams.set("search", newSearchQuery); // Use the new value here
            handlePageChange(1); // Reset to the first page
        }
    };

    const fetchGameList = async () => {
        const response = await fetch(`/api/gameList?page=${page}&pageSize=${pageSize}${searchQuery ? `&search=${searchQuery}` : ""}`);
        const data = await response.json();
        if (!data.initialized) {
            setCacheInitialized(false);
            return;
        }
        setGameList(data.games);
        const pageCount = calculatePageCount(data.totalItems, pageSize);
        if (pageCount != totalPageCount && data.totalItems != undefined) {
            setTotalPageCount(pageCount);
        }
    };

    const Pagination = () => {
        return (
            <nav className="pagination is-centered">
                <a className="pagination-previous" onClick={() => handlePageChange(page - 1)}>Previous</a>
                <a className="pagination-next" onClick={() => handlePageChange(page + 1)}>Next</a>
                <ul className="pagination-list">
                    {page > 2 && (
                        <>
                            <li><a className={`pagination-link ${page === 1 ? 'is-current' : ''}`} onClick={() => handlePageChange(1)}>1</a></li>
                            {page > 3 && <li><span className="pagination-ellipsis">&hellip;</span></li>}
                        </>
                    )}
                    {page > 1 && (
                        <li><a className="pagination-link" onClick={() => handlePageChange(page - 1)}>{page - 1}</a></li>
                    )}
                    <li><a className="pagination-link is-current">{page}</a></li>
                    {page < totalPageCount && (
                        <li><a className="pagination-link" onClick={() => handlePageChange(page + 1)}>{page + 1}</a></li>
                    )}
                    {page < totalPageCount - 1 && (
                        <>
                            {page < totalPageCount - 2 && <li><span className="pagination-ellipsis">&hellip;</span></li>}
                            <li><a className={`pagination-link ${page === totalPageCount ? 'is-current' : ''}`} onClick={() => handlePageChange(totalPageCount)}>{totalPageCount}</a></li>
                        </>
                    )}
                </ul>
            </nav>
        )
    }

    useEffect(() => {
        setIsLoadingPage(true);
        fetchGameList().then(() => {
            setIsLoadingPage(false);
        });
    }, [page, searchQuery, pageSize]);

    useEffect(() => {
        setPageSize(rows * columns);
    }, [rows, columns]);

    useEffect(() => {
        setURLParams(new URLSearchParams(window.location.search));
        const pageFromUrl = parseInt(urlParams?.get("page") || "1", 10);
        const searchFromUrl = urlParams?.get("search") || "";
        if (searchFromUrl) {
            setSearchQuery(searchFromUrl);
        }
        if (!isNaN(pageFromUrl) && pageFromUrl >= 1 && pageFromUrl <= totalPageCount) {
            setPage(pageFromUrl);
        }
    }, [totalPageCount]);

    if (isLoadingPage) {
        <Spinner />
    }

    return (
        <div className="container">
            {/* Search bar centered */}
            <div className="columns is-centered">
                <div className="column is-half">
                    <form onSubmit={handleSearch}>
                        <div className="field has-addons">
                            <div className="control is-expanded">
                                <input className="input" type="text" placeholder="Search for games..." ref={searchInput}/>
                            </div>
                            <div className="control">
                                <button className="button is-info" onClick={handleSearch}>Search</button>
                            </div>
                            <button className="button is-danger" type="reset" onClick={() => {
                                setSearchQuery("");
                                if (urlParams) {
                                    urlParams.delete("search");
                                    handleParamsUpdate();
                                }
                            }}>Clear Search</button>
                        </div>
                    </form>
                </div>
            </div>
            <Pagination />
            <div className={`fixed-grid has-${columns}-cols has-2-cols-mobile`}>
                <div className="grid">
                    {gameList.map((game) => <div key={game} className="cell"><GameCard gameCode={game} /></div>)}
                </div>
            </div>
            <Pagination />
        </div>
    );
}