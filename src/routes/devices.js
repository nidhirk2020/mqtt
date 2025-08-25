import { Router } from 'express';
import { DeviceService } from '../services/deviceService.js';
import { StatusService } from '../services/statusService.js';

const router = Router();

/**
 * Register (or upsert) a device
 * POST /devices
 * { "deviceId": "abc123", "name": "My Pump" }
 */
router.post('/', async (req, res) => {
  try {
    const { deviceId, name } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'deviceId required' });

    await DeviceService.register(deviceId, name ?? null);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed_to_register' });
  }
});

/**
 * List devices
 * GET /devices
 */
router.get('/', async (_req, res) => {
  try {
    const devices = await DeviceService.list();
    res.json({ devices });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed_to_list' });
  }
});

/**
 * Get last known status (Mongo)
 * GET /devices/:deviceId/status
 */
router.get('/:deviceId/status', async (req, res) => {
  try {
    const doc = await StatusService.get(req.params.deviceId);
    res.json({ status: doc?.status ?? null, updatedAt: doc?.updatedAt ?? null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed_to_get_status' });
  }
});

/**
 * Delete a device (SQL + Mongo)
 * DELETE /devices/:deviceId
 */
router.delete('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    await DeviceService.remove(deviceId);
    await StatusService.remove(deviceId);
    res.json({ ok: true, deleted: deviceId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed_to_delete' });
  }
});

export default router;
