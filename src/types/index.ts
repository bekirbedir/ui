// Kullanıcı tipleri
export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'AGENCY';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}


// Location tipleri
export interface Location {
  id: number;
  name: string;
  country: string;
  city: string;
  code: string;
  latitude?: number;      // Enlem
  longitude?: number;     // Boylam
}

// Transportation tipleri - Backend'deki TransportationResponse ile aynı
export type TransportationType = 'FLIGHT' | 'BUS' | 'SUBWAY' | 'UBER';

export interface Transportation {
  id: number;
  originId: number;
  originCode: string;      // Backend'den geliyor
  destinationId: number;
  destinationCode: string;  // Backend'den geliyor
  type: TransportationType;
  operatingDays: number[];
}

export interface TransportationRequest {
  originId: number;
  destinationId: number;
  type: TransportationType;
  operatingDays: number[];
}

// Haftanın günleri için yardımcı tip
export const WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

// ... mevcut tipler

// Route tipleri - Backend'deki RouteResponse ve RouteSegment ile uyumlu
export interface RouteSegment {
  origin: string;      // location code (string)
  destination: string; // location code (string)
  type: TransportationType;
}

export interface RouteResponse {
  segments: RouteSegment[];
}

// Frontend'de kullanmak için zenginleştirilmiş route tipi
export interface Route {
  id: string;
  segments: RouteSegment[];
  transportations?: RouteTransportation[]; // Detaylı gösterim için (opsiyonel)
}

export interface RouteTransportation {
  id: number;
  origin: Location;
  destination: Location;
  type: TransportationType;
  operatingDays: number[];
}