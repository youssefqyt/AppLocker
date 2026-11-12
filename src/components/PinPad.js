import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

const PIN_LENGTH = 4;

const KEYS = [
  { label: '1', sub: '' },
  { label: '2', sub: 'ABC' },
  { label: '3', sub: 'DEF' },
  { label: '4', sub: 'GHI' },
  { label: '5', sub: 'JKL' },
  { label: '6', sub: 'MNO' },
  { label: '7', sub: 'PQRS' },
  { label: '8', sub: 'TUV' },
  { label: '9', sub: 'WXYZ' },
  { label: null },
  { label: '0', sub: '+' },
  { label: 'del' },
];

export default function PinPad({ onComplete, errorMessage, onClear }) {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef(
    Array.from({ length: PIN_LENGTH }, () => new Animated.Value(0))
  ).current;

  const shake = () => {
    Vibration.vibrate([0, 60, 60, 60]);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start(() => {
      setIsError(false);
      setPin('');
    });
  };

  const animateDot = (index) => {
    Animated.sequence([
      Animated.timing(dotAnims[index], { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleKey = async (key) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === 'del') {
      const next = pin.slice(0, -1);
      setPin(next);
      if (onClear) onClear();
      return;
    }

    if (pin.length >= PIN_LENGTH) return;

    const next = pin + key;
    setPin(next);
    animateDot(next.length - 1);

    if (next.length === PIN_LENGTH) {
      const result = await onComplete(next);
      if (result === false) {
        setIsError(true);
        setTimeout(() => shake(), 100);
      } else {
        setPin('');
      }
    }
  };

  const dotColor = (i) => {
    if (isError) return COLORS.danger;
    if (i < pin.length) return COLORS.accent;
    return 'transparent';
  };

  const dotBorder = (i) => {
    if (isError) return COLORS.danger;
    if (i < pin.length) return COLORS.accent;
    return COLORS.borderLight;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: dotColor(i),
                borderColor: dotBorder(i),
                shadowColor: i < pin.length && !isError ? COLORS.accent : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 6,
              },
            ]}
          />
        ))}
      </Animated.View>

      {errorMessage ? (
        <Text style={styles.errorMsg}>{errorMessage}</Text>
      ) : null}

      <View style={styles.pad}>
        {KEYS.map((key, i) => {
          if (key.label === null) {
            return <View key={i} style={styles.keyEmpty} />;
          }
          if (key.label === 'del') {
            return (
              <TouchableOpacity
                key={i}
                style={styles.key}
                onPress={() => handleKey('del')}
                activeOpacity={0.6}
              >
                <Ionicons name="backspace-outline" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={i}
              style={styles.key}
              onPress={() => handleKey(key.label)}
              activeOpacity={0.6}
            >
              <Text style={styles.keyNum}>{key.label}</Text>
              {key.sub ? <Text style={styles.keySub}>{key.sub}</Text> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  errorMsg: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
    marginTop: -16,
    marginBottom: 16,
    textAlign: 'center',
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    gap: 10,
  },
  key: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  keyEmpty: {
    width: '30%',
    flexGrow: 1,
    minHeight: 56,
  },
  keyNum: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  keySub: {
    color: COLORS.textDim,
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 1.5,
    marginTop: 1,
  },
});
