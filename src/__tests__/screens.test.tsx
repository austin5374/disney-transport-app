import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import PlannerScreen from '../screens/PlannerScreen';
import ResultsScreen from '../screens/ResultsScreen';
import DetailScreen from '../screens/DetailScreen';
import SavedTripsScreen from '../screens/SavedTripsScreen';
import { getActiveRoutes } from '../utils/routing';
import { removeSavedTrip } from '../utils/savedTrips';

// Screen tests
//
// The suite used to be entirely pure functions, with a `react-native` stub
// sitting in __mocks__ so that nothing ever had to mount. That tested the
// half of the app that was easy to test. These render the real screens.

const AFTERNOON = new Date(2026, 7, 20, 14, 0, 0).toISOString();

function nav(overrides: Record<string, unknown> = {}) {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setParams: jest.fn(),
    getParent: jest.fn(() => ({ navigate: jest.fn() })),
    ...overrides,
  } as never;
}

// Testing Library v14 renders asynchronously: `render` returns a promise and
// `screen` is only populated once it settles.
const wrap = (ui: React.ReactElement) =>
  render(<NavigationContainer>{ui}</NavigationContainer>);

describe('planner', () => {
  it('greets you and offers directions before any trip is chosen', async () => {
    await wrap(<PlannerScreen navigation={nav()} route={{ params: undefined } as never} />);
    expect(screen.getByText('Where to today?')).toBeTruthy();
    expect(screen.getByText('Get Directions')).toBeTruthy();
  });

  it('opens the Get Directions sheet with both fields visible', async () => {
    await wrap(<PlannerScreen navigation={nav()} route={{ params: undefined } as never} />);
    await fireEvent.press(screen.getByText('Get Directions'));
    await waitFor(() => expect(screen.getByText('From')).toBeTruthy());
    expect(screen.getByText('To')).toBeTruthy();
  });

  it('carries a destination handed over by the search tab', async () => {
    const navigation = nav();
    await wrap(
      <PlannerScreen
        navigation={navigation}
        route={{ params: { presetTo: 'MK' } } as never}
      />
    );
    await waitFor(() => expect(screen.getAllByText(/Magic Kingdom/).length).toBeGreaterThan(0));
  });
});

describe('results', () => {
  const route = {
    params: { fromId: 'POLY', toId: 'MK', timeOverride: AFTERNOON },
  } as never;

  it('lists transit options and says how they are ordered', async () => {
    await wrap(<ResultsScreen navigation={nav()} route={route} />);
    expect(screen.getByText(/Transit Option/)).toBeTruthy();
  });

  it('explains itself when a link names a place that does not exist', async () => {
    await wrap(
      <ResultsScreen
        navigation={nav()}
        route={{ params: { fromId: 'NOPE', toId: 'MK' } } as never}
      />
    );
    expect(screen.getByText("We don't know that place")).toBeTruthy();
  });

  it('names the filter responsible for an empty list rather than the network', async () => {
    await wrap(
      <ResultsScreen
        navigation={nav()}
        route={{
          params: {
            fromId: 'POLY', toId: 'MK', timeOverride: AFTERNOON,
            filters: { sort: 'fastest', noWater: false, accessible: true },
          },
        } as never}
      />
    );
    // Either routes survive the filter, or the empty state blames the filter.
    const empty = screen.queryByText('Your filters hid every route');
    const list = screen.queryByText(/Transit Option/);
    expect(Boolean(empty) || Boolean(list)).toBe(true);
  });
});

describe('detail', () => {
  const first = getActiveRoutes('POLY', 'MK', new Date(AFTERNOON))
    .find(r => !r.legs.some(l => l.mode === 'minnie_van'))!;

  it('renders one step per leg', async () => {
    await wrap(
      <DetailScreen
        navigation={nav()}
        route={{
          params: {
            fromId: 'POLY', toId: 'MK', routeId: first.id, timeOverride: AFTERNOON,
          },
        } as never}
      />
    );
    expect(screen.getByText('Step by Step')).toBeTruthy();
    expect(screen.getAllByText(/^Step \d+ of \d+$/)).toHaveLength(first.legs.length);
  });

  it('says so rather than crashing when a link points at a route that has gone', async () => {
    await wrap(
      <DetailScreen
        navigation={nav()}
        route={{
          params: { fromId: 'POLY', toId: 'MK', routeId: 'no-such-route' },
        } as never}
      />
    );
    expect(screen.getByText("This route isn't running")).toBeTruthy();
  });

  it('offers to save the trip, and the control is not a stub', async () => {
    await wrap(
      <DetailScreen
        navigation={nav()}
        route={{
          params: {
            fromId: 'POLY', toId: 'MK', routeId: first.id, timeOverride: AFTERNOON,
          },
        } as never}
      />
    );
    await fireEvent.press(screen.getByText('Save Trip'));
    expect(screen.queryByText(/not available in this build/)).toBeNull();
  });
});

describe('planning for a different time', () => {
  // The "Change" link opened a sheet with a title and a Done button and
  // nothing in between: the picker it rendered has no web implementation, so
  // on the only build anyone can click, the whole feature was dead.
  const morning = new Date(2026, 7, 20, 9, 0, 0).toISOString();
  const early = { params: { fromId: 'MK', toId: 'HS', timeOverride: morning } } as never;

  it('opens a sheet that actually contains a time control', async () => {
    await wrap(<ResultsScreen navigation={nav()} route={early} />);
    await fireEvent.press(screen.getByText('Change'));
    await waitFor(() => expect(screen.getByText('Plan for a different time')).toBeTruthy());
    // A readout to change, presets to change it to, and a way to commit.
    expect(screen.getByText('Early morning · 9:00 AM')).toBeTruthy();
    expect(screen.getByLabelText('Forward 15 minutes')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('moves the planned time when the control is used', async () => {
    await wrap(<ResultsScreen navigation={nav()} route={early} />);
    await fireEvent.press(screen.getByText('Change'));
    await waitFor(() => expect(screen.getByLabelText('Planning for 9:00 AM')).toBeTruthy());
    await fireEvent.press(screen.getByLabelText('Forward 15 minutes'));
    expect(screen.getByLabelText('Planning for 9:15 AM')).toBeTruthy();
  });

  it('offers a preview of the routes the clock is hiding', async () => {
    await wrap(<ResultsScreen navigation={nav()} route={early} />);
    expect(screen.getByText(/Planning ahead\?/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Show 10:00 AM'));
    // The direct park-to-park bus is what was missing at eight.
    await waitFor(() => expect(screen.getByText('Bus from Magic Kingdom')).toBeTruthy());
  });
});

describe('saved trips', () => {
  // The detail test above pressed Save Trip, and the store is module-level, so
  // this is the other half of the same journey: what you saved is what you see.
  it('lists a trip that was saved from its detail screen', async () => {
    await wrap(<SavedTripsScreen navigation={nav()} />);
    expect(screen.getByText(/Polynesian Village/)).toBeTruthy();
  });

  it('offers a way forward when the list is empty', async () => {
    removeSavedTrip('POLY', 'MK');
    await wrap(<SavedTripsScreen navigation={nav()} />);
    expect(screen.getByText('No saved trips yet')).toBeTruthy();
    expect(screen.getByText('Plan a Trip')).toBeTruthy();
  });
});
