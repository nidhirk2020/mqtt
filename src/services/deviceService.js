import { upsertDevice, isDeviceRegistered, deleteDeviceSQL, listDevices } from '../db/sql.js';

export const DeviceService = {
  async register(deviceId, name) {
    await upsertDevice(deviceId, name, 1);
  },

  async ensureRegistered(deviceId) {
    return isDeviceRegistered(deviceId);
  },

  async remove(deviceId) {
    await deleteDeviceSQL(deviceId);
  },

  async list() {
    return listDevices();
  }
};
