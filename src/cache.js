const { AceBase } = require("acebase");
const cache = new AceBase("cache");

async function getAllGames() {
    return (await cache.ref("games").get()).val();
}

module.exports = {
    Cache: cache,
    getAllGames
};