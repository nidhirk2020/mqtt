import mqtt from 'mqtt';
import { TOPICS, extractDeviceIdFromTopic } from './utils/topics.js';
import { DeviceService } from './services/deviceService.js';
import { StatusService } from './services/statusService.js';
import 'dotenv/config';

/**
 * Processor subscribes to incoming topics and handles messages:
 * - Parse { deviceId, status, isRegistered }
 * - If isRegistered === true AND device exists in SQL -> save status to Mongo
 * - Else ignore (or log)
 */
export function startProcessor() {
  const client = mqtt.connect(`mqtt://127.0.0.1:${process.env.MQTT_PORT}`);

  client.on('connect', () => {
    console.log('📡 Processor connected to broker as MQTT client');
    client.subscribe(TOPICS.DEVICE_STATUS_IN, (err) => {
      if (err) {
        console.error('Failed to subscribe:', err);
      } else {
        console.log(`✅ Subscribed: ${TOPICS.DEVICE_STATUS_IN}`);
      }
    });
  });

client.on('message', async (topic, payload) => {
  try {
    const str = payload.toString();
    let json;

    try {
      json = JSON.parse(str);
    } catch {
      console.warn('⚠️  Non-JSON message ignored:', str);
      return;
    }

    const topicDeviceId = extractDeviceIdFromTopic(topic);
    const deviceId = json.deviceId ?? topicDeviceId;
    const { status, isRegistered, name } = json;

    if (!deviceId || typeof status === 'undefined') {
      console.warn('⚠️  Missing deviceId or status. Ignored.');
      return;
    }

    if (isRegistered === false) {
      // Device claims not registered → ensure registration
      const exists = await DeviceService.ensureRegistered(deviceId);
      if (!exists) {
        console.log(`🆕 Auto-registering device: ${deviceId}`);
        await DeviceService.register(deviceId, name ?? null);
      }
    }

    // Always update status in Mongo
    await StatusService.updateStatus(deviceId, String(status));
    console.log(`💾 Status updated for ${deviceId}:`, status);

    // Optional ACK
    client.publish(
      `devices/${deviceId}/ack`,
      JSON.stringify({ ok: true, saved: true, ts: new Date().toISOString() }),
      { qos: 0 }
    );

  } catch (err) {
    console.error('Processor error:', err);
  }
});



  client.on('error', (e) => console.error('Processor MQTT error:', e));

  return { client };
}
