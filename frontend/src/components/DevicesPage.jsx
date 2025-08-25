import React ,{Suspense}  from 'react';
import {
  useLazyGetDevicesQuery,
  useLazyGetDeviceStatusQuery,
  useDeleteDeviceMutation,
} from '../store/queries/devices';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import Albums from '../components/album.jsx';
import dev1 from '../assets/dev1.webp';
import dev2 from '../assets/dev2.jpg';
import dev3 from '../assets/dev3.jpg';
import dev4 from '../assets/dev4.jpg';

const SENSOR_IMAGES = [dev1, dev2, dev3, dev4];
function Loading() {
  return <h2>🌀 Loading...</h2>;
}

function useDeviceStatuses(devices) {
  const [getStatus] = useLazyGetDeviceStatusQuery();
  const [statusMap, setStatusMap] = React.useState({});

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!devices?.length) return;
      const entries = await Promise.all(
        devices.map(async (d) => {
          try {
            const res = await getStatus({ deviceId: d.device_id }).unwrap();
            return [d.device_id, { status: res?.status ?? '—', updatedAt: res?.updatedAt ?? null }];
          } catch {
            return [d.device_id, { status: '—', updatedAt: null }];
          }
        })
      );
      if (!cancelled) {
        setStatusMap(Object.fromEntries(entries));
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [devices, getStatus]);

  return statusMap;
}

export default function DevicesPage() {
  const [trigger, { data: devices, isFetching }] = useLazyGetDevicesQuery();
  React.useEffect(() => {
    trigger();
  }, [trigger]);

  const statusMap = useDeviceStatuses(devices);
  const [deleteDevice, { isLoading: isDeleting }] = useDeleteDeviceMutation();

  // ✅ Dialog state
  const [confirmDialog, setConfirmDialog] = React.useState({
    open: false,
    device: null,
  });

  // ✅ Snackbar state
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleDeleteClick = (device) => {
    setConfirmDialog({ open: true, device });
  };

  const handleConfirmDelete = async () => {
    const device = confirmDialog.device;
    setConfirmDialog({ open: false, device: null });

    try {
      await deleteDevice({ deviceId: device.device_id }).unwrap();
      setSnackbar({
        open: true,
        message: `✅ Deleted: ${device.device_id}`,
        severity: 'success',
      });
      trigger(); // re-fetch
    } catch (e) {
      setSnackbar({
        open: true,
        message: `❌ Delete failed: ${e?.data?.error ?? e?.message ?? 'unknown error'}`,
        severity: 'error',
      });
    }
  };

  if (isFetching) return <div style={{ padding: 24 }}>Loading devices…</div>;
  if (!devices?.length) return <div style={{ padding: 24 }}>No devices found.</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: 16, fontFamily: 'system-ui, Arial, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>Devices</h1>
        <div style={{ marginBottom: 30, fontSize: 14, opacity: 0.8 }}>
          Total: {devices?.length ?? 0}
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <Albums  />
      </Suspense>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {devices?.map((d, idx) => {
          const img = SENSOR_IMAGES[idx % SENSOR_IMAGES.length];
          const s = statusMap[d.device_id];
          const status = s?.status ?? '—';
          const updatedAt = s?.updatedAt ? new Date(s.updatedAt).toLocaleString() : '—';

          return (
            <div
              key={d.device_id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <img src={img} alt="sensor" style={{ width: '100%', height: 160, objectFit: 'cover' }} loading="lazy" />

              <div style={{ padding: 14, display: 'grid', gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                  {d.name || <span style={{ opacity: 0.7 }}>{d.device_id}</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: '1px solid #e5e7eb',
                      background: d.registered ? '#e8fff1' : '#fff0f0',
                    }}
                  >
                    {d.registered ? 'Registered' : 'Not registered'}
                  </span>

                  <span title={`Last update: ${updatedAt}`} style={{ opacity: 0.8 }}>
                    Status: <b>{String(status)}</b>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => handleDeleteClick(d)}
                    disabled={isDeleting}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: '1px solid #ef4444',
                      background: '#fff5f5',
                      color: '#b91c1c',
                      cursor: 'pointer',
                    }}
                  >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>

                <div style={{ fontSize: 12, opacity: 0.6 }}>Last updated: {updatedAt}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Confirm Delete Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, device: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Delete device "{confirmDialog.device?.name ?? confirmDialog.device?.device_id}"?<br />
          This removes it from SQL + Mongo.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, device: null })}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}


