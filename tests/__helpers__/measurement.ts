import { CameraData } from '@fibricheck/react-native-camera-sdk';
import DeviceInfo from 'react-native-device-info';

export const mockSchemas = [{
  id: 'fibricheck-measurements',
  name: 'fibricheck-measurements',
}];

export const cameraResult: CameraData = {
  heartrate: 100,
  quadrants: [],
  technicalDetails: {
    camera_exposure_time: 0,
    camera_hardware_level: 'high',
    camera_iso: 0,
  },
  time: [],
  yList: [],
  measurementTimestamp: new Date(),
};

export const mockDevice = {
  os: DeviceInfo.getSystemName(),
  model: DeviceInfo.getModel(),
  brand: DeviceInfo.getBrand(),
};

export const mockApp = {
  build: Number(DeviceInfo.getBuildNumber()),
  name: 'mobile-spot-check',
  version: DeviceInfo.getVersion(),
};
