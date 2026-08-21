// Jumping between tabs from inside a stack
//
// A screen inside the planner stack reaches the map or the status board
// through its parent tab navigator. Typing that parent properly from a child
// means threading generics through every screen for one call, and the
// alternative everyone reaches for — `navigate('Map' as never)` — silently
// stops compiling the moment the target needs params.
//
// One narrowly-typed helper, cast in a single place, keeps the call sites
// readable and keeps the cast out of the screens.
interface TabNavigator {
  navigate: (name: string, params?: object) => void;
}

export function goToTab(parent: unknown, name: string, params?: object): void {
  (parent as TabNavigator | undefined)?.navigate(name, params);
}

/** Open the transportation status board, which lives under the More hub. */
export function goToStatus(parent: unknown): void {
  goToTab(parent, 'More', { screen: 'Status' });
}

/** Open the transit map tab. */
export function goToMap(parent: unknown): void {
  goToTab(parent, 'Map');
}
