# 🎲 Monopoly GO! Tracker

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-success?style=for-the-badge)](https://kevinr99089.github.io/Mgo-Tracker/)

A sleek, fast, and fully client-side web application designed to help Monopoly GO! players track their sticker albums, manage multiple accounts, and organize trades effortlessly.

👉 **[Access the Tracker Here](https://kevinr99089.github.io/Mgo-Tracker/)**

---

## ✨ Features

* **Multi-Player Support:** Track albums for your main account and your alt accounts (or friends) all in one place.
* **Smart Board System:** Toggle between visual state tracking and exact duplicate counting.
* **Gold Cards Configuration:** Define which stickers are Gold cards for the current season.
* **Gold Trades Ledger:** Keep a written record of your planned Gold Blitz trades.
* **Bilingual UI:** Automatically adapts to English or French based on your system/browser language.
* **Customizable Ambiance:** Choose between different animated background modes.
* **Print-Ready:** Clean print layout to generate a physical checklist of your missing stickers.

---

## 📖 How It Works: The Board

The app is built around "Glass Cards" for each player, containing grids that represent the in-game sticker albums (1 to 24+).

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

## 💾 How Data is Stored (Privacy First)

**Your data is 100% private and stays on your device.** This application uses your browser's **Local Storage** to save all configurations, player names, and board states. 
* **No databases:** There is no backend server or cloud database. 
* **No tracking:** We do not collect, process, or see your data.

### Backups & Cross-Device Sync
Because data is stored locally in your browser, it won't automatically sync to your phone if you are using your computer. However, the app includes a built-in **Save & Load** feature:
1. Open the Menu and click **Save**. This will download a `.json` file containing all your tracking data.
2. Send this file to your other device (via email, Discord, etc.).
3. On the new device, open the app, click **Load** in the menu, and upload the `.json` file to restore your exact setup.

---

## 🛠️ Built With
* Pure HTML5
* CSS3 (Custom properties, Glassmorphism, Animations, Print Media Queries)
* Vanilla JavaScript (No frameworks, fully standalone)

---

*Disclaimer: This project is an unofficial fan-made tool and is not affiliated with, endorsed, or sponsored by Scopely or Monopoly GO!*
