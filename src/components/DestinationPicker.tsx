import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  SectionList, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppModal from './AppModal';
import { Destination, DestinationGroup } from '../types';
import { DESTINATIONS } from '../data/destinations';
import { Colors, Type, Spacing, Radius, groupBadgeColors } from '../utils/theme';

interface DestinationPickerProps {
  visible: boolean;
  /** "Where from?" for the origin field, "Where to?" for the destination.
   *  Previously hardcoded, so picking a starting point asked where you were
   *  going. */
  title: string;
  onClose: () => void;
  onSelect: (dest: Destination) => void;
  recent: Destination[];
  excludeId?: string;
}

const GROUP_ORDER: DestinationGroup[] = [
  'Parks', 'Water Parks', 'Transportation', 'Entertainment',
  'Deluxe MK Area', 'Deluxe EPCOT Area', 'Deluxe AK Area',
  'Moderate Resorts', 'Value Resorts', 'DVC / Other',
];

export default function DestinationPicker({
  visible, title, onClose, onSelect, recent, excludeId,
}: DestinationPickerProps) {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  // The reference app opens its destination field with the keyboard already
  // up and the cursor in place. Opening a full-screen directory with an
  // unfocused input costs the user an extra tap every single search.
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, [visible]);

  const filtered = useMemo(() => {
    const all = DESTINATIONS.filter(d => d.id !== excludeId);
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(d =>
      d.label.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.abbrev.toLowerCase().includes(q)
    );
  }, [query, excludeId]);

  const sections = useMemo(() => {
    if (query.trim()) {
      return filtered.length ? [{ title: 'Results', data: filtered }] : [];
    }
    const result: { title: string; data: Destination[] }[] = [];
    const recentVisible = recent.filter(d => d.id !== excludeId);
    if (recentVisible.length > 0) result.push({ title: 'Recent', data: recentVisible });
    for (const g of GROUP_ORDER) {
      const data = filtered.filter(d => d.group === g);
      if (data.length) result.push({ title: g, data });
    }
    return result;
  }, [filtered, recent, excludeId, query]);

  const choose = (item: Destination) => {
    onSelect(item);
    onClose();
    setQuery('');
  };

  return (
    <AppModal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Flat white bar with a close control and a centered title. The
              same header shape the reference app's Get Directions sheet uses. */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={26} color={Colors.primaryBlue} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={styles.closeBtn} />
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={Colors.textPlaceholder} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search parks and resorts"
              placeholderTextColor={Colors.textPlaceholder}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
              onSubmitEditing={() => { if (filtered.length) choose(filtered[0]); }}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={18} color={Colors.textPlaceholder} />
              </TouchableOpacity>
            )}
          </View>

          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => choose(item)} activeOpacity={0.6}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={[
                  styles.itemBadge,
                  {
                    backgroundColor: groupBadgeColors(item.group).bg,
                    color: groupBadgeColors(item.group).text,
                  },
                ]}>{item.abbrev}</Text>
              </TouchableOpacity>
            )}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No matches</Text>
                <Text style={styles.emptyBody}>
                  Nothing on property matches "{query.trim()}". Try a shorter search.
                </Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
          />
        </View>
      </KeyboardAvoidingView>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: Colors.sectionBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  closeBtn: {
    width: 34,
  },
  headerTitle: {
    ...Type.subtitle,
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.pageBg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchInput: {
    ...Type.body,
    flex: 1,
    color: Colors.textPrimary,
    // react-native-web renders a focus ring that clashes with the field
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as never } : {}),
  },
  sectionHeader: {
    backgroundColor: Colors.pageBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    ...Type.eyebrow,
    color: Colors.textSecondary,
  },
  item: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemLabel: {
    ...Type.body,
    flex: 1,
    color: Colors.textPrimary,
  },
  itemBadge: {
    ...Type.caption,
    fontFamily: Type.label.fontFamily,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    marginLeft: Spacing.md,
  },
  empty: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Type.subtitle,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyBody: {
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
