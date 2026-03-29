import api from './api';
import type { RouteResponse, Route } from '../types';

export const routeService = {
  searchRoutes: async (
    origin: string,
    destination: string,
    date: string
  ): Promise<Route[]> => {
    try {
      console.log('Searching routes:', { origin, destination, date });
      const response = await api.get('/routes', {
        params: { origin, destination, date },
      });
      console.log('Raw API response:', response.data);
      
      // Backend'den gelen RouteResponse[] array'i
      const routeResponses: RouteResponse[] = response.data;
      
      // Frontend için zenginleştirilmiş route listesi oluştur
      const routes: Route[] = routeResponses.map((routeRes, index) => ({
        id: `route-${index}-${Date.now()}`,
        segments: routeRes.segments,
      }));
      
      console.log('Processed routes:', routes);
      return routes;
    } catch (error: any) {
      console.error('Search routes error:', error.response?.data || error.message);
      throw error;
    }
  },
};