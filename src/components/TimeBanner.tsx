import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import AppModal from './AppModal';
import { Ionicons } from '@expo/vector-icons';
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

  const isAdvisory = !!message;

  return (
    <>
      <View style={[styles.banner, isAdvisory ? styles.bannerAdvisory : styles.bannerNeutral]}>
        <Ionicons
          name="time-outline"
          size={16}
          color={isAdvisory ? Colors.warnIcon : Colors.textSecondary}
        />
        <Text style={[styles.bannerText, isAdvisory && styles.bannerTextAdvisory]} numberOfLines={2}>
          {message ?? `Showing routes for ${effectiveTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
        </Text>
        <TouchableOpacity
          onPress={() => { setPickerValue(timeOverride ?? new Date()); setShowPicker(true); }}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Text style={styles.link}>Change</Text>
        </TouchableOpacity>
        {timeOverride && (
          <TouchableOpacity
            onPress={() => onTimeChange(null)}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
          >
            <Ionicons name="close" size={15} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showPicker && (
        <AppModal transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
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
        </AppModal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  bannerNeutral: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  bannerAdvisory: {
    backgroundColor: 'rgba(255,179,0,0.08)',
  },
  bannerText: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.textSecondary,
  },
  bannerTextAdvisory: {
    color: Colors.warnText,
  },
  link: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.primaryBlue,
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
