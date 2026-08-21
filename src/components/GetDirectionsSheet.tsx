import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SectionList,
  StyleSheet, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Destination, DestinationGroup } from '../types';
import { DESTINATIONS } from '../data/destinations';
import { destinationSubtitle, matchesQuery } from '../utils/destinationMeta';
import { Colors, Type, Spacing } from '../utils/theme';
import { useChromeTintOverride } from '../utils/frameChrome';
import AppModal from './AppModal';
import PillButton from './ui/PillButton';
import LinkAction from './ui/LinkAction';

interface GetDirectionsSheetProps {
  visible: boolean;
  from: Destination | null;
  to: Destination | null;
  /** Which field the sheet opens focused on. */
  initialField: 'from' | 'to';
  recent: Destination[];
  onClose: () => void;
  /** Called with the finished trip when the user submits. */
  onSubmit: (from: Destination, to: Destination) => void;
  /** Keeps the planner's own fields in step as the sheet is edited. */
  onDraftChange: (from: Destination | null, to: Destination | null) => void;
  onUseMyLocation: () => void;
  locationHint?: string | null;
}

const GROUP_ORDER: DestinationGroup[] = [
  'Parks', 'Water Parks', 'Transportation', 'Entertainment',
  'Deluxe MK Area', 'Deluxe EPCOT Area', 'Deluxe AK Area',
  'Moderate Resorts', 'Value Resorts', 'DVC / Other',
];

