import React, { useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  SectionList, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Destination, DestinationGroup } from '../types';
import { DESTINATIONS } from '../data/destinations';
import { Colors } from '../utils/theme';

interface DestinationPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (dest: Destination) => void;
  recent: Destination[];
  excludeId?: string;
}

function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  return t.includes(q);
}

export default function DestinationPicker({
  visible, onClose, onSelect, recent, excludeId,
}: DestinationPickerProps) {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const filtered = useMemo(() => {
    const all = DESTINATIONS.filter(d => d.id !== excludeId);
    if (!query.trim()) return all;
    return all.filter(d =>
      fuzzyMatch(d.label, query) || fuzzyMatch(d.id, query) || fuzzyMatch(d.abbrev, query)
    );
  }, [query, excludeId]);

  const sections = useMemo(() => {
    if (query.trim()) {
      return [{ title: 'Results', data: filtered }];
    }
    const groups: DestinationGroup[] = [
      'Parks', 'Water Parks', 'Transportation', 'Entertainment',
      'Deluxe MK Area', 'Deluxe EPCOT Area', 'Moderate Resorts',
      'Value Resorts', 'DVC / Other',
    ];
    const result: { title: string; data: Destination[] }[] = [];
    if (recent.length > 0) {
      result.push({ title: 'Recent', data: recent.filter(d => d.id !== excludeId) });
    }
    for (const g of groups) {
      const data = filtered.filter(d => d.group === g);
      if (data.length) result.push({ title: g, data });
    }
    return result;
  }, [filtered, recent, excludeId, query]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Where to?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations..."
              placeholderTextColor={Colors.textPlaceholder}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => { onSelect(item); onClose(); setQuery(''); }}
              >
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemId}>{item.id}</Text>
              </TouchableOpacity>
            )}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    color: Colors.textPlaceholder,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  clearBtn: {
    fontSize: 14,
    color: Colors.textPlaceholder,
    padding: 4,
  },
  sectionHeader: {
    backgroundColor: Colors.pageBg,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  itemId: {
    fontSize: 12,
    color: Colors.textPlaceholder,
    backgroundColor: Colors.lightBlueTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
