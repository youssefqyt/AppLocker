// Mock for react-native-reanimated
module.exports = {
  default: {
    Value: class { constructor(v) { this._value = v; } },
    timing: jest.fn(),
    sequence: jest.fn(),
    View: 'Animated.View',
  },
  useSharedValue: jest.fn((v) => ({ value: v })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((v) => v),
  withSpring: jest.fn((v) => v),
};
