import pkg from '../../package.json';
import app from '../../app.json';
import { Brand, Type } from '../utils/theme';

describe('project metadata', () => {
  it('keeps package.json and app.json on the same version', () => {
    expect(pkg.version).toBe(app.expo.version);
  });

  it('renders the version the config declares', () => {
    expect(Brand.version).toBe(app.expo.version);
  });
});

describe('typography', () => {
  // The reference app uses no uppercase label anywhere. Re-adding a role that
  // shouts is the single fastest way to make this look like a template again,
  // so the ramp is asserted rather than trusted.
  it('has no all-caps role', () => {
    for (const [name, role] of Object.entries(Type)) {
      expect([name, (role as { textTransform?: string }).textTransform])
        .toEqual([name, undefined]);
    }
  });
});
