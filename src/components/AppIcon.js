import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS } from '../utils/theme';

export default function AppIcon({ icon, color, bgColor, size = 44 }) {
  const iconSize = Math.round(size * 0.5);
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.27),
          backgroundColor: bgColor,
        },
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
});
