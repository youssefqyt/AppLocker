import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppIcon from '../components/AppIcon';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useApp } from '../context/AppContext';

const FILTERS = ['All', 'Unlocked', 'Failed', 'Blocked'];

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

const STATUS_CONFIG = {
  unlocked: { label: 'Unlocked', color: COLORS.success, bg: '#0D2D1A', icon: 'checkmark-circle' },
  failed: { label: 'Failed', color: COLORS.danger, bg: COLORS.dangerBg, icon: 'close-circle' },
  blocked: { label: 'Cancelled', color: COLORS.warning, bg: COLORS.warningBg, icon: 'remove-circle' },
  opened: { label: 'Opened', color: '#5BB8FF', bg: '#0D1E30', icon: 'open' },
};

export default function AccessLogScreen() {
  const { state, actions } = useApp();
  const [filter, setFilter] = useState('All');

  const filtered = state.log.filter(entry => {
    if (filter === 'All') return true;
    return entry.status === filter.toLowerCase();
  });

  const stats = {
    total: state.log.length,
    unlocked: state.log.filter(l => l.status === 'unlocked').length,
    failed: state.log.filter(l => l.status === 'failed').length,
    blocked: state.log.filter(l => l.status === 'blocked').length,
  };

  const handleClear = () => {
    Alert.alert('Clear log?', 'All access history will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => actions.clearLog() },
    ]);
  };

  const renderItem = ({ item }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.unlocked;
    const app = (state.apps || []).find(a => a.name === item.appName);
    return (
      <View style={styles.logRow}>
        <View style={[styles.logIco, { backgroundColor: app?.bgColor || COLORS.surface }]}>
          {app ? (
            <Ionicons name={app.icon} size={18} color={app.color} />
          ) : (
            <Ionicons name="apps-outline" size={18} color={COLORS.textMuted} />
          )}
        </View>
        <View style={styles.logInfo}>
          <Text style={styles.logName}>{item.appName}</Text>
          <Text style={styles.logTime}>
            {formatDate(item.time)} · {formatTime(item.time)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={11} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Access log</Text>
          {state.log.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mini stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{stats.total}</Text>
            <Text style={styles.statLbl}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.success }]}>{stats.unlocked}</Text>
            <Text style={styles.statLbl}>Unlocked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.danger }]}>{stats.failed}</Text>
            <Text style={styles.statLbl}>Failed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.warning }]}>{stats.blocked}</Text>
            <Text style={styles.statLbl}>Cancelled</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <View style={styles.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="clipboard-outline" size={44} color={COLORS.textDim} />
              <Text style={styles.emptyTitle}>No events yet</Text>
              <Text style={styles.emptyText}>
                Access attempts will appear here
              </Text>
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
    alignItems: 'center', marginBottom: SPACING.lg,
  },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '700' },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: '#3A1515',
    borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 7,
  },
  clearText: { color: COLORS.danger, fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: 10, alignItems: 'center',
  },
  statVal: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  statLbl: { color: COLORS.textDim, fontSize: 9, marginTop: 2, textTransform: 'uppercase' },
  filters: {
    flexDirection: 'row', gap: 8, marginBottom: SPACING.md,
  },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
  },
  filterActive: { backgroundColor: COLORS.surface2, borderColor: COLORS.accent },
  filterText: { color: COLORS.textDim, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: COLORS.accentLight },
  logRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 10,
  },
  logIco: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  logInfo: { flex: 1 },
  logName: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  logTime: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { color: COLORS.textMuted, fontSize: 16, fontWeight: '600' },
  emptyText: { color: COLORS.textDim, fontSize: 13, textAlign: 'center' },
});
