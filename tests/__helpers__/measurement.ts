import DeviceInfo from 'react-native-device-info';
import { CameraData } from '../../src/types/measurement';
import { version } from '../../package.json';

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
  measurement_timestamp: Date.now(),
};

export const mockDevice = {
  os: DeviceInfo.getSystemName(),
  model: DeviceInfo.getModel(),
  manufacturer: DeviceInfo.getBrand(),
  type: 'ios',
};

export const mockApp = {
  build: Number(DeviceInfo.getBuildNumber()),
  name: 'mobile-spot-check',
  version: DeviceInfo.getVersion(),
  camera_sdk_version: '1.0.0',
  fibricheck_sdk_version: version,
};
