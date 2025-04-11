const fs = require('fs');

const file = fs.readFileSync('dstdb.txt', 'utf8');

const lines = file.split('\n').map(line => line.trim()).filter(line => line.length > 0);
const data = {};

//read the file line by line, taking the format code = title and putting it in the data object
for (const line of lines) {
    const [code, title] = line.split('=').map(part => part.trim());
    if (code && title) {
        data[code] = title;
    }
}

//write the data object to a json file
const json = JSON.stringify(data, null, 2);
fs.writeFileSync('dstdb.json', json, 'utf8');
console.log('dstdb.json created successfully!');