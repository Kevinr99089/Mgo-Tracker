# 🎲 MGO Tracker

🇬🇧 [English](https://github.com/Kevinr99089/Mgo-Tracker/blob/main/README.md) | 🇫🇷 [Français](https://github.com/Kevinr99089/Mgo-Tracker/blob/main/READMEfr.md)

Welcome to **MGO Tracker**, a powerful, standalone web application designed to help you easily track your Monopoly Go albums, cards, and trades. 

Whether you play on a single account or manage multiple players, this tool provides a seamless, fast, and secure way to keep your progress updated offline or online.

[![MGO Tracker](https://img.shields.io/badge/Open_MGO_Tracker-Create/Manage_your_boards-2563eb?style=for-the-badge)](https://kevinr99089.github.io/Mgo-Tracker/)

---

## 📦 Versions Available

This tool is available as a single-file monolithic HTML download in the [Releases](../../releases) section, and includes two built-in variants:

* **MGO Tracker (Full)**: The complete experience featuring dynamic, animated backgrounds (Ambiance feature including Cosmic Orbs, Floating Cards, Neon Frames, and Lava Lamp).
* **MGO Tracker Lite**: A streamlined, lightweight version optimized for performance and low-end devices, featuring a static aesthetic background without heavy animations.

> ### 🗂️ Legacy Versions
>
> Before V4, earlier iterations of MGO Tracker were built for personal, local use only — with player names hardcoded directly into the source. They were never intended for public release.
>
> When publishing them on GitHub, these versions were adapted to match V4's architecture: player names are now stored in `LocalStorage`, and features introduced in V4 have been backported while preserving the original look and feel of each version. Note: These versions are available only in French.
>
> * **V2** — [Live Page](https://kevinr99089.github.io/Mgo-Tracker/v2)
> * **V3** — [Live Page](https://kevinr99089.github.io/Mgo-Tracker/V3)

## ✨ Features

* **100% Offline & Private**: This tool works completely offline. Your data remains 100% private and stays entirely on your device. There are no external databases, absolutely no tracking, and zero data collection. All data is saved locally in your browser (`LocalStorage`), and you can export your progress to a `.json` backup file to load it anytime.
* **Multi-Account Tracking**: Add, rename, and manage multiple players within the same interface. Reorder them easily using drag-and-drop.
* **Detailed Card Status**: Mark cards as missing, collected, or duplicates (up to 3 states per card).
* **Gold Cards Management**: Click and configure which cards are "Gold" for the current season, and manage a dedicated "Gold Trades" checklist.
* **Board Sharing & Importing**: Generate a unique, compressed link to share your specific board with friends (via Discord, WhatsApp, etc.), allowing them to import it directly into their own tracker. *Note: The shared link is a snapshot of your board at the moment you share it — it won't update on its own. If you make changes later and want the other person to have the latest version, just share a new link.*
* **Print-Friendly**: Need a physical copy? Use the built-in print layout to print specific player boards efficiently.
* **Auto-Translation**: Automatically detects your browser's language and switches seamlessly between English and French.

## 🚀 How to Use

Since MGO Tracker is built as a single HTML file, installation is entirely optional:

1.  **Web Version**: Simply click the badge above to visit the Live Page.
2.  **Local Version**: Go to the **Releases** tab, download the `.html` file, and double-click it to open it in any modern web browser. No internet connection is required to use the local file!

## 🛠️ Technical Info

* Built entirely with pure HTML, CSS, and Vanilla JavaScript.
* Zero dependencies, zero external database tracking.
* The Releases versions is bundled into a single file for maximum portability.
* AI-assisted (by Gemini and Claude) · Designed and directed by me.

---

## ⚠️ Disclaimer

This project is an unofficial fan-made tool. It is not affiliated with, endorsed, or sponsored by Scopely or Monopoly GO!.
