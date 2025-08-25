import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { connectMongo } from './db/mongo.js';
import devicesRouter from './routes/devices.js';
import { startBroker } from './broker.js';
import { startProcessor } from './processor.js';

async function main() {
  // 1) DBs
  await connectMongo();

  // 2) HTTP API
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/devices', devicesRouter);

  app.listen(process.env.HTTP_PORT, () => {
    console.log(`🌐 HTTP API listening on :${process.env.HTTP_PORT}`);
  });

  // 3) MQTT Broker
  startBroker();

  // 4) Processor (MQTT client)
  startProcessor();
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
