import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors, Type, Spacing, Radius } from '../utils/theme';

interface Props { children: React.ReactNode }
interface State { error: Error | null }

// Without this, a single missing key in a lookup table takes the whole app to
// a white screen with no way back. Route data is hand-authored, so that is a
// realistic failure, not a hypothetical one.
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Unhandled error:', error);
  }

  reset = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
      return;
    }
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          The app hit an unexpected error and could not finish loading this screen.
        </Text>
        <TouchableOpacity style={styles.button} onPress={this.reset} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.pageBg,
  },
  title: {
    ...Type.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  body: {
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    borderWidth: 2,
    borderColor: Colors.primaryBlue,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.sectionBg,
  },
  buttonText: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
});
