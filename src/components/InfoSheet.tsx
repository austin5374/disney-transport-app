import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppModal from './AppModal';
import { Colors, Type, Spacing, Radius } from '../utils/theme';
import PillButton from './ui/PillButton';

interface InfoSheetProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

// A small in-app bottom sheet for one-off informational messages. Used
// instead of Alert.alert, which react-native-web ships as a total no-op, and
// instead of a raw window.alert(), which looks like browser chrome rather
// than part of the app.
export default function InfoSheet({ visible, title, message, onClose }: InfoSheetProps) {
  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <PillButton label="Got It" onPress={onClose} style={styles.button} />
        </View>
      </TouchableOpacity>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14,44,75,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.sectionBg,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl + Spacing.sm,
    alignItems: 'center',
  },
  title: {
    ...Type.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    alignSelf: 'stretch',
  },
});
