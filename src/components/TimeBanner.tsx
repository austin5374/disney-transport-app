import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../utils/theme';
import { getTimeBannerMessage } from '../utils/routing';

interface TimeBannerProps {
  timeOverride: Date | null;
  onTimeChange: (date: Date | null) => void;
}

export default function TimeBanner({ timeOverride, onTimeChange }: TimeBannerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerValue, setPickerValue] = useState(new Date());

  const effectiveTime = timeOverride ?? new Date();
  const message = getTimeBannerMessage(effectiveTime);

  if (!message && !timeOverride) return null;

  return (
    <>
      <View style={styles.banner}>
        <Text style={styles.bannerText} numberOfLines={2}>
          {message ?? `Using ${effectiveTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => { setPickerValue(timeOverride ?? new Date()); setShowPicker(true); }}
            style={styles.pill}
          >
            <Text style={styles.pillText}>Change time</Text>
          </TouchableOpacity>
          {timeOverride && (
            <TouchableOpacity onPress={() => onTimeChange(null)} style={[styles.pill, styles.resetPill]}>
              <Text style={styles.pillText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showPicker && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Set time override</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pickerValue}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  if (date) {
                    setPickerValue(date);
                    onTimeChange(date);
                    if (Platform.OS === 'android') setShowPicker(false);
                  }
                }}
                style={styles.picker}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(255,200,0,0.12)',
    borderWidth: 1,
    borderColor: Colors.gold,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    color: Colors.warnText,
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  resetPill: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  pillText: {
    color: Colors.warnText,
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  pickerDone: {
    fontSize: 16,
    color: Colors.primaryBlue,
    fontWeight: '500',
  },
  picker: {
    width: '100%',
  },
});
