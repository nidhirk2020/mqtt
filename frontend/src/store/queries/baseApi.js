
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
console.log("API BASE URL:", process.env.REACT_APP_API_BASE_URL);


export const baseApi = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000',
  }),
  tagTypes: ['Devices', 'DeviceStatus'],
    reactHooks: {
    useSuspenseQuery: true,
  },

  endpoints: () => ({}),
  // useSuspense: true,
});
