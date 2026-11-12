import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import PinPad from '../components/PinPad';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { generatePinSuggestions } from '../utils/storage';
import { useApp } from '../context/AppContext';

const STEPS = { CHOOSE: 0, CONFIRM: 1 };

export default function SetupPinScreen({ navigation, route }) {
  const { actions } = useApp();
  const isChange = route?.params?.isChange || false;
  const [step, setStep] = useState(STEPS.CHOOSE);
  const [firstPin, setFirstPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [suggestions] = useState(generatePinSuggestions());

  const handlePinComplete = async (pin) => {
    setErrorMsg('');
    if (step === STEPS.CHOOSE) {
      setFirstPin(pin);
      setStep(STEPS.CONFIRM);
      return true;
    }
    if (pin === firstPin) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await actions.setPin(pin);
      if (isChange) {
        navigation.goBack();
      }
      return true;
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMsg('PINs do not match — try again');
      setStep(STEPS.CHOOSE);
      setFirstPin('');
      return false;
    }
  };

  const useSuggested = (pin) => {
    if (step === STEPS.CHOOSE) {
      setFirstPin(pin);
      setStep(STEPS.CONFIRM);
    } else {
      if (pin === firstPin) {
        handlePinComplete(pin);
      } else {
        setErrorMsg('PINs do not match');
        setStep(STEPS.CHOOSE);
        setFirstPin('');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isChange && (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.accentLight} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}

        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={30} color={COLORS.accent} />
        </View>

        <Text style={styles.title}>
          {step === STEPS.CHOOSE
            ? isChange ? 'Change your PIN' : 'Set up your PIN'
            : 'Confirm your PIN'}
        </Text>
        <Text style={styles.sub}>
          {step === STEPS.CHOOSE
            ? 'Choose a 4-digit PIN to protect your apps'
            : `Re-enter your PIN to confirm`}
        </Text>

        {step === STEPS.CHOOSE && (
          <View style={styles.sugSection}>
            <Text style={styles.sugLabel}>✦ Suggested PINs</Text>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.sugRow}
                onPress={() => useSuggested(s.pin)}
                activeOpacity={0.7}
              >
                <View style={styles.sugLeft}>
                  <View style={styles.sugDots}>
                    {[0,1,2,3].map(d => (
                      <View key={d} style={styles.sugDot} />
                    ))}
                  </View>
                  <View>
                    <Text style={styles.sugCode}>{s.pin}</Text>
                    <Text style={styles.sugDesc}>{s.desc}</Text>
                  </View>
                </View>
                <View style={[
                  styles.strengthBadge,
                  s.strength === 'Strong' ? styles.badgeStrong : styles.badgeMedium,
                ]}>
                  <Text style={[
                    styles.strengthText,
                    s.strength === 'Strong' ? styles.strengthStrong : styles.strengthMedium,
                  ]}>{s.strength}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === STEPS.CHOOSE && (
          <Text style={styles.orDivider}>— or enter manually —</Text>
        )}

        <PinPad
          onComplete={handlePinComplete}
          errorMessage={errorMsg}
          onClear={() => setErrorMsg('')}
        />

        <Text style={styles.hint}>
          <Ionicons name="shield-checkmark-outline" size={12} color={COLORS.textDim} />
          {' '}PIN is stored securely on device
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: 40, alignItems: 'center' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', marginBottom: SPACING.lg,
  },
  backText: { color: COLORS.accentLight, fontSize: 14, fontWeight: '600' },
  iconWrap: {
    width: 64, height: 64, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg, marginTop: SPACING.md,
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  sub: {
    color: COLORS.textDim, fontSize: 13, textAlign: 'center',
    marginTop: 6, marginBottom: SPACING.xxl,
  },
  sugSection: {
    width: '100%', backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg,
  },
  sugLabel: {
    color: COLORS.accent, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: SPACING.md,
  },
  sugRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.bg,
  },
  sugLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sugDots: { flexDirection: 'row', gap: 4 },
  sugDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent, opacity: 0.65 },
  sugCode: { color: COLORS.text, fontSize: 16, fontWeight: '700', letterSpacing: 3 },
  sugDesc: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  strengthBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeStrong: { backgroundColor: '#0D2D1A' },
  badgeMedium: { backgroundColor: '#2D1F00' },
  strengthText: { fontSize: 9, fontWeight: '700' },
  strengthStrong: { color: COLORS.success },
  strengthMedium: { color: COLORS.warning },
  orDivider: {
    color: COLORS.textDim, fontSize: 11, marginBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
  hint: { color: COLORS.textDim, fontSize: 11, marginTop: SPACING.lg, textAlign: 'center' },
});
