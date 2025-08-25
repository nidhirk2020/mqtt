import aedes from 'aedes';
import net from 'net';
import 'dotenv/config';

export function startBroker() {
  const broker = aedes();
  const server = net.createServer(broker.handle);

  server.listen(process.env.MQTT_PORT, () => {
    console.log(`🚦 MQTT broker listening on :${process.env.MQTT_PORT}`);
  });

  broker.on('clientReady', (client) => {
    console.log(`🔌 Client connected: ${client?.id}`);
  });

  broker.on('clientDisconnect', (client) => {
    console.log(`🔌 Client disconnected: ${client?.id}`);
  });

  return { broker, server };
}
