# ParkWays 🚝

This is a Walt Disney World transportation app I built for fun. It shows "live" status for all the monorails, the Skyliner gondolas, boats, and buses, plus a trip planner that tells you how to get from any park/resort to any other one.

**[Try the live demo →](https://disney-transport-app.vercel.app)** (no install needed, just click)

![status](https://img.shields.io/badge/status-demo-blue) ![stack](https://img.shields.io/badge/stack-Expo%20%2B%20React%20Native-4F46A5)

## What it does

Disney doesn't have a public API for their transportation system, so there's no way to actually pull real bus/monorail data. So instead I built a fake version that updates itself over time, kind of like a simulation, so it at least *feels* like a real live app instead of just static screens.

- **Live status board**: all 19 real transit lines (monorail, Skyliner, boats, buses) show Operating / Delayed / Down, and the status actually changes on its own every 20 seconds. All the screens read from the same shared state, so if a line goes down on the Status tab, it also shows down on the Map and in the trip planner.
- **Trip planner**: pick a starting point and a destination (33 options each) and it gives you a route. I wrote out routing data by hand for basically every combination, and if there's no direct route it tries to figure out a path through a transfer point instead of just giving up.
- **Time-aware routing**: some routes only work at certain times of day (like park-to-park buses only running after 10am), so the planner checks the time and adjusts what it shows you.
- **Transit map**: a schematic map I drew with SVG. You can tap a line to highlight it and see its status.
- **"Use my location"**: if you let it, it can guess which park/resort you're at using GPS and auto-fill the trip planner.

## Why everything is fake data

Since there's no real API to hit, I had to fake one myself. There's a file (`src/utils/liveStatus.ts`) that acts like a mini backend, it randomly decides when a line should go down or get delayed, comes up with a reason ("Suspended for lightning in the area"), and counts down realistic wait times. Every screen in the app subscribes to this same state so it all stays in sync. This was honestly the most fun part to build, and also the part I got stuck on the most.

The actual transit lines and route info (which lines exist, roughly how long a ride takes) are based on the real WDW transportation system, I just made up the live status part.

## Stack

- [Expo](https://expo.dev) + React Native, also works in a browser thanks to react-native-web
- TypeScript (still learning it honestly, but it caught a bunch of bugs while I was building this)
- [React Navigation](https://reactnavigation.org) for the tabs and screens
- [react-native-svg](https://github.com/software-mansion/react-native-svg) for the map
- No backend or database, everything runs on the device/browser

## Running it yourself

```bash
git clone https://github.com/austin5374/disney-transport-app.git
cd disney-transport-app
npm install --legacy-peer-deps

npx expo start --web       # opens it in your browser
npx expo start             # scan the QR code with Expo Go on your phone
```

Note: you need the `--legacy-peer-deps` flag because some of the package versions don't fully agree with each other yet. It still works fine, npm just complains without it.

## How it's organized

```
src/
  screens/       the main pages (Status, Map, Planner, More)
  components/    smaller reusable pieces like cards and pickers
  data/          all the transit lines, destinations, and routes
  utils/
    liveStatus.ts   the fake "live" simulation
    routing.ts      figures out routes between two places
```

## Disclaimer

This is just a fan project I made for practice, it's not affiliated with or endorsed by Disney in any way. All the live status/wait times are made up. Disney park and resort names are only used so people know what the app is actually referring to.

---

Made by [Austin](https://github.com/austin5374). Still learning, so feedback is always welcome!
