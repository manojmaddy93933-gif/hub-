export const CAR_WASH_HOURS = { open: '04:00', close: '12:00' };
export const AURA_CAFE_HOURS = { open: '04:00', close: '12:00' };
export const THEATRE_HOURS = [
  { open: '04:00', close: '12:00' }
];
export const BADMINTON_HOURS = [
  { open: '04:00', close: '12:00' }
];

export const RATES = {
  GAMES: {
    CARROM: { name: 'Carrom Table', tables: 2, rate: 100 },
    CHESS: { name: 'Chess Table', tables: 1, rate: 100 },
    LUDO: { name: 'Ludo Table', tables: 3, rate: 100 },
    FREE: { name: 'Free Table', tables: 3, rate: 0 }
  },
  CAR_WASH: [
    { type: 'Quick Wash', price: 500 },
    { type: 'Premium Wash', price: 1200 },
    { type: 'Deep Clean Service', price: 2200 }
  ],
  BADMINTON: {
    rate1h: 400,
    rate2h: 600
  },
  THEATRE: {
    rate1h: 1000,
    rate2h: 1500,
    rate5h: 3500,
    getTogether: 3000
  },
  CAFE: {
    tableBooking: 200
  }
};

export const ADMIN_EMAILS = ['manojmaddy93933@gmail.com'];

export const HUB_LOCATION = { lat: 17.4326, lng: 78.4071 };
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: 
    (process.env.GOOGLE_MAPS_PLATFORM_KEY) || 
    ((import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY) || 
    ((globalThis as any).GOOGLE_MAPS_PLATFORM_KEY) ||
    '',
  MAP_ID: 'DEMO_MAP_ID'
};
