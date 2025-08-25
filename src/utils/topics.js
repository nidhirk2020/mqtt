export const TOPICS = {
  DEVICE_STATUS_IN: 'devices/+/status',      // devices/{deviceId}/status
  DEVICE_STATUS_ACK: (deviceId) => `devices/${deviceId}/ack`
};

export function extractDeviceIdFromTopic(topic) {
  // topic format: devices/{deviceId}/status
  const parts = topic.split('/');
  // ["devices", "{deviceId}", "status"]
  return parts.length >= 3 ? parts[1] : null;
}
