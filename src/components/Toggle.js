import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

export default function Toggle({ value, onToggle, size = 'md' }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const width = size === 'sm' ? 36 : 44;
  const height = size === 'sm' ? 20 : 24;
  const thumbSize = size === 'sm' ? 14 : 18;
  const thumbOffset = size === 'sm' ? 3 : 3;
  const thumbTravel = width - thumbSize - thumbOffset * 2;

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.surface2, COLORS.accent],
  });

  const thumbPos = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [thumbOffset, thumbOffset + thumbTravel],
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.track,
          { width, height, borderRadius: height / 2, backgroundColor: bgColor },
          !value && styles.trackOff,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              top: thumbOffset,
              left: thumbPos,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  trackOff: {
    borderColor: COLORS.borderLight,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
});
