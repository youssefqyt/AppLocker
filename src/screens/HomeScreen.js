import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AppIcon from '../components/AppIcon';
import Toggle from '../components/Toggle';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useApp } from '../context/AppContext';

export default function HomeScreen({ navigation }) {
  const { state, actions } = useApp();
  const [search, setSearch] = useState('');

  const lockedCount = state.apps.filter(a => a.locked).length;

  const filtered = state.apps.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAppPress = (app) => {
    if (app.locked) {
      navigation.navigate('Lock', { app });
    } else {
      actions.addLog(app.name, app.icon, app.color, 'opened');
    }
  };

  const handleToggle = async (app) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    actions.toggleAppLock(app.id);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.appRow}
      onPress={() => handleAppPress(item)}
      activeOpacity={0.75}
    >
      <AppIcon icon={item.icon} color={item.color} bgColor={item.bgColor} size={44} />
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.appCat}>{item.category}</Text>
      </View>
      {item.locked && (
        <Ionicons
          name="lock-closed"
          size={13}
          color={COLORS.accent}
          style={styles.lockBadge}
        />
      )}
      <Toggle value={item.locked} onToggle={() => handleToggle(item)} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>AppLocker</Text>
            <Text style={styles.headerSub}>
              {lockedCount} of {state.apps.length} apps protected
            </Text>
          </View>
          <View style={styles.shieldBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#5BB8FF" />
            <Text style={styles.shieldText}>{lockedCount} locked</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{state.apps.length}</Text>
            <Text style={styles.statLbl}>Total apps</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.accent }]}>{lockedCount}</Text>
            <Text style={styles.statLbl}>Protected</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.success }]}>
              {state.log.filter(l => l.status === 'unlocked').length}
            </Text>
            <Text style={styles.statLbl}>Unlocks</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={COLORS.textDim} style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            placeholderTextColor={COLORS.textDim}
            value={search}
            onChangeText={setSearch}
            returnKeyType="done"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 12 }}>
              <Ionicons name="close-circle" size={16} color={COLORS.textDim} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionLbl}>Your apps</Text>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="apps-outline" size={40} color={COLORS.textDim} />
              <Text style={styles.emptyText}>No apps found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: SPACING.lg,
  },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '700' },
  headerSub: { color: COLORS.textDim, fontSize: 12, marginTop: 2 },
  shieldBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#0D1E30', borderWidth: 1, borderColor: '#1A3A5C',
    borderRadius: RADIUS.md, paddingHorizontal: 10, paddingVertical: 6,
  },
  shieldText: { color: '#5BB8FF', fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: SPACING.md,
  },
  statVal: { color: COLORS.text, fontSize: 22, fontWeight: '700' },
  statLbl: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 11,
    paddingHorizontal: 10,
  },
  sectionLbl: {
    color: COLORS.textDim, fontSize: 11, fontWeight: '600',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm,
  },
  appRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 11,
  },
  appInfo: { flex: 1 },
  appName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  appCat: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
  lockBadge: { marginRight: -4 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { color: COLORS.textDim, fontSize: 14 },
});
