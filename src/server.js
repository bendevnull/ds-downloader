const { createServer } = require("http")
const { parse } = require("url")
const fs = require("fs")
const next = require("next")
const path = require("path");

const config = require("./serverConfig");

const dev = process.env.NODE_ENV !== "production" || config.devMode == false;
const app = next({ dev })
const handle = app.getRequestHandler()

const { Cache, getAllGames } = require("./cache");
const { getShortRegion } = require("./utils");

async function cacheData() {
    if (!config.forceDataCache && (await Cache.ref("initialized").get()).exists()) {
        console.log("Using cached data");
        return;
    }

    console.log("Caching data");
    const gameTitles = JSON.parse(fs.readFileSync("dstdb.json", "utf8"));
    for (const dir of fs.readdirSync(config.dataFolder)) {
        if (!fs.statSync(path.join(config.dataFolder, dir)).isDirectory()) continue;
        const gameCodeFilePath = path.join(config.dataFolder, dir, "game_code.txt");
        if (!fs.existsSync(gameCodeFilePath)) continue;
        const gameCode = fs.readFileSync(gameCodeFilePath, "utf8").trim();
        const gameTitle = Object.keys(gameTitles).includes(gameCode) ? gameTitles[gameCode] : dir;
        const gameDir = path.join(config.dataFolder, dir);
        // find zip file in gameDir
        const zipFiles = fs.readdirSync(gameDir).filter(file => file.endsWith(".zip"));
        if (zipFiles.length == 0) continue;
        const gameFile = path.join(gameDir, zipFiles[0]);
        const region = getShortRegion(gameCode);

        await Cache.ref(`games/${gameCode}`).set({
            title: gameTitle,
            file: gameFile,
            region,
            gameCode
        })
    }
    // fs.writeFileSync("cache.json", JSON.stringify(cache, null, 2), "utf8");
    await Cache.ref("initialized").set(true);
    console.log(`Cached ${Object.keys(await getAllGames()).length} games`);
}

if (!config.dataFolder) {
    console.error("Data folder not specified in serverConfig.js");
    process.exit(1);
}

if (!fs.existsSync(config.dataFolder)) {
    console.error("Data folder does not exist:", config.dataFolder);
    process.exit(1);
}

app.prepare().then(async () => {
    await cacheData();
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(config.serverPort, (err) => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${config.serverPort}`)
    });
})