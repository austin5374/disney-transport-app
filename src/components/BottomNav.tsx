import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';

const TABS = [
  { icon: '⌂', label: 'Home'   },
  { icon: '⊙', label: 'Map'    },
  { icon: '＋', label: ''       },
  { icon: '⌕', label: 'Search' },
  { icon: '≡', label: 'Menu'   },
];

interface BottomNavProps {
  activeTab?: number;
}

export default function BottomNav({ activeTab = 0 }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {TABS.map((tab, i) => {
        const isCenter = i === 2;
        const isActive = i === activeTab;
        return (
          <TouchableOpacity
            key={i}
            style={[styles.tab, isCenter && styles.centerTab]}
            activeOpacity={0.7}
          >
            {isCenter ? (
              <View style={styles.centerBtn}>
                <Text style={styles.centerIcon}>{tab.icon}</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
                <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  centerIcon: {
    fontSize: 22,
    color: '#fff',
  },
  icon: {
    fontSize: 20,
    color: Colors.textPlaceholder,
  },
  iconActive: {
    color: Colors.primaryBlue,
  },
  label: {
    fontSize: 10,
    color: Colors.textPlaceholder,
    marginTop: 2,
  },
  labelActive: {
    color: Colors.primaryBlue,
  },
});
