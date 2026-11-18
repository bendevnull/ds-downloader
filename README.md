# DS Downloader

DS Downloader is a self-hosted web app for browsing and downloading Nintendo DS ROMs you already have. It indexes a local collection of `.nds` files and ZIP archives, shows game titles and regions, and generates download QR codes for other devices. This project does not supply any ROMs.

## Getting started

Use a supported Node.js LTS release and npm. From the project directory, install dependencies and copy the configuration template. If you already have `src/serverConfig.js`, keep it and skip the copy command.

```powershell
npm ci
Copy-Item src\serverConfig.template.js src\serverConfig.js
```

Set `dataFolder` in [the local configuration](./src/serverConfig.template.js) copy to an absolute path to your collection, such as `D:/ROMs/NDS`. The app needs read and write access to that directory. **Back up your collection before initializing the cache:** initialization moves selected files.

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and follow the **Initialize Cache** prompt. To rescan later, choose **Settings → Reinitialize Cache**.

## How indexing works

- The scanner walks the collection recursively and reads the four-character game code from the NDS header. For ZIPs, it reads the first `.nds` entry without extracting it to disk. Invalid or unreadable files are skipped.
- Duplicate game codes and destination folder conflicts are presented in the browser before changes are applied. Unchosen files stay where they are and are not indexed.
- Each selected file goes into a folder named after its game code alongside `game_code.txt`. ZIPs remain zipped on disk; downloading a ZIP-backed game sends the `.nds` entry.

## Download to another device

Use **Download** on a game card, or select **QR Code** and scan it on another device. The QR code uses the address in your browser. For a phone on the same network, open the app using the server's LAN address (for example, `http://192.168.1.20:3000`) before generating the code. A `localhost` QR link won't reach the server from another device.

## Production startup

```powershell
npm run build
npm start
```

# WARNING
#### Run the app on a trusted network. It has no built-in authentication, and anyone who can reach it can download indexed files or run cache initialization.
