'use client';
import GameCard from "./GameCard";
import { FormEvent, useRef, useState, useEffect } from "react";

export default function GameCardGrid() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [gameList, setGameList] = useState<string[]>([]); // Replace with actual type
    const [page, setPage] = useState<number>(1);
    const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
    const searchInput = useRef<HTMLInputElement>(null);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > 5) return; // Prevent going out of bounds
        setPage(newPage);
    };
    

    const handleNextPage = () => {
        handlePageChange(page + 1);
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchInput.current) {
            setSearchQuery(searchInput.current.value);
        }
        setIsLoadingPage(true);
    };

    const setCards = (column: number) => {
        // return values from gameList based on column number (Column 1 returns 0, 3, 6, 9; Column 2 returns 1, 4, 7, 10; etc.)
        const columnValues = gameList.filter((_, index) => index % 4 === column - 1);
        // game is not a string, it's an object with gameCode
        // do this without map
        const gameCodes = columnValues.reduce((acc: string[], game: any) => {
            acc.push(game.gameCode);
            return acc;
        }, [] as string[]);
        return gameCodes.map((gameCode) => { 
            return <GameCard key={gameCode} gameCode={gameCode} />;
        });
    };

    const fetchGameList = async () => {
        const response = await fetch(`/api/gameList?page=${page}${searchQuery ? `&query=${searchQuery}` : ""}`);
        const data = await response.json();
        setGameList(data);
    };

    useEffect(() => {
        setIsLoadingPage(true);
        fetchGameList().then(() => {
            setIsLoadingPage(false);
        });
    }, [page, searchQuery]);

    if (isLoadingPage) {
        return <div className="loading">Loading...</div>; // Add a loading indicator
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
            <nav className="pagination is-centered">
                <a className="pagination-previous" onClick={() => handlePageChange(page - 1)}>Previous</a>
                <a className="pagination-next" onClick={() => handlePageChange(page + 1)}>Next</a>
                <ul className="pagination-list">
                    <li><a className={`pagination-link ${page === 1 ? 'is-current' : ''}`} onClick={() => handlePageChange(1)}>1</a></li>
                    <li><a className={`pagination-link ${page === 2 ? 'is-current' : ''}`} onClick={() => handlePageChange(2)}>2</a></li>
                    <li><a className={`pagination-link ${page === 3 ? 'is-current' : ''}`} onClick={() => handlePageChange(3)}>3</a></li>
                    <li><a className={`pagination-link ${page === 4 ? 'is-current' : ''}`} onClick={() => handlePageChange(4)}>4</a></li>
                    <li><a className={`pagination-link ${page === 5 ? 'is-current' : ''}`} onClick={() => handlePageChange(5)}>5</a></li>
                </ul>
            </nav>
        </div>
    );
}