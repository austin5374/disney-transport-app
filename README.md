# 🏰 Disney Transport App

A Walt Disney World guest transportation app that helps you find the best way to get between any two Disney locations — with live simulated arrival times, smart time-aware routing, and a My Disney Experience-inspired design.

---

## 📱 Try it on your phone (easiest way)

1. Download **[Expo Go](https://expo.dev/go)** from the App Store (iPhone) or Google Play (Android) — it's free
2. Follow the "Run it yourself" steps below to start the app
3. Scan the QR code that appears in your terminal with Expo Go

---

## 🚀 Run it yourself

You'll need [Node.js](https://nodejs.org) installed (just download and run the installer — pick the "LTS" version).

Then open **Terminal** (Mac) or **Command Prompt** (Windows) and run these commands one at a time:

```bash
# 1. Download the project
git clone https://github.com/austin5374/disney-transport-app.git

# 2. Go into the folder
cd disney-transport-app

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Start the app
npx expo start --clear
```

A QR code will appear. Scan it with **Expo Go** on your phone and the app will open.

---

## ✨ Features

- **Smart routing** between all Walt Disney World parks, resorts, and entertainment districts
- **Live arrival simulation** — pulsing green dot shows next bus/monorail/gondola arrival, tap to refresh
- **Time-aware** — automatically adjusts routes before 10am (no park-to-park buses), before 4pm (Disney Springs limits), and after 3pm (Blue Flag water taxis)
- **Filter options** — Fastest first, Scenic routes, No water, Accessible, No transfer
- **Journey diagram** — animated node-and-line diagram showing your full route
- **Step-by-step cards** — done / current / upcoming states with contextual tips
- **My Disney Experience aesthetic** — Disney blue headers, white cards, familiar layout

---

## 🗺️ What's covered

Every Disney World transport route including:
- 🚌 Disney Buses (all resorts and parks)
- 🚝 Monorail (Express, Resort loop, EPCOT)
- 🚡 Disney Skyliner gondola (CBR hub network)
- ⛵ Friendship Boats (Crescent Lake)
- 🚢 Ferry Boat (TTC ↔ Magic Kingdom)
- 🛥️ Water Taxis (Gold/Red/Green/Blue flag launches)
- 🚣 Sassagoula River Cruise (Disney Springs area)
- 🚶 Walking paths (Contemporary, EPCOT resorts, etc.)
- 🚗 Minnie Van via Lyft

---

## 🛠️ Built with

- [React Native](https://reactnative.dev) + [Expo](https://expo.dev)
- [React Navigation](https://reactnavigation.org)
- TypeScript

---

*All transport data sourced from official Disney documentation and verified community sources. This is an unofficial fan-made app and is not affiliated with The Walt Disney Company.*
