import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppModal from './AppModal';
import { Colors } from '../utils/theme';

interface InfoSheetProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

// A small in-app bottom sheet for one-off informational messages — used
// instead of Alert.alert, which react-native-web ships as a total no-op, and
// instead of a raw window.alert(), which looks like a browser-chrome popup
// rather than part of the app.
export default function InfoSheet({ visible, title, message, onClose }: InfoSheetProps) {
  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
