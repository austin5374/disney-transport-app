# ParkWays 🚝

A Walt Disney World transportation app I built to see if I could model an entire theme park's transit system — monorails, the Skyliner gondolas, boats, buses, all of it — and make it feel like a real live app instead of a static map.

**[Try the live demo →](https://disney-transport-app.vercel.app)** (no install, just click)

![status](https://img.shields.io/badge/status-demo-blue) ![stack](https://img.shields.io/badge/stack-Expo%20%2B%20React%20Native-4F46A5)

## What it does

WDW doesn't publish a public transit API, so Disney apps that try to show "live" bus/monorail status don't really exist outside the official My Disney Experience app. I wanted to build the experience anyway — so everything here is simulated, but built to *behave* like a real live system, not just hardcoded placeholder text.

- **Live status board** — all 19 real transit lines (3 monorail lines, 3 Skyliner lines, 7 boat routes, 6 bus groups) with Operating/Delayed/Down states that actually drift over time. There's a shared "simulation engine" (`src/utils/liveStatus.ts`) that ticks every 20 seconds, so if the Skyliner is down on the status board, it's *also* down on the map and in the trip planner. One source of truth, not three different mock states.
- **Trip planner** — pick any two of the 33 parks/resorts/hubs and it finds you a route. I precomputed and hand-wrote routing data for all 1,056 possible directed pairs, with a fallback engine that synthesizes a route through a transfer hub (or suggests Minnie Van/rideshare) for pairs that don't have a direct connection, so it's never a dead end.
- **Time-aware routing** — some routes only make sense at certain times (park-to-park buses don't run before 10am, Disney Springs buses from parks only run after 4pm, the Blue Flag boat launch only runs in the evening). The planner actually enforces these instead of just listing every route all the time.
- **Transit map** — an SVG schematic of the monorail/Skyliner/boat network (not to scale, like every transit map ever). Tap a line to highlight it and see its live status.
- **"Use my location"** — geofences the real WDW park/resort coordinates so if you grant location access, it can guess where you are and pre-fill the trip planner.

## Why it's simulated (and why that's the interesting part)

Disney has no public transportation API, so I couldn't just call a real endpoint. Instead I built a fake one — a client-side store that generates plausible disruptions ("Suspended for lightning in the area — est. 16 min"), weighted random status transitions, arrival countdowns based on real timestamps, and time-of-day crowd levels (morning rush, post-fireworks exodus). It's `useSyncExternalStore`-based so every screen subscribes to the same state and nothing gets out of sync. Basically the goal was: could I fake a live backend well enough that it *feels* real for a few minutes of poking around?

The actual route network (which lines exist, where they stop, roughly how long they take) is modeled on the real WDW transportation system.

## Stack

- [Expo](https://expo.dev) + React Native (SDK 57 / RN 0.83), also runs in a browser via react-native-web
- TypeScript, strict-ish — `tsc --noEmit` passes clean
- [React Navigation](https://reactnavigation.org) v7 (bottom tabs + native stack)
- [react-native-svg](https://github.com/software-mansion/react-native-svg) for the hand-drawn transit map
- No backend, no database — it's all client-side state, which is what makes the "live" part a fun problem (see above)

## Run it yourself

```bash
git clone https://github.com/austin5374/disney-transport-app.git
cd disney-transport-app
npm install --legacy-peer-deps

npx expo start --web       # opens in your browser
npx expo start             # scan the QR code with Expo Go on your phone
```

(`--legacy-peer-deps` because some of the Expo/RN peer dependency ranges are a little behind React 19 — nothing broken, just noisy without the flag.)

## Project structure

```
src/
  screens/       Status, Map, Planner (Search → Results → Detail), More
  components/    cards, pickers, the map legend, live-arrival pills, etc.
  data/          the 19 transit lines, 33 destinations, and 400+ hand-written routes
  utils/
    liveStatus.ts   the shared simulation engine
    routing.ts      route lookup, filtering, hub-transfer synthesis, geofencing
```

## Disclaimer

This is an unofficial fan project — not affiliated with, endorsed by, or sponsored by The Walt Disney Company. All status/wait-time/arrival data is simulated. Disney park, resort, and attraction names are used only to describe the real transportation network this app is modeled on.

---

Built by [Austin](https://github.com/austin5374) — feedback/issues welcome.
