const mockRNDeviceInfo = require('react-native-device-info/jest/react-native-device-info-mock');

jest.mock('react-native-device-info', () => mockRNDeviceInfo);
