# ParkWays

A trip planner for Walt Disney World transportation — monorails, the Skyliner, boats, and buses. Pick where you are and where you're going; it routes you across the property and shows what's running.

**[Live demo →](https://disney-transport-app.vercel.app)**

Built with Expo + React Native (TypeScript), running on iOS, Android, and the web from one codebase.

---

## What it does

**Routes across the whole network.** 33 destinations, 400+ hand-authored route entries covering every park, resort, water park, and Disney Springs. Where no direct route exists, the planner composes one through a transfer hub the way a guest actually would — bus to a park, then transfer.

**Ranks by the journey, not the ride.** A trip costs *wait + time aboard + walking*. Expected wait comes from each line's real headway (half the mean interval, since you arrive at a random moment); walking legs and transfer walks are counted; the detail screen breaks the total back into its parts so the headline number reconciles with the steps below it.

This matters more than it sounds. An earlier version ranked on time aboard alone, which charged transit nothing for standing at the stop and made a paid Minnie Van the single fastest option on 60% of all pairs — the app's own headline advice was "call a car." Paid rides are now estimated from real distance and grouped separately, below transit.

**Time-of-day rules.** Park-to-park buses don't run before 10 AM, Blue Flag launches start at 3 PM, and Disney Springs park service starts at 4 PM. The planner checks the clock and swaps in the documented workaround — before opening, Magic Kingdom to Hollywood Studios routes you through a monorail resort instead of offering a bus that isn't running yet.

**A live status board that doesn't lie to you on reload.** Every monorail beam, Skyliner line, boat route, and bus group carries a service level, next departures, and crowding. Disruptions are coordinated by system: a storm cell takes every Seven Seas Lagoon boat at once, never one boat while its dock-mates keep running, and monorail lightning escalates from the EPCOT beam to all three.

**A schematic transit map.** SVG, hand-placed, with live line status. Select a line to highlight it.

---

## The interesting part: a simulation with no randomness in it

Disney publishes no transportation API, so the live data is modeled. The naive way to do that is `Math.random()` on a timer — which is what this app did first, and it had a tell: refreshing the browser re-rolled the whole board. You could watch the Skyliner get suspended for lightning, hit reload, and find it running.

The engine is now a **pure function of the wall clock**. There is no stored state, nothing mutates on a tick, and `src/utils/liveStatus.ts` contains no call to `Math.random()`.

Each line's status is derived by hashing `(lineId, 30-minute episode index)` through a splitmix mixer into a uniform value, then reading a disruption window out of it. Departure boards are a fixed schedule with a per-line phase offset, so countdowns fall smoothly and never jump backwards. Coordinated weather works by hashing the *group* key rather than the line key, which makes the coordination structural — there's no shared mutable state for the code to keep in sync.

What that buys:

- Reload the page and the board is identical.
- Every device sees the same thing at the same moment.
- The whole engine is testable: freeze `Date.now()`, assert exact behavior.
- No persistence layer, no seeding ceremony, no cleanup.

The interval that remains exists only to re-render countdowns, and it pauses when the tab is backgrounded.

---

## Running it

```bash
git clone https://github.com/austin5374/disney-transport-app.git
cd disney-transport-app
npm install --legacy-peer-deps   # some peer ranges lag React 19

npx expo start --web             # browser
npx expo start                   # scan the QR code with Expo Go
```

```bash
npm test         # 45 tests
npm run typecheck
```

---

## Tests

The route graph is 400+ entries written by hand, so it gets a validation suite rather than trust. Every check in `src/__tests__/routeData.test.ts` guards a defect that was actually present at some point:

- Totals that disagreed with the sum of their own legs (5 routes)
- Bus legs that resolved to no transit line at all (22 legs)
- A field carried on every leg of every route and read by nothing (485 instances)

`routing.test.ts` covers the cost model and the filters, including the invariant that a paid ride never outranks transit on any of the 1,056 ordered pairs. `liveStatus.test.ts` pins the clock and asserts the board is byte-identical across fresh module loads.

---

## Layout

```
src/
  screens/       Planner, Results, Detail, Status, Map, About
  components/
    ui/          Section, PillButton, LinkAction, ActionRow, StatBlock, OutlinedBox
  data/          transit lines, destinations, route graph
  utils/
    theme.ts        design tokens — 5 type roles, one accent color, 4pt spacing
    routing.ts      journey cost model, transfer synthesis, filters
    liveStatus.ts   the clock-derived simulation
  __tests__/
```

The design system is five type roles and three weights. Anything needing a size off that ramp is a design mistake rather than a missing token — the previous build had 17 distinct font sizes, including 10.5, 11.5, 12.5, and 13.5.

---

## Disclaimer

Service levels, departure countdowns, and crowd levels are modeled, not live operational data. Route structure — which lines exist, where they stop, how long a ride takes — follows the real Walt Disney World network.

ParkWays is an independent project, not affiliated with, endorsed by, or sponsored by The Walt Disney Company. Park, resort, and attraction names are trademarks of their respective owners and appear here for identification only.

Built by [Austin Vodrazka](https://github.com/austin5374).
