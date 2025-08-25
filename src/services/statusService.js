import { DeviceStatus } from '../db/mongo.js';

export const StatusService = {
  async updateStatus(deviceId, status) {
    // upsert latest status
    await DeviceStatus.updateOne(
      { deviceId },
      { $set: {deviceType, deviceId, status, updatedAt: new Date() } },
      { upsert: true }
    );
  },

  async remove(deviceId) {
    await DeviceStatus.deleteOne({ deviceId });
  },

  async get(deviceId) {
    return DeviceStatus.findOne({ deviceId }).lean();
  }
};
