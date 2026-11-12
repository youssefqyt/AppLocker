import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import Toggle from '../components/Toggle';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useApp } from '../context/AppContext';

const AUTO_LOCK_OPTIONS = ['Immediately', '30 sec', '1 min', '5 min', 'Never'];
const MAX_ATTEMPTS_OPTIONS = [3, 5, 10];

export default function SettingsScreen({ navigation }) {
  const { state, actions } = useApp();
  const { settings } = state;
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(has => {
      if (has) LocalAuthentication.isEnrolledAsync().then(setBiometricAvailable);
    });
  }, []);

  const lockedApps = state.apps.filter(a => a.locked).length;

  const handleChangePIN = () => navigation.navigate('SetupPin', { isChange: true });

  const handleReset = () => {
    Alert.alert(
      'Reset AppLocker?',
      'This will remove your PIN, unlock all apps, and clear the access log.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset everything', style: 'destructive',
          onPress: async () => { await actions.resetAll(); },
        },
      ]
    );
  };

  const handleLockAll = () => {
    state.apps.forEach(app => {
      if (!app.locked) actions.toggleAppLock(app.id);
    });
  };

  const handleUnlockAll = () => {
    Alert.alert('Unlock all apps?', 'This will remove protection from all apps.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unlock all', style: 'destructive',
        onPress: () => {
          state.apps.forEach(app => {
            if (app.locked) actions.toggleAppLock(app.id);
          });
        },
      },
    ]);
  };

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  const Row = ({ icon, iconColor, title, subtitle, right, onPress, isLast }) => (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.accent} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>AppLocker is active</Text>
            <Text style={styles.statusSub}>{lockedApps} apps protected</Text>
          </View>
          <View style={[styles.statusPill, lockedApps > 0 && styles.statusPillActive]}>
            <Text style={[styles.statusPillText, lockedApps > 0 && styles.statusPillTextActive]}>
              {lockedApps > 0 ? 'On' : 'Off'}
            </Text>
          </View>
        </View>

        <Section title="Security">
          <Row
            icon="key-outline" iconColor={COLORS.accent}
            title="Change PIN" subtitle="Update your 4-digit PIN"
            onPress={handleChangePIN}
            right={<Ionicons name="chevron-forward" size={16} color={COLORS.textDim} />}
          />
          {biometricAvailable && (
            <Row
              icon="finger-print" iconColor="#5BB8FF"
              title="Biometric unlock" subtitle="Use fingerprint or Face ID"
              right={
                <Toggle
                  value={settings.biometrics}
                  onToggle={() => actions.updateSettings({ biometrics: !settings.biometrics })}
                />
              }
            />
          )}
          <Row
            icon="notifications-outline" iconColor={COLORS.warning}
            title="Failed attempt alerts" subtitle="Notify on wrong PIN entry"
            right={
              <Toggle
                value={settings.notifications}
                onToggle={() => actions.updateSettings({ notifications: !settings.notifications })}
              />
            }
          />
          <Row
            icon="eye-off-outline" iconColor="#FF6584"
            title="Hide content preview" subtitle="Blur locked app previews"
            isLast
            right={
              <Toggle
                value={settings.hideContent}
                onToggle={() => actions.updateSettings({ hideContent: !settings.hideContent })}
              />
            }
          />
        </Section>

        <Section title="Auto-lock">
          {AUTO_LOCK_OPTIONS.map((opt, i) => (
            <Row
              key={opt}
              icon="time-outline" iconColor={COLORS.textDim}
              title={opt}
              isLast={i === AUTO_LOCK_OPTIONS.length - 1}
              onPress={() => actions.updateSettings({ autoLock: opt })}
              right={
                settings.autoLock === opt
                  ? <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
                  : <View style={{ width: 18 }} />
              }
            />
          ))}
        </Section>

        <Section title="Max failed attempts">
          {MAX_ATTEMPTS_OPTIONS.map((n, i) => (
            <Row
              key={n}
              icon="alert-circle-outline" iconColor={COLORS.danger}
              title={`${n} attempts`}
              subtitle={n === 5 ? 'Recommended' : undefined}
              isLast={i === MAX_ATTEMPTS_OPTIONS.length - 1}
              onPress={() => actions.updateSettings({ maxAttempts: n })}
              right={
                settings.maxAttempts === n
                  ? <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
                  : <View style={{ width: 18 }} />
              }
            />
          ))}
        </Section>

        <Section title="Quick actions">
          <Row
            icon="lock-closed-outline" iconColor={COLORS.success}
            title="Lock all apps" subtitle="Protect every app at once"
            onPress={handleLockAll}
            right={<Ionicons name="chevron-forward" size={16} color={COLORS.textDim} />}
          />
          <Row
            icon="lock-open-outline" iconColor={COLORS.warning}
            title="Unlock all apps" subtitle="Remove protection from all"
            isLast
            onPress={handleUnlockAll}
            right={<Ionicons name="chevron-forward" size={16} color={COLORS.textDim} />}
          />
        </Section>

        <Section title="About">
          <Row
            icon="information-circle-outline" iconColor={COLORS.textDim}
            title="Version" subtitle="AppLocker v1.0.0"
            isLast
            right={<Text style={styles.versionText}>v1.0.0</Text>}
          />
        </Section>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
          <Text style={styles.resetText}>Reset AppLocker</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  pageTitle: { color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: SPACING.lg },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xl,
  },
  statusIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#1A1D35', alignItems: 'center', justifyContent: 'center',
  },
  statusInfo: { flex: 1 },
  statusTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  statusSub: { color: COLORS.textDim, fontSize: 12, marginTop: 2 },
  statusPill: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface2,
  },
  statusPillActive: { backgroundColor: '#1A1D35', borderWidth: 1, borderColor: COLORS.accent },
  statusPillText: { color: COLORS.textDim, fontSize: 12, fontWeight: '700' },
  statusPillTextActive: { color: COLORS.accent },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    color: COLORS.textDim, fontSize: 11, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm,
  },
  sectionCard: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingVertical: 13,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.bg },
  rowIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowTitle: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  rowSub: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
  versionText: { color: COLORS.textDim, fontSize: 12 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.dangerBg,
    borderWidth: 1, borderColor: '#3A1515',
    borderRadius: RADIUS.lg, paddingVertical: 14,
    marginBottom: SPACING.md,
  },
  resetText: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },
});
