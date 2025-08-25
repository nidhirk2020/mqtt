import { baseApi } from './baseApi';

const devicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDevices: builder.query({
      query: () => `/devices`,
      transformResponse: (resp) => resp?.devices ?? [],
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((d) => ({ type: 'Devices', id: d.device_id })),
              { type: 'Devices', id: 'LIST' },
            ]
          : [{ type: 'Devices', id: 'LIST' }],
      // 👇 force cache to clear so Suspense or Lazy always reloads fresh
      keepUnusedDataFor: 0,
    }),

    getDeviceStatus: builder.query({
      query: ({ deviceId }) => `/devices/${encodeURIComponent(deviceId)}/status`,
      providesTags: (_res, _err, arg) => [{ type: 'DeviceStatus', id: arg.deviceId }],
    }),

    deleteDevice: builder.mutation({
      query: ({ deviceId }) => ({
        url: `/devices/${encodeURIComponent(deviceId)}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ deviceId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            devicesApi.util.invalidateTags([
              { type: 'Devices', id: 'LIST' },
              { type: 'Devices', id: deviceId },
              { type: 'DeviceStatus', id: deviceId },
            ])
          );
        } catch {
          // handled in component
        }
      },
    }),
  }),
});

export const {
  useGetDevicesQuery,
  useLazyGetDevicesQuery,        // ✅ now exported
  useLazyGetDeviceStatusQuery,
  useDeleteDeviceMutation,
} = devicesApi;

export default devicesApi;

