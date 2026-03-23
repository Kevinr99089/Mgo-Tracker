# 🎲 Monopoly GO! Tracker

🇬🇧 [English](https://github.com/Kevinr99089/Mgo-Tracker/blob/main/README.md) | 🇫🇷 [Français](https://github.com/Kevinr99089/Mgo-Tracker/blob/main/READMEfr.md)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-success?style=for-the-badge)](https://kevinr99089.github.io/Mgo-Tracker/)
[![Version](https://img.shields.io/badge/Version-4.07-6366f1?style=for-the-badge)](https://github.com/Kevinr99089/Mgo-Tracker)

A sleek, fast, and fully client-side web application designed to help Monopoly GO! players track their sticker albums, manage multiple accounts, and organize trades effortlessly.

👉 **[Access the Tracker Here](https://kevinr99089.github.io/Mgo-Tracker/)**

---

## ✨ Features

* **Multi-Player Support:** Track albums for your main account and your alt accounts (or friends) all in one place.
* **Smart Board System:** Toggle between visual state tracking and exact duplicate counting.
* **Gold Cards Configuration:** Define which stickers are Gold cards for the current season.
* **Gold Trades Ledger:** Keep a written record of your Gold card trades.
* **Bilingual UI:** Automatically adapts to English or French based on your system/browser language.
* **Customizable Ambiance:** Choose between four animated background modes, including a rare secret one.
* **Print-Ready:** Clean print layout with player selection to generate a physical checklist of your missing stickers.
* **Undo:** Instantly revert your last cell change with the undo button in the dock.

---

## 📖 How It Works: The Board

The app is built around "Glass Cards" for each player, containing grids that represent the in-game sticker albums. Each season can be configured with **21 to 26 albums**, each containing 9 stickers (3×3 grid).

### Card States
By clicking on a cell, you can cycle through 3 states to track your collection:
1. **Empty / Dark:** You are missing this sticker.
2. **Blue (Check):** You have exactly one copy of this sticker.
3. **Red (Cross):** You have duplicates of this sticker and can trade it.

### Primary Player vs. Secondary Players
* **Primary Player (1st on the list):** The top player in your list gets premium features. They have access to a **"Number Mode"** (toggleable via the '123' button) which allows you to type the *exact number* of duplicates you own instead of just a red cross. They also get a dedicated **Note** field.
* **Secondary Players:** Have standard tracking (Missing / Have / Duplicate) to quickly see what alt accounts or friends need.
* *Note: You can reorder players dynamically in the "Manage Players" menu. If you change the primary player, the exact numbers will be cleared, but the red crosses will remain intact.*

### Gold Cards
Gold cards are indicated by a shiny gold border. You can set up your season's gold cards during the initial setup wizard, or at any time using the "Gold Setup" button in the dock.

---

## 🎨 Ambiance Modes

The tracker features four animated background modes, switchable from the dock:

| Mode | Description |
|------|-------------|
| 🔵 Cosmic Orbs | Soft floating gradient orbs |
| 🃏 Floating Cards | Animated card silhouettes drifting across the screen |
| 🟣 Neon Frames | Flickering neon rectangles, some with a realistic dying-light effect |
| ✨ Special | A hidden shiny mode — appears with a 1% chance each time you cycle. Consider yourself lucky! |

---

## 💾 How Data is Stored (Privacy First)

**Your data is 100% private and stays on your device.** This application uses your browser's **Local Storage** to save all configurations, player names, and board states.
* **No databases:** There is no backend server or cloud database.
* **No tracking:** We do not collect, process, or see your data.

### Backups & Cross-Device Sync
Because data is stored locally in your browser, it won't automatically sync across devices. The app provides two ways to move your data around:

**Full backup (all boards):**
1. Open the Menu and click **Save to file**. This downloads a `.json` file containing every player's board and all your settings.
2. Transfer the file to your other device (email, Discord, USB, etc.).
3. On the new device, open the app, click **Load** in the menu, and upload the `.json` to restore everything exactly as it was.

**Board sharing (single board, via link):**
The app also lets you share an individual player's board via a simple link — no file involved.
1. Open the Menu and click **Share a board**.
2. Select the player whose board you want to share.
3. A unique link is generated instantly. Copy it and send it to whoever you want (WhatsApp, Discord, SMS, email — anything works).
4. When the recipient opens the link, the app detects the shared board automatically and shows an **import prompt**, letting them add it to their own tracker in one tap.

> This is especially handy for coordinating with friends, managing alt accounts from someone else's device, or quickly syncing a single board without sharing your entire save file.

> **⚠️ Heads up:** The link is a photo of your board at the moment you shared it — it won't update on its own. If you make changes later and want the other person to have the latest version, just share a new link.

---

## 🔒 Security

* **XSS Protection:** All user input (player names, notes) is HTML-escaped before being inserted into the page, preventing any injection attack.
* **No external scripts:** The file is 100% self-contained — no CDN calls, no third-party code loaded at runtime.
* **Destructive actions are double-confirmed:** A full reset requires two separate confirmation dialogs before any data is erased.

---

## 🛠️ Built With
* Pure HTML5
* CSS3 (Custom properties, Glassmorphism, Animations, Print Media Queries)
* Vanilla JavaScript (No frameworks, fully standalone)

---

*Disclaimer: This project is an unofficial fan-made tool and is not affiliated with, endorsed, or sponsored by Scopely or Monopoly GO!*
