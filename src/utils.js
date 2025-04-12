const getGameRegion = (gameCode) => {
    // can normally be determined from the last character of the gameCode
    if (!gameCode) return 'Other';
    switch (gameCode.slice(-1)) {
        case 'E':
            return 'United States';
        case 'P':
            return 'Europe';
        case 'J':
            return 'Japan';
        case 'C':
            return 'China';
        case 'K':
            return 'Korea';
        case 'T':
            return 'Taiwan';
        case 'A':
            return 'Australia';
        case 'H':
            return 'Netherlands';
        default:
            return 'Other';
    }
}

const getShortRegion = (gameCode) => {
    const region = getGameRegion(gameCode);
    switch (region) {
        case 'United States':
            return 'US';
        case 'Japan':
            return 'JP';
        case 'China':
            return 'CN';
        case 'Korea':
            return 'KO';
        case 'Europe':
            return 'EU';
        default:
            return 'Other';
    }
}

const getGameTDBRegion = (gameCode) => {
    const region = getGameRegion(gameCode);
    switch (region) {
        case 'United States':
            return 'US';
        case 'Japan':
            return 'JA';
        case 'China':
            return 'EN';
        case 'Korea':
            return 'KO';
        case 'Netherlands':
            return 'NL';
        case 'Europe':
        default:
            return 'EN';
    }
}

module.exports = {
    getGameRegion,
    getGameTDBRegion,
    getShortRegion
}