const { AceBase } = require("acebase");
export const cache = new AceBase("cache");

export async function getAllGames() {
    return (await cache.ref("games").get()).val();
}