// Mock for expo-local-authentication
module.exports = {
  hasHardwareAsync: jest.fn(() => Promise.resolve(false)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(false)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: false })),
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 },
};