// One sheet, both fields
//
// The reference app asks for a trip in a single full-screen "Get Directions"
// sheet: From over To with a dotted gutter beside them, a swap control at the
// right, the keyboard already up, and matches appearing underneath whichever
// field has focus.
//
// This app used to ask in two: tapping From opened a modal titled "Where
// From?", and tapping To opened a second one titled "Where To?". You could
// never see the trip you were building. Worse, the whole form lived on the
// home screen — the one place the reference deliberately does not put it.
export default function GetDirectionsSheet({
  visible, from, to, initialField, recent, onClose, onSubmit, onDraftChange,
  onUseMyLocation, locationHint,
}: GetDirectionsSheetProps) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  // A white sheet over the blue planner needs dark status-bar glyphs.
  useChromeTintOverride('dark', visible);

  const [field, setField] = useState<'from' | 'to'>(initialField);
  const [query, setQuery] = useState('');
  const [sameWarning, setSameWarning] = useState(false);

  // Re-seed every time the sheet opens: it is a draft of the planner's trip,
  // not a second copy of it.
  useEffect(() => {
    if (!visible) return;
    setField(initialField);
    setQuery('');
    setSameWarning(false);
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, [visible, initialField]);

  const other = field === 'from' ? to : from;

  const matches = useMemo(() => {
    const q = query.trim();
    const pool = DESTINATIONS.filter(d => d.id !== other?.id);
    return q ? pool.filter(d => matchesQuery(d, q)) : pool;
  }, [query, other]);

  const sections = useMemo(() => {
    if (query.trim()) {
      return matches.length ? [{ title: 'Results', data: matches }] : [];
    }
    const out: { title: string; data: Destination[] }[] = [];
    const recentVisible = recent.filter(d => d.id !== other?.id);
    if (recentVisible.length) out.push({ title: 'Recent', data: recentVisible });
    for (const group of GROUP_ORDER) {
      const data = matches.filter(d => d.group === group);
      if (data.length) out.push({ title: group, data });
    }
    return out;
  }, [matches, recent, other, query]);

  const choose = (dest: Destination) => {
    setQuery('');
    setSameWarning(false);
    const nextFrom = field === 'from' ? dest : from;
    const nextTo = field === 'to' ? dest : to;
    onDraftChange(nextFrom, nextTo);
    // Move to whichever half of the trip is still blank, so a two-tap trip
    // takes two taps.
    if (field === 'from' && !nextTo) setField('to');
    else if (field === 'to' && !nextFrom) setField('from');
    else inputRef.current?.blur();
  };

  const swap = () => {
    onDraftChange(to, from);
    setQuery('');
  };

  const submit = () => {
    if (!from || !to) return;
    if (from.id === to.id) { setSameWarning(true); return; }
    onSubmit(from, to);
  };

  const ready = !!from && !!to;

  const renderField = (which: 'from' | 'to') => {
    const value = which === 'from' ? from : to;
    const focused = field === which;
    return (
      <TouchableOpacity
        style={[styles.field, focused && styles.fieldFocused]}
        activeOpacity={0.8}
        onPress={() => { setField(which); setQuery(''); inputRef.current?.focus(); }}
        accessibilityRole="button"
        accessibilityLabel={which === 'from' ? 'Starting point' : 'Destination'}
      >
        <Text style={styles.fieldLabel}>{which === 'from' ? 'From' : 'To'}</Text>
        {focused ? (
          <TextInput
            ref={inputRef}
            style={styles.fieldInput}
            value={query}
            onChangeText={setQuery}
            placeholder={value ? value.label : 'Walt Disney World Location'}
            placeholderTextColor={value ? Colors.textPrimary : Colors.textPlaceholder}
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => { if (matches.length) choose(matches[0]); }}
            accessibilityLabel={which === 'from' ? 'Search for a starting point' : 'Search for a destination'}
          />
        ) : (
          <Text
            style={[styles.fieldValue, !value && styles.fieldPlaceholder]}
            numberOfLines={1}
          >
            {value ? value.label : 'Walt Disney World Location'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <AppModal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
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
            <Text style={styles.headerTitle}>Get Directions</Text>
            <View style={styles.closeBtn} />
          </View>

          <View style={styles.tripBody}>
            <View style={styles.gutter}>
              <Ionicons name="navigate" size={16} color={Colors.textPlaceholder} />
              <View style={styles.gutterDots}>
                {[0, 1, 2, 3].map(i => <View key={i} style={styles.gutterDot} />)}
              </View>
              <Ionicons name="star" size={16} color={to ? Colors.primaryBlue : Colors.textPlaceholder} />
            </View>

            <View style={styles.fields}>
              {renderField('from')}
              {renderField('to')}
            </View>

            <TouchableOpacity
              onPress={swap}
              disabled={!from && !to}
              style={styles.swapBtn}
              accessibilityRole="button"
              accessibilityLabel="Swap origin and destination"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name="swap-vertical"
                size={22}
                color={from || to ? Colors.primaryBlue : Colors.textPlaceholder}
              />
            </TouchableOpacity>
          </View>

          {sameWarning && (
            <Text style={styles.warning}>
              You are already there. Choose a different destination.
            </Text>
          )}
          {locationHint ? <Text style={styles.hint}>{locationHint}</Text> : null}

          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => choose(item)}
                activeOpacity={0.6}
                accessibilityRole="button"
              >
                <View style={styles.itemText}>
                  <Text style={styles.itemLabel} numberOfLines={1}>{item.label}</Text>
                  <Text style={styles.itemSub} numberOfLines={1}>{destinationSubtitle(item)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.primaryBlue} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No matches</Text>
                <Text style={styles.emptyBody}>
                  Nothing on property matches "{query.trim()}". Try a shorter search.
                </Text>
              </View>
            }
          />

          <View style={[styles.footer, { paddingBottom: Spacing.lg + insets.bottom }]}>
            <PillButton label="Get Directions" disabled={!ready} onPress={submit} />
            <LinkAction label="Use My Location" noChevron onPress={onUseMyLocation} />
          </View>
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
  closeBtn: { width: 34 },
  headerTitle: {
    ...Type.subtitle,
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  tripBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  gutter: {
    width: 20,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  gutterDots: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: Spacing.xs,
  },
  gutterDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.dividerStrong,
  },
  fields: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  field: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primaryBorder,
    marginBottom: Spacing.md,
  },
  fieldFocused: {
    borderBottomColor: Colors.primaryBlue,
  },
  fieldLabel: {
    ...Type.caption,
    color: Colors.textSecondary,
  },
  fieldValue: {
    ...Type.body,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  fieldInput: {
    ...Type.body,
    color: Colors.textPrimary,
    marginTop: 2,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as never } : {}),
  },
  fieldPlaceholder: {
    color: Colors.textPlaceholder,
  },
  swapBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  warning: {
    ...Type.bodySmall,
    color: Colors.statusDown,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  hint: {
    ...Type.caption,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  sectionHeader: {
    backgroundColor: Colors.pageBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    ...Type.label,
    color: Colors.textSecondary,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemText: { flex: 1 },
  itemLabel: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  itemSub: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  empty: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Type.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyBody: {
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.sectionBg,
  },
});
