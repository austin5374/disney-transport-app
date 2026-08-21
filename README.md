# Walt Disney World transportation planner

Pick where you are and where you're going, and it tells you how to get there on Disney transportation: monorails, the Skyliner, boats, and buses.

Live demo: https://disney-transport-app.vercel.app

Built with Expo and React Native in TypeScript, so the same code runs on iOS, Android, and in a browser.

## What it does

You pick two places out of 33 (every park, every resort, both water parks, Disney Springs) and it gives you the ways to get between them. There are about 385 routes written out by hand. If two places have no direct connection, it builds a trip through a transfer point instead, which is what you'd actually end up doing.

Trips are sorted by how long the whole thing takes, not just the time you're on the vehicle. That means it counts the wait too. A bus that shows up every 20 minutes costs you about 10 minutes of standing there on average, and a trip that ignores that isn't telling you the truth. The detail page splits the total back out into wait, ride, and walking so you can see where the time goes.

Some routes only run at certain times. Park to park buses don't start until 10am, the Blue Flag boat starts at 3pm, and Disney Springs buses from the parks start at 4pm. The planner checks the clock. If you ask for Magic Kingdom to Hollywood Studios at 8am it won't offer you a bus that isn't running yet, it'll route you through a monorail resort instead.

There's also a status board for every line and a schematic map you can tap.

## About the "live" data

Disney doesn't have a public API for transportation, so none of the status data is real. I made it up.

The first version of this used `Math.random()` on a timer, and it had an obvious problem: refreshing the page rerolled everything. You could see the Skyliner shut down for lightning, hit reload, and it'd be running again. That's not a small bug, it makes the whole thing feel fake.

So I rewrote it. Now every line's status is worked out from the current time and nothing else. There's no stored state and no `Math.random()` anywhere in `src/utils/liveStatus.ts`. It hashes the line ID together with a 30 minute time window to decide whether that line is having problems, and how long for. Departure times are a fixed schedule with an offset per line, so the countdowns tick down smoothly instead of jumping around.

Because of that:

- Reloading gives you the same board
- Everyone sees the same thing at the same time
- I can freeze the clock in a test and check exactly what it does

Storms take out a whole group of boats at once instead of one random boat while the ones next to it keep going, because the outage is decided per body of water rather than per line. Monorail lightning starts with the EPCOT beam and can spread to all three.

## Running it

```
git clone https://github.com/austin5374/disney-transport-app.git
cd disney-transport-app
npm install --legacy-peer-deps

npx expo start --web    # opens in a browser
npx expo start          # scan the QR code with Expo Go
```

You need `--legacy-peer-deps` because a few packages haven't caught up to React 19 yet. It works fine, npm just complains.

```
npm test
npm run typecheck
```

## Tests

47 of them. Most are checks on the route data, because it's 385 entries typed out by hand and I didn't trust it. Writing the tests turned up real problems:

- 5 routes where the total time didn't match the sum of their own legs
- 22 bus legs that didn't match up to any transit line
- A field sitting on every leg of every route that nothing ever read (485 of them)

The rest cover the routing logic (including a check that a paid Minnie Van never gets ranked above actual Disney transportation on any of the 1,056 possible trips) and the status simulation, where the clock gets frozen and the board has to come out identical every time.

## Files

```
src/
  screens/       the pages
  components/
    ui/          buttons, sections, dividers, that kind of thing
  data/          transit lines, places, route data
  utils/
    theme.ts        colors, type sizes, spacing
    routing.ts      works out trips and sorts them
    liveStatus.ts   the fake status data
  __tests__/
```

## Disclaimer

The status, wait times, and crowd levels are made up. The route information is based on the real Walt Disney World transportation system.

This is a personal project. It's not affiliated with or endorsed by Disney. Park and resort names are used so you know what the app is talking about.

Made by [Austin Vodrazka](https://github.com/austin5374).
