'use client';
import GameCard from "./GameCard";
import { FormEvent, useRef, useState, useEffect } from "react";
import Spinner from "@/components/Spinner";

export default function GameCardGrid() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [gameList, setGameList] = useState<string[]>([]); // Replace with actual type
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(16);
    const [totalPageCount, setTotalPageCount] = useState<number>(5);
    const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
    const [urlParams, setURLParams] = useState<URLSearchParams | null>(null);
    const searchInput = useRef<HTMLInputElement>(null);


    const handleParamsUpdate = () => {
        if (!urlParams) return;
        window.location.search = urlParams.toString();
    }

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPageCount) return; // Prevent going out of bounds
        setPage(newPage);
        if (!urlParams) return;
        urlParams.set("page", newPage.toString());
        handleParamsUpdate();
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchInput.current) {
            setSearchQuery(searchInput.current.value);
        }
        setIsLoadingPage(true);
        if (!urlParams) return;
        urlParams.set("search", searchQuery);
        handlePageChange(1);
    };

    const setCards = (column: number) => {
        // Calculate values for this column keeping in mind items should go in order of left to right
        const totalColumns = 4; // Assuming 4 columns
        const columnValues = gameList.filter((_, index) => index % totalColumns === column - 1);

        return columnValues.map((game: any) => {
            console.log("Game:", game)
            return <GameCard key={game} gameCode={game} />;
        });
    };

    const fetchGameList = async () => {
        const response = await fetch(`/api/gameList?page=${page}${searchQuery ? `&query=${searchQuery}` : ""}`);
        const data = await response.json();
        setGameList(data);
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
    }, [page, searchQuery]);

    useEffect(() => {
        const fetchPageCount = async () => {
            const response = await fetch(`/api/pageCount`);
            const data = await response.json();
            setTotalPageCount(data.totalPages);
        };
        fetchPageCount();
    }, [pageSize]);

    useEffect(() => {
        setURLParams(new URLSearchParams(window.location.search));
        const pageFromUrl = parseInt(urlParams?.get("page") || "1", 10);
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
                        </div>
                    </form>
                </div>
            </div>
            <Pagination />
            {/* <p>Currently searching: {searchQuery ? searchQuery : "None"}</p> */}
            <div className="columns">
                <div className="column">
                    {setCards(1)}
                </div>
                <div className="column">
                    {setCards(2)}
                </div>
                <div className="column">
                    {setCards(3)}
                </div>
                <div className="column">
                    {setCards(4)}
                </div>
            </div>
            <Pagination />
        </div>
    );
}