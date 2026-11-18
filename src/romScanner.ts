import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

type Rom = { path: string; gameCode: string };
export type RomGroup = { gameCode: string; files: string[] };

async function readGameCode(filePath: string): Promise<string | null> {
    let header: Buffer;
    if (path.extname(filePath).toLowerCase() === '.zip') {
        const archive = await unzipper.Open.file(filePath);
        const entry = archive.files.find(file => file.type === 'File' && file.path.toLowerCase().endsWith('.nds'));
        if (!entry) return null;
        const chunks: Buffer[] = [];
        let length = 0;
        for await (const chunk of entry.stream()) {
            chunks.push(chunk);
            length += chunk.length;
            if (length >= 16) break;
        }
        header = Buffer.concat(chunks, length);
    } else {
        const file = await fs.promises.open(filePath, 'r');
        try {
            header = Buffer.alloc(16);
            const { bytesRead } = await file.read(header, 0, 16, 0);
            if (bytesRead < 16) return null;
        } finally {
            await file.close();
        }
    }
    if (header.length < 16) return null;
    const code = header.toString('ascii', 12, 16);
    return /^[A-Z0-9]{4}$/.test(code) ? code : null;
}

export async function scanRoms(root: string): Promise<RomGroup[]> {
    const roms: Rom[] = [];
    async function walk(folder: string) {
        for (const entry of await fs.promises.readdir(folder, { withFileTypes: true })) {
            const filePath = path.join(folder, entry.name);
            if (entry.isDirectory()) {
                if (!entry.isSymbolicLink()) await walk(filePath);
            } else if (entry.isFile() && ['.zip', '.nds'].includes(path.extname(entry.name).toLowerCase())) {
                try {
                    const gameCode = await readGameCode(filePath);
                    if (gameCode) roms.push({ path: path.relative(root, filePath), gameCode });
                } catch (error) {
                    console.warn(`Could not scan ROM ${filePath}:`, error);
                }
            }
        }
    }
    await walk(root);
    const groups = new Map<string, string[]>();
    for (const rom of roms) {
        groups.set(rom.gameCode, [...(groups.get(rom.gameCode) ?? []), rom.path]);
    }
    return [...groups].map(([gameCode, files]) => ({ gameCode, files }));
}

export async function organizeRom(root: string, gameCode: string, relativeFile: string): Promise<string> {
    const source = path.resolve(root, relativeFile);
    if (!source.startsWith(root + path.sep)) throw new Error('Invalid ROM path');
    if (!/^[A-Z0-9]{4}$/.test(gameCode)) throw new Error('Invalid game code');
    const destinationFolder = path.join(root, gameCode);
    if (path.dirname(source) === destinationFolder) {
        await fs.promises.writeFile(path.join(destinationFolder, 'game_code.txt'), gameCode, 'utf8');
        return source;
    }
    await fs.promises.mkdir(destinationFolder, { recursive: true });
    let destination = path.join(destinationFolder, path.basename(source));
    if (source !== destination) {
        let suffix = 1;
        while (fs.existsSync(destination)) {
            const extension = path.extname(source);
            destination = path.join(destinationFolder, `${path.basename(source, extension)} (${suffix++})${extension}`);
        }
        try {
            await fs.promises.rename(source, destination);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'EXDEV') throw error;
            await fs.promises.copyFile(source, destination, fs.constants.COPYFILE_EXCL);
            await fs.promises.unlink(source);
        }
    }
    await fs.promises.writeFile(path.join(destinationFolder, 'game_code.txt'), gameCode, 'utf8');
    return destination;
}
