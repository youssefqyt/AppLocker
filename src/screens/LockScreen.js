import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import PinPad from '../components/PinPad';
import AppIcon from '../components/AppIcon';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useApp } from '../context/AppContext';

export default function LockScreen({ navigation, route }) {
  const { state, actions } = useApp();
  const { app } = route.params;
  const [errorMsg, setErrorMsg] = useState('');
  const maxAttempts = state.settings.maxAttempts || 5;

  const handlePinComplete = async (pin) => {
    if (pin === state.pin) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      actions.addLog(app.name, app.icon, app.color, 'unlocked');
      actions.resetFailed();
      navigation.goBack();
      return true;
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      actions.incrementFailed();
      const remaining = maxAttempts - (state.failedAttempts + 1);
      if (remaining <= 0) {
        actions.addLog(app.name, app.icon, app.color, 'failed');
        setErrorMsg('Too many attempts. Try again later.');
      } else {
        actions.addLog(app.name, app.icon, app.color, 'failed');
        setErrorMsg(`Wrong PIN · ${remaining} attempt${remaining !== 1 ? 's' : ''} left`);
      }
      return false;
    }
  };

  const handleBiometric = async () => {
    if (!state.settings.biometrics) return;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Unlock ${app.name}`,
        cancelLabel: 'Use PIN',
        fallbackLabel: 'Use PIN',
      });
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        actions.addLog(app.name, app.icon, app.color, 'unlocked');
        actions.resetFailed();
        navigation.goBack();
      }
    } catch (e) {}
  };

  const handleCancel = () => {
    actions.addLog(app.name, app.icon, app.color, 'blocked');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <AppIcon
            icon={app.icon}
            color={app.color}
            bgColor={app.bgColor}
            size={64}
          />
          <Text style={styles.appName}>{app.name} is locked</Text>
          <Text style={styles.sub}>Enter your PIN to continue</Text>
        </View>

        <PinPad
          onComplete={handlePinComplete}
          errorMessage={errorMsg}
          onClear={() => setErrorMsg('')}
        />

        <View style={styles.actions}>
          {state.settings.biometrics && (
            <TouchableOpacity style={styles.bioBtn} onPress={handleBiometric}>
              <Ionicons name="finger-print" size={22} color={COLORS.accentLight} />
              <Text style={styles.bioBtnText}>Use biometrics</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flex: 1, alignItems: 'center', paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl, paddingBottom: SPACING.xl,
  },
  top: { alignItems: 'center', marginBottom: SPACING.xxl },
  appName: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginTop: SPACING.lg },
  sub: { color: COLORS.textDim, fontSize: 13, marginTop: 4 },
  actions: { width: '100%', marginTop: SPACING.xl, gap: SPACING.md },
  bioBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingVertical: 13,
  },
  bioBtnText: { color: COLORS.accentLight, fontSize: 14, fontWeight: '600' },
  cancelBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13,
  },
  cancelText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '500' },
});
