# Walt Disney World Transportation

Pick where you are and where you're going, and it tells you how to get there on Disney transportation: monorails, the Skyliner, boats, and buses.

Live demo: https://disney-transport-app.vercel.app

Built with Expo and React Native in TypeScript, so the same code runs on iOS, Android, and in a browser.

## What it does

You pick two places out of 33 (every park, every resort, both water parks, Disney Springs) and it gives you the ways to get between them. There are about 385 routes written out by hand. If two places have no direct connection, it builds a trip through a transfer point instead, which is what you'd actually end up doing.

Trips are sorted by how long the whole thing takes, not just the time you're on the vehicle. That means it counts the wait too. A bus that shows up every 20 minutes costs you about 10 minutes of standing there on average, and a trip that ignores that isn't telling you the truth. The detail page splits the total back out into wait, ride, and walking so you can see where the time goes.

Some routes only run at certain times. Park to park buses don't start until 10am, the Blue Flag boat starts at 3pm, and Disney Springs buses from the parks start at 4pm. The planner checks the clock. If you ask for Magic Kingdom to Hollywood Studios at 8am it won't offer you a bus that isn't running yet, it'll route you through a monorail resort instead.

Every line has published operating hours, and the app respects them. After park close the board says a line has ended for the night rather than counting down to a train that isn't coming, and a route that rides a closed line drops out of the results instead of being offered.

Live service feeds the ranking, not just the decoration. A line that's down costs a trip the length of its own outage, a delayed line costs it the stretched headway, and a heavy crowd costs it more still — so a downed monorail falls below the ferry on its own rather than sitting at the top of the list with a red warning underneath it.

There's also a status board for every line and a pannable map with live departures on it.

## Offline

Every byte of data in this app is static: the route graph, the line definitions, and a status engine that computes from a hash of the wall clock. Nothing needs a network, which means the whole thing works with the antenna off — which is exactly the condition it's for. Park wifi at 2pm is not a network. Add it to your home screen and it runs as an app.

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

87, in two suites. `npm run test:logic` runs the route graph and the status engine under ts-jest with no native pipeline, so a sweep across all 1,056 destination pairs finishes in under a second. `npm run test:screens` renders the real screens under jest-expo.

Most of the route-data tests exist because the data was typed out by hand and I didn't trust it. Writing them turned up real problems:

- 5 routes where the total time didn't match the sum of their own legs
- 22 bus legs that didn't match up to any transit line
- A field sitting on every leg of every route that nothing ever read (485 of them)

The rest cover the routing logic and the status simulation, where the clock gets frozen and the board has to come out identical every time. Some of them are guarantees about the network as a whole, checked across every ordered pair:

- every pair has an answer that isn't a paid car
- no pair is offered a journey long enough to be a mistake
- every two stops on the same boat or Skyliner line are actually connected
- a paid Minnie Van never outranks Disney transportation

The last one is why the coverage tests sweep all 1,056 pairs rather than sampling: this class of gap is never the pair you happen to check by hand. Twelve pairs used to have no transit answer at all, and all twelve involved Typhoon Lagoon.

## Files

```
src/
  screens/       the pages
  components/
    ui/          buttons, sections, tabs, dividers, that kind of thing
  data/
    routes.ts       hand-authored trips
    lines.ts        transit lines, with their operating hours
    rail.ts         monorail pairs, derived from the beams
    lineRoutes.ts   boat and Skyliner pairs, derived from the stops
    resortBus.ts    resort buses, derived from Disney's own rule
  utils/
    theme.ts        colors, type sizes, spacing
    routing.ts      works out trips, ranks them against live service
    liveStatus.ts   the simulated status engine
    savedTrips.ts   trips you kept
  __tests__/
```

Three of those data files generate trips instead of listing them. That's deliberate: the monorail resort loop had only 12 of its 20 ordered pairs written out, so Magic Kingdom to Grand Floridian offered a walk and no train. The boats had the same latent bug, and so did the resort buses. Deriving the trips from the stops makes that whole class of gap impossible rather than fixing its instances one at a time.

## Sharing a trip

Every screen has a URL. `/trip/POLY/MK` is Polynesian to Magic Kingdom, `/trip/POLY/MK/:routeId` is one specific way of doing it, and `/more/status` is the board. A saved trip stores the question rather than the answer, so opening it re-checks against the day's service instead of handing back a route from last week.

## Disclaimer

The status, wait times, and crowd levels are made up. The route information is based on the real Walt Disney World transportation system.

This is a personal project. It's not affiliated with or endorsed by Disney. Park and resort names are used so you know what the app is talking about.

Made by [Austin Vodrazka](https://github.com/austin5374).
